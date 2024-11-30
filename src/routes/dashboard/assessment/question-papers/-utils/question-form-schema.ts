import { z } from "zod";

export const questionFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    questions: z
        .array(
            z.object({
                questionId: z.string().optional(),
                questionName: z.string().min(1, "Question name is required"),
                explanation: z.string().optional(),
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
                    name: z.string().min(1, "Option 1 is required"),
                    isSelected: z.boolean(),
                    image: z
                        .object({
                            imageId: z.string().optional(),
                            imageName: z.string().min(1, "Image name is required"),
                            imageTitle: z.string().optional(),
                            imageFile: z.string().min(1, "Image file is required"),
                        })
                        .optional(),
                }),
                option2: z.object({
                    name: z.string().min(1, "Option 2 is required"),
                    isSelected: z.boolean(),
                    image: z
                        .object({
                            imageId: z.string().optional(),
                            imageName: z.string().min(1, "Image name is required"),
                            imageTitle: z.string().optional(),
                            imageFile: z.string().min(1, "Image file is required"),
                        })
                        .optional(),
                }),
                option3: z.object({
                    name: z.string().min(1, "Option 3 is required"),
                    isSelected: z.boolean(),
                    image: z
                        .object({
                            imageId: z.string().optional(),
                            imageName: z.string().min(1, "Image name is required"),
                            imageTitle: z.string().optional(),
                            imageFile: z.string().min(1, "Image file is required"),
                        })
                        .optional(),
                }),
                option4: z.object({
                    name: z.string().min(1, "Option 4 is required"),
                    isSelected: z.boolean(),
                    image: z
                        .object({
                            imageId: z.string().optional(),
                            imageName: z.string().min(1, "Image name is required"),
                            imageTitle: z.string().optional(),
                            imageFile: z.string().min(1, "Image file is required"),
                        })
                        .optional(),
                }),
            }),
        )
        .superRefine((questions, ctx) => {
            questions.forEach((question, index) => {
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
