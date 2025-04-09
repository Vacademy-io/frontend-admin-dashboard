interface RichText {
    id: string | null;
    type: "HTML" | string;
    content: string;
}

interface Option {
    id: string | null;
    preview_id: string;
    question_id: string | null;
    text: RichText;
    media_id: string | null;
    option_order: number | null;
    created_on: string | null;
    updated_on: string | null;
    explanation_text: string | null;
}

export interface AIAssessmentCompleteQuestion {
    id: string | null;
    preview_id: string | null;
    section_id: string | null;
    question_order_in_section: number | null;
    text: RichText;
    media_id: string | null;
    created_at: string | null;
    updated_at: string | null;
    question_response_type: string;
    question_type: string;
    access_level: string;
    auto_evaluation_json: string;
    options_json: string | null;
    parsed_evaluation_object: string | null;
    evaluation_type: string | null;
    explanation_text: RichText;
    default_question_time_mins: number | null;
    parent_rich_text_id: string | null;
    parent_rich_text: string | null;
    options: Option[];
    errors: string[];
    warnings: string[];
    tags: string[];
    level: string;
}

export interface AIAssessmentResponseInterface {
    title: string;
    tags: string[];
    difficulty: string;
    description: string | null;
    subjects: string[];
    classes: string[];
    questions: AIAssessmentCompleteQuestion[];
}
