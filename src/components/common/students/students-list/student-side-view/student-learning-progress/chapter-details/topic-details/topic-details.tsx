import { useState } from "react";
import { ChapterDetailsType } from "../../../student-view-dummy-data";
import { Topic } from "./topic";

const StudyMediumToggleMenu = ({
    menuOption,
    len,
    name,
}: {
    menuOption: string;
    len: number;
    name: string;
}) => {
    return (
        <div
            className={`flex h-10 w-[200px] items-center justify-center gap-[10px] rounded-lg px-4 py-[9px] ${
                menuOption === name ? "bg-white text-primary-500" : "bg-none text-neutral-600"
            }`}
        >
            <div>{name}</div>
            <div
                className={`flex size-6 items-center justify-center rounded-full bg-primary-500 text-caption text-neutral-50 ${
                    !len ? "hidden" : "visible"
                }`}
            >
                {len}
            </div>
        </div>
    );
};

export const TopicDetails = ({ topicsData }: { topicsData: ChapterDetailsType }) => {
    const [studyMedium, setStudyMedium] = useState("E-Book");

    return (
        <div className="flex flex-col gap-4">
            <div className="flex">
                {topicsData.e_book && (
                    <div
                        onClick={() => {
                            setStudyMedium("E-Book");
                        }}
                    >
                        <StudyMediumToggleMenu
                            menuOption={studyMedium}
                            len={topicsData.e_book.length}
                            name="E-Book"
                        />
                    </div>
                )}
                {topicsData.videos && (
                    <div
                        onClick={() => {
                            setStudyMedium("Videos");
                        }}
                    >
                        <StudyMediumToggleMenu
                            menuOption={studyMedium}
                            len={topicsData.videos.length}
                            name="Videos"
                        />
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-4">
                {studyMedium == "E-Book" &&
                    topicsData.e_book?.map((topicData, key) => (
                        <Topic studyMedium={studyMedium} topicData={topicData} key={key} />
                    ))}
                {studyMedium == "Videos" &&
                    topicsData.videos?.map((topicData, key) => (
                        <Topic studyMedium={studyMedium} topicData={topicData} key={key} />
                    ))}
            </div>
        </div>
    );
};
