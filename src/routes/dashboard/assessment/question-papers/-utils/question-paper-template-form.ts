import { z } from "zod";
import { questionFormSchema } from "./question-form-schema";
import { UseFormReturn } from "react-hook-form";

// Infer the form type from the schema
type QuestionFormSchemaType = z.infer<typeof questionFormSchema>;

export interface QuestionPaperTemplateFormProps {
    form: UseFormReturn<QuestionFormSchemaType>;
    currentQuestionIndex: number;
    setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
    currentQuestionImageIndex: number;
    setCurrentQuestionImageIndex: React.Dispatch<React.SetStateAction<number>>;
    className: string;
    isSideBar?: boolean;
}
