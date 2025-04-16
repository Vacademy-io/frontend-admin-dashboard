import { z } from "zod";

export const generateCompleteAssessmentFormSchema = z.object({
    questionPaperId: z
        .string({
            required_error: "Question Paper ID is required",
            invalid_type_error: "Question Paper ID must be a number",
        })
        .optional(),
    isFavourite: z.boolean().default(false),
    title: z.string({
        required_error: "Title is required",
        invalid_type_error: "Title must be a string",
    }),
    createdOn: z.date().default(() => new Date()),
    yearClass: z.string({
        required_error: "Title is required",
        invalid_type_error: "Title must be a string",
    }),
    subject: z.string({
        required_error: "Title is required",
        invalid_type_error: "Title must be a string",
    }),
    questionsType: z.string({
        required_error: "Question field is required",
        invalid_type_error: "Question field must be a string",
    }),
    optionsType: z.string({
        required_error: "Option field is required",
        invalid_type_error: "Option field must be a string",
    }),
    answersType: z.string({
        required_error: "Answer field is required",
        invalid_type_error: "Answer field must be a string",
    }),
    explanationsType: z.string({
        required_error: "Explanation field is required",
        invalid_type_error: "Explanation field must be a string",
    }),
    fileUpload: z
        .instanceof(File, {
            message: "File upload is required and must be a valid file",
        })
        .optional(),
    questions: z.array(
        z.object({
            questionId: z.string().optional(),
            questionName: z.string(),
            explanation: z.string().optional(),
            questionType: z.string().default("MCQS"),
            questionPenalty: z.string(),
            questionDuration: z.object({
                hrs: z.string(),
                min: z.string(),
            }),
            questionMark: z.string(),
            singleChoiceOptions: z
                .array(
                    z.object({
                        id: z.string().optional(),
                        name: z.string().optional(),
                        isSelected: z.boolean().optional(),
                    }),
                )
                .optional(),
            multipleChoiceOptions: z
                .array(
                    z.object({
                        id: z.string().optional(),
                        name: z.string().optional(),
                        isSelected: z.boolean().optional(),
                    }),
                )
                .optional(),
        }),
    ),
});
