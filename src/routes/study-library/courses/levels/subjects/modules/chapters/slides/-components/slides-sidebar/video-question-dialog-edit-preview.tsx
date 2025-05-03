import { QuestionType } from "@/constants/dummy-data";
import { MainViewComponentFactory } from "@/routes/assessment/question-papers/-components/QuestionPaperTemplatesTypes/MainViewComponentFactory";
import { uploadQuestionPaperFormSchema } from "@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema";
import { Dispatch, MutableRefObject, SetStateAction, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MyButton } from "@/components/design-system/button";
import { UploadQuestionPaperFormType } from "@/routes/assessment/question-papers/-components/QuestionPaperUpload";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { PencilSimpleLine } from "phosphor-react";
import { zodResolver } from "@hookform/resolvers/zod";

type QuestionPaperForm = z.infer<typeof uploadQuestionPaperFormSchema>;

const VideoQuestionDialogEditPreview = ({
    formRefData,
    question,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    editQuestionPreview,
    setEditQuestionPreview,
}: {
    formRefData: MutableRefObject<UploadQuestionPaperFormType>;
    question?: any;
    currentQuestionIndex: number;
    setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
    editQuestionPreview: boolean;
    setEditQuestionPreview: Dispatch<SetStateAction<boolean>>;
}) => {
    const form = useForm<QuestionPaperForm>({
        resolver: zodResolver(uploadQuestionPaperFormSchema),
        mode: "onChange",
        defaultValues: {
            questionPaperId: "",
            isFavourite: false,
            title: "",
            createdOn: new Date(),
            yearClass: "",
            subject: "",
            questionsType: "",
            optionsType: "",
            answersType: "",
            explanationsType: "",
            fileUpload: null as unknown as File,
            questions: [],
        },
    });
    const handleEditQuestionInAddedForm = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const currentQuestionIndex = formRefData.current.questions.findIndex(
            (q) => q.questionId === question.questionId,
        );
        formRefData.current.questions[currentQuestionIndex] = form.getValues("questions")[0];
        setEditQuestionPreview(false);
    };

    useEffect(() => {
        form.reset({
            ...form.getValues(),
            questions: [...form.getValues("questions"), question],
        });
    }, [question]);

    return (
        <Dialog open={editQuestionPreview} onOpenChange={setEditQuestionPreview}>
            <DialogTrigger>
                <MyButton
                    buttonType="secondary"
                    scale="small"
                    layoutVariant="default"
                    className="h-8 min-w-4"
                >
                    <PencilSimpleLine size={32} />
                </MyButton>
            </DialogTrigger>
            <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col !gap-0 overflow-y-auto !rounded-none !p-0">
                <h1 className="bg-primary-50 p-4 font-semibold text-primary-500">Question</h1>
                <div>
                    <FormProvider {...form}>
                        {form.getValues("questions")?.length === 0 ? (
                            <p>Nothing to show</p>
                        ) : (
                            <div className="my-4 flex flex-col gap-2">
                                <MainViewComponentFactory
                                    key={currentQuestionIndex}
                                    type={
                                        form.getValues(
                                            `questions.${currentQuestionIndex}.questionType`,
                                        ) as QuestionType
                                    }
                                    props={{
                                        form,
                                        currentQuestionIndex,
                                        setCurrentQuestionIndex,
                                        className:
                                            "dialog-height overflow-auto ml-6 flex w-full flex-col gap-6 pr-6 pt-4",
                                    }}
                                />
                            </div>
                        )}
                    </FormProvider>
                </div>
                <div className="flex justify-end">
                    <MyButton
                        type="button"
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                        className="mr-3"
                        onClick={handleEditQuestionInAddedForm}
                    >
                        Edit
                    </MyButton>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VideoQuestionDialogEditPreview;
