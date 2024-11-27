import { questionFormSchema } from "@/routes/dashboard/assessment/question-papers/-utils/question-form-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Infer the form type from the schema
type QuestionFormSchemaType = z.infer<typeof questionFormSchema>;

export interface QuestionImagePreviewDialogueProps {
    form: UseFormReturn<QuestionFormSchemaType>; // Type for the form
}
