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
import { toast } from "sonner";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useQuestionStore } from "../-global-states/question-index";
import { addQuestionPaper } from "../-utils/question-paper-services";
import { MyQuestionPaperFormInterface } from "../../../../types/question-paper-form";
import {
    getIdByLevelName,
    getIdBySubjectName,
    transformResponseDataToMyQuestionsSchema,
} from "../-utils/helper";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useRefetchStore } from "../-global-states/refetch-store";
import {
    ANSWER_LABELS,
    EXPLANATION_LABELS,
    OPTIONS_LABELS,
    QUESTION_LABELS,
} from "@/constants/dummy-data";
import { useFilterDataForAssesment } from "../../tests/-utils.ts/useFiltersData";

interface QuestionPaperUploadProps {
    isManualCreated: boolean;
}

export const QuestionPaperUpload = ({ isManualCreated }: QuestionPaperUploadProps) => {
    const handleRefetchData = useRefetchStore((state) => state.handleRefetchData);
    const { setCurrentQuestionIndex } = useQuestionStore();
    const { instituteDetails } = useInstituteDetailsStore();

    const { YearClassFilterData, SubjectFilterData } = useFilterDataForAssesment(instituteDetails);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<z.infer<typeof uploadQuestionPaperFormSchema>>({
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
            questions: [
                {
                    questionId: "1",
                    questionName: "",
                    explanation: "",
                    questionType: "MCQS",
                    questionMark: "",
                    imageDetails: [],
                    singleChoiceOptions: [
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                    ],
                    multipleChoiceOptions: [
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                    ],
                },
            ],
        },
    });

    const { getValues, setValue, watch } = form;

    const questionPaperId = getValues("questionPaperId");
    const title = getValues("title");
    const yearClass = getValues("yearClass");
    const subject = getValues("subject");
    const questionIdentifier = getValues("questionsType");
    const optionIdentifier = getValues("optionsType");
    const answerIdentifier = getValues("answersType");
    const explanationIdentifier = getValues("explanationsType");
    const fileUpload = getValues("fileUpload");
    watch("fileUpload");

    const isFormValidWhenManuallyCreated = !!title && !!yearClass && !!subject;
    const isFormValidWhenUploaded = !!title && !!yearClass && !!subject && !!fileUpload;

    const [uploadProgress, setUploadProgress] = useState(0);
    const [isProgress, setIsProgress] = useState(false);

    // Your mutation setup
    const handleSubmitFormData = useMutation({
        mutationFn: ({ data }: { data: MyQuestionPaperFormInterface }) => addQuestionPaper(data),
        onSuccess: () => {
            setCurrentQuestionIndex(0);
            toast.success("Question Paper added successfully", {
                className: "success-toast",
                duration: 2000,
            });
            handleRefetchData();
        },
        onError: (error: unknown) => {
            console.log("Error:", error);
            toast.error(error as string);
        },
    });

    function onSubmit(values: z.infer<typeof uploadQuestionPaperFormSchema>) {
        const getIdYearClass = getIdByLevelName(instituteDetails?.levels || [], values.yearClass);
        const getIdSubject = getIdBySubjectName(instituteDetails?.subjects || [], values.subject);
        handleSubmitFormData.mutate({
            data: {
                ...values,
                yearClass: getIdYearClass,
                subject: getIdSubject,
            } as MyQuestionPaperFormInterface,
        });
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
            setValue("questions", transformResponseDataToMyQuestionsSchema(data));
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
        setValue("questions", []);
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
                                    options={QUESTION_LABELS.map((option, index) => ({
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
                                    options={OPTIONS_LABELS.map((option, index) => ({
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
                                    options={ANSWER_LABELS.map((option, index) => ({
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
                                    options={EXPLANATION_LABELS.map((option, index) => ({
                                        value: option,
                                        label: option,
                                        _id: index,
                                    }))}
                                    control={form.control}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-6">
                                <div
                                    className="flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dotted border-primary-500 p-4"
                                    onClick={handleFileSelect}
                                >
                                    <UploadFileBg className="mb-3" />
                                    <FileUploadComponent
                                        fileInputRef={fileInputRef}
                                        onFileSubmit={handleFileSubmit}
                                        control={form.control}
                                        name="fileUpload"
                                    />
                                </div>
                                <h1 className="-mt-4 text-xs text-red-500">
                                    If you are having a problem while uploading docx file then
                                    please convert your file in html{" "}
                                    <a
                                        href="https://convertio.co/docx-html/"
                                        target="_blank"
                                        className="text-blue-500"
                                        rel="noreferrer"
                                    >
                                        here
                                    </a>{" "}
                                    and try to re-upload.
                                </h1>
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
                                                {getValues("fileUpload")?.name}
                                            </p>
                                            <X
                                                size={16}
                                                className="mt-[2px] cursor-pointer"
                                                onClick={handleRemoveQuestionPaper}
                                            />
                                        </div>

                                        <p className="whitespace-normal text-xs">
                                            {(
                                                (((getValues("fileUpload")?.size || 0) /
                                                    (1024 * 1024)) *
                                                    uploadProgress) /
                                                100
                                            ).toFixed(2)}{" "}
                                            MB /{" "}
                                            {(
                                                (getValues("fileUpload")?.size || 0) /
                                                (1024 * 1024)
                                            ).toFixed(2)}
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
                            options={YearClassFilterData.map((option, index) => ({
                                value: option.name,
                                label: option.name,
                                _id: index,
                            }))}
                            control={form.control}
                            required
                            className="!w-full"
                        />
                        <SelectField
                            label="Subject"
                            name="subject"
                            options={SubjectFilterData.map((option, index) => ({
                                value: option.name,
                                label: option.name,
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
                            !isManualCreated &&
                            fileUpload && (
                                <QuestionPaperTemplate
                                    form={form}
                                    questionPaperId={questionPaperId}
                                    isViewMode={false}
                                    refetchData={handleRefetchData}
                                />
                            )
                        )}
                        {isManualCreated && (
                            <QuestionPaperTemplate
                                form={form}
                                questionPaperId={questionPaperId}
                                isViewMode={false}
                                refetchData={handleRefetchData}
                                isManualCreated={isManualCreated}
                            />
                        )}
                        {fileUpload && (
                            <AlertDialogCancel className="border-none shadow-none hover:bg-transparent">
                                <Button
                                    disabled={
                                        isManualCreated
                                            ? !isFormValidWhenManuallyCreated
                                            : !isFormValidWhenUploaded
                                    }
                                    type="submit"
                                    className="ml-[1.8rem] w-56 bg-primary-500 text-white"
                                >
                                    Done
                                </Button>
                            </AlertDialogCancel>
                        )}
                        {!fileUpload && (
                            <Button
                                disabled={
                                    isManualCreated
                                        ? !isFormValidWhenManuallyCreated
                                        : !isFormValidWhenUploaded
                                }
                                type="submit"
                                className="w-56 bg-primary-500 text-white"
                            >
                                Done
                            </Button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </>
    );
};
