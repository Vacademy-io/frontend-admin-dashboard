import { MCQS, MCQM, Numerical, TrueFalse, LongAnswer, SingleWord, CMCQS, CMCQM } from '@/svgs';
import { QuestionType as QuestionTypeList } from '@/constants/dummy-data';
import { Separator } from '@/components/ui/separator';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadQuestionPaperFormSchema } from '@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema';
import { UploadQuestionPaperFormType } from '@/routes/assessment/question-papers/-components/QuestionPaperUpload';
import { useState } from 'react';
import { useContentStore } from '../../-stores/chapter-sidebar-store';
import { useSlides } from '../../-hooks/use-slides';
import { Route } from '../..';
import { toast } from 'sonner';
import { convertToQuestionSlideFormat } from '../../-helper/helper';

export interface QuestionTypeProps {
    icon: React.ReactNode;
    text: string;
    type?: QuestionTypeList;
}

const AddQuestionDialog = ({ openState }: { openState?: (open: boolean) => void }) => {
    const { setActiveItem, getSlideById } = useContentStore();
    const { chapterId } = Route.useSearch();
    const { updateQuestionOrder } = useSlides(chapterId);

    const form = useForm<UploadQuestionPaperFormType>({
        resolver: zodResolver(uploadQuestionPaperFormSchema),
        mode: 'onChange',
        defaultValues: {
            questionPaperId: '1',
            isFavourite: false,
            title: 'New Question',
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
        control: form.control,
        name: 'questions',
    });

    const [isQuestionSlideAdding, setIsQuestionSlideAdding] = useState(false);

    const handleAddQuestion = async (
        newQuestionType: string,
        title: string = 'New Question',
        reattemptCount: string = ''
    ) => {
        setIsQuestionSlideAdding(true);

        const responseData = {
            id: '',
            questionId: String(fields.length + 1),
            questionName: '',
            explanation: '',
            questionType: newQuestionType,
            questionPenalty: '',
            questionDuration: {
                hrs: '',
                min: '',
            },
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
            reattemptCount,
        };

        try {
            const response: string = await updateQuestionOrder({
                id: crypto.randomUUID(),
                source_id: '',
                source_type: 'QUESTION',
                title,
                image_file_id: '',
                description: '',
                status: 'DRAFT',
                slide_order: 0,
                question_slide: convertToQuestionSlideFormat(responseData),
                is_loaded: true,
                new_slide: true,
            });

            toast.success('Question added successfully!');
            form.reset();
            openState?.(false);
            setActiveItem(getSlideById(response));
        } catch (error) {
            toast.error('Failed to add question');
        } finally {
            setIsQuestionSlideAdding(false);
        }
    };

    const QuestionType = ({ icon, text, type = QuestionTypeList.MCQS }: QuestionTypeProps) => (
        <div
            className={`flex w-full cursor-pointer flex-row items-center gap-4 rounded-md border px-4 py-3 ${
                isQuestionSlideAdding ? 'pointer-events-none opacity-50' : ''
            }`}
            onClick={() => handleAddQuestion(type)}
        >
            {icon}
            <div className="text-body">{text}</div>
        </div>
    );

    return (
        <>
            <h1 className="mb-4 text-xl font-semibold">New Question</h1>

            <div className="flex flex-col gap-4">
                <div className="text-subtitle font-semibold">Quick Access</div>
                <QuestionType
                    icon={<MCQS />}
                    text="Multiple Choice Questions (Single correct)"
                    type={QuestionTypeList.MCQS}
                />
                <QuestionType
                    icon={<MCQM />}
                    text="Multiple Choice Questions (Multiple correct)"
                    type={QuestionTypeList.MCQM}
                />
                <QuestionType
                    icon={<Numerical />}
                    text="Numerical"
                    type={QuestionTypeList.NUMERIC}
                />
                <QuestionType
                    icon={<TrueFalse />}
                    text="True False"
                    type={QuestionTypeList.TRUE_FALSE}
                />
            </div>

            <Separator className="my-6" />
            <div className="flex flex-col gap-4">
                <div className="text-subtitle font-semibold">Option Based</div>
                <QuestionType
                    icon={<MCQS />}
                    text="Multiple Choice Questions (Single correct)"
                    type={QuestionTypeList.MCQS}
                />
                <QuestionType
                    icon={<MCQM />}
                    text="Multiple Choice Questions (Multiple correct)"
                    type={QuestionTypeList.MCQM}
                />
            </div>

            <Separator className="my-6" />
            <div className="flex flex-col gap-4">
                <div className="text-subtitle font-semibold">Math Based</div>
                <QuestionType
                    icon={<Numerical />}
                    text="Numerical"
                    type={QuestionTypeList.NUMERIC}
                />
            </div>

            <Separator className="my-6" />
            <div className="flex flex-col gap-4">
                <div className="text-subtitle font-semibold">Writing Skills</div>
                <QuestionType
                    icon={<LongAnswer />}
                    text="Long Answer"
                    type={QuestionTypeList.LONG_ANSWER}
                />
                <QuestionType
                    icon={<SingleWord />}
                    text="Single Word"
                    type={QuestionTypeList.ONE_WORD}
                />
            </div>

            <Separator className="my-6" />
            <div className="flex flex-col gap-4">
                <div className="text-subtitle font-semibold">Reading Skills</div>
                <QuestionType
                    icon={<CMCQS />}
                    text="Comprehension MCQ (Single correct)"
                    type={QuestionTypeList.CMCQS}
                />
                <QuestionType
                    icon={<CMCQM />}
                    text="Comprehension MCQ (Multiple correct)"
                    type={QuestionTypeList.CMCQM}
                />
                <QuestionType
                    icon={<CMCQM />}
                    text="Comprehension Numeric"
                    type={QuestionTypeList.CNUMERIC}
                />
            </div>
        </>
    );
};

export default AddQuestionDialog;
