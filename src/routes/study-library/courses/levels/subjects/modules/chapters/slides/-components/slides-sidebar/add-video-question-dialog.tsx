import { MCQS, MCQM, Numerical, TrueFalse, LongAnswer, SingleWord, CMCQS, CMCQM } from "@/svgs";
import { QuestionType as QuestionTypeList } from "@/constants/dummy-data";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { questionsFormSchema } from "@/routes/assessment/question-papers/-utils/question-form-schema";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { UploadQuestionPaperFormType } from "@/routes/assessment/question-papers/-components/QuestionPaperUpload";
import { uploadQuestionPaperFormSchema } from "@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MyButton } from "@/components/design-system/button";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { VideoPlayerTimeFormType } from "../../-form-schemas/video-player-time-schema";
import VideoQuestionDialogAddPreview from "./video-question-dialog-add-preview";

export interface QuestionTypeProps {
    icon: React.ReactNode; // Accepts an SVG or any React component
    text: string; // Accepts the text label
    type?: QuestionTypeList;
    handleAddQuestion: (type: string) => void;
}

export type QuestionPaperFormType = z.infer<typeof questionsFormSchema>;
type QuestionPaperForm = z.infer<typeof uploadQuestionPaperFormSchema>;

const QuestionType = ({
    icon,
    text,
    type = QuestionTypeList.MCQS,
    handleAddQuestion,
}: QuestionTypeProps) => {
    return (
        <div
            className="flex w-full cursor-pointer flex-row items-center gap-4 rounded-md border px-4 py-3"
            onClick={() => handleAddQuestion(type)}
        >
            {icon}
            <div className="text-body">{text}</div>
        </div>
    );
};

const AddVideoQuestionDialog = ({
    addedQuestionForm,
    videoQuestionForm,
    videoPlayerTimeFrameForm,
    formRefData,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    previewQuestionDialog,
    setPreviewQuestionDialog,
    formData,
    setFormData,
}: {
    addedQuestionForm: UseFormReturn<QuestionPaperForm>;
    videoQuestionForm: UseFormReturn<QuestionPaperForm>;
    videoPlayerTimeFrameForm: UseFormReturn<VideoPlayerTimeFormType>;
    formRefData: MutableRefObject<UploadQuestionPaperFormType>;
    currentQuestionIndex: number;
    setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
    previewQuestionDialog: boolean;
    setPreviewQuestionDialog: Dispatch<SetStateAction<boolean>>;
    formData: UploadQuestionPaperFormType;
    setFormData: Dispatch<SetStateAction<UploadQuestionPaperFormType>>;
}) => {
    const { append: appendVideoQuestion } = useFieldArray({
        control: videoQuestionForm.control,
        name: "questions", // Name of the field array
    });

    // Function to handle adding a new question
    const handleAddQuestion = (newQuestionType: string) => {
        appendVideoQuestion({
            id: "",
            questionId: String(formRefData.current.questions.length + 1),
            questionName: "",
            explanation: "",
            questionType: newQuestionType,
            questionPenalty: "",
            questionDuration: {
                hrs: "",
                min: "",
            },
            questionMark: "",
            singleChoiceOptions: Array(4).fill({
                id: "",
                name: "",
                isSelected: false,
            }),
            multipleChoiceOptions: Array(4).fill({
                id: "",
                name: "",
                isSelected: false,
            }),
            csingleChoiceOptions: Array(4).fill({
                id: "",
                name: "",
                isSelected: false,
            }),
            cmultipleChoiceOptions: Array(4).fill({
                id: "",
                name: "",
                isSelected: false,
            }),
            trueFalseOptions: Array(2).fill({
                id: "",
                name: "",
                isSelected: false,
            }),
            parentRichTextContent: "",
            decimals: 0,
            numericType: "",
            validAnswers: [],
            questionResponseType: "",
            subjectiveAnswerText: "",
            timestamp: `${videoPlayerTimeFrameForm.getValues(
                "hrs",
            )}:${videoPlayerTimeFrameForm.getValues("min")}:${videoPlayerTimeFrameForm.getValues(
                "sec",
            )}`,
        });
        videoQuestionForm.trigger();
        setPreviewQuestionDialog(true);
    };

    return (
        <>
            <Dialog>
                <DialogTrigger>
                    <MyButton
                        type="button"
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                        className="mr-3"
                    >
                        Next
                    </MyButton>
                </DialogTrigger>
                <DialogContent className="size-[500px] p-0">
                    <h1 className="rounded-t-lg bg-primary-50 p-4 font-semibold text-primary-500">
                        Add Question
                    </h1>
                    <div className="overflow-auto p-4">
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
                                type={QuestionTypeList.TRUE_FALSE}
                                icon={<TrueFalse />}
                                text="True False"
                                handleAddQuestion={handleAddQuestion}
                            />
                        </div>
                        <Separator className="my-6" />
                        <div className="flex flex-col gap-4">
                            <div className="text-subtitle font-semibold">Option Based</div>
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
                        </div>
                        <Separator className="my-6" />
                        <div className="flex flex-col gap-4">
                            <div className="text-subtitle font-semibold">Math Based</div>
                            <QuestionType
                                icon={<Numerical />}
                                text="Numerical"
                                type={QuestionTypeList.NUMERIC}
                                handleAddQuestion={handleAddQuestion}
                            />
                        </div>
                        <Separator className="my-6" />
                        <div className="flex flex-col gap-4">
                            <div className="text-subtitle font-semibold">Writing Skills</div>
                            <QuestionType
                                icon={<LongAnswer />}
                                type={QuestionTypeList.LONG_ANSWER}
                                text="Long Answer"
                                handleAddQuestion={handleAddQuestion}
                            />
                            <QuestionType
                                icon={<SingleWord />}
                                type={QuestionTypeList.ONE_WORD}
                                text="Single Word"
                                handleAddQuestion={handleAddQuestion}
                            />
                        </div>
                        <Separator className="my-6" />
                        <div className="flex flex-col gap-4">
                            <div className="text-subtitle font-semibold">Reading Skills</div>
                            <QuestionType
                                icon={<CMCQS />}
                                text="Comprehension Multiple Choice Questions (Single correct)"
                                type={QuestionTypeList.CMCQS}
                                handleAddQuestion={handleAddQuestion}
                            />
                            <QuestionType
                                icon={<CMCQM />}
                                text="Comprehension Multiple Choice Questions (Multiple correct)"
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
                    </div>
                </DialogContent>
            </Dialog>
            <VideoQuestionDialogAddPreview
                videoQuestionForm={videoQuestionForm}
                addedQuestionForm={addedQuestionForm}
                videoPlayerTimeFrameForm={videoPlayerTimeFrameForm}
                formRefData={formRefData}
                currentQuestionIndex={currentQuestionIndex}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                previewQuestionDialog={previewQuestionDialog}
                setPreviewQuestionDialog={setPreviewQuestionDialog}
                formData={formData}
                setFormData={setFormData}
            />
        </>
    );
};

export default AddVideoQuestionDialog;
