import { QuestionType } from '@/constants/dummy-data';
import { MainViewComponentFactory } from '@/routes/assessment/question-papers/-components/QuestionPaperTemplatesTypes/MainViewComponentFactory';
import { uploadQuestionPaperFormSchema } from '@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MyButton } from '@/components/design-system/button';
import { UploadQuestionPaperFormType } from '@/routes/assessment/question-papers/-components/QuestionPaperUpload';
import { VideoPlayerTimeFormType } from '../../-form-schemas/video-player-time-schema';
type QuestionPaperForm = z.infer<typeof uploadQuestionPaperFormSchema>;

const VideoQuestionDialogAddPreview = ({
    videoQuestionForm,
    addedQuestionForm,
    videoPlayerTimeFrameForm,
    formRefData,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    previewQuestionDialog,
    setPreviewQuestionDialog,
    formData,
    setFormData,
    isAddTimeFrameRef,
    isAddQuestionTypeRef,
}: {
    videoQuestionForm: UseFormReturn<QuestionPaperForm>;
    addedQuestionForm: UseFormReturn<QuestionPaperForm>;
    videoPlayerTimeFrameForm: UseFormReturn<VideoPlayerTimeFormType>;
    formRefData: MutableRefObject<UploadQuestionPaperFormType>;
    currentQuestionIndex: number;
    setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
    previewQuestionDialog: boolean;
    setPreviewQuestionDialog: Dispatch<SetStateAction<boolean>>;
    formData: UploadQuestionPaperFormType;
    setFormData: Dispatch<SetStateAction<UploadQuestionPaperFormType>>;
    isAddTimeFrameRef: React.RefObject<HTMLButtonElement>;
    isAddQuestionTypeRef: React.RefObject<HTMLButtonElement>;
}) => {
    console.log(formData);
    const handleClose = () => {
        setCurrentQuestionIndex(0);
        videoQuestionForm.reset({
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

        videoPlayerTimeFrameForm.reset({
            hrs: '',
            min: '',
            sec: '',
        });
        setPreviewQuestionDialog(false);
        isAddTimeFrameRef.current?.click();
        isAddQuestionTypeRef.current?.click();
    };
    const handleAddQuestionInAddedForm = () => {
        // Clone the questions properly to avoid reference issues
        const videoQuestions = JSON.parse(JSON.stringify(videoQuestionForm.getValues('questions')));

        // Update addedQuestionForm with deep-cloned data
        addedQuestionForm.reset({
            ...addedQuestionForm.getValues(),
            questions: [...addedQuestionForm.getValues('questions'), ...videoQuestions],
        });

        // Update formRefData with deep-cloned data
        formRefData.current = {
            ...formRefData.current,
            questions: [...formRefData.current.questions, ...videoQuestions],
        };

        // Update formData state with deep-cloned data
        setFormData((prevData) => ({
            ...prevData,
            questions: [...prevData.questions, ...videoQuestions],
        }));

        // Close after data is properly updated
        handleClose();
    };

    return (
        <Dialog open={previewQuestionDialog} onOpenChange={setPreviewQuestionDialog}>
            <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col !gap-0 overflow-y-auto !rounded-none !p-0">
                <h1 className="bg-primary-50 p-4 font-semibold text-primary-500">Question</h1>
                <div>
                    <FormProvider {...videoQuestionForm}>
                        {videoQuestionForm.getValues('questions')?.length === 0 ? (
                            <p>Nothing to show</p>
                        ) : (
                            <div className="my-4 flex flex-col gap-2">
                                <MainViewComponentFactory
                                    key={currentQuestionIndex}
                                    type={
                                        videoQuestionForm.getValues(
                                            `questions.${currentQuestionIndex}.questionType`
                                        ) as QuestionType
                                    }
                                    props={{
                                        form: videoQuestionForm,
                                        currentQuestionIndex,
                                        setCurrentQuestionIndex,
                                        className:
                                            'dialog-height overflow-auto ml-6 flex w-full flex-col gap-6 pr-6 pt-4',
                                    }}
                                />
                                <div className="flex justify-end">
                                    <MyButton
                                        type="button"
                                        buttonType="primary"
                                        scale="large"
                                        layoutVariant="default"
                                        className="mr-3"
                                        onClick={handleAddQuestionInAddedForm}
                                    >
                                        Done
                                    </MyButton>
                                </div>
                            </div>
                        )}
                    </FormProvider>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VideoQuestionDialogAddPreview;
