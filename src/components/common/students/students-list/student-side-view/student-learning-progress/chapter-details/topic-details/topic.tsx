// components/topic.tsx
import { MyButton } from "@/components/design-system/button";
import { StatusIcon } from "../../status-icon";
import { useActivityStatsStore } from "@/stores/study-library/activity-stats-store";
import { SlideWithStatusType } from "@/types/students/student-slides-progress-type";
import { useEffect, useState } from "react";
import { ActivityLogDialog } from "./activity-log-dialog";
import { useStudentSidebar } from "@/context/selected-student-sidebar-context";

interface TopicProps {
    slideData: SlideWithStatusType;
}

export const Topic = ({ slideData }: TopicProps) => {
    const store = useActivityStatsStore.getState();
    const [chapterCompletionStatus, setChapterCompletionStatus] = useState<"done" | "pending">(
        "pending",
    );
    const { selectedStudent } = useStudentSidebar();

    const handleOpenDialog = () => {
        store.openDialog(selectedStudent?.user_id || "");
    };

    useEffect(() => {
        const status: "done" | "pending" =
            slideData.video_url == null
                ? slideData.percentage_document_watched &&
                  slideData.percentage_document_watched >= "90"
                    ? "done"
                    : "pending"
                : slideData.percentage_video_watched && slideData.percentage_video_watched >= "90"
                  ? "done"
                  : "pending";
        setChapterCompletionStatus(status);
    }, [slideData]);

    return (
        <div className="flex flex-col gap-2 text-body">
            <div className="flex gap-2">
                <StatusIcon status={chapterCompletionStatus} />
                <div>{slideData.slide_title}</div>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    Last viewed on:{" "}
                    {slideData.video_url == null
                        ? slideData.document_last_updated
                        : slideData.video_last_updated}
                </div>
                <MyButton
                    buttonType="secondary"
                    layoutVariant="default"
                    scale="small"
                    onClick={handleOpenDialog}
                >
                    Activity Log
                </MyButton>
                <ActivityLogDialog selectedUser={selectedStudent} slideData={slideData} />
            </div>
        </div>
    );
};
