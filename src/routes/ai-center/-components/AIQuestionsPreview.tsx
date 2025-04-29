import { DashboardLoader } from "@/components/core/dashboard-loader";
import { MyButton } from "@/components/design-system/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
    AIAssessmentResponseInterface,
    AITaskIndividualListInterface,
} from "@/types/ai/generate-assessment/generate-complete-assessment";
import { useMutation } from "@tanstack/react-query";
import { handleGetQuestionsInvidualTask } from "../-services/ai-center-service";
import { useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { generateCompleteAssessmentFormSchema } from "../-utils/generate-complete-assessment-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { transformQuestionsToGenerateAssessmentAI } from "../-utils/helper";
import useInstituteLogoStore from "@/components/common/layout-container/sidebar/institutelogo-global-zustand";
import { Sortable, SortableDragHandle, SortableItem } from "@/components/ui/sortable";
import { getPPTViewTitle } from "@/routes/assessment/question-papers/-utils/helper";
import { QuestionType } from "@/constants/dummy-data";
import { DotsSixVertical } from "phosphor-react";
import { PPTComponentFactory } from "@/routes/assessment/question-papers/-components/QuestionPaperTemplatesTypes/PPTComponentFactory";
import { Separator } from "@/components/ui/separator";
import { MainViewComponentFactory } from "@/routes/assessment/question-papers/-components/QuestionPaperTemplatesTypes/MainViewComponentFactory";
import ExportQuestionPaperAI from "./export-ai-question-paper/ExportQuestionPaperAI";
import { toast } from "sonner";
import { QuestionsFromTextData } from "../ai-tools/vsmart-prompt/-components/GenerateQuestionsFromText";
import { handleGenerateAssessmentQuestions } from "../-services/ai-center-service";
import { VsmartUpload } from "./regenerate-dialogs/VsmartUpload";
import VsmartAudio from "./regenerate-dialogs/VsmartAudio";
import { VsmartPrompt } from "./regenerate-dialogs/VsmartPrompt";
import { VsmartExtract } from "./regenerate-dialogs/VsmartExtract";
import { VsmartImage } from "./regenerate-dialogs/VsmartImage";
import { VsmartOrganizer } from "./regenerate-dialogs/VsmartOrganizer";
import { VsmartSorter } from "./regenerate-dialogs/VsmartSorter";
interface AIQuestionsPreviewProps {
    task: AITaskIndividualListInterface;
    pollGenerateAssessment?: (prompt?: string) => void;
    handleGenerateQuestionsForAssessment?: (
        pdfId?: string,
        prompt?: string,
        taskName?: string,
    ) => void;
    pollGenerateQuestionsFromText?: (data: QuestionsFromTextData) => void;
    pollGenerateQuestionsFromAudio?: (data: QuestionsFromTextData) => void;
    heading: string;
}

const AIQuestionsPreview = ({
    task,
    pollGenerateAssessment,
    handleGenerateQuestionsForAssessment,
    pollGenerateQuestionsFromText,
    pollGenerateQuestionsFromAudio,
    heading,
}: AIQuestionsPreviewProps) => {
    const [open, setOpen] = useState(false);
    const [openVsmartUpload, setOpenVsmartUpload] = useState(false);
    const [openVsmartAudio, setOpenVsmartAudio] = useState(false);
    const [openVsmartPrompt, setOpenVsmartPrompt] = useState(false);
    const [openVsmartExtract, setOpenVsmartExtract] = useState(false);
    const [openVsmartImage, setOpenVsmartImage] = useState(false);
    const [openVsmartOrganizer, setOpenVsmartOrganizer] = useState(false);
    const [openVsmartSorter, setOpenVsmartSorter] = useState(false);
    const handleOpenVsmartUpload = (open: boolean) => {
        setOpenVsmartUpload(open);
    };
    const handleOpenVsmartAudio = (open: boolean) => {
        setOpenVsmartAudio(open);
    };
    const handleOpenVsmartPrompt = (open: boolean) => {
        setOpenVsmartPrompt(open);
    };
    const handleOpenVsmartExtract = (open: boolean) => {
        setOpenVsmartExtract(open);
    };
    const handleOpenVsmartImage = (open: boolean) => {
        setOpenVsmartImage(open);
    };
    const handleOpenVsmartOrganizer = (open: boolean) => {
        setOpenVsmartOrganizer(open);
    };
    const handleOpenVsmartSorter = (open: boolean) => {
        setOpenVsmartSorter(open);
    };

    const { instituteLogo } = useInstituteLogoStore();
    const [assessmentData, setAssessmentData] = useState<AIAssessmentResponseInterface>({
        title: "",
        tags: [],
        difficulty: "",
        description: "",
        subjects: [],
        classes: [],
        questions: [],
    });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const form = useForm<z.infer<typeof generateCompleteAssessmentFormSchema>>({
        resolver: zodResolver(generateCompleteAssessmentFormSchema),
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

    const { getValues } = form;

    // UseFieldArray to manage questions array
    const { fields, move } = useFieldArray({
        control: form.control,
        name: "questions", // Name of the field array
    });

    const questions = form.getValues("questions");

    const handlePageClick = (pageIndex: number) => {
        setCurrentQuestionIndex(pageIndex);
        form.trigger();
    };

    const getQuestionsListMutation = useMutation({
        mutationFn: async ({ taskId }: { taskId: string }) => {
            return handleGetQuestionsInvidualTask(taskId);
        },
        onSuccess: (response) => {
            if (!response.questions) {
                toast.success("No data exists!");
                return;
            }
            setAssessmentData(response);
            const transformQuestionsData = transformQuestionsToGenerateAssessmentAI(
                response.questions,
            );
            form.reset({
                ...form.getValues(),
                title: response?.title,
                questions: transformQuestionsData,
            });
        },
        onError: (error: unknown) => {
            console.log(error);
        },
    });

    const handlViewQuestionsList = (taskId: string) => {
        getQuestionsListMutation.mutate({
            taskId,
        });
    };

    const handleGenerateClick = () => {
        switch (heading) {
            case "Vsmart Upload":
                setOpenVsmartUpload(true);
                break;
            case "Vsmart Audio":
                setOpenVsmartAudio(true);
                break;
            case "Vsmart Topics":
                setOpenVsmartPrompt(true);
                break;
            case "Vsmart Extract":
                setOpenVsmartExtract(true);
                break;
            case "Vsmart Image":
                setOpenVsmartImage(true);
                break;
            case "Vsmart Organizer":
                setOpenVsmartOrganizer(true);
                break;
            case "Vsmart Sorter":
                setOpenVsmartSorter(true);
                break;
            default:
                console.log("Vsmart Upload");
                break;
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger>
                    <MyButton
                        type="button"
                        scale="small"
                        buttonType="secondary"
                        className="border-none text-sm !text-blue-600 shadow-none hover:bg-transparent focus:bg-transparent focus:outline-none focus:ring-0 active:bg-transparent"
                        onClick={() => handlViewQuestionsList(task.id)}
                    >
                        {getQuestionsListMutation.status === "pending" ? (
                            <DashboardLoader size={18} />
                        ) : (
                            "View"
                        )}
                    </MyButton>
                </DialogTrigger>
                {assessmentData &&
                    assessmentData.questions &&
                    assessmentData.questions.length > 0 && (
                        <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col !gap-0 overflow-y-auto !rounded-none !p-0 [&>button]:hidden">
                            <FormProvider {...form}>
                                <form className="flex h-screen flex-col items-start">
                                    <div className="flex w-full items-center justify-between bg-primary-100 p-2">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={instituteLogo}
                                                alt="logo"
                                                className="size-12 rounded-full"
                                            />
                                            <span className="text-lg font-semibold text-neutral-500">
                                                {form.getValues("title")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <MyButton onClick={handleGenerateClick} type="button">
                                                Generate
                                            </MyButton>
                                            <MyButton
                                                type="button"
                                                scale="medium"
                                                buttonType="secondary"
                                                layoutVariant="default"
                                                className="mr-4 text-sm"
                                                onClick={() => {
                                                    setOpen(false);
                                                }}
                                            >
                                                Cancel
                                            </MyButton>
                                            <ExportQuestionPaperAI
                                                responseQuestionsData={assessmentData?.questions}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex w-full">
                                        <div className="mt-4 flex w-40 flex-col items-center justify-center gap-2">
                                            <div className="flex h-[325vh] w-40 flex-col items-start justify-between gap-4 overflow-x-hidden overflow-y-scroll p-2">
                                                <Sortable
                                                    value={fields}
                                                    onMove={({ activeIndex, overIndex }) =>
                                                        move(activeIndex, overIndex)
                                                    }
                                                >
                                                    <div className="flex origin-top-left scale-[0.26] flex-col gap-8 overflow-x-hidden">
                                                        {fields.map((field, index) => {
                                                            return (
                                                                <SortableItem
                                                                    key={field.id}
                                                                    value={field.id}
                                                                    asChild
                                                                >
                                                                    <div
                                                                        key={index}
                                                                        // onClick={() => handlePageClick(index)}
                                                                        className={`rounded-xl border-4 bg-primary-50 p-6 ${
                                                                            currentQuestionIndex ===
                                                                            index
                                                                                ? "border-primary-500 bg-none"
                                                                                : "bg-none"
                                                                        }`}
                                                                        onMouseEnter={() =>
                                                                            handlePageClick(index)
                                                                        }
                                                                    >
                                                                        <div className="flex flex-col">
                                                                            <div className="flex items-center justify-start gap-4">
                                                                                <h1 className="left-0 w-96 whitespace-nowrap text-4xl font-bold">
                                                                                    {index + 1}
                                                                                    &nbsp;
                                                                                    {getPPTViewTitle(
                                                                                        getValues(
                                                                                            `questions.${index}.questionType`,
                                                                                        ) as QuestionType,
                                                                                    )}
                                                                                </h1>
                                                                                <SortableDragHandle
                                                                                    variant="outline"
                                                                                    size="icon"
                                                                                    className="size-16"
                                                                                >
                                                                                    <DotsSixVertical className="!size-12" />
                                                                                </SortableDragHandle>
                                                                            </div>
                                                                            <PPTComponentFactory
                                                                                key={index}
                                                                                type={
                                                                                    getValues(
                                                                                        `questions.${index}.questionType`,
                                                                                    ) as QuestionType
                                                                                }
                                                                                props={{
                                                                                    form: form,
                                                                                    currentQuestionIndex:
                                                                                        index,
                                                                                    setCurrentQuestionIndex:
                                                                                        setCurrentQuestionIndex,
                                                                                    className:
                                                                                        "relative mt-4 rounded-xl border-4 border-primary-300 bg-white p-4",
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </SortableItem>
                                                            );
                                                        })}
                                                    </div>
                                                </Sortable>
                                            </div>
                                        </div>
                                        <Separator orientation="vertical" className="h-screen" />
                                        {questions && questions.length === 0 ? (
                                            <div className="flex h-screen w-screen items-center justify-center">
                                                <h1>No Question Exists.</h1>
                                            </div>
                                        ) : (
                                            <MainViewComponentFactory
                                                key={currentQuestionIndex}
                                                type={
                                                    getValues(
                                                        `questions.${currentQuestionIndex}.questionType`,
                                                    ) as QuestionType
                                                }
                                                props={{
                                                    form: form,
                                                    currentQuestionIndex: currentQuestionIndex,
                                                    setCurrentQuestionIndex:
                                                        setCurrentQuestionIndex,
                                                    className:
                                                        "dialog-height overflow-auto ml-6 flex w-full flex-col gap-6 pr-6 pt-4",
                                                }}
                                            />
                                        )}
                                    </div>
                                </form>
                            </FormProvider>
                        </DialogContent>
                    )}
            </Dialog>
            <VsmartUpload
                open={openVsmartUpload}
                handleOpen={handleOpenVsmartUpload}
                pollGenerateAssessment={pollGenerateAssessment}
            />
            <VsmartAudio
                open={openVsmartAudio}
                handleOpen={handleOpenVsmartAudio}
                pollGenerateQuestionsFromAudio={pollGenerateQuestionsFromAudio}
            />
            <VsmartPrompt
                open={openVsmartPrompt}
                handleOpen={handleOpenVsmartPrompt}
                pollGenerateQuestionsFromText={pollGenerateQuestionsFromText}
            />
            <VsmartExtract
                open={openVsmartExtract}
                handleOpen={handleOpenVsmartExtract}
                pollGenerateAssessment={pollGenerateAssessment}
            />
            <VsmartImage
                open={openVsmartImage}
                handleOpen={handleOpenVsmartImage}
                handleGenerateQuestionsFromImage={handleGenerateAssessmentQuestions}
            />
            <VsmartOrganizer
                open={openVsmartOrganizer}
                handleOpen={handleOpenVsmartOrganizer}
                pollGenerateAssessment={handleGenerateAssessmentQuestions}
            />
            <VsmartSorter
                open={openVsmartSorter}
                handleOpen={handleOpenVsmartSorter}
                handleGenerateQuestionsForAssessment={handleGenerateQuestionsForAssessment}
            />
        </>
    );
};

export default AIQuestionsPreview;
