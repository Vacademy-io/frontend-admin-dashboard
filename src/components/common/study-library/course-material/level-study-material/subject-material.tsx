// class-study-material.tsx
import { useRouter } from "@tanstack/react-router";
import { AddSubjectButton } from "./subject-material/add-subject.tsx/add-subject-button";
import { Subjects } from "./subject-material/add-subject.tsx/subjects";
import { useEffect, useState } from "react";
import {
    StudyLibrarySessionType,
    SubjectType,
    useStudyLibraryStore,
} from "@/stores/study-library/use-study-library-store";
import { useAddSubject } from "@/services/study-library/subject-operations/addSubject";
import { useUpdateSubject } from "@/services/study-library/subject-operations/updateSubject";
import { useDeleteSubject } from "@/services/study-library/subject-operations/deleteSubject";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { SessionDropdown } from "../../study-library-session-dropdown";
import { getCourseSubjects } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSubjects";
// import { getLevelName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getLevelNameById";
import { useGetPackageSessionId } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getPackageSessionId";
import { useUpdateSubjectOrder } from "@/services/study-library/subject-operations/updateSubjectOrder";
import { orderSubjectPayloadType } from "@/types/study-library/order-payload";
import { getLevelSessions } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSessionsForSubjects";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";
import useIntroJsTour from "@/hooks/use-intro";
import { StudyLibraryIntroKey } from "@/constants/storage/introKey";
import { studyLibrarySteps } from "@/constants/intro/steps";
// import { getCourseNameById } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getCourseNameById";

export const SubjectMaterial = () => {
    const router = useRouter();
    const searchParams = router.state.location.search;
    const { selectedSession, setSelectedSession } = useSelectedSessionStore();

    const { studyLibraryData } = useStudyLibraryStore();

    // Extract params safely
    const courseId: string = searchParams.courseId || "";
    const levelId: string = searchParams.levelId || "";

    // Define states before any conditions
    const sessionList = courseId && levelId ? getLevelSessions(levelId) : [];
    const initialSession: StudyLibrarySessionType | undefined =
        selectedSession && sessionList.includes(selectedSession) ? selectedSession : sessionList[0];
    const [currentSession, setCurrentSession] = useState<StudyLibrarySessionType | undefined>(
        initialSession,
    );
    // const [searchInput, setSearchInput] = useState("");

    // Custom hooks (always called unconditionally)
    const addSubjectMutation = useAddSubject();
    const updateSubjectMutation = useUpdateSubject();
    const deleteSubjectMutation = useDeleteSubject();
    const updateSubjectOrderMutation = useUpdateSubjectOrder();

    // Prevent rendering if required params are missing

    const handleSessionChange = (value: string | StudyLibrarySessionType) => {
        if (typeof value !== "string" && value) {
            setCurrentSession(value);
        }
    };

    const initialSubjects = getCourseSubjects(courseId, currentSession?.id ?? "", levelId);
    const [subjects, setSubjects] = useState(initialSubjects);

    useIntroJsTour({
        key: StudyLibraryIntroKey.addSubjectStep,
        steps: studyLibrarySteps.addSubjectStep,
    });

    useEffect(() => {
        setSelectedSession(currentSession);
        const newSubjects = getCourseSubjects(courseId, currentSession?.id ?? "", levelId);
        setSubjects(newSubjects);
    }, [currentSession, studyLibraryData]);

    // const classNumber = getLevelName(levelId);
    const packageSessionIds =
        useGetPackageSessionId(courseId, currentSession?.id ?? "", levelId) || "";

    // const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setSearchInput(e.target.value);
    // };

    const handleAddSubject = async (newSubject: SubjectType) => {
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

    const handleSubjectOrderChange = (updatedOrder: orderSubjectPayloadType[]) => {
        updateSubjectOrderMutation.mutate({
            orderedSubjects: updatedOrder,
        });
    };

    if (courseId == "" || levelId == "") {
        return <p>Missing required parameters</p>;
    }

    // const courseName = getCourseNameById(courseId);

    const isLoading =
        addSubjectMutation.isPending ||
        deleteSubjectMutation.isPending ||
        updateSubjectMutation.isPending;

    return isLoading ? (
        <DashboardLoader />
    ) : (
        <div className="flex size-full flex-col gap-8 text-neutral-600">
            <div className="flex items-center justify-between gap-8">
                <div className="flex w-full flex-col gap-2">
                    <div className="text-h3 font-semibold">{`Manage Batch Subjects`}</div>
                    <div className="text-subtitle">
                        Explore and manage resources for the batch. Click on a subject to view and
                        organize eBooks and video lectures, or upload new content to enrich your
                        learning centre.
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
                {/* TODO: aad search fuctionlity when api is created
                    <SearchInput
                    searchInput={searchInput}
                    onSearchChange={handleSearchInputChange}
                    placeholder="Search subject"
                /> */}
            </div>
            <Subjects
                subjects={subjects}
                onDeleteSubject={handleDeleteSubject}
                onEditSubject={handleEditSubject}
                packageSessionIds={packageSessionIds}
                onOrderChange={handleSubjectOrderChange}
            />
        </div>
    );
};
