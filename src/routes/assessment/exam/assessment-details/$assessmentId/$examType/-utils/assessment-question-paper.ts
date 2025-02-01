import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { sectionsEditQuestionFormSchema } from "./sections-edit-question-form-schema";

// Infer the form type from the schema
type sectionQuestionPaperForm = z.infer<typeof sectionsEditQuestionFormSchema>;
export interface SectionQuestionPaperFormProps {
    form: UseFormReturn<sectionQuestionPaperForm>;
    currentQuestionIndex: number;
    currentQuestionImageIndex: number;
    setCurrentQuestionImageIndex: (index: number) => void;
    className: string;
    selectedSectionIndex: number;
}
