import { questionFormSchema } from "@/routes/dashboard/assessment/question-papers/-utils/question-form-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Infer the form type from the schema
type QuestionFormSchemaType = z.infer<typeof questionFormSchema>;

export interface UploadImageDialogueProps {
    form: UseFormReturn<QuestionFormSchemaType>; // Type for the form
    title: string; // Title for the dialogue
    triggerButton?: React.ReactNode; // Optional trigger button
}

export interface OptionImageDialogueProps {
    form: UseFormReturn<QuestionFormSchemaType>; // Type for the form
    title: string; // Title for the dialogue
    triggerButton?: React.ReactNode; // Optional trigger button
    option: number;
}