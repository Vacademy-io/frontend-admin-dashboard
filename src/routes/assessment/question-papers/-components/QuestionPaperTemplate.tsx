import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DotsSixVertical, Plus } from "phosphor-react";
import { useEffect, useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SSDCLogo } from "@/svgs";
import { Sortable, SortableDragHandle, SortableItem } from "@/components/ui/sortable";
import { useQuestionStore } from "../-global-states/question-index";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PPTComponentFactory } from "./QuestionPaperTemplatesTypes/PPTComponentFactory";
import { MainViewComponentFactory } from "./QuestionPaperTemplatesTypes/MainViewComponentFactory";
import { QuestionPaperTemplateProps } from "@/types/question-paper-template";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuestionPaperById, updateQuestionPaper } from "../-utils/question-paper-services";
import {
    getIdByLevelName,
    getIdBySubjectName,
    transformResponseDataToMyQuestionsSchema,
} from "../-utils/helper";
import {
    MyQuestion,
    MyQuestionPaperFormEditInterface,
    MyQuestionPaperFormInterface,
} from "../../../../types/question-paper-form";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { toast } from "sonner";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { QuestionPaperEditDialog } from "./QuestionPaperEditDialogue";

export function QuestionPaperTemplate({
    form,
    questionPaperId,
    isViewMode,
    refetchData,
    isManualCreated,
}: QuestionPaperTemplateProps) {
    const queryClient = useQueryClient();
    const { instituteDetails } = useInstituteDetailsStore();
    const { control, getValues, setValue, formState, watch } = form;
    const questions = getValues("questions");
    const title = getValues("title") || "";
    const yearClass = getValues("yearClass") || "";
    const subject = getValues("subject") || "";
    const { currentQuestionIndex, setCurrentQuestionIndex } = useQuestionStore();
    const [isQuestionDataLoading, setIsQuestionDataLoading] = useState(false);
    const [previousQuestionPaperData, setPreviousQuestionPaperData] = useState(
        {} as MyQuestionPaperFormEditInterface,
    );

    watch(`questions.${currentQuestionIndex}`);
    watch(`questions.${currentQuestionIndex}`);
    watch(`questions.${currentQuestionIndex}`);
    watch(`questions.${currentQuestionIndex}`);
    watch(`questions.${currentQuestionIndex}.questionType`);

    // UseFieldArray to manage questions array
    const { fields, append, move } = useFieldArray({
        control: form.control,
        name: "questions", // Name of the field array
    });

    // Function to handle adding a new question
    const handleAddNewQuestion = () => {
        append({
            questionId: String(questions.length + 1),
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
        });
        setCurrentQuestionIndex(0);
    };

    // Function to handle page navigation by question number
    const handlePageClick = (pageIndex: number) => {
        setCurrentQuestionIndex(pageIndex);
    };

    const handleUpdateQuestionPaper = useMutation({
        mutationFn: ({
            data,
            previousQuestionPaperData,
        }: {
            data: MyQuestionPaperFormInterface;
            previousQuestionPaperData: MyQuestionPaperFormEditInterface;
        }) => updateQuestionPaper(data, previousQuestionPaperData),
        onSuccess: () => {
            setCurrentQuestionIndex(0);
            refetchData();
            toast.success("Question Paper updated successfully", {
                className: "success-toast",
                duration: 2000,
            });
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    const handleSaveClick = (values: MyQuestionPaperFormInterface) => {
        const changedValues = {
            ...values,
            ...(values.yearClass !== "N/A" && {
                yearClass: getIdByLevelName(instituteDetails?.levels || [], yearClass),
            }),
            ...(values.subject !== "N/A" && {
                subject: getIdBySubjectName(instituteDetails?.subjects || [], subject),
            }),
        };
        handleUpdateQuestionPaper.mutate({ data: changedValues, previousQuestionPaperData });
    };

    const handleMutationViewQuestionPaper = useMutation({
        mutationFn: ({ questionPaperId }: { questionPaperId: string | undefined }) =>
            getQuestionPaperById(questionPaperId),
        onMutate: () => {
            setIsQuestionDataLoading(true);
        },
        onSettled: () => {
            setIsQuestionDataLoading(false);
        },
        onSuccess: (data) => {
            const transformQuestionsData: MyQuestion[] = transformResponseDataToMyQuestionsSchema(
                data.question_dtolist,
            );
            setPreviousQuestionPaperData({
                questionPaperId: questionPaperId,
                title: title,
                ...(data.yearClass !== "N/A" && {
                    level_id: getIdByLevelName(instituteDetails?.levels || [], yearClass),
                }),
                ...(data.subject !== "N/A" && {
                    subject_id: getIdBySubjectName(instituteDetails?.subjects || [], subject),
                }),
                questions: transformQuestionsData,
            });
            setValue("questions", transformQuestionsData);
            queryClient.invalidateQueries({ queryKey: ["GET_QUESTION_PAPER_FILTERED_DATA"] });
        },
        onError: (error: unknown) => {
            setIsQuestionDataLoading(false);
            throw error;
        },
    });

    const handleViewQuestionPaper = () => {
        handleMutationViewQuestionPaper.mutate({ questionPaperId });
    };

    useEffect(() => {
        setValue(
            `questions.${currentQuestionIndex}`,
            getValues(`questions.${currentQuestionIndex}`),
        );
    }, [currentQuestionIndex]);

    return (
        <Dialog>
            <DialogTrigger>
                {isViewMode ? (
                    <Button
                        type="button"
                        variant="outline"
                        className="m-0 border-none pl-2 font-normal shadow-none"
                        onClick={handleViewQuestionPaper}
                    >
                        View Question Paper
                    </Button>
                ) : (
                    <Button type="button" variant="outline" className="w-52 border-[1px]">
                        {isManualCreated ? (
                            <p className="flex items-center gap-1">
                                Create <Plus className="!size-4" />
                            </p>
                        ) : (
                            "Preview"
                        )}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="no-scrollbar !m-0 h-full !w-full !max-w-full !gap-0 overflow-y-auto !rounded-none !p-0 [&>button]:hidden">
                {isQuestionDataLoading ? (
                    <DashboardLoader />
                ) : (
                    <div>
                        <div className="flex items-center justify-between bg-primary-100 p-2">
                            <div className="flex items-start gap-2">
                                <SSDCLogo />
                                <FormField
                                    control={control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    className="rounded-none border-none p-0 !text-[1.2rem] shadow-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                    placeholder="Untitled"
                                                    disabled
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <QuestionPaperEditDialog form={form} />
                            </div>
                            <div className="flex items-center gap-4">
                                <DialogClose>
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        className="w-44 bg-transparent shadow-none hover:bg-transparent"
                                        onClick={
                                            isViewMode
                                                ? () =>
                                                      handleSaveClick(
                                                          form.getValues() as MyQuestionPaperFormInterface,
                                                      )
                                                : undefined
                                        }
                                    >
                                        Save
                                    </Button>
                                </DialogClose>
                                <DialogClose>
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        className="w-44 bg-transparent shadow-none hover:bg-transparent"
                                    >
                                        Exit
                                    </Button>
                                </DialogClose>
                            </div>
                        </div>
                        <div className="flex h-screen items-start">
                            <div className="mt-4 flex w-40 flex-col items-center justify-center gap-2">
                                <Button
                                    type="button"
                                    className="-ml-[0.6rem] max-w-sm bg-primary-500 text-xs text-white shadow-none"
                                    onClick={handleAddNewQuestion}
                                >
                                    Add Question
                                </Button>
                                <div className="flex h-[325vh] w-40 flex-col items-start justify-between gap-4 overflow-x-hidden overflow-y-scroll p-2">
                                    <Sortable
                                        value={fields}
                                        onMove={({ activeIndex, overIndex }) =>
                                            move(activeIndex, overIndex)
                                        }
                                    >
                                        <div className="flex origin-top-left scale-[0.26] flex-col gap-8 overflow-x-hidden">
                                            {fields.map((field, index) => {
                                                // Check if the current question has an error
                                                const hasError =
                                                    formState.errors?.questions?.[index];
                                                return (
                                                    <SortableItem
                                                        key={field.id}
                                                        value={field.id}
                                                        asChild
                                                    >
                                                        <div
                                                            key={index}
                                                            onClick={() => handlePageClick(index)}
                                                            className={`rounded-xl border-4 bg-primary-50 p-6 ${
                                                                currentQuestionIndex === index
                                                                    ? "border-primary-500 bg-none"
                                                                    : "bg-none"
                                                            }`}
                                                            onMouseEnter={() =>
                                                                handlePageClick(index)
                                                            }
                                                        >
                                                            <TooltipProvider>
                                                                <Tooltip
                                                                    open={hasError ? true : false}
                                                                >
                                                                    <TooltipTrigger>
                                                                        <div className="flex flex-col">
                                                                            <div className="flex items-center justify-start gap-4">
                                                                                <h1 className="left-0 w-96 whitespace-nowrap text-4xl font-bold">
                                                                                    {index + 1}
                                                                                    &nbsp;
                                                                                    {getValues(
                                                                                        `questions.${index}.questionType`,
                                                                                    ) === "MCQS"
                                                                                        ? "MCQ (Single Correct)"
                                                                                        : getValues(
                                                                                                `questions.${index}.questionType`,
                                                                                            ) ===
                                                                                            "MCQM"
                                                                                          ? "MCQ (Multiple Correct)"
                                                                                          : "MCQ (Multiple Correct)"}
                                                                                </h1>
                                                                                <SortableDragHandle
                                                                                    variant="outline"
                                                                                    size="icon"
                                                                                    className="size-16"
                                                                                >
                                                                                    <DotsSixVertical className="text-bold !size-12" />
                                                                                </SortableDragHandle>
                                                                            </div>
                                                                            <PPTComponentFactory
                                                                                type={
                                                                                    getValues(
                                                                                        `questions.${index}.questionType`,
                                                                                    ) as
                                                                                        | "MCQS"
                                                                                        | "MCQM"
                                                                                }
                                                                                props={{
                                                                                    form: form,
                                                                                    currentQuestionIndex:
                                                                                        index,
                                                                                    className:
                                                                                        "relative mt-4 rounded-xl border-4 border-primary-300 bg-white p-4",
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    {hasError && (
                                                                        <TooltipContent
                                                                            className="ml-3 border-2 border-danger-400 bg-primary-50"
                                                                            side="right"
                                                                        >
                                                                            <p>
                                                                                Question isn&apos;t
                                                                                complete
                                                                            </p>
                                                                        </TooltipContent>
                                                                    )}
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </SortableItem>
                                                );
                                            })}
                                        </div>
                                    </Sortable>
                                </div>
                            </div>

                            <Separator orientation="vertical" className="min-h-screen" />
                            <MainViewComponentFactory
                                type={
                                    getValues(`questions.${currentQuestionIndex}.questionType`) as
                                        | "MCQS"
                                        | "MCQM"
                                }
                                props={{
                                    form: form,
                                    className: "ml-6 flex w-full flex-col gap-6 pr-6 pt-4",
                                    currentQuestionIndex: currentQuestionIndex,
                                }}
                            />
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
