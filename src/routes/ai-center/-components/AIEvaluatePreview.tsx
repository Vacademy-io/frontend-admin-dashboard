import { DashboardLoader } from "@/components/core/dashboard-loader";
import { MyButton } from "@/components/design-system/button";
import {
    AILectureFeedbackInterface,
    AITaskIndividualListInterface,
} from "@/types/ai/generate-assessment/generate-complete-assessment";
import { useMutation } from "@tanstack/react-query";
import { handleGetEvaluateLecture } from "../-services/ai-center-service";
import EvaluateReportPreview from "../ai-tools/vsmart-feedback/-components/EvaluateReportPreview";
import { useState } from "react";

const AIEvaluatePreview = ({ task }: { task: AITaskIndividualListInterface }) => {
    const [evaluateLecture, setEvaluateLecture] = useState<AILectureFeedbackInterface>({
        title: "",
        report_title: "",
        lecture_info: {
            lecture_title: "",
            duration: "",
            evaluation_date: "",
        },
        total_score: "0",
        criteria: [],
        summary: [],
    });
    const getChatListMutation = useMutation({
        mutationFn: async ({ parentId }: { parentId: string }) => {
            return handleGetEvaluateLecture(parentId); // need to change it
        },
        onSuccess: (response) => {
            setEvaluateLecture(response);
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
                <EvaluateReportPreview openDialog={true} evaluateLectureData={evaluateLecture} />
            )}
        </>
    );
};

export default AIEvaluatePreview;
