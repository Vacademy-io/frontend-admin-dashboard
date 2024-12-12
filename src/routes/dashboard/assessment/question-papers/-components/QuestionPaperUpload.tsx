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

export const QuestionPaperUpload = () => {
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
            questions: "",
            options: "",
            answers: "",
            explanations: "",
            fileUpload: undefined,
        },
    });

    const { getValues, setValue } = form;
    const questionIdentifier = getValues("questions");
    const optionIdentifier = getValues("options");
    const answerIdentifier = getValues("answers");
    const explanationIdentifier = getValues("explanations");
    const fileUpload = getValues("fileUpload");
    const isFormValid =
        !!questionIdentifier && !!optionIdentifier && !!answerIdentifier && !!fileUpload;
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isProgress, setIsProgress] = useState(false);

    function onSubmit(values: z.infer<typeof uploadQuestionPaperFormSchema>) {
        console.log(values);
    }

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
            console.log(data);
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
        // Clear the file input value
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset the file input to clear the selection
        }
    };
    return (
        <>
            <FormProvider {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="scrollbar-hidden no-scrollbar max-h-[60vh] space-y-8 overflow-y-auto p-4 pt-2"
                >
                    <div className="ml-4 flex flex-col gap-4">
                        <SelectField
                            label="Questions"
                            name="questions"
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
                            name="options"
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
                            name="answers"
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
                            name="explanations"
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
                                    MB / {(getValues("fileUpload").size / (1024 * 1024)).toFixed(2)}
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
                    <CustomInput
                        control={form.control}
                        name="title"
                        label="Title"
                        placeholder="Enter Title"
                        required
                    />
                    <div className="flex justify-between">
                        {isProgress ? (
                            <Button type="button" variant="outline" className="w-52 border-2">
                                Loading...
                            </Button>
                        ) : (
                            questionsData.length > 0 && (
                                <QuestionPaperTemplate
                                    questionPaperUploadForm={form}
                                    questionsData={questionsData}
                                />
                            )
                        )}
                        <Button
                            disabled={!isFormValid}
                            type="submit"
                            className="w-52 bg-primary-500 text-white"
                        >
                            Done
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </>
    );
};
