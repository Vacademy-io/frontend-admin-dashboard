'use client';

import { MCQS, MCQM, Numerical, TrueFalse, LongAnswer, SingleWord, CMCQS, CMCQM } from '@/svgs';
import { QuestionType as QuestionTypeList } from '@/constants/dummy-data';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { questionsFormSchema } from '@/routes/assessment/question-papers/-utils/question-form-schema';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadQuestionPaperFormType } from '@/routes/assessment/question-papers/-components/QuestionPaperUpload';
import { uploadQuestionPaperFormSchema } from '@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema';
import { useRef, useState } from 'react';
import { useContentStore } from '../../-stores/chapter-sidebar-store';
import { toast } from 'sonner';
import {
    useSlidesMutations,
    useSlidesQuery,
    QuizSlidePayload,
    Slide,
} from '../../-hooks/use-slides';
import { Route } from '../..';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import QuizQuestionDialogAddPreview from './QuizQuestionDialog';

export interface QuestionTypeProps {
    icon: React.ReactNode;
    text: string;
    type?: string;
    handleAddQuestion: (type: string, questionPoints?: string, reattemptCount?: string) => void;
}

export type QuestionPaperFormType = z.infer<typeof questionsFormSchema>;

const AddQuizDialog = ({ openState }: { openState?: (open: boolean) => void }) => {
    const { getPackageSessionId } = useInstituteDetailsStore();
    const { setActiveItem, setItems, items } = useContentStore();

    const quizQuestionForm = useForm<UploadQuestionPaperFormType>({
        resolver: zodResolver(uploadQuestionPaperFormSchema),
        mode: 'onChange',
        defaultValues: {
            questionPaperId: '1',
            isFavourite: false,
            title: '',
            createdOn: new Date(),
            yearClass: '',
            subject: '',
            questionsType: '',
            optionsType: '',
            answersType: '',
            explanationsType: '',
            fileUpload: undefined,
            questions: [],
        },
    });

    const formRefData = useRef<UploadQuestionPaperFormType>(quizQuestionForm.getValues());
    const isAddQuestionTypeRef = useRef<HTMLButtonElement>(null);
    const [previewQuestionDialog, setPreviewQuestionDialog] = useState(false);
    const [formData, setFormData] = useState<UploadQuestionPaperFormType>(
        quizQuestionForm.getValues()
    );
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const { courseId, levelId, chapterId, moduleId, subjectId, sessionId } = Route.useSearch();

    const { addUpdateQuizSlide, updateSlideOrder } = useSlidesMutations(
        chapterId || '',
        moduleId || '',
        subjectId || '',
        getPackageSessionId({
            courseId: courseId || '',
            levelId: levelId || '',
            sessionId: sessionId || '',
        }) || ''
    );

    const { fields } = useFieldArray({
        control: quizQuestionForm.control,
        name: 'questions',
    });

    const createSlide = async (
        questions: UploadQuestionPaperFormType['questions']
    ): Promise<string | null> => {
        if (!questions || questions.length === 0) {
            toast.error('No questions provided for quiz creation.');
            return null;
        }

        const quizSlides = items.filter((slide) => slide.source_type === 'QUIZ');
        const quizIndex = quizSlides.length + 1;
        const autoTitle = `Quiz ${quizIndex}`;

        // Check for duplicate titles
        const existingTitles = quizSlides.map((slide) => slide.title.toLowerCase().trim());
        const proposedTitle = autoTitle.toLowerCase().trim();

        let finalTitle = autoTitle;
        if (existingTitles.includes(proposedTitle)) {
            // Find the next available number
            let counter = quizIndex + 1;
            let newTitle = `Quiz ${counter}`;
            while (existingTitles.includes(newTitle.toLowerCase().trim())) {
                counter++;
                newTitle = `Quiz ${counter}`;
            }

            console.log('[AddQuizDialog] Duplicate title detected, using:', newTitle);
            finalTitle = newTitle;
        }

        // Helper function to transform questions
        const transformQuestions = (questions: UploadQuestionPaperFormType['questions']) => {
            return questions.map((question, index) => {
                // Determine which options array to use based on question type
                let options: Array<{
                    id: string;
                    quiz_slide_question_id: string;
                    text: { id: string; type: string; content: string };
                    explanation_text: { id: string; type: string; content: string };
                    explanation_text_data: { id: string; type: string; content: string };
                    media_id: string;
                }> = [];
                let questionResponseType = 'OPTION';
                let evaluationType = 'AUTO';

                switch (question.questionType) {
                    case 'MCQS':
                    case 'CMCQS':
                        options = (question.singleChoiceOptions || []).map((option) => ({
                            id: option.id || crypto.randomUUID(),
                            quiz_slide_question_id: '',
                            text: { id: '', type: 'TEXT', content: option.name || '' },
                            explanation_text: { id: '', type: 'TEXT', content: '' },
                            explanation_text_data: { id: '', type: 'TEXT', content: '' },
                            media_id: '',
                        }));
                        break;
                    case 'MCQM':
                    case 'CMCQM':
                        options = (question.multipleChoiceOptions || []).map((option) => ({
                            id: option.id || crypto.randomUUID(),
                            quiz_slide_question_id: '',
                            text: { id: '', type: 'TEXT', content: option.name || '' },
                            explanation_text: { id: '', type: 'TEXT', content: '' },
                            explanation_text_data: { id: '', type: 'TEXT', content: '' },
                            media_id: '',
                        }));
                        break;
                    case 'TRUE_FALSE':
                        options = (question.trueFalseOptions || []).map((option) => ({
                            id: option.id || crypto.randomUUID(),
                            quiz_slide_question_id: '',
                            text: { id: '', type: 'TEXT', content: option.name || '' },
                            explanation_text: { id: '', type: 'TEXT', content: '' },
                            explanation_text_data: { id: '', type: 'TEXT', content: '' },
                            media_id: '',
                        }));
                        break;
                    case 'NUMERIC':
                    case 'CNUMERIC':
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
                            explanation_text_data: { id: '', type: 'TEXT', content: '' },
                            media_id: '',
                        }));
                }

                // Calculate question time in milliseconds
                const calculateQuestionTimeInMillis = (
                    question: UploadQuestionPaperFormType['questions'][0]
                ): number => {
                    const duration = question.questionDuration;
                    if (duration) {
                        const hours = parseInt(duration.hrs || '0') * 60 * 60 * 1000;
                        const minutes = parseInt(duration.min || '0') * 60 * 1000;
                        return hours + minutes;
                    }
                    return 0;
                };

                // Create auto evaluation JSON
                const createAutoEvaluationJson = (
                    question: UploadQuestionPaperFormType['questions'][0]
                ): string => {
                    if (
                        question.questionType === 'LONG_ANSWER' ||
                        question.questionType === 'ONE_WORD'
                    ) {
                        if (
                            question.subjectiveAnswerText &&
                            question.subjectiveAnswerText.trim() !== ''
                        ) {
                            return JSON.stringify({
                                data: {
                                    answer:
                                        question.questionType === 'LONG_ANSWER'
                                            ? { content: question.subjectiveAnswerText }
                                            : question.subjectiveAnswerText,
                                },
                            });
                        } else if (question.validAnswers && question.validAnswers.length > 0) {
                            return JSON.stringify({ correctAnswers: question.validAnswers });
                        }
                    } else {
                        if (question.validAnswers && question.validAnswers.length > 0) {
                            return JSON.stringify({ correctAnswers: question.validAnswers });
                        }
                    }
                    return '';
                };

                return {
                    id: crypto.randomUUID(),
                    parent_rich_text: {
                        id: '',
                        type: 'TEXT',
                        content: question.questionName || '',
                    },
                    text: { id: '', type: 'TEXT', content: question.questionName || '' },
                    text_data: { id: '', type: 'TEXT', content: question.questionName || '' },
                    explanation_text: {
                        id: '',
                        type: 'TEXT',
                        content: question.explanation || '',
                    },
                    explanation_text_data: {
                        id: '',
                        type: 'TEXT',
                        content: question.explanation || '',
                    },
                    media_id: '',
                    status: 'ACTIVE',
                    question_response_type: questionResponseType,
                    question_type: question.questionType,
                    questionType: question.questionType, // Fix: Add questionType field for backend compatibility
                    access_level: 'INSTITUTE',
                    auto_evaluation_json: createAutoEvaluationJson(question),
                    evaluation_type: evaluationType,
                    question_time_in_millis: calculateQuestionTimeInMillis(question),
                    question_order: index + 1,
                    quiz_slide_id: '',
                    can_skip: question.canSkip || false,
                    new_question: true,
                    options: options,
                };
            });
        };

        try {
            const transformedQuestions = transformQuestions(questions);

            const response: string = await addUpdateQuizSlide({
                id: `quiz-${crypto.randomUUID()}`,
                source_id: '',
                source_type: 'QUIZ',
                title: finalTitle,
                description: 'Quiz',
                image_file_id: '',
                status: 'DRAFT',
                slide_order: 0,
                video_slide: null,
                document_slide: null,
                question_slide: null,
                assignment_slide: null,
                quiz_slide: {
                    id: crypto.randomUUID(),
                    title: finalTitle,
                    description: { id: '', content: '', type: 'TEXT' },
                    questions: transformedQuestions,
                },
                is_loaded: true,
                new_slide: true,
            } as QuizSlidePayload);

            if (response) {
                const reorderedSlides = [
                    { slide_id: response, slide_order: 0 },
                    ...items
                        .filter((slide) => slide.id !== response)
                        .map((slide, index) => ({
                            slide_id: slide.id,
                            slide_order: index + 1,
                        })),
                ];

                await updateSlideOrder({
                    chapterId: chapterId || '',
                    slideOrderPayload: reorderedSlides,
                });

                toast.success('Quiz added successfully!');
                quizQuestionForm.reset();
                return response;
            }
        } catch (error) {
            console.error('Error creating quiz slide:', error);
            toast.error('Failed to add quiz');
        }

        return null;
    };
    const { refetch } = useSlidesQuery(chapterId || '');
    const handleAddQuestion = async (
        type: string,
        questionPoints?: string,
        reattemptCount?: string
    ) => {
        const newQuestion = {
            questionType: type,
            questionId: String(fields.length + 1),
            questionName: '',
            explanation: '',
            questionPenalty: '',
            questionDuration: { hrs: '', min: '' },
            questionMark: questionPoints ?? '1',
            singleChoiceOptions: Array(4).fill({ id: '', name: '', isSelected: false }),
            multipleChoiceOptions: Array(4).fill({ id: '', name: '', isSelected: false }),
            csingleChoiceOptions: Array(4).fill({ id: '', name: '', isSelected: false }),
            cmultipleChoiceOptions: Array(4).fill({ id: '', name: '', isSelected: false }),
            trueFalseOptions: Array(2).fill({ id: '', name: '', isSelected: false }),
            parentRichTextContent: '',
            decimals: 0,
            numericType: '',
            validAnswers: [0],
            questionResponseType: 'OPTION',
            subjectiveAnswerText: '',
            reattemptCount: reattemptCount ?? '0',
        };

        quizQuestionForm.setValue('questions', [newQuestion]);
        setPreviewQuestionDialog(true);
    };

    const handleCreateQuizSlide = async (): Promise<string | null> => {
        const questions = quizQuestionForm.getValues('questions');

        if (!questions || questions.length === 0) {
            toast.error('Please add at least one question before creating the quiz.');
            return null;
        }

        // Validate that all questions have required fields
        const invalidQuestions = questions.filter((q) => !q.questionName || !q.questionName.trim());
        if (invalidQuestions.length > 0) {
            toast.error('All questions must have a question name.');
            return null;
        }

        console.log('[AddQuizDialog] Creating slide with questions:', questions);
        const slideId = await createSlide(questions);

        if (!slideId) {
            toast.error('Quiz slide creation failed.');
            return null;
        }

        console.log('[AddQuizDialog] Slide created with ID:', slideId);

        // Immediately update the store with the new quiz data
        try {
            // Create a temporary slide object with the questions data
            const tempSlide: Slide = {
                id: slideId,
                source_id: slideId,
                source_type: 'QUIZ',
                title: `Quiz ${items.filter((slide) => slide.source_type === 'QUIZ').length + 1}`,
                image_file_id: '',
                description: 'Quiz',
                status: 'DRAFT',
                slide_order: 0,
                video_slide: null,
                document_slide: null,
                question_slide: null,
                assignment_slide: null,
                quiz_slide: {
                    id: crypto.randomUUID(),
                    title: `Quiz ${items.filter((slide) => slide.source_type === 'QUIZ').length + 1}`,
                    description: { id: '', content: '', type: 'TEXT' },
                    questions: questions.map((question, index) => ({
                        id: crypto.randomUUID(),
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
                        status: 'ACTIVE',
                        question_response_type: 'OPTION',
                        question_type: question.questionType,
                        questionType: question.questionType, // Fix: Add questionType field for backend compatibility
                        access_level: 'INSTITUTE',
                        auto_evaluation_json: question.validAnswers
                            ? JSON.stringify({ correctAnswers: question.validAnswers })
                            : '',
                        evaluation_type: 'AUTO',
                        question_order: index + 1,
                        quiz_slide_id: '',
                        can_skip: question.canSkip || false,
                        options: [],
                    })),
                },
                is_loaded: true,
                new_slide: true,
            };

            // Add the new slide to the items array
            const updatedItems = [tempSlide, ...items];
            setItems(updatedItems);

            // Set the new slide as active immediately
            setActiveItem(tempSlide);

            console.log('[AddQuizDialog] ✅ Store updated immediately with new quiz data');

            openState?.(false);
            toast.success('Quiz created successfully!');

            // Refetch data in the background to get the complete backend data
            setTimeout(async () => {
                console.log('[AddQuizDialog] Refetching data in background...');
                const refreshed = await refetch();

                if (refreshed.data) {
                    const refreshedSlide = refreshed.data.find((s) => s.id === slideId);
                    if (refreshedSlide) {
                        console.log(
                            '[AddQuizDialog] ✅ Background refresh completed, updating with backend data'
                        );
                        setItems(refreshed.data as Slide[]);
                        setActiveItem(refreshedSlide as Slide);
                    }
                }
            }, 1000);

            return slideId;
        } catch (error) {
            console.error('[AddQuizDialog] Error updating store immediately:', error);
            // Fallback to the original approach
            toast.warning(
                'Quiz created, but there was an issue updating the preview. Please refresh the page.'
            );
            return slideId;
        }
    };

    const QuestionType = ({ icon, text, type = QuestionTypeList.MCQS }: QuestionTypeProps) => (
        <div
            className="flex w-full cursor-pointer flex-row items-center gap-4 rounded-md border px-4 py-3"
            onClick={() => handleAddQuestion(type, '1', '0')}
        >
            {icon}
            <div className="text-body">{text}</div>
        </div>
    );

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="text-subtitle font-semibold">Quick Access</div>
                <QuestionType
                    icon={<MCQS />}
                    text="MCQ (Single correct)"
                    type={QuestionTypeList.MCQS}
                    handleAddQuestion={handleAddQuestion}
                />
                <QuestionType
                    icon={<MCQM />}
                    text="MCQ (Multiple correct)"
                    type={QuestionTypeList.MCQM}
                    handleAddQuestion={handleAddQuestion}
                />
                <QuestionType
                    icon={<Numerical />}
                    text="Numerical"
                    type={QuestionTypeList.NUMERIC}
                    handleAddQuestion={handleAddQuestion}
                />
                <QuestionType
                    icon={<TrueFalse />}
                    text="True False"
                    type={QuestionTypeList.TRUE_FALSE}
                    handleAddQuestion={handleAddQuestion}
                />
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col gap-4">
                <div className="text-subtitle font-semibold">Writing Skills</div>
                <QuestionType
                    icon={<LongAnswer />}
                    text="Long Answer"
                    type={QuestionTypeList.LONG_ANSWER}
                    handleAddQuestion={handleAddQuestion}
                />
                <QuestionType
                    icon={<SingleWord />}
                    text="Single Word"
                    type={QuestionTypeList.ONE_WORD}
                    handleAddQuestion={handleAddQuestion}
                />
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col gap-4">
                <div className="text-subtitle font-semibold">Reading Skills</div>
                <QuestionType
                    icon={<CMCQS />}
                    text="Comprehension MCQ (Single correct)"
                    type={QuestionTypeList.CMCQS}
                    handleAddQuestion={handleAddQuestion}
                />
                <QuestionType
                    icon={<CMCQM />}
                    text="Comprehension MCQ (Multiple correct)"
                    type={QuestionTypeList.CMCQM}
                    handleAddQuestion={handleAddQuestion}
                />
                <QuestionType
                    icon={<Numerical />}
                    text="Comprehension Numeric"
                    type={QuestionTypeList.CNUMERIC}
                    handleAddQuestion={handleAddQuestion}
                />
            </div>

            <QuizQuestionDialogAddPreview
                quizQuestionForm={quizQuestionForm}
                addedQuestionForm={quizQuestionForm}
                formRefData={formRefData}
                currentQuestionIndex={currentQuestionIndex}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                previewQuestionDialog={previewQuestionDialog}
                setPreviewQuestionDialog={setPreviewQuestionDialog}
                formData={formData}
                setFormData={setFormData}
                isAddQuestionTypeRef={isAddQuestionTypeRef}
                variantTitle="Quiz Question"
                onCreate={handleCreateQuizSlide}
            />
        </>
    );
};

export default AddQuizDialog;
