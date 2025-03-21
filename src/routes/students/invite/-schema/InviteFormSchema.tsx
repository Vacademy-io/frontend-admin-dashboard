import { z } from "zod";

// Define the email entry schema
const emailEntrySchema = z.object({
    id: z.string(),
    value: z.string().email(),
});

// Define the dropdown item type schema
const dropdownItemSchema = z.object({
    id: z.string(),
    name: z.string(),
});

// Create schema for form validation
export const inviteFormSchema = z.object({
    inviteLink: z.string().min(1, "Invite link is required"),
    activeStatus: z.boolean(),
    custom_fields: z.array(
        z.object({
            id: z.number(),
            type: z.string(),
            name: z.string(),
            oldKey: z.boolean(),
            isRequired: z.boolean(),
            options: z
                .array(
                    z.object({
                        id: z.number(),
                        value: z.string(),
                        disabled: z.boolean(),
                    }),
                )
                .optional(),
        }),
    ),
    courseSelectionMode: z.enum(["institute", "student", "both"]),
    sessionSelectionMode: z.enum(["institute", "student", "both"]),
    levelSelectionMode: z.enum(["institute", "student", "both"]),
    preSelectedCourses: z.array(dropdownItemSchema).optional(),
    learnerChoiceCourses: z.array(dropdownItemSchema).optional(),
    maxCourses: z.number().optional(),
    preSelectedSessions: z.array(dropdownItemSchema).optional(),
    learnerChoiceSessions: z.array(dropdownItemSchema).optional(),
    maxSessions: z.number().optional(),
    preSelectedLevels: z.array(dropdownItemSchema).optional(),
    learnerChoiceLevels: z.array(dropdownItemSchema).optional(),
    maxLevels: z.number().optional(),
    studentExpiryDays: z.number(),
    inviteeEmail: z.string().optional(), // For the input field
    inviteeEmails: z
        .array(emailEntrySchema)
        .min(1, "Please add at least one email address")
        .default([]),
});

export type InviteFormType = z.infer<typeof inviteFormSchema>;

export const defaultFormValues: Partial<InviteFormType> = {
    inviteLink: "",
    activeStatus: true,
    custom_fields: [
        {
            id: 0,
            type: "textfield",
            name: "Full Name",
            oldKey: true,
            isRequired: true,
        },
        {
            id: 1,
            type: "textfield",
            name: "Email",
            oldKey: true,
            isRequired: true,
        },
        {
            id: 2,
            type: "textfield",
            name: "Phone Number",
            oldKey: true,
            isRequired: true,
        },
    ],
    courseSelectionMode: "institute",
    sessionSelectionMode: "institute",
    levelSelectionMode: "institute",
    studentExpiryDays: 365,
    inviteeEmail: "",
    inviteeEmails: [],
    preSelectedCourses: [],
    learnerChoiceCourses: [],
    preSelectedSessions: [],
    learnerChoiceSessions: [],
    preSelectedLevels: [],
    learnerChoiceLevels: [],
};
