// cell-validation-utils.ts
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import { ValidationError, SchemaFields } from "@/types/students/bulk-upload-types";
import { convertExcelDateToDesiredFormat } from "./csv-utils";

/**
 * Utility to check if a date string matches the expected format
 */
const isValidDateFormat = (dateStr: string, format: string): boolean => {
    // Normalize the format for case-insensitive comparison
    const normalizedFormat = format.toUpperCase();

    // Handle all date formats that are essentially DD-MM-YYYY
    if (normalizedFormat === "DD-MM-YYYY" || normalizedFormat === "DD-MM-YYYY") {
        // Validate dates in format XX-XX-XXXX where X is a digit
        const regex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
        if (regex.test(dateStr)) {
            const parts = dateStr.split("-");
            if (parts.length === 3) {
                const day = parseInt(parts[0] || "", 10);
                const month = parseInt(parts[1] || "", 10);
                const year = parseInt(parts[2] || "", 10);

                // Check if the date is valid
                return day >= 1 && day <= 31 && month >= 1 && month <= 12 && year > 0;
            }
        }
        return false;
    }

    // For other formats, improve the regex pattern
    let pattern = format;
    // Case-insensitive replacements
    pattern = pattern
        .replace(/[Dd][Dd]/g, "(0[1-9]|[12][0-9]|3[01])")
        .replace(/[Mm][Mm]/g, "(0[1-9]|1[012])")
        .replace(/[Yy][Yy][Yy][Yy]/g, "\\d{4}")
        .replace(/-/g, "\\-")
        .replace(/\//g, "\\/");

    return new RegExp(`^${pattern}$`).test(dateStr);
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
    console.log("inside cell validation");

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
            console.log("formattedDate: ", formattedDate);

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
