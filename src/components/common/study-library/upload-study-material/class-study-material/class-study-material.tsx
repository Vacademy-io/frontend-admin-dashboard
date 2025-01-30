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
import { ADD_SUBJECT, DELETE_SUBJECT, UPDATE_SUBJECT } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";
import { SubjectType } from "@/stores/study-library/use-study-library-store";

interface ClassStudyMaterialProps {
    classNumber: string;
}
// class-study-material.tsx
export const ClassStudyMaterial = ({ classNumber }: ClassStudyMaterialProps) => {
    const sessionList = getSessionNames();
    const [currentSession, setCurrentSession] = useState(sessionList[0] || "");
    const apiSubjects = useSessionSubjects(currentSession, classNumber);
    const [searchInput, setSearchInput] = useState("");
    const queryClient = useQueryClient();
    const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);

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
        try {
            setIsSubjectsLoading(true);
            const packageSessionIds = getPackageSessionIds(classNumber, currentSession);
            if (packageSessionIds.length === 0) {
                console.error("No package session IDs found");
                return;
            }

            const payload = {
                id: newSubject.id,
                subject_name: newSubject.subject_name,
                subject_code: newSubject.subject_code,
                credit: newSubject.credit,
                thumbnail_id: newSubject.thumbnail_id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const response = await authenticatedAxiosInstance.post(
                `${ADD_SUBJECT}?commaSeparatedPackageSessionIds=${packageSessionIds}`,
                payload,
            );

            if (response.status === 200) {
                await queryClient.invalidateQueries({
                    queryKey: ["GET_INIT_STUDY_LIBRARY"],
                });
            }
        } catch (error) {
            console.error("Failed to add subject:", error);
        } finally {
            setIsSubjectsLoading(false);
        }
    };

    const handleDeleteSubject = async (subjectId: string) => {
        try {
            setIsSubjectsLoading(true);
            const response = await authenticatedAxiosInstance.delete(
                `${DELETE_SUBJECT}?subjectId=${subjectId}`,
            );

            if (response.status === 200) {
                await queryClient.invalidateQueries({
                    queryKey: ["GET_INIT_STUDY_LIBRARY"],
                });
            }
        } catch (error) {
            console.error("Failed to delete subject:", error);
            // Handle error (show error message to user)
        } finally {
            setIsSubjectsLoading(false);
        }
    };

    const handleEditSubject = async (subjectId: string, updatedSubject: SubjectType) => {
        try {
            setIsSubjectsLoading(true);
            const payload = {
                id: subjectId,
                subject_name: updatedSubject.subject_name,
                subject_code: updatedSubject.subject_code,
                credit: updatedSubject.credit,
                thumbnail_id: updatedSubject.thumbnail_id,
                created_at: updatedSubject.created_at,
                updated_at: new Date().toISOString(),
            };

            const response = await authenticatedAxiosInstance.put(
                `${UPDATE_SUBJECT}?subjectId=${subjectId}`,
                payload,
            );

            if (response.status === 200) {
                await queryClient.invalidateQueries({
                    queryKey: ["GET_INIT_STUDY_LIBRARY"],
                });
            }
        } catch (error) {
            console.error("Failed to update subject:", error);
            // Handle error (show error message to user)
        } finally {
            setIsSubjectsLoading(false);
        }
    };

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
                isLoading={isSubjectsLoading}
            />
        </div>
    );
};
