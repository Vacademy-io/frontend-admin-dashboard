import { z } from "zod";

export const BasicInfoFormSchema = z.object({
    testCreation: z.object({
        assessmentName: z.string(),
        subject: z.string(),
        assessmentInstructions: z.string(),
        liveDateRange: z.object({
            startDate: z.string(), // Refine with date validation if necessary
            endDate: z.string(),
        }),
    }),
    testDuration: z.object({
        entireTestDuration: z.object({
            checked: z.boolean(),
            testDuration: z.object({
                hrs: z.string(), // Validate as a two-digit number
                min: z.string(), // Validate as a two-digit number (0-59)
            }),
        }),
        sectionWiseDuration: z.boolean(),
    }),
    assessmentPreview: z.object({
        checked: z.boolean(),
        previewTimeLimit: z.string(),
    }),
    switchSections: z.boolean(),
    raiseReattemptRequest: z.boolean(),
    raiseTimeIncreaseRequest: z.boolean(),
});
