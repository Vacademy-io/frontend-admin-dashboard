'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadQuestionPaperFormSchema } from '@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema';
import { Slide } from '../-hooks/use-slides';
import { UploadQuestionPaperFormType } from '@/routes/assessment/question-papers/-components/QuestionPaperUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { PencilSimpleLine } from 'phosphor-react';
import { MainViewComponentFactory } from '@/routes/assessment/question-papers/-components/QuestionPaperTemplatesTypes/MainViewComponentFactory';
import { QuestionType } from '@/constants/dummy-data';
import { useContentStore } from '../-stores/chapter-sidebar-store';
// import { useContentStore } from '@/stores/content-store';

interface QuizPreviewProps {
    activeItem: Slide;
}

const QuizPreview = ({ activeItem }: QuizPreviewProps) => {
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
    const editForm = useForm<UploadQuestionPaperFormType>({
        resolver: zodResolver(uploadQuestionPaperFormSchema),
        mode: 'onChange',
    });

    const closeRef = useRef<HTMLButtonElement | null>(null);
    const { updateActiveSlideQuestions } = useContentStore();

    useEffect(() => {
        if (activeItem?.question_slide) {
            const slides = Array.isArray(activeItem.question_slide)
                ? activeItem.question_slide
                : [activeItem.question_slide];

            const transformedQuestions = slides.map((slide) => ({
                questionName: slide.title || '',
                questionType: slide.question_type || 'MCQ',
                questionPenalty: slide.penalty || '0',
                questionDuration: {
                    min: '0',
                    hrs: '0',
                },
                questionMark: slide.mark || '1',
                id: slide.id,
                status: slide.status,
                validAnswers: slide.validAnswers || [],
                options: slide.options || [],
                explanation: slide.explanation || '',
                canSkip: slide.canSkip || false,
                hint: slide.hint || '',
                tags: slide.tags || [],
                // ...add other mappings if required
            }));

            replace(transformedQuestions);
        } else {
            replace([]);
        }
    }, [activeItem.question_slide, replace]);

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

    const handleAdd = () => {
        append({
            questionName: '',
            questionType: 'MCQ',
            questionPenalty: '0',
            questionDuration: { min: '0', hrs: '0' },
            questionMark: '1',
            explanation: '',
            validAnswers: [],
        });
        setTimeout(syncToStore, 0);
    };

    const handleRemove = (index: number) => {
        remove(index);
        setTimeout(syncToStore, 0); // ensure state updated after remove
    };

    return (
        <FormProvider {...form}>
            <div className="flex size-full flex-col overflow-hidden rounded border border-neutral-200 bg-white shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-primary-50 px-6 py-4">
                    <h2 className="text-primary-700 text-lg font-semibold">Quiz Preview</h2>
                    <Button type="button" onClick={handleAdd} className="">
                        + Add Question
                    </Button>
                </div>

                {/* Question List */}
                <div className="flex-1 space-y-6 overflow-y-auto bg-white px-6 py-5">
                    {fields.length > 0 ? (
                        fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="relative flex flex-col gap-3 rounded border p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-neutral-600">
                                        Question {index + 1}
                                    </div>

                                    {/* Edit Dialog */}
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="size-7 p-1"
                                                onClick={() => handleEdit(index)}
                                            >
                                                <PencilSimpleLine size={16} />
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

                                            <div className="flex justify-end px-6 pb-4 pt-2">
                                                <DialogClose asChild>
                                                    <button ref={closeRef} className="hidden" />
                                                </DialogClose>
                                                <Button
                                                    type="button"
                                                    className="bg-primary-600 hover:bg-primary-700 text-white"
                                                    onClick={handleEditConfirm}
                                                >
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <Input
                                    {...form.register(`questions.${index}.questionName`)}
                                    placeholder="Enter question"
                                />
                                <Input
                                    {...form.register(`questions.${index}.validAnswers.0`)} // Or map multiple if needed
                                    placeholder="Enter correct answer"
                                />

                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => handleRemove(index)}
                                    className="mt-2 w-fit self-end"
                                >
                                    Remove
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-neutral-400">
                            No questions added yet......
                        </p>
                    )}
                </div>
            </div>
        </FormProvider>
    );
};

export default QuizPreview;
