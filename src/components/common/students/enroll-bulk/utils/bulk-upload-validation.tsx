// utils/bulk-upload-validation.tsx
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import { SchemaFields } from "@/types/students/bulk-upload-types";

// Function to validate a single field according to its defined rules
export const validateField = (
    value: string,
    header: Header,
): { isValid: boolean; errorMessage?: string; resolution?: string; format?: string } => {
    // Skip validation if field is optional and empty
    if (header.optional && (!value || value.trim() === "")) {
        return { isValid: true };
    }

    // Check if required field is missing
    if (!header.optional && (!value || value.trim() === "")) {
        return {
            isValid: false,
            errorMessage: `${header.column_name.replace(/_/g, " ")} is required`,
            resolution: `Please provide a value for ${header.column_name.replace(/_/g, " ")}`,
        };
    }

    // If field has value, validate according to type
    if (value) {
        // Enum validation
        if (header.type === "enum" && header.options && header.options.length > 0) {
            if (!header.options.includes(value)) {
                return {
                    isValid: false,
                    errorMessage: `Invalid value for ${header.column_name.replace(/_/g, " ")}`,
                    resolution: `Value must be one of: ${header.options.join(", ")}`,
                    format: header.options.join(", "),
                };
            }
        }

        // Date validation
        if (header.type === "date" && header.format) {
            // This would use our date validation logic from csv-utils.ts
            // Simplified check here for example
            const formatRegex = createDateFormatRegex(header.format);
            if (!formatRegex.test(value)) {
                return {
                    isValid: false,
                    errorMessage: `Invalid date format for ${header.column_name.replace(
                        /_/g,
                        " ",
                    )}`,
                    resolution: `Date must be in format: ${header.format}`,
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
                        isValid: false,
                        errorMessage:
                            header.regex_error_message ||
                            `Invalid format for ${header.column_name.replace(/_/g, " ")}`,
                        resolution: `Please check the format`,
                        format: header.regex,
                    };
                }
            } catch (e) {
                console.error(`Invalid regex pattern: ${header.regex}`);
            }
        }
    }

    // If all validations pass
    return { isValid: true };
};

// Helper to create regex for date format validation
function createDateFormatRegex(format: string): RegExp {
    const pattern = format
        .replace(/DD/g, "(0[1-9]|[12][0-9]|3[01])")
        .replace(/MM/g, "(0[1-9]|1[012])")
        .replace(/YYYY/g, "\\d{4}")
        .replace(/-/g, "\\-")
        .replace(/\//g, "\\/");

    return new RegExp(`^${pattern}$`);
}

// Pre-process CSV data before validation
export const preprocessCsvData = (data: SchemaFields[], headers: Header[]): SchemaFields[] => {
    return data.map((row) => {
        const processedRow = { ...row };

        headers.forEach((header) => {
            const fieldName = header.column_name;
            const value = row[fieldName] as string;

            if (value) {
                // Date format conversion
                if (header.type === "date" && header.format) {
                    // This would use the convertExcelDateToDesiredFormat function from csv-utils.ts
                    // Implementation details would be imported from there
                }

                // Enum value mapping (if send_option_id is true)
                if (
                    header.type === "enum" &&
                    header.options &&
                    header.send_option_id &&
                    header.option_ids
                ) {
                    if (header.options.includes(value)) {
                        const mapping = Object.entries(header.option_ids).find(
                            ([displayValue]) => displayValue === value,
                        );
                        if (mapping) {
                            processedRow[fieldName] = mapping[1];
                        }
                    }
                }
            }
        });

        return processedRow;
    });
};
