import { z } from "zod";

export const BasicInfoFormSchema = z.object({
    status: z.string(),
    testCreation: z.object({
        assessmentName: z.string().min(1, "assessName is required"),
        subject: z.string(),
        assessmentInstructions: z.string(),
        liveDateRange: z
            .object({
                startDate: z.string(), // Assuming these are ISO strings or formatted dates
                endDate: z.string(),
            })
            .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
                message: "End date must be greater than start date",
                path: ["endDate"], // The path to associate the error with
            }),
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
