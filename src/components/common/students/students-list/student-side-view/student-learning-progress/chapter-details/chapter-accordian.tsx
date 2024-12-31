import { CaretUp, CaretDown } from "@phosphor-icons/react";
import { useState } from "react";
import { TopicDetails } from "./topic-details/topic-details";
import { StatusIcon } from "../status-icon";
import { ChapterType } from "../../student-view-dummy-data/learning-progress";

export const ChapterAccordian = ({ ChapterDetails }: { ChapterDetails: ChapterType }) => {
    const [expand, setExpand] = useState(false);

    return (
        <div className="flex">
            <div className="flex w-full cursor-pointer flex-col gap-4 rounded-lg border border-primary-300 p-4">
                <div
                    className="flex w-full items-center justify-between"
                    onClick={() => {
                        setExpand(!expand);
                    }}
                >
                    <div className="flex items-center gap-2">
                        <StatusIcon status={ChapterDetails.status} />
                        <div>
                            Chapter {ChapterDetails.number}: {ChapterDetails.name}
                        </div>
                    </div>
                    <div>{expand ? <CaretUp /> : <CaretDown />}</div>
                </div>
                {expand && ChapterDetails.chapter_details && (
                    <TopicDetails topicsData={ChapterDetails.chapter_details} />
                )}
            </div>
        </div>
    );
};
