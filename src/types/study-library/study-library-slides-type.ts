export interface SlideQuestionsDataInterface {
    id: string;
    source_id: string;
    source_type: string;
    title: string;
    image_file_id: string;
    description: string;
    status: string;
    slide_order: number;

    video_slide: {
        id: string;
        description: string;
        title: string;
        url: string;
        video_length_in_millis: number;
        published_url: string;
        published_video_length_in_millis: number;
        source_type: string;
    };

    document_slide: {
        id: string;
        type: string;
        data: string;
        title: string;
        cover_file_id: string;
        total_pages: number;
        published_data: string;
        published_document_total_pages: number;
    };

    question_slide: {
        id: string;
        parent_rich_text: RichText;
        text_data: RichText;
        explanation_text_data: RichText;
        media_id: string;
        question_response_type: string;
        question_type: string;
        access_level: string;
        auto_evaluation_json: string;
        evaluation_type: string;
        default_question_time_mins: number;
        re_attempt_count: string;
        points: string;
        options?: QuestionOption[];
    };

    quiz_slide?: {
        id: string;
        title: string;
        description: {
            id: string;
            type: string;
            content: string;
        };
        questions: {
            id: string;
            parent_rich_text: { id: string; type: string; content: string };
            text: { id: string; type: string; content: string };
            explanation_text: { id: string; type: string; content: string };
            media_id: string;
            status: string;
            question_response_type: string;
            question_type: string;
            access_level: string;
            auto_evaluation_json: string;
            evaluation_type: string;
            question_order: number;
            quiz_slide_id: string;
            can_skip: boolean;
            options: {
                id: string;
                quiz_slide_question_id: string;
                text: { id: string; type: string; content: string };
                explanation_text: { id: string; type: string; content: string };
                media_id: string;
            }[];
        }[];
    };

    assignment_slide: {
        id: string;
        parentRichText: RichText;
        textData: RichText;
        liveDate: string; // ISO date string
        endDate: string;
        reAttemptCount: number;
        commaSeparatedMediaIds: string;
    };

    is_loaded: boolean;
    new_slide: boolean;
}

export interface RichText {
    id: string;
    type: string;
    content: string;
}

export interface QuestionOption {
    id: string;
    questionSlideId: string;
    text: RichText;
    explanationTextData: RichText;
    mediaId: string;
}
