import { UploadQuestionPaperFormType } from '@/routes/assessment/question-papers/-components/QuestionPaperUpload';
import { QuizSlidePayload, QuizSlideQuestion } from '../../../-hooks/use-slides';
import { Slide } from '../types';

// Helper function to transform form questions to backend format
export const transformFormQuestionsToBackend = (
    questions: UploadQuestionPaperFormType['questions']
): QuizSlideQuestion[] => {
    return questions.map((question, index) => {
        // Determine which options array to use based on question type
        let options: Array<{
            id: string;
            quiz_slide_question_id: string;
            text: { id: string; type: string; content: string };
            explanation_text: { id: string; type: string; content: string };
            media_id: string;
        }> = [];
        let questionResponseType = 'OPTION';
        let evaluationType = 'AUTO';

        switch (question.questionType) {
            case 'MCQS':
                options = (question.singleChoiceOptions || []).map((option) => ({
                    id: option.id || crypto.randomUUID(),
                    quiz_slide_question_id: '',
                    text: { id: '', type: 'TEXT', content: option.name || '' },
                    explanation_text: { id: '', type: 'TEXT', content: '' },
                    media_id: '',
                }));
                break;
            case 'MCQM':
                options = (question.multipleChoiceOptions || []).map((option) => ({
                    id: option.id || crypto.randomUUID(),
                    quiz_slide_question_id: '',
                    text: { id: '', type: 'TEXT', content: option.name || '' },
                    explanation_text: { id: '', type: 'TEXT', content: '' },
                    media_id: '',
                }));
                break;
            case 'TRUE_FALSE':
                options = (question.trueFalseOptions || []).map((option) => ({
                    id: option.id || crypto.randomUUID(),
                    quiz_slide_question_id: '',
                    text: { id: '', type: 'TEXT', content: option.name || '' },
                    explanation_text: { id: '', type: 'TEXT', content: '' },
                    media_id: '',
                }));
                break;
            case 'NUMERIC':
                questionResponseType = 'NUMERIC';
                evaluationType = 'AUTO';
                break;
            case 'LONG_ANSWER':
                questionResponseType = 'TEXT';
                evaluationType = 'MANUAL';
                break;
            case 'ONE_WORD':
                questionResponseType = 'TEXT';
                evaluationType = 'AUTO';
                break;
            default:
                options = (question.singleChoiceOptions || []).map((option) => ({
                    id: option.id || crypto.randomUUID(),
                    quiz_slide_question_id: '',
                    text: { id: '', type: 'TEXT', content: option.name || '' },
                    explanation_text: { id: '', type: 'TEXT', content: '' },
                    media_id: '',
                }));
        }

        return {
            id: question.id || crypto.randomUUID(),
            parent_rich_text: {
                id: '',
                type: 'TEXT',
                content: question.questionName || '',
            },
            text: { id: '', type: 'TEXT', content: question.questionName || '' },
            explanation_text: {
                id: '',
                type: 'TEXT',
                content: question.explanation || '',
            },
            media_id: '',
            status: question.status || 'ACTIVE',
            question_response_type: questionResponseType,
            question_type: question.questionType,
            access_level: 'INSTITUTE',
            auto_evaluation_json: question.validAnswers
                ? JSON.stringify({ correctAnswers: question.validAnswers })
                : '',
            evaluation_type: evaluationType,
            question_order: index + 1,
            quiz_slide_id: '', // This will be set by the caller
            can_skip: question.canSkip || false,
            options: options,
        };
    });
};

// Helper function to create quiz slide payload for API
export const createQuizSlidePayload = (
    questions: UploadQuestionPaperFormType['questions'],
    activeItem: Slide
): QuizSlidePayload => {
    return {
        id: activeItem.id,
        source_id: activeItem.source_id || '',
        source_type: activeItem.source_type || 'QUIZ',
        title: activeItem.title || 'Quiz',
        image_file_id: activeItem.image_file_id || '',
        description: activeItem.description || '',
        status: activeItem.status || 'DRAFT',
        slide_order: activeItem.slide_order || 0,
        video_slide: null,
        document_slide: null,
        question_slide: null,
        assignment_slide: null,
        quiz_slide: {
            id: activeItem.quiz_slide?.id || crypto.randomUUID(),
            title: activeItem.quiz_slide?.title || activeItem.title || 'Quiz',
            description: activeItem.quiz_slide?.description || {
                id: '',
                content: '',
                type: 'TEXT',
            },
            questions: transformFormQuestionsToBackend(questions),
        },
        is_loaded: true,
        new_slide: false,
    };
}; 