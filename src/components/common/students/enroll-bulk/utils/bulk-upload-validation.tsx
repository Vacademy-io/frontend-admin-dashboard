// utils/bulk-upload-validation.ts
import { z } from "zod";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";

export const createSchemaFromHeaders = (headers: Header[]) => {
    const schemaFields: Record<string, z.ZodType> = {};

    headers.forEach((header) => {
        if (header.type === "enum" && header.options && header.options.length > 0) {
            // For columns with send_option_id true, we'll validate against both options and option_ids
            if (header.send_option_id && header.option_ids) {
                const validValues = [...header.options, ...Object.values(header.option_ids)];
                const enumSchema = z.enum([validValues[0], ...validValues.slice(1)] as [
                    string,
                    ...string[],
                ]);
                schemaFields[header.column_name] = header.optional
                    ? enumSchema.optional()
                    : enumSchema;
            } else {
                const enumSchema = z.enum([header.options[0], ...header.options.slice(1)] as [
                    string,
                    ...string[],
                ]);
                schemaFields[header.column_name] = header.optional
                    ? enumSchema.optional()
                    : enumSchema;
            }
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
