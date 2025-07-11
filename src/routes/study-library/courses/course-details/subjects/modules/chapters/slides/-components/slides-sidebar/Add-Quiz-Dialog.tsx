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
import { useSlidesMutations, useSlidesQuery, QuizSlidePayload } from '../../-hooks/use-slides';
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
        questionType: string,
        questionPoints?: string,
        reattemptCount?: string
    ): Promise<string | null> => {
        const responseData = {
            id: '',
            questionId: String(fields.length + 1),
            questionName: 'What is 2 + 2?',
            explanation: 'Basic addition example.',
            questionType,
            questionPenalty: '',
            questionDuration: { hrs: '', min: '' },
            questionMark: questionPoints ?? '1',
            singleChoiceOptions: [
                { id: '1', name: '2', isSelected: false },
                { id: '2', name: '4', isSelected: true },
                { id: '3', name: '6', isSelected: false },
                { id: '4', name: '8', isSelected: false },
            ],
            multipleChoiceOptions: [],
            csingleChoiceOptions: [],
            cmultipleChoiceOptions: [],
            trueFalseOptions: [],
            parentRichTextContent: 'What is 2 + 2?',
            decimals: 0,
            numericType: '',
            validAnswers: [1],
            questionResponseType: 'OPTION',
            subjectiveAnswerText: '',
            reattemptCount: reattemptCount ?? '0',
        };

        const quizSlides = items.filter((slide) => slide.source_type === 'QUIZ');
        const quizIndex = quizSlides.length + 1;
        const autoTitle = `Quiz ${quizIndex}`;

        try {
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
                    questions: [{
                        id: crypto.randomUUID(),
                        parent_rich_text: { id: '', type: 'TEXT', content: responseData.questionName },
                        text: { id: '', type: 'TEXT', content: responseData.questionName },
                        explanation_text: { id: '', type: 'TEXT', content: responseData.explanation },
                        media_id: '',
                        status: 'ACTIVE',
                        question_response_type: responseData.questionResponseType,
                        question_type: responseData.questionType,
                        access_level: 'INSTITUTE',
                        auto_evaluation_json: '',
                        evaluation_type: 'AUTO',
                        question_order: 1,
                        quiz_slide_id: '',
                        can_skip: false,
                        options: responseData.singleChoiceOptions.map((option, index) => ({
                            id: option.id || crypto.randomUUID(),
                            quiz_slide_question_id: '',
                            text: { id: '', type: 'TEXT', content: option.name },
                            explanation_text: { id: '', type: 'TEXT', content: '' },
                            media_id: '',
                        })),
                    }],
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
            return null; // 🔴 Make sure to return null if validation fails
        }

        const question = questions[0];

        if (!question) {
            toast.error('No question found.');
            return null;
        }

        const slideId = await createSlide(
            question.questionType,
            question.questionMark,
            question.reattemptCount
        );

        if (!slideId) {
            toast.error('Quiz slide creation failed.');
            return null; // 🔴 Again, return explicitly
        }

        const refreshed = await refetch();
        const slide = refreshed?.data?.find((s) => s.id === slideId);

        if (slide) {
            setItems((refreshed.data || []) as any);
            setActiveItem(slide as any);
            openState?.(false);
            return slideId; // ✅ ✅ ✅ This is the MOST IMPORTANT LINE
        } else {
            toast.warning('Quiz created, but slide not found in refreshed list.');
            return slideId; // Still return it so QuizPreview doesn't break
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
