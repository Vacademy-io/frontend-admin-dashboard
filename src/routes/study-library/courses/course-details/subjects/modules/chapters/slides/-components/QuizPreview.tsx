'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadQuestionPaperFormSchema } from '@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema';
import { Slide } from '../-hooks/use-slides';
import { UploadQuestionPaperFormType } from '@/routes/assessment/question-papers/-components/QuestionPaperUpload';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { PencilSimpleLine, Plus, Trash, Warning } from 'phosphor-react';
import { MainViewComponentFactory } from '@/routes/assessment/question-papers/-components/QuestionPaperTemplatesTypes/MainViewComponentFactory';
import { QuestionType } from '@/constants/dummy-data';
import { useContentStore } from '../-stores/chapter-sidebar-store';
import { toast } from 'sonner';
import { MCQS, MCQM, Numerical, TrueFalse, LongAnswer, SingleWord, CMCQS, CMCQM } from '@/svgs';
import { QuestionType as QuestionTypeList } from '@/constants/dummy-data';
import { Separator } from '@/components/ui/separator';
import { MyButton } from '@/components/design-system/button';

interface QuizPreviewProps {
    activeItem: Slide;
}

interface QuizQuestion {
    text_data?: { content: string };
    questionName?: string;
    question_type?: string;
    penalty?: string;
    mark?: string;
    id?: string;
    status?: string;
    validAnswers?: number[];
    explanation?: string;
    canSkip?: boolean;
    tags?: string[];
}

interface QuestionTypeProps {
    icon: React.ReactNode;
    text: string;
    type?: string;
    handleAddQuestion: (type: string) => void;
}

