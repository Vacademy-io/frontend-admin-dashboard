import { z } from "zod";

export const questionFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    questions: z
        .array(
            z.object({
                questionId: z.string().optional(),
                questionName: z.string().min(1, "Question name is required"),
                explanation: z.string().optional(),
                questionType: z.string(),
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
                option1: z.object({
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
                option2: z.object({
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
                option3: z.object({
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
                option4: z.object({
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
            }),
        )
        .superRefine((questions, ctx) => {
            questions.forEach((question, index) => {
                // Validation for missing questionName
                if (!question.questionName) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Question name is required at question no.${index + 1}`,
                        path: ["questions", index, "questionName"], // Highlights the specific question field
                    });
                }

                // Validation for selected options
                const hasSelectedOption = [
                    question.option1.isSelected,
                    question.option2.isSelected,
                    question.option3.isSelected,
                    question.option4.isSelected,
                ].some((isSelected) => isSelected === true);

                if (!hasSelectedOption) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `At least one option must be selected. Error at question no.${
                            index + 1
                        }`,
                        path: ["questions", index], // Highlights the specific question index
                    });
                }
            });
        }),
});
