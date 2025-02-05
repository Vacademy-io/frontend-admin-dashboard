import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { uploadQuestionPaperFormSchema } from "./upload-question-paper-form-schema";
import { Dispatch, SetStateAction } from "react";

// Infer the form type from the schema
type QuestionPaperForm = z.infer<typeof uploadQuestionPaperFormSchema>;
export interface QuestionPaperTemplateFormProps {
    form: UseFormReturn<QuestionPaperForm>;
    currentQuestionIndex: number;
    setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
    currentQuestionImageIndex: number;
    setCurrentQuestionImageIndex: Dispatch<SetStateAction<number>>;
    className: string;
}
