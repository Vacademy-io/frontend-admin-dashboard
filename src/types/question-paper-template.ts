import { uploadQuestionPaperFormSchema } from "@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

type QuestionPaperForm = z.infer<typeof uploadQuestionPaperFormSchema>;
export interface QuestionPaperTemplateProps {
    form: UseFormReturn<QuestionPaperForm>;
    questionPaperId: number | undefined;
    isViewMode: boolean;
}

export interface QuestionData {
    questionId: number;
    questionHtml: string;
    explanationHtml: string;
    answerOptionIds: string[];
    optionsData: OptionData[];
    errors: string[];
    warnings: string[];
}

export interface OptionData {
    optionId: number;
    optionHtml: string;
}
