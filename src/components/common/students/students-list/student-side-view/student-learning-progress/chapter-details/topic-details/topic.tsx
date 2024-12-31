// components/topic.tsx
import { MyButton } from "@/components/design-system/button";
import { TopicActivityDetails } from "../../../student-view-dummy-data/learning-progress";
import { StatusIcon } from "../../status-icon";
import { ActivityLogDialog } from "./activity-log-dialog";
import { useState } from "react";

export const Topic = ({
    studyMedium,
    topicData,
}: {
    studyMedium: string;
    topicData: TopicActivityDetails;
}) => {
    const [showActivityLog, setShowActivityLog] = useState(false);

    return (
        <>
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
                            onClick={() => setShowActivityLog(true)}
                        >
                            Activity Log
                        </MyButton>
                    )}
                </div>
            </div>

            {topicData.activity_log && topicData.activity_log.length > 0 && (
                <ActivityLogDialog
                    isOpen={showActivityLog}
                    onClose={() => setShowActivityLog(false)}
                    activityData={topicData.activity_log}
                    topicName={topicData.topic}
                    studyType={studyMedium}
                />
            )}
        </>
    );
};
