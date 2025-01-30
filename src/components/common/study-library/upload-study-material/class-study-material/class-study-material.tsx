// class-study-material.tsx
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AddSubjectButton } from "./subject-material/add-subject.tsx/add-subject-button";
import { Subjects } from "./subject-material/add-subject.tsx/subjects";
import { useState } from "react";
import { SessionDropdown } from "../../study-library-session-dropdown";
import { SearchInput } from "@/components/common/students/students-list/student-list-section/search-input";
import { getSessionNames } from "@/utils/helpers/study-library-helpers.ts/get-utilitites-from-stores/getStudyLibrarySessions";
import { useSessionSubjects } from "@/utils/helpers/study-library-helpers.ts/get-utilitites-from-stores/getSessionSubjects";
import { getPackageSessionIds } from "@/utils/helpers/study-library-helpers.ts/get-utilitites-from-stores/getLevelPackageSessionIds";
import { SubjectType } from "@/stores/study-library/use-study-library-store";
import { useAddSubject } from "@/services/study-library/subject-operations/addSubject";
import { useUpdateSubject } from "@/services/study-library/subject-operations/updateSubject";
import { useDeleteSubject } from "@/services/study-library/subject-operations/deleteSubject";
import { DashboardLoader } from "@/components/core/dashboard-loader";

interface ClassStudyMaterialProps {
    classNumber: string;
}
// class-study-material.tsx
export const ClassStudyMaterial = ({ classNumber }: ClassStudyMaterialProps) => {
    const sessionList = getSessionNames();
    const [currentSession, setCurrentSession] = useState(sessionList[0] || "");
    const apiSubjects = useSessionSubjects(currentSession, classNumber);
    const [searchInput, setSearchInput] = useState("");

    const addSubjectMutation = useAddSubject();
    const updateSubjectMutation = useUpdateSubject();
    const deleteSubjectMutation = useDeleteSubject();

    const router = useRouter();

    const handleBackClick = () => {
        router.navigate({
            to: "/study-library",
        });
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>{`${classNumber} Class Study Library`}</div>
        </div>
    );

    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading(heading);
    }, [classNumber]);

    const handleSessionChange = (value: string) => {
        setCurrentSession(value);
    };

    const mappedSubjects = apiSubjects.map((subject) => ({
        id: subject.id,
        subject_name: subject.subject_name,
        subject_code: subject.subject_code,
        credit: subject.credit,
        thumbnail_id: subject.thumbnail_id,
        created_at: subject.created_at,
        updated_at: subject.updated_at,
    }));

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleAddSubject = async (newSubject: SubjectType) => {
        const packageSessionIds = getPackageSessionIds(classNumber, currentSession);
        if (packageSessionIds.length === 0) {
            console.error("No package session IDs found");
            return;
        }

        addSubjectMutation.mutate({
            subject: newSubject,
            packageSessionIds,
        });
    };

    const handleDeleteSubject = (subjectId: string) => {
        deleteSubjectMutation.mutate(subjectId);
    };

    const handleEditSubject = (subjectId: string, updatedSubject: SubjectType) => {
        updateSubjectMutation.mutate({
            subjectId,
            updatedSubject: updatedSubject,
        });
    };

    const isLoading =
        addSubjectMutation.isPending ||
        deleteSubjectMutation.isPending ||
        updateSubjectMutation.isPending;

    if (isLoading) {
        return <DashboardLoader />;
    }

    return (
        <div className="flex h-full w-full flex-col gap-8 text-neutral-600">
            <div className="flex items-center justify-between gap-80">
                <div className="flex w-full flex-col gap-2">
                    <div className="text-h3 font-semibold">
                        {`Manage ${classNumber} Class Resources`}
                    </div>
                    <div className="text-subtitle">
                        {`Explore and manage resources for ${classNumber} Class. Click on a subject to view and
                        organize eBooks and video lectures, or upload new content to enrich your
                        study library.`}
                    </div>
                </div>
                <AddSubjectButton onAddSubject={handleAddSubject} />
            </div>
            <div className="flex items-center gap-6">
                <SessionDropdown
                    currentSession={currentSession}
                    onSessionChange={handleSessionChange}
                    className="text-title font-semibold"
                />
                <SearchInput
                    searchInput={searchInput}
                    onSearchChange={handleSearchInputChange}
                    placeholder="Search subject"
                />
            </div>
            <Subjects
                subjects={mappedSubjects}
                onDeleteSubject={handleDeleteSubject}
                onEditSubject={handleEditSubject}
                classNumber={classNumber}
            />
        </div>
    );
};
