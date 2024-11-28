import { z } from "zod";

export const questionFormSchema = z.object({
    title: z.string({
        required_error: "Title is required",
        invalid_type_error: "Title field must be a string",
    }),
    questions: z.array(
        z.object({
            questionId: z
                .string({
                    required_error: "Question ID is required",
                    invalid_type_error: "Question ID must be a string",
                })
                .optional(),
            questionName: z.string({
                required_error: "Question name is required",
                invalid_type_error: "Question name must be a string",
            }),
            explanation: z
                .string({
                    required_error: "Explanation is required",
                    invalid_type_error: "Explanation must be a string",
                })
                .optional(),
            imageDetails: z
                .array(
                    z.object({
                        imageId: z.string({
                            required_error: "Image ID is required",
                            invalid_type_error: "Image ID must be a string",
                        }),
                        imageName: z.string({
                            required_error: "Image name is required",
                            invalid_type_error: "Image name must be a string",
                        }),
                        imageTitle: z.string({
                            required_error: "Image title is required",
                            invalid_type_error: "Image title must be a string",
                        }),
                        imageFile: z.string().optional(),
                        isDeleted: z.boolean({
                            required_error: "isDeleted is required",
                            invalid_type_error: "isDeleted must be a boolean",
                        }),
                    }),
                )
                .optional(),
            option1: z.object({
                name: z.string({
                    required_error: "Option 1 name is required",
                    invalid_type_error: "Option 1 name must be a string",
                }),
                isSelected: z.boolean({
                    required_error: "Please select option 1",
                    invalid_type_error: "Option 1 must be a boolean",
                }),
            }),
            option2: z.object({
                name: z.string({
                    required_error: "Option 2 name is required",
                    invalid_type_error: "Option 2 name must be a string",
                }),
                isSelected: z.boolean({
                    required_error: "Please select option 2",
                    invalid_type_error: "Option 2 must be a boolean",
                }),
            }),
            option3: z.object({
                name: z.string({
                    required_error: "Option 3 name is required",
                    invalid_type_error: "Option 3 name must be a string",
                }),
                isSelected: z.boolean({
                    required_error: "Please select option 3",
                    invalid_type_error: "Option 3 must be a boolean",
                }),
            }),
            option4: z.object({
                name: z.string({
                    required_error: "Option 4 name is required",
                    invalid_type_error: "Option 4 name must be a string",
                }),
                isSelected: z.boolean({
                    required_error: "Please select option 4",
                    invalid_type_error: "Option 4 must be a boolean",
                }),
            }),
        }),
    ),
});
