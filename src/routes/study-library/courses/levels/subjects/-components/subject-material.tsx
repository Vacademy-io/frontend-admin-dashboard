// class-study-material.tsx
import { useRouter } from "@tanstack/react-router";
import { AddSubjectButton } from "./add-subject.tsx/add-subject-button";
import { Subjects } from "./add-subject.tsx/subjects";
import { useEffect, useState } from "react";
import {
    SubjectType,
    useStudyLibraryStore,
} from "@/stores/study-library/use-study-library-store";
import { useAddSubject } from "@/routes/study-library/courses/levels/subjects/-services/addSubject";
import { useUpdateSubject } from "@/routes/study-library/courses/levels/subjects/-services/updateSubject";
import { useDeleteSubject } from "@/routes/study-library/courses/levels/subjects/-services/deleteSubject";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { getCourseSubjects } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSubjects";
import { useGetPackageSessionId } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getPackageSessionId";
import { useUpdateSubjectOrder } from "@/routes/study-library/courses/levels/subjects/-services/updateSubjectOrder";
import { orderSubjectPayloadType } from "@/routes/study-library/courses/-types/order-payload";
import useIntroJsTour from "@/hooks/use-intro";
import { StudyLibraryIntroKey } from "@/constants/storage/introKey";
import { studyLibrarySteps } from "@/constants/intro/steps";
import { MyDropdown } from "@/components/common/students/enroll-manually/dropdownForPackageItems";
import { DropdownValueType } from "@/components/common/students/enroll-manually/dropdownTypesForPackageItems";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { DropdownItemType } from "@/components/common/students/enroll-manually/dropdownTypesForPackageItems";

export const SubjectMaterial = () => {
    const router = useRouter();
    const searchParams = router.state.location.search;
    const { getSessionFromPackage } = useInstituteDetailsStore();
    const { studyLibraryData } = useStudyLibraryStore();

    // Extract params safely
    const courseId: string = searchParams.courseId || "";
    const levelId: string = searchParams.levelId || "";

    // Define states before any conditions
    const [sessionList, setSessionList] = useState<DropdownItemType[]>(
        searchParams.courseId ? getSessionFromPackage({courseId: courseId, levelId: levelId}) : []
    );
    const initialSession: DropdownItemType | undefined = {id: sessionList[0]?.id || "", name: sessionList[0]?.name || ""}

    const [currentSession, setCurrentSession] = useState<DropdownItemType | undefined>(
        () => initialSession,
    );

    useEffect(() => {
        setSessionList(searchParams.courseId ? getSessionFromPackage({courseId: courseId, levelId: searchParams.levelId}) : []);
    }, [searchParams.courseId, searchParams.levelId]);

    useEffect(() => {
        setCurrentSession({id: sessionList[0]?.id || "", name: sessionList[0]?.name || ""});
    }, [sessionList]);

    const handleSessionChange = (value: DropdownValueType) => {
        if (value && typeof value === "object" && "id" in value && "name" in value) {
            setCurrentSession(value as DropdownItemType);
        }
    };
    // const [searchInput, setSearchInput] = useState("");

    // Custom hooks (always called unconditionally)
    const addSubjectMutation = useAddSubject();
    const updateSubjectMutation = useUpdateSubject();
    const deleteSubjectMutation = useDeleteSubject();
    const updateSubjectOrderMutation = useUpdateSubjectOrder();

    useIntroJsTour({
        key: StudyLibraryIntroKey.addSubjectStep,
        steps: studyLibrarySteps.addSubjectStep,
    });

    const initialSubjects = getCourseSubjects(courseId, currentSession?.id ?? "", levelId);
    const [subjects, setSubjects] = useState(initialSubjects);

    useEffect(() => {
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
                <MyDropdown
                    currentValue={currentSession ?? undefined}
                    dropdownList={sessionList}
                    placeholder="Select Session"
                    handleChange={handleSessionChange}
                />
            </div>
            <Subjects
                subjects={subjects}
                onDeleteSubject={handleDeleteSubject}
                onEditSubject={handleEditSubject}
                packageSessionIds={packageSessionIds}
                onOrderChange={handleSubjectOrderChange}
                currentSession={currentSession}
            />
        </div>
    );
};
