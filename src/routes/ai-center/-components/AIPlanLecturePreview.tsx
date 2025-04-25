import { DashboardLoader } from "@/components/core/dashboard-loader";
import { MyButton } from "@/components/design-system/button";
import {
    AITaskIndividualListInterface,
    PlanLectureDataInterface,
} from "@/types/ai/generate-assessment/generate-complete-assessment";
import { useMutation } from "@tanstack/react-query";
import { handleGetLecturePlan } from "../-services/ai-center-service";

import PlanLecturePreview from "../ai-tools/vsmart-lecture/-components/PlanLecturePreview";
import { useState } from "react";

const AIPlanLecturePreview = ({ task }: { task: AITaskIndividualListInterface }) => {
    const [planLectureData, setPlanLectureData] = useState<PlanLectureDataInterface>({
        heading: "",
        mode: "",
        duration: "",
        language: "",
        level: "",
        time_wise_split: [],
        assignment: {
            topic_covered: [],
            tasks: [],
        },
        summary: [],
    });
    const getChatListMutation = useMutation({
        mutationFn: async ({ parentId }: { parentId: string }) => {
            return handleGetLecturePlan(parentId);
        },
        onSuccess: (response) => {
            setPlanLectureData(response);
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
                <PlanLecturePreview openDialog={true} planLectureData={planLectureData} />
            )}
        </>
    );
};

export default AIPlanLecturePreview;
