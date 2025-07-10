'use client';

import { QuestionType } from '@/constants/dummy-data';
import { MainViewComponentFactory } from '@/routes/assessment/question-papers/-components/QuestionPaperTemplatesTypes/MainViewComponentFactory';
import { uploadQuestionPaperFormSchema } from '@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema';
import { Dispatch, MutableRefObject, SetStateAction, useEffect } from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MyButton } from '@/components/design-system/button';
import { UploadQuestionPaperFormType } from '@/routes/assessment/question-papers/-components/QuestionPaperUpload';
import { useContentStore } from '../../-stores/chapter-sidebar-store';

type QuestionPaperForm = z.infer<typeof uploadQuestionPaperFormSchema>;

const QuizQuestionDialogAddPreview = ({
    quizQuestionForm,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    previewQuestionDialog,
    setPreviewQuestionDialog,
    isAddQuestionTypeRef,
    variantTitle = 'Quiz Question',
    onCreate,
}: {
    quizQuestionForm: UseFormReturn<QuestionPaperForm>;
    addedQuestionForm: UseFormReturn<QuestionPaperForm>;
    formRefData: MutableRefObject<UploadQuestionPaperFormType>;
    currentQuestionIndex: number;
    setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
    previewQuestionDialog: boolean;
    setPreviewQuestionDialog: Dispatch<SetStateAction<boolean>>;
    formData: UploadQuestionPaperFormType;
    setFormData: Dispatch<SetStateAction<UploadQuestionPaperFormType>>;
    isAddQuestionTypeRef: React.RefObject<HTMLButtonElement>;
    variantTitle?: string;
    onCreate: () => Promise<string | null>;
}) => {
    const { setActiveItem, getSlideById, updateActiveSlideQuestions } = useContentStore();

    useEffect(() => {
        console.log(`[QuizDialog] 🧠 Dialog rendered | Preview mode =`, previewQuestionDialog);
    }, [previewQuestionDialog]);

    const handleClose = () => {
        console.log('[QuizDialog] ❌ Closing dialog & resetting form');
        setCurrentQuestionIndex(0);
        quizQuestionForm.reset({
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
        });

        setPreviewQuestionDialog(false);
        isAddQuestionTypeRef.current?.click();
    };

    const handleCreateQuiz = async () => {
        const questions = quizQuestionForm.getValues('questions');

        if (!questions || questions.length === 0) {
            console.warn('[QuizDialog] ⚠️ No questions found. Aborting creation.');
            return;
        }

        const slideId = await onCreate();
        console.log(`[QuizDialog] 📥 Slide ID received:`, slideId);

        if (slideId) {
            const newSlide = getSlideById(slideId);

            if (newSlide) {
                const updatedSlide = {
                    ...newSlide,
                    quiz_slide: {
                        ...newSlide.quiz_slide,
                        questions,
                    },
                };

                setActiveItem(updatedSlide);
                updateActiveSlideQuestions(questions);
                handleClose();
            } else {
                console.warn('[QuizDialog] ⚠️ Slide not found in store after creation.');
            }
        }
    };

    return (
        <Dialog open={previewQuestionDialog} onOpenChange={setPreviewQuestionDialog}>
            <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col !gap-0 overflow-y-auto !rounded-none !p-0 [&>button]:hidden">
                <div className="flex w-full items-center justify-between bg-primary-50">
                    <h1 className="p-4 font-semibold text-primary-500">{variantTitle}</h1>
                    <div className="mr-4 flex items-center gap-2">
                        <MyButton
                            type="button"
                            buttonType="secondary"
                            scale="medium"
                            layoutVariant="default"
                            className="mr-3"
                            onClick={() => {
                                console.log('[QuizDialog] 🔙 User clicked Close button');
                                setPreviewQuestionDialog(false);
                            }}
                        >
                            Close
                        </MyButton>
                        <MyButton
                            type="button"
                            buttonType="primary"
                            scale="medium"
                            layoutVariant="default"
                            className="mr-3"
                            disabled={quizQuestionForm.getValues('questions').length === 0}
                            onClick={handleCreateQuiz}
                        >
                            Create
                        </MyButton>
                    </div>
                </div>

                <div>
                    <FormProvider {...quizQuestionForm}>
                        {quizQuestionForm.getValues('questions')?.length === 0 ? (
                            <p className="p-6 text-center text-muted">Nothing to show</p>
                        ) : (
                            <div className="my-4 flex flex-col gap-2">
                                <MainViewComponentFactory
                                    key={currentQuestionIndex}
                                    type={
                                        quizQuestionForm.getValues(
                                            `questions.${currentQuestionIndex}.questionType`
                                        ) as QuestionType
                                    }
                                    props={{
                                        form: quizQuestionForm,
                                        currentQuestionIndex,
                                        setCurrentQuestionIndex,
                                        className:
                                            'dialog-height overflow-auto ml-6 flex w-full flex-col gap-6 pr-6 pt-4',
                                    }}
                                />
                            </div>
                        )}
                    </FormProvider>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QuizQuestionDialogAddPreview;
