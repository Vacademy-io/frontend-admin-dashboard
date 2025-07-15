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
import { convertToQuestionSlideFormat } from '../../-helper/helper';
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
    const { setActiveItem, setItems, getSlideById, items } = useContentStore();

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

        try {
            // Transform form questions to backend format
            const transformedQuestions = questions.map((question, index) => {
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
                    case 'ONE_WORD':
                        questionResponseType = 'TEXT';
                        evaluationType = 'MANUAL';
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
                    question_response_type: questionResponseType,
                    question_type: question.questionType,
                    access_level: 'INSTITUTE',
                    auto_evaluation_json: question.validAnswers
                        ? JSON.stringify({ correctAnswers: question.validAnswers })
                        : '',
                    evaluation_type: evaluationType,
                    question_order: index + 1,
                    quiz_slide_id: '',
                    can_skip: question.canSkip || false,
                    options: options,
                };
            });

            const response: string = await addUpdateQuizSlide({
                id: `quiz-${crypto.randomUUID()}`,
                source_id: '',
                source_type: 'QUIZ',
                title: autoTitle,
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
                    title: autoTitle,
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

        // Wait a bit for backend to process the quiz creation
        console.log('[AddQuizDialog] Waiting for backend to process quiz...');
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

        // Now refetch and get fresh data
        console.log('[AddQuizDialog] Refetching data after backend processing...');
        const refreshed = await refetch();

        if (!refreshed.data) {
            console.error('[AddQuizDialog] Refetch failed or returned no data');
            toast.error('Failed to refresh slide data');
            return slideId;
        }

        console.log('[AddQuizDialog] Refreshed data:', {
            refreshedDataLength: refreshed.data.length || 0,
            allSlideIds: refreshed.data.map((s) => s.id),
        });

        // Find the newly created slide in the refreshed data
        const slide = refreshed.data.find((s) => s.id === slideId);

        console.log('[AddQuizDialog] Looking for slide:', {
            slideId,
            foundSlide: !!slide,
            slideData: slide,
            hasQuizSlide: !!slide?.quiz_slide,
            questionsCount: slide?.quiz_slide?.questions?.length || 0,
        });

        if (slide) {
            console.log('[AddQuizDialog] Setting items and active item with fresh data:', slide);

            // Update the store with fresh data from backend
            setItems(refreshed.data as Slide[]);

            // Set the newly created slide as active
            setActiveItem(slide as Slide);

            openState?.(false);

            if (slide.quiz_slide?.questions && slide.quiz_slide.questions.length > 0) {
                console.log('[AddQuizDialog] ✅ Quiz created successfully with questions!');
                toast.success('Quiz created successfully with questions!');
            } else {
                console.log('[AddQuizDialog] ⚠️ Quiz created but questions not yet available');
                toast.success('Quiz created! Questions may take a moment to appear.');
            }

            return slideId;
        } else {
            console.warn('[AddQuizDialog] Quiz created but slide not found in refreshed data');
            toast.warning('Quiz created, but slide not found in refreshed list.');
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
