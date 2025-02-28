// cell-validation-utils.ts
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import { ValidationError, SchemaFields } from "@/types/students/bulk-upload-types";
import { convertExcelDateToDesiredFormat } from "./csv-utils";

/**
 * Utility to check if a date string matches the expected format
 */
const isValidDateFormat = (dateStr: string, format: string): boolean => {
    // Convert format patterns to regex patterns
    const formatToRegex = (format: string): RegExp => {
        const pattern = format
            .replace(/DD/g, "(0[1-9]|[12][0-9]|3[01])")
            .replace(/MM/g, "(0[1-9]|1[012])")
            .replace(/YYYY/g, "\\d{4}")
            .replace(/-/g, "\\-")
            .replace(/\//g, "\\/");
        return new RegExp(`^${pattern}$`);
    };

    return formatToRegex(format).test(dateStr);
};

/**
 * Validates a single cell value based on the field's header definition
 */
export const validateCellValue = (
    value: string,
    header: Header,
    rowIndex: number,
): ValidationError | null => {
    const fieldName = header.column_name;

    // Skip validation if the field is optional and empty
    if (header.optional && (!value || value.trim() === "")) {
        return null;
    }

    // Check if required field is missing
    if (!header.optional && (!value || value.trim() === "")) {
        return {
            path: [rowIndex, fieldName],
            message: `${fieldName.replace(/_/g, " ")} is required`,
            resolution: `Please provide a value for ${fieldName.replace(/_/g, " ")}`,
            currentVal: "N/A",
            format: "",
        };
    }

    // If field has a value, validate according to type
    if (value) {
        // Enum validation
        if (header.type === "enum" && header.options && header.options.length > 0) {
            if (!header.options.includes(value)) {
                return {
                    path: [rowIndex, fieldName],
                    message: `Invalid value for ${fieldName.replace(/_/g, " ")}`,
                    resolution: `Value must be one of: ${header.options.join(", ")}`,
                    currentVal: value,
                    format: header.options.join(", "),
                };
            }
        }

        // Date validation
        if (header.type === "date" && header.format) {
            const formattedDate = convertExcelDateToDesiredFormat(value, header.format);

            if (!isValidDateFormat(formattedDate, header.format)) {
                return {
                    path: [rowIndex, fieldName],
                    message: `Invalid date format for ${fieldName.replace(/_/g, " ")}`,
                    resolution: `Date must be in format: ${header.format}`,
                    currentVal: value,
                    format: header.format,
                };
            }
        }

        // Regex validation
        if (header.regex) {
            try {
                const regex = new RegExp(header.regex);
                if (!regex.test(value)) {
                    return {
                        path: [rowIndex, fieldName],
                        message:
                            header.regex_error_message ||
                            `Invalid format for ${fieldName.replace(/_/g, " ")}`,
                        resolution: `Please check the format`,
                        currentVal: value,
                        format: header.regex,
                    };
                }
            } catch (e) {
                console.error(`Invalid regex pattern: ${header.regex}`);
            }
        }
    }

    // No validation errors
    return null;
};

/**
 * Validates an entire row of data against all headers
 */
export const validateRowData = (
    rowData: SchemaFields,
    headers: Header[],
    rowIndex: number,
): ValidationError[] => {
    const errors: ValidationError[] = [];

    headers.forEach((header) => {
        // Skip the STATUS column which is special
        if (header.column_name === "STATUS") return;

        const value = rowData[header.column_name] as string;
        const error = validateCellValue(value, header, rowIndex);

        if (error) {
            errors.push(error);
        }
    });

    return errors;
};

/**
 * Re-validates all data after editing and updates the error state
 */
export const revalidateAllData = (data: SchemaFields[], headers: Header[]): ValidationError[] => {
    const allErrors: ValidationError[] = [];

    data.forEach((row, rowIndex) => {
        const rowErrors = validateRowData(row, headers, rowIndex);
        allErrors.push(...rowErrors);
    });

    return allErrors;
};
