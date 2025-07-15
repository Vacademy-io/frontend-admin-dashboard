import { UploadQuestionPaperFormType } from '@/routes/assessment/question-papers/-components/QuestionPaperUpload';
import { QuizSlidePayload, QuizSlideQuestion } from '../../../-hooks/use-slides';
import { Slide } from '../types';

// Helper function to create option structure
const createOptionStructure = (option: any) => ({
    id: option.id || crypto.randomUUID(),
    quiz_slide_question_id: '',
    text: { id: '', type: 'TEXT', content: option.name || '' },
    explanation_text: { id: '', type: 'TEXT', content: '' },
    media_id: '',
});

// Helper function to determine question response type and evaluation type
const getQuestionResponseConfig = (questionType: string): { questionResponseType: string; evaluationType: string } => {
    switch (questionType) {
        case 'NUMERIC':
        case 'CNUMERIC':
            return { questionResponseType: 'NUMERIC', evaluationType: 'AUTO' };
        case 'LONG_ANSWER':
            return { questionResponseType: 'TEXT', evaluationType: 'MANUAL' };
        case 'ONE_WORD':
            return { questionResponseType: 'TEXT', evaluationType: 'AUTO' };
        default:
            return { questionResponseType: 'OPTION', evaluationType: 'AUTO' };
    }
};

// Helper function to transform options based on question type
const transformOptionsByType = (question: any): Array<{
    id: string;
    quiz_slide_question_id: string;
    text: { id: string; type: string; content: string };
    explanation_text: { id: string; type: string; content: string };
    media_id: string;
}> => {
    switch (question.questionType) {
        case 'MCQS':
        case 'CMCQS':
            return (question.singleChoiceOptions || []).map(createOptionStructure);
        case 'MCQM':
        case 'CMCQM':
            return (question.multipleChoiceOptions || []).map(createOptionStructure);
        case 'TRUE_FALSE':
            return (question.trueFalseOptions || []).map(createOptionStructure);
        default:
            return (question.singleChoiceOptions || []).map(createOptionStructure);
    }
};

// Helper function to create auto evaluation JSON
const createAutoEvaluationJson = (question: any): string => {
    if (question.questionType === 'LONG_ANSWER' || question.questionType === 'ONE_WORD') {
        // For subjective questions, store the answer text
        if (question.subjectiveAnswerText && question.subjectiveAnswerText.trim() !== '') {
            const autoEvaluationJson = JSON.stringify({
                data: {
                    answer: question.questionType === 'LONG_ANSWER' 
                        ? { content: question.subjectiveAnswerText }
                        : question.subjectiveAnswerText
                }
            });
            console.log('[API Helpers] Subjective question auto_evaluation_json:', {
                questionType: question.questionType,
                subjectiveAnswerText: question.subjectiveAnswerText,
                autoEvaluationJson
            });
            return autoEvaluationJson;
        } else if (question.validAnswers && question.validAnswers.length > 0) {
            // Fallback to validAnswers if no subjective answer
            return JSON.stringify({ correctAnswers: question.validAnswers });
        }
    } else {
        // For other question types, use validAnswers
        if (question.validAnswers && question.validAnswers.length > 0) {
            return JSON.stringify({ correctAnswers: question.validAnswers });
        }
    }
    return '';
};

// Helper function to create question structure
const createQuestionStructure = (question: any, index: number, options: any[], questionResponseType: string, evaluationType: string): QuizSlideQuestion => ({
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
    auto_evaluation_json: createAutoEvaluationJson(question),
    evaluation_type: evaluationType,
    question_order: index + 1,
    quiz_slide_id: '', // This will be set by the caller
    can_skip: question.canSkip || false,
    options: options,
});

// Helper function to transform form questions to backend format
export const transformFormQuestionsToBackend = (
    questions: UploadQuestionPaperFormType['questions']
): QuizSlideQuestion[] => {
    return questions.map((question, index) => {
        const { questionResponseType, evaluationType } = getQuestionResponseConfig(question.questionType);
        const options = transformOptionsByType(question);
        
        return createQuestionStructure(question, index, options, questionResponseType, evaluationType);
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