import { z } from "zod";

export const sectionsEditQuestionFormSchema = z.array(
    z.object({
        sectionId: z.string().optional(),
        sectionName: z.string().min(1, "Section name is required"),
        questions: z.array(
            z.object({
                questionId: z.string().optional(),
                questionName: z.string().min(1, "Question name is required"),
                explanation: z.string().optional(),
                questionType: z.string().default("MCQS"),
                questionMark: z.string(),
                imageDetails: z
                    .array(
                        z.object({
                            imageId: z.string().optional(),
                            imageName: z.string().min(1, "Image name is required"),
                            imageTitle: z.string().optional(),
                            imageFile: z.string().min(1, "Image file is required"),
                            isDeleted: z.boolean().optional(),
                        }),
                    )
                    .optional(),
                singleChoiceOptions: z.array(
                    z.object({
                        name: z.string().optional(),
                        isSelected: z.boolean().optional(),
                        image: z.object({
                            imageId: z.string().optional(),
                            imageName: z.string().optional(),
                            imageTitle: z.string().optional(),
                            imageFile: z.string().optional(),
                            isDeleted: z.boolean().optional(),
                        }),
                    }),
                ),
                multipleChoiceOptions: z.array(
                    z.object({
                        name: z.string().optional(),
                        isSelected: z.boolean().optional(),
                        image: z.object({
                            imageId: z.string().optional(),
                            imageName: z.string().optional(),
                            imageTitle: z.string().optional(),
                            imageFile: z.string().optional(),
                            isDeleted: z.boolean().optional(),
                        }),
                    }),
                ),
            }),
        ),
    }),
);
