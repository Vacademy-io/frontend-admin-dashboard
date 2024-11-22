import { questionFormSchema } from "@/routes/dashboard/assessment/question-papers/view/-utils/question-form-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Infer the form type from the schema
type QuestionFormSchemaType = z.infer<typeof questionFormSchema>;

export interface QuestionImagePreviewDialogueProps {
    form: UseFormReturn<QuestionFormSchemaType>; // Type for the form
    currentQuestionIndex: number; // Type for the current question index
    currentQuestionImageIndex: number; // Type for the current image index
}
