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

const selectionModeSchema = z.enum(["institute", "student", "both"]);

const levelSchema = z.object({
    id: z.string(),
    name: z.string(),
    packageSessionId: z.string(),
});

const learnerChoiceSessionSchema = z.object({
    id: z.string(),
    name: z.string(),
    maxLevels: z.number(),
    learnerChoiceLevels: z.array(levelSchema),
});

const preSelectedSessionSchema = z.object({
    id: z.string(),
    name: z.string(),
    maxLevels: z.number(),
    learnerChoiceLevels: z.array(levelSchema),
    preSelectedLevels: z.array(levelSchema),
});

const learnerChoiceCoursesSchema = z.object({
    id: z.string(),
    name: z.string(),
    maxSessions: z.number(),
    learnerChoiceSessions: z.array(learnerChoiceSessionSchema),
});

const preSelectedCoursesSchema = z.object({
    id: z.string(),
    name: z.string(),
    maxSessions: z.number(),
    learnerChoiceSessions: z.array(learnerChoiceSessionSchema),
    preSelectedSessions: z.array(preSelectedSessionSchema),
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
    batches: z
        .object({
            maxCourses: z.number(),
            preSelectedCourses: z.array(preSelectedCoursesSchema),
            learnerChoiceCourses: z.array(learnerChoiceCoursesSchema),
        })
        .optional(),
    studentExpiryDays: z.number(),
    inviteeEmail: z.string().optional(), // For the input field
    inviteeEmails: z
        .array(emailEntrySchema)
        .min(1, "Please add at least one email address")
        .default([]),
});

export type InviteFormType = z.infer<typeof inviteFormSchema>;
export type SelectionModeType = z.infer<typeof selectionModeSchema>;
export type BatchFieldType = z.infer<typeof dropdownItemSchema>;

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
    studentExpiryDays: 365,
    inviteeEmail: "",
    inviteeEmails: [],
};
