import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { uploadQuestionPaperFormSchema } from "./upload-question-paper-form-schema";

// Infer the form type from the schema
type QuestionPaperForm = z.infer<typeof uploadQuestionPaperFormSchema>;
export interface QuestionPaperTemplateFormProps {
    form: UseFormReturn<QuestionPaperForm>;
    currentQuestionIndex: number;
    className: string;
}
