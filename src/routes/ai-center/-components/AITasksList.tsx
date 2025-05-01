import { MyButton } from "@/components/design-system/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
    handleGetListIndividualTopics,
    handleQueryGetListIndividualTopics,
} from "../-services/ai-center-service";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { Badge } from "@/components/ui/badge";
import AIQuestionsPreview from "./AIQuestionsPreview";
import { AITaskIndividualListInterface } from "@/types/ai/generate-assessment/generate-complete-assessment";
import { getTaskTypeFromFeature } from "../-helpers/GetImagesForAITools";
import AIChatWithPDFPreview from "./AIChatWithPDFPreview";
import AIPlanLecturePreview from "./AIPlanLecturePreview";
import AIEvaluatePreview from "./AIEvaluatePreview";
import { ArrowCounterClockwise } from "phosphor-react";
import { convertToLocalDateTime } from "@/constants/helper";
import { QuestionsFromTextData } from "../ai-tools/vsmart-prompt/-components/GenerateQuestionsFromText";

const AITasksList = ({
    heading,
    enableDialog = false,
    pollGenerateAssessment,
    handleGenerateQuestionsForAssessment,
    pollGenerateQuestionsFromText,
    pollGenerateQuestionsFromAudio,
}: {
    heading: string;
    enableDialog?: boolean;
    pollGenerateAssessment?: (prompt?: string, taskId?: string) => void;
    handleGenerateQuestionsForAssessment?: (
        pdfId?: string,
        prompt?: string,
        taskId?: string,
    ) => void;
    pollGenerateQuestionsFromText?: (data: QuestionsFromTextData) => void;
    pollGenerateQuestionsFromAudio?: (data: QuestionsFromTextData, taskId: string) => void;
}) => {
    const [open, setOpen] = useState(enableDialog);

    const { data: allTasksData, isLoading } = useSuspenseQuery(
        handleQueryGetListIndividualTopics(getTaskTypeFromFeature(heading)),
    );

    const [allTasks, setAllTasks] = useState<AITaskIndividualListInterface[]>(allTasksData);

    const getAITasksIndividualListMutation = useMutation({
        mutationFn: async ({ taskType }: { taskType: string }) => {
            return handleGetListIndividualTopics(taskType);
        },
        onSuccess: (response) => {
            setAllTasks(response);
        },
        onError: (error: unknown) => {
            console.log(error);
        },
    });

    const handleRefreshList = (taskType: string) => {
        getAITasksIndividualListMutation.mutate({
            taskType,
        });
    };

    if (isLoading) return <DashboardLoader />;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                asChild
                onClick={(e) => {
                    e.stopPropagation(); // prevent card click
                }}
            >
                <MyButton
                    type="button"
                    scale="small"
                    buttonType="secondary"
                    className="text-normal border-none !text-blue-600 shadow-none hover:bg-transparent focus:bg-transparent focus:outline-none focus:ring-0 active:bg-transparent"
                >
                    View All Tasks
                </MyButton>
            </DialogTrigger>
            <DialogContent
                onClick={(e) => e.stopPropagation()}
                className="no-scrollbar !m-0 flex size-[90%] flex-col !gap-0 overflow-hidden !p-0"
            >
                {/* Fixed Header */}
                <div className="z-1 sticky top-0 flex items-center justify-start gap-4 rounded-t-lg bg-primary-50 p-4">
                    <h1 className="font-semibold text-primary-500">{heading}</h1>
                    <div
                        className="cursor-pointer rounded-lg border p-2 px-3"
                        onClick={() => handleRefreshList(getTaskTypeFromFeature(heading))}
                    >
                        <ArrowCounterClockwise size={18} className="font-thin text-neutral-600" />
                    </div>
                </div>

                {getAITasksIndividualListMutation.status === "pending" ? (
                    <DashboardLoader size={24} />
                ) : (
                    <div className="flex flex-col gap-4 overflow-y-auto p-4">
                        {allTasks.length === 0 ? (
                            <div className="flex h-[75vh] items-center justify-center">
                                <p>No task exists</p>
                            </div>
                        ) : (
                            allTasks?.map((task: AITaskIndividualListInterface) => {
                                return (
                                    <div
                                        key={task.id}
                                        className="flex flex-col gap-1 rounded-lg border bg-neutral-50 p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h1 className="text-neutral-600">{task.task_name}</h1>
                                            <h1 className="text-sm text-neutral-600">
                                                {convertToLocalDateTime(task.updated_at)}
                                            </h1>
                                        </div>
                                        <div className="flex items-center justify-start">
                                            <Badge
                                                className={`border border-gray-200 text-neutral-600 shadow-none ${
                                                    task.status === "FAILED"
                                                        ? "bg-red-100"
                                                        : task.status === "COMPLETED"
                                                          ? "bg-green-100"
                                                          : "bg-blue-100"
                                                }`}
                                            >
                                                {task.status}
                                            </Badge>
                                            {task.status !== "PROGRESS" &&
                                                heading === "Vsmart Feedback" && (
                                                    <AIEvaluatePreview task={task} />
                                                )}

                                            {task.status !== "PROGRESS" &&
                                                heading === "Vsmart Lecturer" && (
                                                    <AIPlanLecturePreview task={task} />
                                                )}

                                            {task.status !== "PROGRESS" &&
                                                heading === "Vsmart Chat" && (
                                                    <AIChatWithPDFPreview task={task} />
                                                )}

                                            {heading !== "Vsmart Lecturer" &&
                                                heading !== "Vsmart Chat" &&
                                                heading !== "Vsmart Feedback" &&
                                                (task.status === "COMPLETED" ||
                                                    task.status === "FAILED") && (
                                                    <AIQuestionsPreview
                                                        task={task}
                                                        pollGenerateAssessment={
                                                            pollGenerateAssessment
                                                        }
                                                        handleGenerateQuestionsForAssessment={
                                                            handleGenerateQuestionsForAssessment
                                                        }
                                                        pollGenerateQuestionsFromText={
                                                            pollGenerateQuestionsFromText
                                                        }
                                                        pollGenerateQuestionsFromAudio={
                                                            pollGenerateQuestionsFromAudio
                                                        }
                                                        heading={heading}
                                                    />
                                                )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AITasksList;
