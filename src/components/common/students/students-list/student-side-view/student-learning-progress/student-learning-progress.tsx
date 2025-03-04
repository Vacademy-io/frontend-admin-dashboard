import { useEffect, useState } from "react";
import { SubjectProgress } from "./chapter-details/subject-progress";
import { useStudentSubjectsProgressQuery } from "@/services/student-list-section/getStudentSubjects";
import { useStudentSidebar } from "@/context/selected-student-sidebar-context";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import {
    ModulesWithChaptersProgressType,
    SubjectWithDetails,
} from "@/types/students/student-subjects-details-types";
// import { Module } from "@/stores/study-library/use-modules-with-chapters-store";

export const StudentLearningProgress = () => {
    const [currentSubjectDetails, setCurrentSubjectDetails] = useState<SubjectWithDetails | null>(
        null,
    );
    const [currentModuleDetails, setCurrentModuleDetails] =
        useState<ModulesWithChaptersProgressType | null>(null);

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
            setCurrentSubjectDetails(subjectsWithChapters[0]);
        } else {
            setCurrentSubjectDetails(null);
        }
    }, [subjectsWithChapters]);

    useEffect(() => {
        if (
            currentSubjectDetails &&
            currentSubjectDetails.modules.length > 0 &&
            currentSubjectDetails.modules[0]
        ) {
            setCurrentModuleDetails(currentSubjectDetails.modules[0]);
        } else {
            setCurrentModuleDetails(null);
        }
    }, [currentSubjectDetails]);

    if (selectedStudent == null) return <p>Student details unavailable</p>;
    if (isLoading) return <DashboardLoader />;
    if (isError || error) return <p>Error loading subject details</p>;
    if (
        subjectsWithChapters == null ||
        subjectsWithChapters == undefined ||
        subjectsWithChapters.length == 0 ||
        subjectsWithChapters[0] == undefined
    )
        return <p>No subject has been created</p>;

    return (
        <div className="flex flex-col gap-10">
            <div className="no-scrollbar flex w-full overflow-x-scroll">
                <div className="flex flex-nowrap">
                    {subjectsWithChapters?.map((subjectData, index) => (
                        <div
                            key={index}
                            className={`w-[150px] py-[9px] text-center ${
                                currentSubjectDetails?.subject_dto.id == subjectData.subject_dto.id
                                    ? "rounded-lg border border-primary-200 bg-white text-primary-500"
                                    : "border-none bg-none text-neutral-600"
                            } cursor-pointer text-subtitle`}
                            onClick={() => {
                                setCurrentSubjectDetails(subjectData);
                            }}
                        >
                            {subjectData.subject_dto.subject_name}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-10">
                {currentSubjectDetails && currentSubjectDetails.modules.length > 0 ? (
                    <div className="flex flex-col gap-10">
                        <div className="no-scrollbar flex w-full overflow-x-scroll">
                            <div className="flex flex-nowrap">
                                {currentSubjectDetails.modules.map((moduleData, index) => (
                                    <div
                                        key={index}
                                        className={`w-[150px] py-[9px] text-center ${
                                            currentModuleDetails?.module.id == moduleData.module.id
                                                ? "rounded-lg border border-primary-200 bg-white text-primary-500"
                                                : "border-none bg-none text-neutral-600"
                                        } cursor-pointer text-subtitle`}
                                        onClick={() => {
                                            setCurrentModuleDetails(moduleData);
                                        }}
                                    >
                                        {moduleData.module.module_name}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <SubjectProgress moduleDetails={currentModuleDetails} />
                    </div>
                ) : (
                    <p>No modules created for this subject </p>
                )}
            </div>
        </div>
    );
};
