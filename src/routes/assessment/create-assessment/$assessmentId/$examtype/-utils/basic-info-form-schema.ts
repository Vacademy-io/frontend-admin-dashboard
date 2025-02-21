import { z } from "zod";

export const BasicInfoFormSchema = z.object({
    status: z.string(),
    testCreation: z.object({
        assessmentName: z.string().min(1, "assessName is required"),
        subject: z.string(),
        assessmentInstructions: z.string(),
        liveDateRange: z
            .object({
                startDate: z.string().optional(),
                endDate: z.string().optional(),
            })
            .refine(
                (data) =>
                    (!data.startDate && !data.endDate) || // Allow empty
                    new Date(data.endDate!) > new Date(data.startDate!), // Date comparison
                {
                    message: "End date must be greater than start date",
                    path: ["endDate"],
                },
            ),
    }),
    assessmentPreview: z.object({
        checked: z.boolean(),
        previewTimeLimit: z.string(),
    }),
    submissionType: z.string(),
    durationDistribution: z.string(),
    evaluationType: z.string(),
    switchSections: z.boolean(),
    raiseReattemptRequest: z.boolean(),
    raiseTimeIncreaseRequest: z.boolean(),
});
