import { useRef, useState } from "react";
import { uploadQuestionPaperFormSchema } from "../-utils/upload-question-paper-form-schema";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectField from "@/components/design-system/select-field";
import { UploadFileBg } from "@/svgs";
import { FileUploadComponent } from "@/components/design-system/file-upload";
import { File, X } from "phosphor-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { QuestionPaperTemplate } from "./QuestionPaperTemplate";
import CustomInput from "@/components/design-system/custom-input";
import { useMutation } from "@tanstack/react-query";
import { uploadDocsFile } from "../-services/question-paper-services";
import { QuestionData } from "@/types/question-paper-template";
import { toast } from "sonner";
import { useAllQuestionsStore } from "../-global-states/questions-store";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";

export const QuestionPaperUpload = ({ isManualCreated }: { isManualCreated: boolean }) => {
    const { allQuestionsData, setAllQuestionsData } = useAllQuestionsStore();
    const YearClassData = ["10th Class", "9th Class", "8th Class"];
    const SubjectData = [
        "Chemistry",
        "Biology",
        "Physics",
        "Olympiad",
        "Mathematics",
        "Civics",
        "History",
        "Geography",
        "Economics",
    ];

    const QuestionsLabels = ["(1.)", "1.)", "(1)", "1)"];
    const OptionsLabels = ["(a.)", "a.)", "(a)", "a)", "(A.)", "A.)", "(A)", "A)"];
    const AnswersLabels = ["Ans:", "Answer:", "Ans.", "Answer."];
    const ExplanationsLabels = ["Exp:", "Explanation:", "Exp.", "Explanation."];
    const [questionsData, setQuestionsData] = useState<QuestionData[]>([]);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<z.infer<typeof uploadQuestionPaperFormSchema>>({
        resolver: zodResolver(uploadQuestionPaperFormSchema),
        mode: "onChange",
        defaultValues: {
            title: "",
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

    const { getValues, setValue } = form;
    const title = getValues("title");
    const yearClass = getValues("yearClass");
    const subject = getValues("subject");
    const questionIdentifier = getValues("questionsType");
    const optionIdentifier = getValues("optionsType");
    const answerIdentifier = getValues("answersType");
    const explanationIdentifier = getValues("explanationsType");
    const fileUpload = getValues("fileUpload");

    const isFormValid =
        !!questionIdentifier &&
        !!optionIdentifier &&
        !!answerIdentifier &&
        !!fileUpload &&
        !!title &&
        !!yearClass &&
        !!subject;

    const [uploadProgress, setUploadProgress] = useState(0);
    const [isProgress, setIsProgress] = useState(false);

    function onSubmit(values: z.infer<typeof uploadQuestionPaperFormSchema>) {
        setAllQuestionsData([...allQuestionsData, values]);
    }

    const onInvalid = (err: unknown) => {
        console.error(err);
    };

    const addDocsFileMutation = useMutation({
        mutationFn: ({
            questionIdentifier,
            optionIdentifier,
            answerIdentifier,
            explanationIdentifier,
            file,
            setUploadProgress,
        }: {
            questionIdentifier: string;
            optionIdentifier: string;
            answerIdentifier: string;
            explanationIdentifier: string;
            file: File;
            setUploadProgress: React.Dispatch<React.SetStateAction<number>>;
        }) =>
            uploadDocsFile(
                questionIdentifier,
                optionIdentifier,
                answerIdentifier,
                explanationIdentifier,
                file,
                setUploadProgress,
            ),
        onMutate: () => {
            setIsProgress(true);
        },
        onSettled: () => {
            setIsProgress(false);
        },
        onSuccess: (data) => {
            setQuestionsData(data);
        },
        onError: (error: unknown) => {
            toast.error(error as string);
        },
    });

    const handleFileSubmit = (file: File) => {
        setValue("fileUpload", file);
        addDocsFileMutation.mutate({
            questionIdentifier,
            optionIdentifier,
            answerIdentifier,
            explanationIdentifier,
            file,
            setUploadProgress,
        });
    };

    const handleFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); // Trigger the file input click
        }
    };

    const handleRemoveQuestionPaper = () => {
        setValue("fileUpload", null as unknown as File);
        setQuestionsData([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset the file input to clear the selection
        }
    };
    return (
        <>
            <FormProvider {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit, onInvalid)}
                    className="scrollbar-hidden no-scrollbar max-h-[60vh] space-y-8 overflow-y-auto p-4 pt-2"
                >
                    {!isManualCreated && (
                        <>
                            <div className="ml-4 flex flex-col gap-4">
                                <SelectField
                                    label="Questions"
                                    name="questionsType"
                                    options={QuestionsLabels.map((option, index) => ({
                                        value: option,
                                        label: option,
                                        _id: index,
                                    }))}
                                    control={form.control}
                                    required
                                />
                                <SelectField
                                    label="Options"
                                    name="optionsType"
                                    options={OptionsLabels.map((option, index) => ({
                                        value: option,
                                        label: option,
                                        _id: index,
                                    }))}
                                    control={form.control}
                                    required
                                />
                                <SelectField
                                    label="Answers"
                                    name="answersType"
                                    options={AnswersLabels.map((option, index) => ({
                                        value: option,
                                        label: option,
                                        _id: index,
                                    }))}
                                    control={form.control}
                                    required
                                />
                                <SelectField
                                    label="Explanations"
                                    name="explanationsType"
                                    options={ExplanationsLabels.map((option, index) => ({
                                        value: option,
                                        label: option,
                                        _id: index,
                                    }))}
                                    control={form.control}
                                    required
                                />
                            </div>
                            <div
                                className="flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dotted border-primary-500 p-4"
                                onClick={handleFileSelect}
                            >
                                <UploadFileBg />
                                <FileUploadComponent
                                    fileInputRef={fileInputRef}
                                    onFileSubmit={handleFileSubmit}
                                    control={form.control}
                                    name="fileUpload"
                                />
                            </div>
                            {getValues("fileUpload") && (
                                <div className="flex w-full items-center gap-2 rounded-md bg-neutral-100 p-2">
                                    <div className="rounded-md bg-primary-100 p-2">
                                        <File
                                            size={32}
                                            fillOpacity={1}
                                            weight="fill"
                                            className="text-primary-500"
                                        />
                                    </div>
                                    <div className="flex w-full flex-col">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="break-all text-sm font-bold">
                                                {getValues("fileUpload").name}
                                            </p>
                                            <X
                                                size={16}
                                                className="mt-[2px] cursor-pointer"
                                                onClick={handleRemoveQuestionPaper}
                                            />
                                        </div>

                                        <p className="whitespace-normal text-xs">
                                            {(
                                                ((getValues("fileUpload").size / (1024 * 1024)) *
                                                    uploadProgress) /
                                                100
                                            ).toFixed(2)}{" "}
                                            MB /{" "}
                                            {(getValues("fileUpload").size / (1024 * 1024)).toFixed(
                                                2,
                                            )}
                                            &nbsp;MB
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <Progress
                                                value={uploadProgress}
                                                className="w-full bg-primary-500"
                                            />
                                            <span className="text-xs">{uploadProgress}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <CustomInput
                        control={form.control}
                        name="title"
                        label="Title"
                        placeholder="Enter Title"
                        required
                    />
                    <div className="flex items-center gap-4">
                        <SelectField
                            label="Year/class"
                            name="yearClass"
                            options={YearClassData.map((option, index) => ({
                                value: option,
                                label: option,
                                _id: index,
                            }))}
                            control={form.control}
                            required
                            className="!w-full"
                        />
                        <SelectField
                            label="Subject"
                            name="subject"
                            options={SubjectData.map((option, index) => ({
                                value: option,
                                label: option,
                                _id: index,
                            }))}
                            control={form.control}
                            required
                            className="!w-full"
                        />
                    </div>

                    <div className="flex justify-between">
                        {isProgress ? (
                            <Button type="button" variant="outline" className="w-52 border-2">
                                Loading...
                            </Button>
                        ) : (
                            questionsData.length > 0 && (
                                <QuestionPaperTemplate form={form} questionsData={questionsData} />
                            )
                        )}
                        {isManualCreated && (
                            <QuestionPaperTemplate form={form} questionsData={questionsData} />
                        )}
                        <AlertDialogCancel className="border-none shadow-none hover:bg-transparent">
                            <Button
                                disabled={!isFormValid}
                                type="submit"
                                className="w-56 bg-primary-500 text-white"
                            >
                                Done
                            </Button>
                        </AlertDialogCancel>
                    </div>
                </form>
            </FormProvider>
        </>
    );
};
