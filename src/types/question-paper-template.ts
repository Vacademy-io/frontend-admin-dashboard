import { uploadQuestionPaperFormSchema } from "@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

type QuestionPaperForm = z.infer<typeof uploadQuestionPaperFormSchema>;
export interface QuestionPaperTemplateProps {
    form: UseFormReturn<QuestionPaperForm>;
    questionsData?: QuestionData[];
}

interface OptionData {
    optionId: number;
    optionHtml: string;
}

export interface QuestionData {
    length: number;
    questionId: number;
    questionHtml: string;
    optionsData: OptionData[];
    answerOptionIds: string[];
    explanationHtml: string;
    errors: string[]; // Array of error messages
    warnings: string[]; // Array of warning messages
}
