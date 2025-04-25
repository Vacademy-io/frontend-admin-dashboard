import { DashboardLoader } from "@/components/core/dashboard-loader";
import { MyButton } from "@/components/design-system/button";
import { AITaskIndividualListInterface } from "@/types/ai/generate-assessment/generate-complete-assessment";
import { useMutation } from "@tanstack/react-query";
import { handleGetLecturePlan } from "../-services/ai-center-service";
import EvaluateReportPreview from "../ai-tools/vsmart-feedback/-components/EvaluateReportPreview";

const AIEvaluatePreview = ({ task }: { task: AITaskIndividualListInterface }) => {
    const getChatListMutation = useMutation({
        mutationFn: async ({ parentId }: { parentId: string }) => {
            return handleGetLecturePlan(parentId); // need to change it
        },
        onSuccess: (response) => {
            console.log(response);
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
                onClick={() => handlViewChatList(task.id)}
            >
                {getChatListMutation.status === "pending" ? <DashboardLoader size={18} /> : "View"}
            </MyButton>
            {getChatListMutation.status === "success" && (
                <EvaluateReportPreview openDialog={true} />
            )}
        </>
    );
};

export default AIEvaluatePreview;
