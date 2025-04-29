import { DashboardLoader } from "@/components/core/dashboard-loader";
import { MyButton } from "@/components/design-system/button";
import { AITaskIndividualListInterface } from "@/types/ai/generate-assessment/generate-complete-assessment";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { handleGetChatWithPDFInvidualTask } from "../-services/ai-center-service";
import PlayWithPDF, {
    QuestionWithAnswerChatInterface,
} from "../ai-tools/vsmart-chat/-components/PlayWithPDF";

const AIChatWithPDFPreview = ({ task }: { task: AITaskIndividualListInterface }) => {
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
    return (
        <>
            <MyButton
                type="button"
                scale="small"
                buttonType="secondary"
                className="border-none text-sm !text-blue-600 shadow-none hover:bg-transparent focus:bg-transparent focus:outline-none focus:ring-0 active:bg-transparent"
                onClick={() => handlViewChatList(task.parent_id)}
            >
                {getChatListMutation.status === "pending" ? <DashboardLoader size={18} /> : "View"}
            </MyButton>
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
