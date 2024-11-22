import { z } from "zod";

export const questionFormSchema = z.object({
    title: z.string({
        required_error: "Title is required",
        invalid_type_error: "Title field must be a string",
    }),
    description: z.string({
        required_error: "Description is required",
        invalid_type_error: "Description field must be a string",
    }),
    createdDate: z.string({
        required_error: "Created date is required",
        invalid_type_error: "Created date must be a string",
    }),
    questions: z.array(
        z.object({
            questionId: z.string({
                required_error: "Question ID is required",
                invalid_type_error: "Question ID must be a string",
            }),
            questionName: z.string({
                required_error: "Question name is required",
                invalid_type_error: "Question name must be a string",
            }),
            explanation: z.string({
                required_error: "Explanation is required",
                invalid_type_error: "Explanation must be a string",
            }),
            imageDetails: z.array(
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
                    isDeleted: z.boolean({
                        required_error: "isDeleted is required",
                        invalid_type_error: "isDeleted must be a boolean",
                    }),
                }),
            ),
            option1: z.object({
                name: z.string({
                    required_error: "Option 1 name is required",
                    invalid_type_error: "Option 1 name must be a string",
                }),
                isSelected: z.boolean({
                    required_error: "Option 1 isSelected is required",
                    invalid_type_error: "Option 1 isSelected must be a boolean",
                }),
            }),
            option2: z.object({
                name: z.string({
                    required_error: "Option 2 name is required",
                    invalid_type_error: "Option 2 name must be a string",
                }),
                isSelected: z.boolean({
                    required_error: "Option 2 isSelected is required",
                    invalid_type_error: "Option 2 isSelected must be a boolean",
                }),
            }),
            option3: z.object({
                name: z.string({
                    required_error: "Option 3 name is required",
                    invalid_type_error: "Option 3 name must be a string",
                }),
                isSelected: z.boolean({
                    required_error: "Option 3 isSelected is required",
                    invalid_type_error: "Option 3 isSelected must be a boolean",
                }),
            }),
            option4: z.object({
                name: z.string({
                    required_error: "Option 4 name is required",
                    invalid_type_error: "Option 4 name must be a string",
                }),
                isSelected: z.boolean({
                    required_error: "Option 4 isSelected is required",
                    invalid_type_error: "Option 4 isSelected must be a boolean",
                }),
            }),
        }),
    ),
});
