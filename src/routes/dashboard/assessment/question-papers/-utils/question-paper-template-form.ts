import { z } from "zod";
import { questionFormSchema } from "./question-form-schema";
import { UseFormReturn } from "react-hook-form";
import { uploadQuestionPaperFormSchema } from "./upload-question-paper-form-schema";

// Infer the form type from the schema
type QuestionFormSchemaType = z.infer<typeof questionFormSchema>;
type QuestionPaperForm = z.infer<typeof uploadQuestionPaperFormSchema>;
export interface QuestionPaperTemplateFormProps {
    form: UseFormReturn<QuestionFormSchemaType>;
    currentQuestionIndex: number;
    className: string;
    isSideBar?: boolean;
    questionPaperUploadForm: UseFormReturn<QuestionPaperForm>;
}
