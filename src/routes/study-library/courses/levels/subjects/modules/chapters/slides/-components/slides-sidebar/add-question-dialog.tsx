import { MCQS, MCQM, Numerical, TrueFalse, LongAnswer, SingleWord, CMCQS, CMCQM } from "@/svgs";
import { QuestionType as QuestionTypeList } from "@/constants/dummy-data";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { questionsFormSchema } from "@/routes/assessment/question-papers/-utils/question-form-schema";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContentStore } from "../../-stores/chapter-sidebar-store";
import { UploadQuestionPaperFormType } from "@/routes/assessment/question-papers/-components/QuestionPaperUpload";
import { uploadQuestionPaperFormSchema } from "@/routes/assessment/question-papers/-utils/upload-question-paper-form-schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MyInput } from "@/components/design-system/input";
import { MyButton } from "@/components/design-system/button";
import { useState } from "react";

export interface QuestionTypeProps {
    icon: React.ReactNode; // Accepts an SVG or any React component
    text: string; // Accepts the text label
    type?: QuestionTypeList;
    handleAddQuestion: (
        type: string,
        questionPoints: string | undefined,
        reattemptCount: string | undefined,
    ) => void;
}

export type QuestionPaperFormType = z.infer<typeof questionsFormSchema>;

const AddQuestionDialog = ({
    openState,
}: {
    openState?: ((open: boolean) => void) | undefined;
}) => {
    const { setItems, items } = useContentStore();
    const form = useForm<UploadQuestionPaperFormType>({
        resolver: zodResolver(uploadQuestionPaperFormSchema),
        mode: "onChange",
        defaultValues: {
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
        },
    });

    const [localPoints, setLocalPoints] = useState("");
    const [localReattempts, setLocalReattempts] = useState("");
    const [activeQuestionDialog, setActiveQuestionDialog] = useState<QuestionTypeList | null>(null);

    console.log(items);

    const QuestionType = ({ icon, text, type = QuestionTypeList.MCQS }: QuestionTypeProps) => {
        return (
            <div
                className="flex w-full cursor-pointer flex-row items-center gap-4 rounded-md border px-4 py-3"
                onClick={() => setActiveQuestionDialog(type)}
            >
                {icon}
                <div className="text-body">{text}</div>
            </div>
        );
    };

    const { fields, append } = useFieldArray({
        control: form.control,
        name: "questions", // Name of the field array
    });

    // Function to handle adding a new question
    const handleAddQuestion = (
        newQuestionType: string,
        questionPoints: string | undefined,
        reattemptCount: string | undefined,
    ) => {
        append({
            questionId: String(fields.length + 1),
            questionName: "",
            explanation: "",
            questionType: newQuestionType,
            questionPenalty: "",
            questionDuration: {
                hrs: "",
                min: "",
            },
            questionMark: "",
            singleChoiceOptions: [],
            multipleChoiceOptions: [],
            csingleChoiceOptions: [],
            cmultipleChoiceOptions: [],
            trueFalseOptions: [],
            parentRichTextContent: "",
            decimals: 0,
            numericType: "",
            validAnswers: [],
            questionResponseType: "",
            subjectiveAnswerText: "",
            questionPoints: questionPoints || "",
            reattemptCount: reattemptCount || "",
        });
        setItems([
            {
                slide_title: null,
                document_id: null,
                document_title: `${form.getValues(`questions.${0}.questionType`)} slide`,
                document_type: form.getValues(`questions.${0}.questionType`),
                slide_description: null,
                document_cover_file_id: null,
                video_description: null,
                document_data: JSON.stringify(form.getValues()),
                video_id: null,
                video_title: null,
                video_url: null,
                slide_id: String(items.length + 1),
                source_type: "QUESTION",
                status: "DRAFT",
                published_data: "",
                published_url: "",
                last_sync_date: null,
            },
            ...items,
        ]);
        form.trigger();
        setActiveQuestionDialog(null); // Close the dialog
        setLocalPoints(""); // Reset input fields
        setLocalReattempts("");
        openState && openState(false);
    };

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

            {/* Separate dialog component that appears when a question type is selected */}
            <Dialog
                open={activeQuestionDialog !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setActiveQuestionDialog(null);
                        setLocalPoints("");
                        setLocalReattempts("");
                    }
                }}
            >
                <DialogContent className="p-0">
                    <h1 className="rounded-t-lg bg-primary-50 p-4 font-semibold text-primary-500">
                        Question Settings
                    </h1>
                    <div className="flex flex-col gap-4 p-4">
                        <MyInput
                            input={localPoints}
                            onChangeFunction={(e) => setLocalPoints(e.target.value)}
                            label="Question Points"
                            required={true}
                            inputType="text"
                            inputPlaceholder="00"
                            className="w-full"
                        />
                        <MyInput
                            input={localReattempts}
                            onChangeFunction={(e) => setLocalReattempts(e.target.value)}
                            label="Reattempt Count"
                            required={true}
                            inputType="text"
                            inputPlaceholder="00"
                            className="w-full"
                        />
                        <div>
                            <MyButton
                                type="button"
                                scale="large"
                                buttonType="primary"
                                className="font-medium"
                                onClick={() => {
                                    if (activeQuestionDialog) {
                                        handleAddQuestion(
                                            activeQuestionDialog,
                                            localPoints,
                                            localReattempts,
                                        );
                                    }
                                }}
                            >
                                Add
                            </MyButton>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AddQuestionDialog;
