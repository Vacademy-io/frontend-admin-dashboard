import { QuestionType } from "@/constants/dummy-data";
import { MainViewComponentFactory } from "@/routes/assessment/question-papers/-components/QuestionPaperTemplatesTypes/MainViewComponentFactory";
import { uploadQuestionPaperFormSchema } from "@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema";
import { Dispatch, MutableRefObject, SetStateAction, useState } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MyButton } from "@/components/design-system/button";
import { UploadQuestionPaperFormType } from "@/routes/assessment/question-papers/-components/QuestionPaperUpload";
import { VideoPlayerTimeFormType } from "../../-form-schemas/video-player-time-schema";

type QuestionPaperForm = z.infer<typeof uploadQuestionPaperFormSchema>;

const VideoQuestionDialogPreview = ({
    videoQuestionForm,
    addedQuestionForm,
    videoPlayerTimeFrameForm,
    openQuestionPreview,
    setOpenQuestionPreview,
    formRefData,
    setIsTimeStampDialogOpen,
    setAddQuestionTypeDialog,
}: {
    videoQuestionForm: UseFormReturn<QuestionPaperForm>;
    addedQuestionForm: UseFormReturn<QuestionPaperForm>;
    videoPlayerTimeFrameForm: UseFormReturn<VideoPlayerTimeFormType>;
    openQuestionPreview: boolean;
    setOpenQuestionPreview: Dispatch<SetStateAction<boolean>>;
    formRefData: MutableRefObject<UploadQuestionPaperFormType>;
    setIsTimeStampDialogOpen: Dispatch<SetStateAction<boolean>>;
    setAddQuestionTypeDialog: Dispatch<SetStateAction<boolean>>;
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const handleClose = () => {
        setCurrentQuestionIndex(0);
        setOpenQuestionPreview(false);

        videoQuestionForm.reset({
            questionPaperId: "1",
            isFavourite: false,
            title: "",
            createdOn: new Date(),
            yearClass: "",
            subject: "",
            questionsType: "",
            optionsType: "",
            answersType: "",
            explanationsType: "",
            fileUpload: undefined,
            questions: [],
        });

        videoPlayerTimeFrameForm.reset({
            hrs: "",
            min: "",
            sec: "",
        });
        setIsTimeStampDialogOpen(false);
        setAddQuestionTypeDialog(false);
    };
    const handleAddQuestionInAddedForm = () => {
        addedQuestionForm.reset({
            ...addedQuestionForm.getValues(),
            questions: [
                ...addedQuestionForm.getValues("questions"),
                ...videoQuestionForm.getValues("questions"),
            ],
        });
        formRefData.current = {
            ...formRefData.current,
            questions: [
                ...formRefData.current.questions,
                ...videoQuestionForm.getValues("questions"),
            ],
        };
        handleClose();
    };
    console.log("form ref data", formRefData.current);
    return (
        <Dialog open={openQuestionPreview} onOpenChange={handleClose}>
            <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col !gap-0 overflow-y-auto !rounded-none !p-0">
                <h1 className="bg-primary-50 p-4 font-semibold text-primary-500">Question</h1>
                <div>
                    <FormProvider {...videoQuestionForm}>
                        {videoQuestionForm.getValues("questions")?.length === 0 ? (
                            <p>Nothing to show</p>
                        ) : (
                            <div className="my-4 flex flex-col gap-2">
                                <MainViewComponentFactory
                                    key={currentQuestionIndex}
                                    type={
                                        videoQuestionForm.getValues(
                                            `questions.${currentQuestionIndex}.questionType`,
                                        ) as QuestionType
                                    }
                                    props={{
                                        form: videoQuestionForm,
                                        currentQuestionIndex,
                                        setCurrentQuestionIndex,
                                        className:
                                            "dialog-height overflow-auto ml-6 flex w-full flex-col gap-6 pr-6 pt-4",
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

export default VideoQuestionDialogPreview;
