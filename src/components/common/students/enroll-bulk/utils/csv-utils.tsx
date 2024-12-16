// utils/csv-utils.ts
import { z } from "zod";
import Papa from "papaparse";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import { SchemaFields, ValidationError } from "@/types/students/bulk-upload-types";

export const createSchemaFromHeaders = (headers: Header[]) => {
    const schemaFields: Record<string, z.ZodType> = {};

    headers.forEach((header) => {
        if (header.type === "enum" && header.options && header.options.length > 0) {
            const enumSchema = z.enum([header.options[0], ...header.options.slice(1)] as [
                string,
                ...string[],
            ]);
            schemaFields[header.column_name] = header.optional ? enumSchema.optional() : enumSchema;
        } else {
            let fieldSchema = z.string();

            if (header.regex) {
                fieldSchema = fieldSchema.regex(
                    new RegExp(header.regex),
                    header.regex_error_message ?? "Invalid format",
                );
            }

            schemaFields[header.column_name] = header.optional
                ? fieldSchema.optional()
                : fieldSchema.min(1, `${header.column_name} is required`);
        }
    });

    return z.object(schemaFields);
};

type ParseResult = {
    data: SchemaFields[];
    errors: ValidationError[];
};

export const validateCsvData = (file: File, schema: z.ZodType): Promise<ParseResult> => {
    return new Promise((resolve, reject) => {
        Papa.parse<SchemaFields>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedResult = schema.safeParse(results.data);

                if (parsedResult.success) {
                    resolve({
                        data: parsedResult.data as SchemaFields[],
                        errors: [],
                    });
                } else {
                    const errors = parsedResult.error.errors.map((error) => {
                        const pathArray = Array.isArray(error.path) ? error.path : [];
                        const rowIndex = typeof pathArray[0] === "number" ? pathArray[0] : 0;
                        const columnName = String(pathArray[1] || "");

                        return {
                            path: [rowIndex, columnName] as [number, string],
                            message: error.message,
                            resolution: `Please check the value for ${columnName}`,
                            currentVal: String(results.data[rowIndex]?.[columnName] ?? "N/A"),
                            format: "",
                        };
                    });

                    resolve({
                        data: results.data,
                        errors,
                    });
                }
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
