import { z } from "zod";

// Define the schema for a single role
const roleSchema = z.object({
    roleId: z.string(), // Assuming roleId is always a string
    roleName: z.string(), // Assuming roleName is always a string
    isSelected: z.boolean(), // Boolean for selection status
});

// Define the schema for a single user
const userSchema = z.object({
    userId: z.string(), // Assuming userId is always a string
    email: z.string().email(), // Email validation
});

// Define the schema for a single access type
const accessTypeSchema = z.object({
    roles: z.array(roleSchema), // Array of roles
    users: z.array(userSchema), // Array of users
});

// Define the schema for the entire object
export const AccessControlFormSchema = z.object({
    assessment_creation_access: accessTypeSchema,
    live_assessment_notification: accessTypeSchema,
    assessment_submission_and_report_access: accessTypeSchema,
    evaluation_process: accessTypeSchema,
});
