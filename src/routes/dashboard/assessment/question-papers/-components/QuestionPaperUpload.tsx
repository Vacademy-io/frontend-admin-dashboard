import { useRef } from "react";
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

export const QuestionPaperUpload = () => {
    const QuestionsLabels = ["(1.)", "1.)", "(1)", "1)"];
    const OptionsLabels = ["(a.)", "a.)", "(a)", "a)", "(A.)", "A.)", "(A)", "A)"];
    const AnswersLabels = ["Ans:", "Answer:", "Ans.", "Answer."];
    const ExplanationsLabels = ["Exp:", "Explanation:", "Exp.", "Explanation."];

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<z.infer<typeof uploadQuestionPaperFormSchema>>({
        resolver: zodResolver(uploadQuestionPaperFormSchema),
        defaultValues: {
            title: "",
            questions: "",
            options: "",
            answers: "",
            explanations: "",
            fileUpload: "",
        },
    });

    const { setValue } = form;

    function onSubmit(values: z.infer<typeof uploadQuestionPaperFormSchema>) {
        console.log(values);
    }

    const handleFileSubmit = (file: File) => {
        console.log("Uploaded file:", file);
        setValue("fileUpload", file.name);
        // Add your upload logic here (e.g., sending to S3 or a server).
    };

    const handleFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); // Trigger the file input click
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
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold">10th Class Enrollment.tsx</p>
                                <X size={14} className="cursor-pointer" />
                            </div>
                            <p className="text-xs">10 MB / 50 MB</p>
                            <div className="flex items-center gap-2">
                                <Progress value={100} className="w-full bg-primary-500" />
                                <span className="text-xs">100%</span>
                            </div>
                        </div>
                    </div>
                    <CustomInput
                        control={form.control}
                        name="title"
                        label="Title"
                        placeholder="Enter Title"
                        required
                    />
                    <div className="flex justify-between">
                        <QuestionPaperTemplate questionPaperUploadForm={form} />
                        <Button
                            disabled={!form.formState.isValid}
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
