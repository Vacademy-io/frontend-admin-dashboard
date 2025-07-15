import { BackendQuestion, TransformedQuestion } from '../types';

// Helper function to parse auto_evaluation_json
export const parseValidAnswers = (question: BackendQuestion): number[] => {
    try {
        if (question.auto_evaluation_json) {
            const evaluationData = JSON.parse(question.auto_evaluation_json);
            return evaluationData.correctAnswers || [];
        }
    } catch (error) {
        console.warn('[QuizPreview] Failed to parse auto_evaluation_json:', error);
    }
    return [];
};

// Helper function to get question text
export const getQuestionText = (question: BackendQuestion): string => {
    return (
        question.parent_rich_text?.content ||
        question.text?.content ||
        question.text_data?.content ||
        question.questionName ||
        ''
    );
};

// Helper function to transform options
export const transformOptions = (
    options: BackendQuestion['options'],
    validAnswers: number[]
): Array<{ id: string; name: string; isSelected: boolean }> => {
    if (!options || options.length === 0) return [];

    return options.map((opt, idx: number) => ({
        id: opt.id || `opt-${idx}`,
        name: opt.text?.content || opt.content || '',
        isSelected: validAnswers.includes(idx),
    }));
};

// Helper function to transform a single question
export const transformQuestion = (question: BackendQuestion | any): TransformedQuestion => {
    const validAnswers = parseValidAnswers(question);
    const questionText = getQuestionText(question);
    const questionType =
        question.question_type ||
        question.question_response_type ||
        question.questionType ||
        'MCQS';

    // Extract subjective answer from backend data for ONE_WORD and LONG_ANSWER
    let subjectiveAnswerText = '';
    if (question.auto_evaluation_json) {
        try {
            const evaluationData = JSON.parse(question.auto_evaluation_json);
            console.log('[QuestionTransformer] Parsed auto_evaluation_json for', questionType, ':', evaluationData);
            if (questionType === 'ONE_WORD') {
                subjectiveAnswerText = evaluationData?.data?.answer || evaluationData?.answer || '';
            } else if (questionType === 'LONG_ANSWER') {
                subjectiveAnswerText = evaluationData?.data?.answer?.content || evaluationData?.answer?.content || evaluationData?.answer || '';
            }
            console.log('[QuestionTransformer] Extracted subjectiveAnswerText:', subjectiveAnswerText);
        } catch (error) {
            console.warn('[QuizPreview] Failed to parse auto_evaluation_json:', error);
        }
    }

    const transformed: TransformedQuestion = {
        questionName: questionText,
        questionType,
        questionPenalty: question.penalty || question.questionPenalty || '0',
        questionDuration: {
            min: '0',
            hrs: '0',
        },
        questionMark: question.mark || question.questionMark || '1',
        id: question.id,
        status: question.status,
        validAnswers: validAnswers.length > 0 ? validAnswers : undefined,
        explanation: question.explanation_text?.content || question.explanation || '',
        canSkip: question.can_skip || question.canSkip || false,
        tags: question.tags || [],
        singleChoiceOptions: [],
        multipleChoiceOptions: [],
        trueFalseOptions: [],
        subjectiveAnswerText: '',
    };

    // For subjective questions, don't set validAnswers if they're just default values
    if (questionType === 'LONG_ANSWER' || questionType === 'ONE_WORD') {
        console.log('[QuestionTransformer] Processing subjective question:', {
            questionType,
            validAnswers,
            subjectiveAnswerText,
        });
        if (validAnswers.length === 0 || (validAnswers.length === 1 && validAnswers[0] === 0)) {
            transformed.validAnswers = undefined;
            console.log('[QuestionTransformer] Removed default validAnswers for subjective question');
        }
    }

    // Handle numeric questions
    if (questionType === 'NUMERIC') {
        transformed.subjectiveAnswerText = validAnswers.join(', ');
    }
    // Handle one word questions
    else if (questionType === 'ONE_WORD') {
        if (subjectiveAnswerText) {
            transformed.subjectiveAnswerText = subjectiveAnswerText;
        } else if (question.subjectiveAnswerText) {
            transformed.subjectiveAnswerText = question.subjectiveAnswerText;
        }
        // Don't set default answer for subjective questions
    }
    // Handle long answer questions
    else if (questionType === 'LONG_ANSWER') {
        if (subjectiveAnswerText) {
            transformed.subjectiveAnswerText = subjectiveAnswerText;
        } else if (question.subjectiveAnswerText) {
            transformed.subjectiveAnswerText = question.subjectiveAnswerText;
        }
        // Don't set default answer for subjective questions
    }

    // Handle options for other question types
    // First check if it's form data (has the options arrays)
    if (question.singleChoiceOptions && question.singleChoiceOptions.length > 0) {
        transformed.singleChoiceOptions = question.singleChoiceOptions;
    } else if (question.multipleChoiceOptions && question.multipleChoiceOptions.length > 0) {
        transformed.multipleChoiceOptions = question.multipleChoiceOptions;
    } else if (question.trueFalseOptions && question.trueFalseOptions.length > 0) {
        transformed.trueFalseOptions = question.trueFalseOptions;
    }
    // Then check if it's backend data (has the options field)
    else if (question.options && question.options.length > 0) {
        const options = transformOptions(question.options, validAnswers);

        if (questionType === 'MCQS') {
            transformed.singleChoiceOptions = options;
        } else if (questionType === 'MCQM') {
            transformed.multipleChoiceOptions = options;
        } else if (questionType === 'TRUE_FALSE') {
            transformed.trueFalseOptions = options;
        }
    }

    return transformed;
}; 