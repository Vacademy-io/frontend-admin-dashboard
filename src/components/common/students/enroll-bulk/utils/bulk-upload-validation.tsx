// utils/bulk-upload-validation.ts
import { z } from "zod";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";

export const createSchemaFromHeaders = (headers: Header[]) => {
    const schemaFields: Record<string, z.ZodType> = {};

    headers.forEach((header) => {
        if (header.type === "enum" && header.options && header.options.length > 0) {
            // Handle enum type
            const enumSchema = z.enum([header.options[0], ...header.options.slice(1)] as [
                string,
                ...string[],
            ]);
            schemaFields[header.column_name] = header.optional ? enumSchema.optional() : enumSchema;
        } else {
            // Handle string type
            let fieldSchema = z.string();

            // Add regex validation if exists
            if (header.regex) {
                fieldSchema = fieldSchema.regex(
                    new RegExp(header.regex),
                    header.regex_error_message ?? "Invalid format",
                );
            }

            // Add required/optional validation
            schemaFields[header.column_name] = header.optional
                ? fieldSchema.optional()
                : fieldSchema.min(1, `${header.column_name} is required`);
        }
    });

    return z.object(schemaFields);
};
