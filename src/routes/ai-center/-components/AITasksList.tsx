import { MyButton } from "@/components/design-system/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { handleQueryGetListIndividualTopics } from "../-services/ai-center-service";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { Badge } from "@/components/ui/badge";
import AIQuestionsPreview from "./AIQuestionsPreview";
import { AITaskIndividualListInterface } from "@/types/ai/generate-assessment/generate-complete-assessment";
import { getTaskTypeFromFeature } from "../-helpers/GetImagesForAITools";
import AIChatWithPDFPreview from "./AIChatWithPDFPreview";
import AIPlanLecturePreview from "./AIPlanLecturePreview";
import AIEvaluatePreview from "./AIEvaluatePreview";

const AITasksList = ({
    heading,
    enableDialog = false,
}: {
    heading: string;
    enableDialog?: boolean;
}) => {
    const [open, setOpen] = useState(enableDialog);

    const { data: allTasks, isLoading } = useSuspenseQuery(
        handleQueryGetListIndividualTopics(getTaskTypeFromFeature(heading)),
    );

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
                className="no-scrollbar !m-0 flex size-[90%] flex-col !gap-0 overflow-y-auto !p-0"
            >
                <h1 className="rounded-t-lg bg-primary-50 p-4 font-semibold text-primary-500">
                    {heading}
                </h1>
                <div className="flex flex-col gap-4 p-4">
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
                                    <h1 className="text-neutral-600">{task.task_name}</h1>
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
                                        {heading === "Vsmart Feedback" && (
                                            <AIEvaluatePreview task={task} />
                                        )}

                                        {heading === "Vsmart Lecturer" && (
                                            <AIPlanLecturePreview task={task} />
                                        )}

                                        {heading === "Vsmart Chat" && (
                                            <AIChatWithPDFPreview task={task} />
                                        )}

                                        {heading !== "Vsmart Lecturer" &&
                                            heading !== "Vsmart Chat" &&
                                            heading !== "Vsmart Feedback" &&
                                            (task.status === "COMPLETED" ||
                                                task.status === "FAILED") && (
                                                <AIQuestionsPreview task={task} />
                                            )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AITasksList;
