import { ChapterAccordian } from "./chapter-accordian";
import { LearningProgressSubjectType } from "../../student-view-dummy-data/learning-progress";
import { ProgressBar } from "@/components/design-system/progress-bar";

export const SubjectProgress = ({ subjectData }: { subjectData?: LearningProgressSubjectType }) => {
    return (
        <div className="flex flex-col gap-10">
            <ProgressBar progress={subjectData?.progress || 0} />
            {subjectData?.chapters && (
                <div className="flex flex-col gap-6">
                    {subjectData.chapters.map((chapter, key) => (
                        <ChapterAccordian ChapterDetails={chapter} key={key} />
                    ))}
                </div>
            )}
        </div>
    );
};
