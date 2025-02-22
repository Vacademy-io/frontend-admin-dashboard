// components/topic.tsx
import { MyButton } from "@/components/design-system/button";
import { TopicActivityDetails } from "../../../student-view-dummy-data/learning-progress";
import { StatusIcon } from "../../status-icon";
import { useActivityStatsStore } from "@/stores/study-library/activity-stats-store";

interface TopicProps {
    topicData: TopicActivityDetails;
}

export const Topic = ({ topicData }: TopicProps) => {
    const openDialog = useActivityStatsStore((state) => state.openDialog);

    const handleOpenDialog = () => {
        if (topicData.activity_log) {
            openDialog(topicData.id);
        }
    };

    return (
        <div className="flex flex-col gap-2 text-body">
            <div className="flex gap-2">
                <StatusIcon status={topicData.status} />
                <div>{topicData.topic}</div>
            </div>
            <div className="flex items-center justify-between">
                <div>Last viewed on: {topicData.last_viewed}</div>
                {topicData.activity_log && topicData.activity_log.length > 0 && (
                    <MyButton
                        buttonType="secondary"
                        layoutVariant="default"
                        scale="small"
                        onClick={handleOpenDialog}
                    >
                        Activity Log
                    </MyButton>
                )}
            </div>
        </div>
    );
};
