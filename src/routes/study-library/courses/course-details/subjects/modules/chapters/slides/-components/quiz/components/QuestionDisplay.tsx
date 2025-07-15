import React from 'react';
import { TransformedQuestion } from '../types';

interface QuestionDisplayProps {
    question: TransformedQuestion;
    questionIndex: number;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
    question,
    questionIndex,
    onEdit,
    onDelete,
}) => {
    // Debug logging for explanations
    console.log('[QuestionDisplay] Rendering question:', {
        questionIndex: questionIndex + 1,
        questionType: question.questionType,
        questionName: question.questionName,
        explanation: question.explanation,
        explanationLength: question.explanation?.length || 0,
        hasExplanation: !!question.explanation,
        explanationContent: question.explanation
    });

    // Debug logging for subjective questions
    if (question.questionType === 'LONG_ANSWER' || question.questionType === 'ONE_WORD') {
        console.log('[QuestionDisplay] Subjective question data:', {
            questionType: question.questionType,
            subjectiveAnswerText: question.subjectiveAnswerText,
            validAnswers: question.validAnswers,
            questionName: question.questionName,
        });
    }
    const renderOptions = (options: Array<{ id: string; name: string; isSelected: boolean }>) => {
        return (
            <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-slate-600">Options:</div>
                <div className="grid grid-cols-2 gap-2">
                    {options.map((option, optionIndex) => (
                        <div
                            key={optionIndex}
                            className={`flex items-center gap-2 rounded-md p-2 text-xs ${
                                option.isSelected
                                    ? 'border border-green-200 bg-green-50'
                                    : 'border border-slate-200 bg-slate-50'
                            }`}
                        >
                            <div
                                className={`flex size-5 items-center justify-center rounded-full text-xs font-medium ${
                                    option.isSelected
                                        ? 'bg-green-500 text-white'
                                        : 'bg-slate-300 text-slate-600'
                                }`}
                            >
                                {String.fromCharCode(65 + optionIndex)}
                            </div>
                            <div
                                className="flex-1"
                                dangerouslySetInnerHTML={{
                                    __html: option.name || '',
                                }}
                            />
                            {option.isSelected && (
                                <div className="text-xs font-medium text-green-600">✓ Correct</div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                    <span className="font-medium">
                        {options.filter(opt => opt.isSelected).length > 1 ? 'Correct Answers: ' : 'Correct Answer: '}
                    </span>
                    {options
                        .map((option, index) =>
                            option.isSelected ? String.fromCharCode(65 + index) : null
                        )
                        .filter(Boolean)
                        .join(', ')}
                </div>
            </div>
        );
    };

    const renderSubjectiveAnswer = (answerText: string | undefined, label: string = 'Correct Answer:') => {
        const hasAnswer = answerText && answerText.trim() !== '' && answerText !== 'No answer provided';
        return (
            <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-slate-600">{label}</div>
                <div className={`rounded-md border p-3 text-xs ${
                    hasAnswer 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-orange-200 bg-orange-50'
                }`}>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: hasAnswer ? answerText : '<em>No answer provided</em>',
                        }}
                    />
                </div>
            </div>
        );
    };

    const renderNumericAnswer = (validAnswers: number[]) => {
        return (
            <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-slate-600">Correct Answer(s):</div>
                <div className="flex flex-wrap gap-2">
                    {validAnswers.map((answer, answerIndex) => (
                        <div
                            key={answerIndex}
                            className="rounded-md border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                        >
                            {answer}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderCorrectAnswerIndex = (validAnswers: number[], questionType: string) => {
        if (!validAnswers || validAnswers.length === 0) return null;
        
        return (
            <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-slate-600">Correct Answer(s):</div>
                <div className="flex flex-wrap gap-2">
                    {validAnswers.map((answerIndex, index) => (
                        <div
                            key={index}
                            className="rounded-md border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                        >
                            Option {String.fromCharCode(65 + answerIndex)} (Index: {answerIndex})
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderExplanation = (explanation: string) => {
        if (!explanation || explanation.trim() === '') return null;
        
        return (
            <div className="mt-4 space-y-2">
                <div className="text-xs font-medium text-slate-600">Explanation:</div>
                <div className="rounded-md border border-purple-200 bg-purple-50 p-3 text-xs">
                    <div
                        className="text-slate-700"
                        dangerouslySetInnerHTML={{
                            __html: explanation,
                        }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="relative flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-primary-700 flex size-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold">
                        {questionIndex + 1}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-600">
                            Question {questionIndex + 1}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        {question.questionType}
                    </span>
                    <button
                        type="button"
                        className="flex size-8 items-center justify-center rounded border border-slate-200 bg-white p-0 text-slate-600 hover:bg-slate-50"
                        onClick={() => onEdit(questionIndex)}
                    >
                        <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        className="flex size-8 items-center justify-center rounded border border-slate-200 bg-white p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => onDelete(questionIndex)}
                    >
                        <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="ml-11">
                <div className="mb-2 text-sm font-medium text-slate-700">
                    <div
                        dangerouslySetInnerHTML={{
                            __html: question.questionName || 'Untitled Question',
                        }}
                    />
                </div>

                {/* Display Answer Options based on question type */}
                {(question.questionType === 'MCQS' || question.questionType === 'CMCQS') && 
                    (question.singleChoiceOptions && question.singleChoiceOptions.length > 0) && 
                    renderOptions(question.singleChoiceOptions)}

                {(question.questionType === 'MCQM' || question.questionType === 'CMCQM') && 
                    (question.multipleChoiceOptions && question.multipleChoiceOptions.length > 0) && 
                    renderOptions(question.multipleChoiceOptions)}

                {question.questionType === 'TRUE_FALSE' && question.trueFalseOptions && question.trueFalseOptions.length > 0 && 
                    renderOptions(question.trueFalseOptions)}

                {/* Show message when options are expected but not found */}
                {((question.questionType === 'MCQS' || question.questionType === 'CMCQS') && 
                    (!question.singleChoiceOptions || question.singleChoiceOptions.length === 0)) && (
                    <div className="mt-3 space-y-2">
                        <div className="text-xs text-orange-600">
                            <span className="font-medium">Note: </span>
                            No options found for this {question.questionType} question
                        </div>
                        {question.validAnswers && renderCorrectAnswerIndex(question.validAnswers, question.questionType)}
                    </div>
                )}

                {((question.questionType === 'MCQM' || question.questionType === 'CMCQM') && 
                    (!question.multipleChoiceOptions || question.multipleChoiceOptions.length === 0)) && (
                    <div className="mt-3 space-y-2">
                        <div className="text-xs text-orange-600">
                            <span className="font-medium">Note: </span>
                            No options found for this {question.questionType} question
                        </div>
                        {question.validAnswers && renderCorrectAnswerIndex(question.validAnswers, question.questionType)}
                    </div>
                )}

                {question.questionType === 'TRUE_FALSE' && 
                    (!question.trueFalseOptions || question.trueFalseOptions.length === 0) && (
                    <div className="mt-3 space-y-2">
                        <div className="text-xs text-orange-600">
                            <span className="font-medium">Note: </span>
                            No True/False options found for this question
                        </div>
                        {question.validAnswers && renderCorrectAnswerIndex(question.validAnswers, question.questionType)}
                    </div>
                )}

                {(question.questionType === 'NUMERIC' || question.questionType === 'CNUMERIC') && question.validAnswers && question.validAnswers.length > 0 && 
                    renderNumericAnswer(question.validAnswers)}

                {(question.questionType === 'LONG_ANSWER' || question.questionType === 'ONE_WORD') &&
                    renderSubjectiveAnswer(
                        question.subjectiveAnswerText || ''
                    )}

                {/* Display Explanation */}
                {renderExplanation(question.explanation || '')}
            </div>
        </div>
    );
};

export default QuestionDisplay; 