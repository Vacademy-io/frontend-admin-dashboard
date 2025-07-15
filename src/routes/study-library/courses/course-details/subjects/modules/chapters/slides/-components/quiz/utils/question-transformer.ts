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

// Helper function to extract subjective answer from auto_evaluation_json
const extractSubjectiveAnswer = (question: BackendQuestion, questionType: string): string => {
    if (!question.auto_evaluation_json) return '';

    try {
        const evaluationData = JSON.parse(question.auto_evaluation_json);
        console.log('[QuestionTransformer] Parsed auto_evaluation_json for', questionType, ':', evaluationData);
        
        let subjectiveAnswerText = '';
        if (questionType === 'ONE_WORD') {
            subjectiveAnswerText = evaluationData?.data?.answer || evaluationData?.answer || '';
        } else if (questionType === 'LONG_ANSWER') {
            subjectiveAnswerText = evaluationData?.data?.answer?.content || evaluationData?.answer?.content || evaluationData?.answer || '';
        }
        
        console.log('[QuestionTransformer] Extracted subjectiveAnswerText:', subjectiveAnswerText);
        return subjectiveAnswerText;
    } catch (error) {
        console.warn('[QuizPreview] Failed to parse auto_evaluation_json:', error);
        return '';
    }
};

// Helper function to create base transformed question
const createBaseTransformedQuestion = (
    question: BackendQuestion | any,
    questionText: string,
    questionType: string,
    validAnswers: number[]
): TransformedQuestion => {
    return {
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
};

// Helper function to handle subjective questions
const handleSubjectiveQuestion = (
    transformed: TransformedQuestion,
    question: BackendQuestion | any,
    questionType: string,
    validAnswers: number[],
    subjectiveAnswerText: string
): void => {
    console.log('[QuestionTransformer] Processing subjective question:', {
        questionType,
        validAnswers,
        subjectiveAnswerText,
    });

    // Remove default validAnswers for subjective questions
    if (validAnswers.length === 0 || (validAnswers.length === 1 && validAnswers[0] === 0)) {
        transformed.validAnswers = undefined;
        console.log('[QuestionTransformer] Removed default validAnswers for subjective question');
    }

    // Set subjective answer text
    if (subjectiveAnswerText) {
        transformed.subjectiveAnswerText = subjectiveAnswerText;
    } else if (question.subjectiveAnswerText) {
        transformed.subjectiveAnswerText = question.subjectiveAnswerText;
    } else if (question.answerText) {
        // Check for answerText field from form
        transformed.subjectiveAnswerText = question.answerText;
    }

    console.log(`[QuestionTransformer] ${questionType} question processed:`, {
        subjectiveAnswerText: transformed.subjectiveAnswerText,
        questionData: question
    });
};

// Helper function to handle numeric questions
const handleNumericQuestion = (transformed: TransformedQuestion, validAnswers: number[]): void => {
    transformed.subjectiveAnswerText = validAnswers.join(', ');
};

// Helper function to handle options for different question types
const handleQuestionOptions = (
    transformed: TransformedQuestion,
    question: BackendQuestion | any,
    questionType: string,
    validAnswers: number[]
): void => {
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
};

// Main function to transform a single question
export const transformQuestion = (question: BackendQuestion | any): TransformedQuestion => {
    const validAnswers = parseValidAnswers(question);
    const questionText = getQuestionText(question);
    const questionType =
        question.question_type ||
        question.question_response_type ||
        question.questionType ||
        'MCQS';

    // Extract subjective answer from backend data
    const subjectiveAnswerText = extractSubjectiveAnswer(question, questionType);

    // Create base transformed question
    const transformed = createBaseTransformedQuestion(question, questionText, questionType, validAnswers);

    // Handle different question types
    if (questionType === 'NUMERIC') {
        handleNumericQuestion(transformed, validAnswers);
    } else if (questionType === 'ONE_WORD' || questionType === 'LONG_ANSWER') {
        handleSubjectiveQuestion(transformed, question, questionType, validAnswers, subjectiveAnswerText);
    }

    // Handle options for all question types
    handleQuestionOptions(transformed, question, questionType, validAnswers);

    return transformed;
}; 