const QuizPreview = ({ activeItem }: QuizPreviewProps) => {
    // Check if the slide is deleted
    if (activeItem?.status === 'DELETED') {
        return (
            <div className="flex size-full flex-col overflow-hidden rounded border border-neutral-200 bg-white shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-red-50 px-6 py-4">
                    <h2 className="text-lg font-semibold text-red-700">Quiz Questions</h2>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
                            DELETED
                        </span>
                    </div>
                </div>

                {/* Deleted Content */}
                <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12">
                    <div className="text-center">
                        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
                            <Trash size={24} className="text-red-500" />
                        </div>
                        <h3 className="mb-2 text-lg font-medium text-slate-600">
                            This quiz has been deleted
                        </h3>
                        <p className="text-sm text-slate-400">
                            The quiz content is no longer available
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const form = useForm<UploadQuestionPaperFormType>({
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

    const { fields, append, remove, replace, update } = useFieldArray({
        control: form.control,
        name: 'questions',
    });

    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false);
    const [isQuestionTypeDialogOpen, setIsQuestionTypeDialogOpen] = useState(false);
    const [selectedQuestionType, setSelectedQuestionType] = useState<string>('');
    const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

    const editForm = useForm<UploadQuestionPaperFormType>({
        resolver: zodResolver(uploadQuestionPaperFormSchema),
        mode: 'onChange',
    });

    const closeRef = useRef<HTMLButtonElement | null>(null);
    const { updateActiveSlideQuestions } = useContentStore();

    useEffect(() => {
        if (activeItem?.quiz_slide?.questions) {
            const questions = activeItem.quiz_slide.questions;
            const transformedQuestions = questions.map((question: QuizQuestion) => ({
                questionName: question.text_data?.content || question.questionName || '',
                questionType: question.question_type || 'MCQ',
                questionPenalty: question.penalty || '0',
                questionDuration: {
                    min: '0',
                    hrs: '0',
                },
                questionMark: question.mark || '1',
                id: question.id,
                status: question.status,
                validAnswers: question.validAnswers || [0],
                explanation: question.explanation || '',
                canSkip: question.canSkip || false,
                tags: question.tags || [],
            }));

            replace(transformedQuestions);
        } else {
            replace([]);
        }
    }, [activeItem.quiz_slide?.questions, replace]);

    const syncToStore = () => {
        const currentQuestions = form.getValues('questions');
        updateActiveSlideQuestions(currentQuestions);
    };

    const handleEdit = (index: number) => {
        const question = form.getValues(`questions.${index}`);
        editForm.reset({ ...form.getValues(), questions: [question] });
        setEditIndex(index);
    };

    const handleEditConfirm = () => {
        const updated = editForm.getValues(`questions.0`);
        if (editIndex !== null) {
            update(editIndex, updated);
            syncToStore();
            setEditIndex(null);
        }
        closeRef.current?.click();
    };

    const handleAddQuestion = (questionType: string) => {
        setSelectedQuestionType(questionType);
        setIsQuestionTypeDialogOpen(false);
        setIsAddQuestionDialogOpen(true);

        // Reset the form for new question
        editForm.reset({
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
            questions: [
                {
                    questionName: '',
                    questionType: questionType,
                    questionPenalty: '0',
                    questionDuration: { min: '0', hrs: '0' },
                    questionMark: '1',
                    explanation: '',
                    validAnswers: [0],
                    canSkip: false,
                    tags: [],
                },
            ],
        });
    };

    const handleAddQuestionConfirm = () => {
        const newQuestion = editForm.getValues(`questions.0`);
        if (newQuestion.questionName.trim()) {
            append(newQuestion);
            syncToStore();
            setIsAddQuestionDialogOpen(false);
            toast.success('Question added successfully!');
        } else {
            toast.error('Please enter a question name');
        }
    };

    const handleRemove = (index: number) => {
        setQuestionToDelete(index);
        setIsDeleteConfirmDialogOpen(true);
    };

    const confirmDelete = () => {
        if (questionToDelete !== null) {
            remove(questionToDelete);
            setTimeout(syncToStore, 0);
            toast.success('Question removed successfully!');
            setQuestionToDelete(null);
        }
        setIsDeleteConfirmDialogOpen(false);
    };

    const cancelDelete = () => {
        setQuestionToDelete(null);
        setIsDeleteConfirmDialogOpen(false);
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
        <FormProvider {...form}>
            <div className="flex size-full flex-col overflow-hidden rounded border border-neutral-200 bg-white shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-primary-50 px-6 py-4">
                    <h2 className="text-primary-700 text-lg font-semibold">Quiz Questions</h2>
                    <Button
                        type="button"
                        onClick={() => setIsQuestionTypeDialogOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add Question
                    </Button>
                </div>

                {/* Question List */}
                <div className="flex-1 space-y-4 overflow-y-auto bg-white px-6 py-5">
                    {fields.length > 0 ? (
                        fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="relative flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-primary-700 flex size-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold">
                                            {index + 1}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-neutral-600">
                                                Question {index + 1}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                            {field.questionType}
                                        </span>
                                        {/* Edit Dialog */}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="size-8 p-0"
                                                    onClick={() => handleEdit(index)}
                                                >
                                                    <PencilSimpleLine size={14} />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col overflow-y-auto !rounded-none !p-0">
                                                <h1 className="bg-primary-50 p-4 font-semibold text-primary-500">
                                                    Edit Question {index + 1}
                                                </h1>

                                                <FormProvider {...editForm}>
                                                    <MainViewComponentFactory
                                                        key={index}
                                                        type={
                                                            editForm.getValues(
                                                                'questions.0.questionType'
                                                            ) as QuestionType
                                                        }
                                                        props={{
                                                            form: editForm,
                                                            currentQuestionIndex: 0,
                                                            setCurrentQuestionIndex: () => {},
                                                            className:
                                                                'dialog-height overflow-auto ml-6 flex w-full flex-col gap-6 pr-6 pt-4',
                                                        }}
                                                    />
                                                </FormProvider>

                                                <div className="flex justify-end gap-3 px-6 pb-4 pt-2">
                                                    <DialogClose asChild>
                                                        <button ref={closeRef} className="hidden" />
                                                    </DialogClose>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setEditIndex(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <MyButton
                                                        type="button"
                                                        // className="bg-primary-600 hover:bg-primary-700 text-white"
                                                        onClick={handleEditConfirm}
                                                    >
                                                        Save Changes
                                                    </MyButton>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        {/* Remove Button */}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="size-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                                            onClick={() => handleRemove(index)}
                                        >
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                </div>

                                <div className="ml-11">
                                    <div className="mb-2 text-sm font-medium text-slate-700">
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: field.questionName || 'Untitled Question',
                                            }}
                                        />
                                    </div>

                                    {/* Display Answer Options */}
                                    {field.questionType === 'MCQS' && field.singleChoiceOptions && (
                                        <div className="mt-3 space-y-2">
                                            <div className="text-xs font-medium text-slate-600">
                                                Options:
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {field.singleChoiceOptions.map(
                                                    (option, optionIndex) => (
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
                                                                {String.fromCharCode(
                                                                    65 + optionIndex
                                                                )}
                                                            </div>
                                                            <div
                                                                className="flex-1"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: option.name || '',
                                                                }}
                                                            />
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {field.questionType === 'MCQM' &&
                                        field.multipleChoiceOptions && (
                                            <div className="mt-3 space-y-2">
                                                <div className="text-xs font-medium text-slate-600">
                                                    Options:
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {field.multipleChoiceOptions.map(
                                                        (option, optionIndex) => (
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
                                                                    {String.fromCharCode(
                                                                        65 + optionIndex
                                                                    )}
                                                                </div>
                                                                <div
                                                                    className="flex-1"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: option.name || '',
                                                                    }}
                                                                />
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {field.questionType === 'TRUE_FALSE' &&
                                        field.trueFalseOptions && (
                                            <div className="mt-3 space-y-2">
                                                <div className="text-xs font-medium text-slate-600">
                                                    Options:
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {field.trueFalseOptions.map(
                                                        (option, optionIndex) => (
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
                                                                    {String.fromCharCode(
                                                                        65 + optionIndex
                                                                    )}
                                                                </div>
                                                                <div
                                                                    className="flex-1"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: option.name || '',
                                                                    }}
                                                                />
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {field.questionType === 'NUMERIC' && field.validAnswers && (
                                        <div className="mt-3 space-y-2">
                                            <div className="text-xs font-medium text-slate-600">
                                                Correct Answer(s):
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {field.validAnswers.map((answer, answerIndex) => (
                                                    <div
                                                        key={answerIndex}
                                                        className="rounded-md border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                                                    >
                                                        {answer}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {field.questionType === 'LONG_ANSWER' &&
                                        field.subjectiveAnswerText && (
                                            <div className="mt-3 space-y-2">
                                                <div className="text-xs font-medium text-slate-600">
                                                    Sample Answer:
                                                </div>
                                                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs">
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html:
                                                                field.subjectiveAnswerText || '',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                    {field.questionType === 'ONE_WORD' &&
                                        field.subjectiveAnswerText && (
                                            <div className="mt-3 space-y-2">
                                                <div className="text-xs font-medium text-slate-600">
                                                    Correct Answer:
                                                </div>
                                                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs">
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html:
                                                                field.subjectiveAnswerText || '',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                    {field.explanation && (
                                        <div className="mt-3 text-xs text-slate-500">
                                            <span className="font-medium">Explanation: </span>
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: field.explanation,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100">
                                <Plus size={24} className="text-slate-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-medium text-slate-600">
                                No questions yet
                            </h3>
                            <p className="text-sm text-slate-400">
                                Add your first question to get started
                            </p>
                        </div>
                    )}
                </div>

                {/* Question Type Selection Dialog */}
                <Dialog open={isQuestionTypeDialogOpen} onOpenChange={setIsQuestionTypeDialogOpen}>
                    <DialogContent className="size-[500px] p-0">
                        <h1 className="rounded-t-lg bg-primary-50 p-4 font-semibold text-primary-500">
                            Add Question
                        </h1>
                        <div className="overflow-auto p-4">
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
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Add Question Dialog */}
                <Dialog open={isAddQuestionDialogOpen} onOpenChange={setIsAddQuestionDialogOpen}>
                    <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col overflow-y-auto !rounded-none !p-0">
                        <h1 className="bg-primary-50 p-4 font-semibold text-primary-500">
                            Add New Question
                        </h1>

                        <FormProvider {...editForm}>
                            <MainViewComponentFactory
                                type={selectedQuestionType as QuestionType}
                                props={{
                                    form: editForm,
                                    currentQuestionIndex: 0,
                                    setCurrentQuestionIndex: () => {},
                                    className:
                                        'dialog-height overflow-auto ml-6 flex w-full flex-col gap-6 pr-6 pt-4',
                                }}
                            />
                        </FormProvider>

                        <div className="flex justify-end px-6 pb-4 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="mr-2"
                                onClick={() => setIsAddQuestionDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <MyButton type="button" className="" onClick={handleAddQuestionConfirm}>
                                Add Question
                            </MyButton>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={isDeleteConfirmDialogOpen}
                    onOpenChange={setIsDeleteConfirmDialogOpen}
                >
                    <DialogContent className="max-w-md">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
                                <Warning size={20} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Delete Question
                                </h3>
                                <p className="text-sm text-slate-600">
                                    Are you sure you want to delete this question? This action
                                    cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={cancelDelete}>
                                Cancel
                            </Button>
                            <Button type="button" variant="destructive" onClick={confirmDelete}>
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </FormProvider>
    );
};

export default QuizPreview;
