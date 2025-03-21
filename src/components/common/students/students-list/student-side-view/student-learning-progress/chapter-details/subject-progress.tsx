import { ChapterAccordian } from "./chapter-accordian";
import { ProgressBar } from "@/components/design-system/progress-bar";
import { ModulesWithChaptersProgressType } from "@/types/students/student-subjects-details-types";

const getProgressPercent = (moduleDetails: ModulesWithChaptersProgressType) => {
    if (!moduleDetails.chapters || moduleDetails.chapters.length === 0) {
        return 0;
    }
    const totalPercentage = moduleDetails.chapters.reduce(
        (sum, chapter) => sum + chapter.percentage_completed,
        0,
    );
    return totalPercentage / moduleDetails.chapters.length;
};

export const SubjectProgress = ({
    moduleDetails,
}: {
    moduleDetails?: ModulesWithChaptersProgressType | null;
}) => {
    return (
        <>
            {moduleDetails?.chapters ? (
                <div className="flex flex-col gap-10">
                    <ProgressBar progress={getProgressPercent(moduleDetails) || 0} />
                    {moduleDetails?.chapters && (
                        <div className="flex flex-col gap-6">
                            {moduleDetails.chapters.map((chapter, index) => (
                                <ChapterAccordian ChapterDetails={chapter} key={index} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <p>No chapter created for this module</p>
            )}
        </>
    );
};
