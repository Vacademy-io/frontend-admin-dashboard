// utils/csv-utils.ts
import { z } from "zod";
import Papa from "papaparse";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import { SchemaFields, ValidationError } from "@/types/students/bulk-upload-types";

type ParseResult = {
    data: SchemaFields[];
    errors: ValidationError[];
};

export const convertExcelDateToDesiredFormat = (dateString: string): string => {
    // Handle Excel date format (Mon Dec 11 00:00:00 GMT X)
    if (dateString.includes("GMT")) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }
    return dateString;
};

export const createSchemaFromHeaders = (headers: Header[]) => {
    const schemaFields: Record<string, z.ZodType> = {};

    headers.forEach((header) => {
        if (header.type === "enum" && header.options && header.options.length > 0) {
            const enumSchema = z.enum([header.options[0], ...header.options.slice(1)] as [
                string,
                ...string[],
            ]);
            schemaFields[header.column_name] = header.optional ? enumSchema.optional() : enumSchema;
        } else if (header.type === "date" && header.format) {
            const baseFieldSchema = z.string();
            const validatedFieldSchema = header.regex
                ? baseFieldSchema.regex(
                      new RegExp(header.regex),
                      header.regex_error_message ??
                          `Invalid date format. Expected ${header.format}`,
                  )
                : baseFieldSchema;

            schemaFields[header.column_name] = header.optional
                ? validatedFieldSchema.optional()
                : validatedFieldSchema.min(1, `${header.column_name} is required`);
        } else if (header.type === "integer") {
            const fieldSchema = z.string().transform((val) => {
                const num = parseInt(val);
                if (isNaN(num)) throw new Error("Not a valid number");
                return num;
            });

            schemaFields[header.column_name] = header.optional
                ? fieldSchema.optional()
                : fieldSchema;
        } else if (header.type === "regex" && header.regex) {
            const fieldSchema = z
                .string()
                .regex(new RegExp(header.regex), header.regex_error_message ?? "Invalid format");

            schemaFields[header.column_name] = header.optional
                ? fieldSchema.optional()
                : fieldSchema;
        } else {
            // Default string type
            const baseFieldSchema = z.string();
            const fieldSchema = header.regex
                ? baseFieldSchema.regex(
                      new RegExp(header.regex),
                      header.regex_error_message ?? "Invalid format",
                  )
                : baseFieldSchema;

            schemaFields[header.column_name] = header.optional
                ? fieldSchema.optional()
                : fieldSchema.min(1, `${header.column_name} is required`);
        }
    });

    return z.object(schemaFields);
};

export const validateCsvData = (file: File, schema: z.ZodType): Promise<ParseResult> => {
    return new Promise((resolve, reject) => {
        Papa.parse<SchemaFields>(file, {
            header: true,
            skipEmptyLines: true,
            transform: (value, field) => {
                // Check if this is a date column
                if (field === "ENROLLMENT_DATE" || field === "DATE_OF_BIRTH") {
                    return convertExcelDateToDesiredFormat(value);
                }
                return value;
            },
            complete: (results) => {
                const allErrors: ValidationError[] = [];

                results.data.forEach((row, rowIndex) => {
                    const validationResult = schema.safeParse(row);

                    if (!validationResult.success) {
                        validationResult.error.errors.forEach((error) => {
                            // Ensure we have a valid column name from the error path
                            const columnName =
                                typeof error.path[0] === "string"
                                    ? error.path[0]
                                    : Object.keys(row)[error.path[0] as number] || "";

                            allErrors.push({
                                path: [rowIndex, columnName],
                                message: error.message,
                                resolution: `Please check the value for ${columnName}`,
                                currentVal: String(row[columnName] ?? "N/A"),
                                format: "",
                            });
                        });
                    }
                });

                resolve({
                    data: results.data,
                    errors: allErrors,
                });
            },
            error: (error) => reject(error),
        });
    });
};

export const createAndDownloadCsv = (data: SchemaFields[], fileName: string): void => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
