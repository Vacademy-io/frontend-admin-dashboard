import { useState } from "react";
import { SubjectProgress } from "./chapter-details/subject-progress";
import { StudentLearningProgressType } from "../student-view-dummy-data";

export const StudentLearningProgress = ({
    learningProgressData,
}: {
    learningProgressData: StudentLearningProgressType;
}) => {
    const [category, setCategory] = useState("physics");

    return (
        <div className="flex flex-col gap-10">
            <div className="flex w-full">
                <div
                    className={`w-full py-[9px] text-center ${
                        category == "physics"
                            ? "rounded-lg border border-primary-200 bg-white text-primary-500"
                            : "border-none bg-none text-neutral-600"
                    } cursor-pointer text-subtitle`}
                    onClick={() => {
                        setCategory("physics");
                    }}
                >
                    Physics
                </div>
                <div
                    className={`w-full py-[9px] text-center ${
                        category == "chemistry"
                            ? "rounded-lg border border-primary-200 bg-white text-primary-500"
                            : "border-none bg-none text-neutral-600"
                    } cursor-pointer text-subtitle`}
                    onClick={() => {
                        setCategory("chemistry");
                    }}
                >
                    Chemistry
                </div>
                <div
                    className={`w-full py-[9px] text-center ${
                        category == "biology"
                            ? "rounded-lg border border-primary-200 bg-white text-primary-500"
                            : "border-none bg-none text-neutral-600"
                    } cursor-pointer text-subtitle`}
                    onClick={() => {
                        setCategory("biology");
                    }}
                >
                    Biology
                </div>
            </div>
            {category == "physics" && (
                <SubjectProgress subjectData={learningProgressData.data[0]} />
            )}
            {category == "chemistry" && <SubjectProgress />}
            {category == "biology" && <SubjectProgress />}
        </div>
    );
};
