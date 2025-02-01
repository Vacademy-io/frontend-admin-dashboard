// class-study-material.tsx
import { useRouter } from "@tanstack/react-router";
import { AddSubjectButton } from "./subject-material/add-subject.tsx/add-subject-button";
import { Subjects } from "./subject-material/add-subject.tsx/subjects";
import { useState } from "react";
// import { SessionDropdown } from "../../study-library-session-dropdown";
import { SearchInput } from "@/components/common/students/students-list/student-list-section/search-input";
import {
    StudyLibrarySessionType,
    SubjectType,
} from "@/stores/study-library/use-study-library-store";
import { useAddSubject } from "@/services/study-library/subject-operations/addSubject";
import { useUpdateSubject } from "@/services/study-library/subject-operations/updateSubject";
import { useDeleteSubject } from "@/services/study-library/subject-operations/deleteSubject";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { getSessionsByLevel } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSessionsByLevel";
import { SessionDropdown } from "../../study-library-session-dropdown";
import { getCourseSubjects } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSubjects";
import { getLevelName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getLevelNameById";
import { getPackageSessionIdsByIds } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getLevelPackageSessionIds";

export const SubjectMaterial = () => {
    const router = useRouter();
    const searchParams = router.state.location.search;

    // Extract params safely
    const courseId: string | undefined = searchParams.courseId;
    const levelId: string | undefined = searchParams.levelId;

    // Define states before any conditions
    const sessionList = courseId && levelId ? getSessionsByLevel(courseId, levelId) : [];
    const initialSession: StudyLibrarySessionType | null = sessionList[0] ?? null;
    const [currentSession, setCurrentSession] = useState<StudyLibrarySessionType | null>(
        initialSession,
    );
    const [searchInput, setSearchInput] = useState("");

    // Custom hooks (always called unconditionally)
    const addSubjectMutation = useAddSubject();
    const updateSubjectMutation = useUpdateSubject();
    const deleteSubjectMutation = useDeleteSubject();

    // Prevent rendering if required params are missing
    if (!courseId || !levelId) {
        return <p>Missing required parameters</p>;
    }

    const handleSessionChange = (value: string | StudyLibrarySessionType) => {
        if (typeof value !== "string" && value) {
            setCurrentSession(value);
        }
    };

    const apiSubjects = getCourseSubjects(courseId, currentSession?.id ?? "", levelId);

    const classNumber = getLevelName(levelId);

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
        const packageSessionIds = getPackageSessionIdsByIds(levelId, currentSession?.id ?? "");
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
            updatedSubject,
        });
    };

    const isLoading =
        addSubjectMutation.isPending ||
        deleteSubjectMutation.isPending ||
        updateSubjectMutation.isPending;

    return isLoading ? (
        <DashboardLoader />
    ) : (
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
                    currentSession={currentSession ?? undefined}
                    onSessionChange={handleSessionChange}
                    className="text-title font-semibold"
                    sessionList={sessionList}
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
            />
        </div>
    );
};
