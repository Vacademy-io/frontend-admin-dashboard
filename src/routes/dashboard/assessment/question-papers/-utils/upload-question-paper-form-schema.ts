import { z } from "zod";

export const uploadQuestionPaperFormSchema = z.object({
    title: z.string({
        required_error: "Title is required",
        invalid_type_error: "Title must be a string",
    }),
    questions: z.string({
        required_error: "Question field is required",
        invalid_type_error: "Question field must be a string",
    }),
    options: z.string({
        required_error: "Option field is required",
        invalid_type_error: "Option field must be a string",
    }),
    answers: z.string({
        required_error: "Answer field is required",
        invalid_type_error: "Answer field must be a string",
    }),
    explanations: z.string({
        required_error: "Explanation field is required",
        invalid_type_error: "Explanation field must be a string",
    }),
    fileUpload: z.instanceof(File, {
        message: "File upload is required and must be a valid file",
    }),
});
