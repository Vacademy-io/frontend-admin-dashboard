import { Progress } from "@/components/ui/progress";
import { ChapterAccordian } from "./chapter-accordian";
import { LearningProgressSubjectType } from "../../student-view-dummy-data/learning-progress";

interface ProgressBarProps {
    progress: number;
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
    return (
        <div className="flex flex-col gap-1">
            <Progress value={progress} className="w-full bg-white [&>div]:bg-primary-500" />
            <div className="w-full text-center text-caption">
                {progress}% of released content completed
            </div>
        </div>
    );
};

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
