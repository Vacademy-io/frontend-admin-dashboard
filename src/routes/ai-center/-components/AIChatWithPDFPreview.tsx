import { DashboardLoader } from "@/components/core/dashboard-loader";
import { MyButton } from "@/components/design-system/button";
import { AITaskIndividualListInterface } from "@/types/ai/generate-assessment/generate-complete-assessment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
    handleGetChatWithPDFInvidualTask,
    handleRetryAITask,
} from "../-services/ai-center-service";
import PlayWithPDF, {
    QuestionWithAnswerChatInterface,
} from "../ai-tools/vsmart-chat/-components/PlayWithPDF";
import { toast } from "sonner";

const AIChatWithPDFPreview = ({ task }: { task: AITaskIndividualListInterface }) => {
    const queryClient = useQueryClient();
    const [chatResponse, setChatResponse] = useState<QuestionWithAnswerChatInterface[]>([]);
    const getChatListMutation = useMutation({
        mutationFn: async ({ parentId }: { parentId: string }) => {
            return handleGetChatWithPDFInvidualTask(parentId);
        },
        onSuccess: (response) => {
            setChatResponse(response);
        },
        onError: (error: unknown) => {
            console.log(error);
        },
    });

    const handlViewChatList = (parentId: string) => {
        getChatListMutation.mutate({
            parentId,
        });
    };

    const getRetryMutation = useMutation({
        mutationFn: async ({ taskId }: { taskId: string }) => {
            return handleRetryAITask(taskId);
        },
        onSuccess: (response) => {
            if (!response) {
                toast.success("No data exists!");
                return;
            }
            setChatResponse(response);
            queryClient.invalidateQueries({ queryKey: ["GET_INDIVIDUAL_AI_LIST_DATA"] });
        },
        onError: (error: unknown) => {
            console.log(error);
        },
    });

    const handleRetryTask = (taskId: string) => {
        getRetryMutation.mutate({
            taskId,
        });
    };
    return (
        <>
            {task.status === "FAILED" ? (
                <MyButton
                    type="button"
                    scale="small"
                    buttonType="secondary"
                    className="border-none text-sm !text-blue-600 shadow-none hover:bg-transparent focus:bg-transparent focus:outline-none focus:ring-0 active:bg-transparent"
                    onClick={() => handleRetryTask(task.id)}
                >
                    {getRetryMutation.status === "pending" ? (
                        <DashboardLoader size={18} />
                    ) : (
                        "Retry"
                    )}
                </MyButton>
            ) : (
                <MyButton
                    type="button"
                    scale="small"
                    buttonType="secondary"
                    className="border-none text-sm !text-blue-600 shadow-none hover:bg-transparent focus:bg-transparent focus:outline-none focus:ring-0 active:bg-transparent"
                    onClick={() => handlViewChatList(task.id)}
                >
                    {getChatListMutation.status === "pending" ? (
                        <DashboardLoader size={18} />
                    ) : (
                        "View"
                    )}
                </MyButton>
            )}

            {getChatListMutation.status === "success" && (
                <PlayWithPDF
                    isListMode={true}
                    chatResponse={chatResponse}
                    input_id={task.input_id}
                    parent_id={task.parent_id}
                    task_name={task.task_name}
                />
            )}
        </>
    );
};

export default AIChatWithPDFPreview;
