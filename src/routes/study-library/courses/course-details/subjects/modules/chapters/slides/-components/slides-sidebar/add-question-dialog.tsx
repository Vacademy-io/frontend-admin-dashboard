'use client';

import { MCQS, MCQM, Numerical, TrueFalse, LongAnswer, SingleWord, CMCQS, CMCQM } from '@/svgs';
import { QuestionType as QuestionTypeList } from '@/constants/dummy-data';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { UploadQuestionPaperFormType } from '@/routes/assessment/question-papers/-components/QuestionPaperUpload';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadQuestionPaperFormSchema } from '@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema';
import { useContentStore } from '../../-stores/chapter-sidebar-store';
import { useSlidesMutations } from '../../-hooks/use-slides';
import { Route } from '../..';
import { convertToQuestionSlideFormat } from '../../-helper/helper';
import { getSlideStatusForUser } from '../../non-admin/hooks/useNonAdminSlides';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';

export interface QuestionTypeProps {
    icon: React.ReactNode;
    text: string;
    type?: QuestionTypeList;
    handleAddQuestion: (
        type: string,
        questionPoints: string | undefined,
        reattemptCount: string | undefined
    ) => void;
}

const AddQuestionDialog = ({ openState }: { openState?: (open: boolean) => void }) => {
    const { getPackageSessionId } = useInstituteDetailsStore();
    const { setActiveItem, getSlideById, items } = useContentStore();

    const { courseId, levelId, chapterId, moduleId, subjectId, sessionId } = Route.useSearch();

    const questionForm = useForm<UploadQuestionPaperFormType>({
        resolver: zodResolver(uploadQuestionPaperFormSchema()),
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

    const { fields } = useFieldArray({
        control: questionForm.control,
        name: 'questions',
    });

    const { updateQuestionOrder, updateSlideOrder } = useSlidesMutations(
        chapterId || '',
        moduleId || '',
        subjectId || '',
        getPackageSessionId({
            courseId: courseId || '',
            levelId: levelId || '',
            sessionId: sessionId || '',
        }) || ''
    );

    const createSlide = async (questionType: string): Promise<string | null> => {
        const responseData = {
            id: '',
            questionId: String(fields.length + 1),
            questionName: '',
            explanation: '',
            questionType,
            questionPenalty: '',
            questionDuration: { hrs: '', min: '' },
            questionMark: '',
            singleChoiceOptions: Array(4).fill({ id: '', name: '', isSelected: false }),
            multipleChoiceOptions: Array(4).fill({ id: '', name: '', isSelected: false }),
            csingleChoiceOptions: Array(4).fill({ id: '', name: '', isSelected: false }),
            cmultipleChoiceOptions: Array(4).fill({ id: '', name: '', isSelected: false }),
            trueFalseOptions: Array(2).fill({ id: '', name: '', isSelected: false }),
            parentRichTextContent: '',
            decimals: 0,
            numericType: '',
            validAnswers: [0],
            questionResponseType: '',
            subjectiveAnswerText: '',
            reattemptCount: '',
        };

        const questionSlides = items.filter((slide) => slide.source_type === 'QUESTION');
        const questionIndex = questionSlides.length + 1;
        const autoTitle = `${questionType} Question ${questionIndex}`;

        try {
            const slideStatus = getSlideStatusForUser();
            const response: string = await updateQuestionOrder({
                id: `question-${crypto.randomUUID()}`,
                source_id: '',
                source_type: 'QUESTION',
                title: autoTitle,
                description: 'Question',
                image_file_id: '',
                status: slideStatus,
                slide_order: 0,
                question_slide: convertToQuestionSlideFormat(responseData),
                video_slide: {
                    id: '',
                    description: '',
                    title: '',
                    url: '',
                    video_length_in_millis: 0,
                    published_url: '',
                    published_video_length_in_millis: 0,
                    source_type: '',
                },
                document_slide: {
                    id: '',
                    type: '',
                    data: '',
                    title: '',
                    cover_file_id: '',
                    total_pages: 0,
                    published_data: '',
                    published_document_total_pages: 0,
                },
                assignment_slide: {
                    id: '',
                    parentRichText: { id: '', type: '', content: '' },
                    textData: { id: '', type: '', content: '' },
                    liveDate: '',
                    endDate: '',
                    reAttemptCount: 0,
                    commaSeparatedMediaIds: '',
                },
                is_loaded: true,
                new_slide: true,
            });

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

                toast.success('Question added successfully!');
                questionForm.reset();
                return response;
            }
        } catch (error) {
            toast.error('Failed to add question');
        }

        return null;
    };

    const handleAddQuestion = async (questionType: string) => {
        await createSlide(questionType);
        openState?.(false);
    };

    const QuestionType = ({ icon, text, type = QuestionTypeList.MCQS }: QuestionTypeProps) => (
        <div
            className="flex w-full cursor-pointer flex-row items-center gap-4 rounded-md border px-4 py-3"
            onClick={() => handleAddQuestion(type)}
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
                    text="Multiple Choice Questions (Single correct)"
                    type={QuestionTypeList.MCQS}
                    handleAddQuestion={handleAddQuestion}
                />
                <QuestionType
                    icon={<MCQM />}
                    text="Multiple Choice Questions (Multiple correct)"
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
                    icon={<CMCQM />}
                    text="Comprehension Numeric"
                    type={QuestionTypeList.CNUMERIC}
                    handleAddQuestion={handleAddQuestion}
                />
            </div>
        </>
    );
};

export default AddQuestionDialog;
