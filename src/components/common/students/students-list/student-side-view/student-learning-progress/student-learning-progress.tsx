import { useEffect, useState } from "react";
import { SubjectProgress } from "./chapter-details/subject-progress";
import { StudentLearningProgressType } from "../student-view-dummy-data/student-view-dummy-data";
import { useStudentSubjectsProgressQuery } from "@/services/student-list-section/getStudentSubjects";
import { useStudentSidebar } from "@/context/selected-student-sidebar-context";
import { DashboardLoader } from "@/components/core/dashboard-loader";
// import { StudentSubjectsDetailsTypes } from "@/types/students/student-subjects-details-types";
import { SubjectType } from "@/stores/study-library/use-study-library-store";
// import { Module } from "@/stores/study-library/use-modules-with-chapters-store";

export const StudentLearningProgress = ({
    learningProgressData,
}: {
    learningProgressData: StudentLearningProgressType;
}) => {
    const [category, setCategory] = useState("physics");
    const [currentSubject, setCurrentSubject] = useState<SubjectType | null>(null);
    // const [currentModule, setCurrentModule] = useState<Module | null>(null);

    const { selectedStudent } = useStudentSidebar();

    const {
        data: subjectsWithChapters,
        isLoading,
        isError,
        error,
    } = useStudentSubjectsProgressQuery({
        userId: selectedStudent?.user_id || "",
        packageSessionId: selectedStudent?.package_session_id || "",
    });

    useEffect(() => {
        if (subjectsWithChapters && subjectsWithChapters.length > 0 && subjectsWithChapters[0]) {
            setCurrentSubject(subjectsWithChapters[0].subject_dto);
        }
    }, [subjectsWithChapters]);

    if (selectedStudent == null) return <p>Student details unavailable</p>;
    if (isLoading) return <DashboardLoader />;
    if (isError || error) return <p>Error loading subject details</p>;
    if (
        subjectsWithChapters == null ||
        subjectsWithChapters == undefined ||
        subjectsWithChapters.length == 0 ||
        subjectsWithChapters[0] == undefined
    )
        return <p>Subjects details unavailable</p>;

    return (
        <div className="flex flex-col gap-10">
            <div className="no-scrollbar flex w-full overflow-x-scroll">
                <div className="flex flex-nowrap">
                    {subjectsWithChapters?.map((subjectData, index) => (
                        <div
                            key={index}
                            className={`w-[150px] py-[9px] text-center ${
                                currentSubject?.id == subjectData.subject_dto.id
                                    ? "rounded-lg border border-primary-200 bg-white text-primary-500"
                                    : "border-none bg-none text-neutral-600"
                            } cursor-pointer text-subtitle`}
                            onClick={() => {
                                setCurrentSubject(subjectData.subject_dto);
                            }}
                        >
                            {subjectData.subject_dto.subject_name}
                        </div>
                    ))}
                </div>
            </div>
            <div className="no-scrollbar flex w-full overflow-x-scroll">
                <div className="flex flex-nowrap">
                    <div
                        className={`w-[150px] py-[9px] text-center ${
                            category == "physics"
                                ? "rounded-lg border border-primary-200 bg-white text-primary-500"
                                : "border-none bg-none text-neutral-600"
                        } cursor-pointer text-subtitle`}
                        onClick={() => {
                            setCategory("physics");
                        }}
                    >
                        Live Session
                    </div>
                    <div
                        className={`w-[150px] py-[9px] text-center ${
                            category == "chemistry"
                                ? "rounded-lg border border-primary-200 bg-white text-primary-500"
                                : "border-none bg-none text-neutral-600"
                        } cursor-pointer text-subtitle`}
                        onClick={() => {
                            setCategory("chemistry");
                        }}
                    >
                        NCERT
                    </div>
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
