import { uploadQuestionPaperFormSchema } from "@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

type QuestionPaperForm = z.infer<typeof uploadQuestionPaperFormSchema>;
export interface QuestionPaperTemplateProps {
    form: UseFormReturn<QuestionPaperForm>;
    questionPaperId: string | undefined;
    isViewMode: boolean;
    refetchData: () => void;
    isManualCreated?: boolean;
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

export interface QuestionPaperInterface {
    id: string; // Unique identifier for the paper
    title: string; // Title of the paper
    status: string; // Status with possible values
    level_id: string | null; // Level ID, nullable
    subject_id: string | null; // Subject ID, nullable
    description: string | null; // Description, nullable
    created_on: string; // ISO 8601 timestamp of creation
    updated_on: string; // ISO 8601 timestamp of last update
    created_by_user_id: string; // ID of the user who created the paper
}

export interface PaginatedResponse {
    content: QuestionPaperInterface[];
    page_no: number;
    page_size: number;
    total_elements: number;
    total_pages: number;
    last: boolean;
}

export interface Subject {
    id: string;
    subject_name: string;
    subject_code: string;
    credit: number | null;
    created_at: string;
    updated_at: string;
}

export interface Level {
    id: string;
    level_name: string;
    duration_in_days: number | null;
}

interface TextContent {
    id: string;
    type: string | null;
    content: string | null;
}

interface ExplanationText {
    id: string | null;
    type: string | null;
    content: string | null;
}

export interface OptionText {
    id: string;
    preview_id: string | null;
    question_id: string;
    text: TextContent;
    media_id: string | null;
    option_order: number | null;
    created_on: string;
    updated_on: string;
    explanation_text: ExplanationText;
}

export interface QuestionResponse {
    id: string | null;
    preview_id: string | null;
    section_id: string | null;
    section_order: number | null;
    text: TextContent;
    media_id: string | null;
    created_at: string;
    updated_at: string;
    question_response_type: string;
    question_type: string;
    access_level: string;
    auto_evaluation_json: string;
    evaluation_type: string;
    explanation_text: ExplanationText;
    default_question_time_mins: number | null;
    options: OptionText[];
    errors: string[];
    warnings: string[];
}

export interface QuestionPaperInterface {
    id: string;
    title: string;
    comma_separated_subject_ids: string;
    institute_id: string;
    level_id: string | null;
    subject_id: string | null;
    tags: string[]; // Array of strings
    description_id: string;
    created_by_user_id: string;
    questions: QuestionResponse[];
}