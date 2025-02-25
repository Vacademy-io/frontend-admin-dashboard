import { MyFilterOption } from "./my-filter";

export interface QuestionAssessmentStatusProps {
    assessmentId: string;
    sectionId: string | undefined;
    questionId: string | undefined;
    assesssmentType: string;
    questionStatus: string;
}

export interface StudentResponseQuestionwiseInterface {
    response_time_in_seconds: number;
    registration_id: string;
    status: string;
    attempt_id: string;
    participant_name: string;
    user_id: string;
    source: string;
    source_id: string;
}

export interface StudentQuestionwiseContent {
    content: StudentResponseQuestionwiseInterface[];
    page_no: number;
    page_size: number;
    total_elements: number;
    total_pages: number;
    last: boolean;
}

export interface SelectedFilterQuestionWise {
    name: string;
    status: string[];
    assessment_visibility: string[];
    registration_source: string[];
    registration_source_id: MyFilterOption[];
    sort_columns: Record<string, string>; // Allows dynamic string keys with string values
}
