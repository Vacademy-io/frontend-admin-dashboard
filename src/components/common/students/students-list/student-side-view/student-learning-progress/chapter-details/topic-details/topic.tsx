import { MyButton } from "@/components/design-system/button";
import { TopicActivityDetails } from "../../../student-view-dummy-data";
import { StatusIcon } from "../../status-icon";

export const Topic = ({
    studyMedium,
    topicData,
}: {
    studyMedium: string;
    topicData: TopicActivityDetails;
}) => {
    return (
        <div className="flex flex-col gap-2 text-body">
            <div className="flex gap-2">
                <StatusIcon status={topicData.status} />
                <div>{topicData.topic}</div>
            </div>
            <div className="flex items-center justify-between">
                <div>Last viewed on: {topicData.last_viewed}</div>
                <MyButton buttonType="secondary" layoutVariant="default" scale="small">
                    Activity Log
                </MyButton>
            </div>
            {studyMedium == "E-Book" && <></>}
        </div>
    );
};
