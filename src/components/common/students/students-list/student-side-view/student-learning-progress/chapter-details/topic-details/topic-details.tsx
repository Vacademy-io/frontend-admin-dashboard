import { useState } from "react";
import { ChapterDetailsType } from "../../../student-view-dummy-data/learning-progress";
import { Topic } from "./topic";
import { StudyMediumToggleMenu } from "./study-medium-toggle-menu";

// First, create interfaces/types for the components
interface StudyMediumConfig {
    render: (topicsData: ChapterDetailsType) => JSX.Element[];
    getLength: (topicsData: ChapterDetailsType) => number;
}

// Create a factory class to handle different study mediums
class StudyMediumFactory {
    private static mediumConfig: Record<string, StudyMediumConfig> = {
        "E-Book": {
            render: (topicsData: ChapterDetailsType) =>
                topicsData.e_book?.map((topicData, key) => (
                    <Topic topicData={topicData} key={key} />
                )) || [],
            getLength: (topicsData: ChapterDetailsType) => topicsData.e_book?.length || 0,
        },
        Videos: {
            render: (topicsData: ChapterDetailsType) =>
                topicsData.videos?.map((topicData, key) => (
                    <Topic topicData={topicData} key={key} />
                )) || [],
            getLength: (topicsData: ChapterDetailsType) => topicsData.videos?.length || 0,
        },
    };

    static getConfig(medium: string): StudyMediumConfig {
        const config = this.mediumConfig[medium];
        if (!config) {
            // Provide a default configuration or throw an error
            throw new Error(`Invalid study medium: ${medium}`);
        }
        return config;
    }

    static getAvailableMediums(topicsData: ChapterDetailsType): string[] {
        return Object.keys(this.mediumConfig).filter((medium) => {
            const config = this.mediumConfig[medium];
            return config && config.getLength(topicsData) > 0;
        });
    }
}

// Refactored TopicDetails component
export const TopicDetails = ({ topicsData }: { topicsData: ChapterDetailsType }) => {
    const [studyMedium, setStudyMedium] = useState("E-Book");
    const availableMediums = StudyMediumFactory.getAvailableMediums(topicsData);
    const currentConfig = StudyMediumFactory.getConfig(studyMedium);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex">
                {availableMediums.map((medium) => (
                    <div key={medium} onClick={() => setStudyMedium(medium)}>
                        <StudyMediumToggleMenu
                            menuOption={studyMedium}
                            len={StudyMediumFactory.getConfig(medium).getLength(topicsData)}
                            name={medium}
                        />
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-4">{currentConfig.render(topicsData)}</div>
        </div>
    );
};
