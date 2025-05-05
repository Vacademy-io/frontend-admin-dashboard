// class-study-material.tsx
import { useRouter } from "@tanstack/react-router";
import { AddSubjectButton } from "./add-subject.tsx/add-subject-button";
import { Subjects } from "./add-subject.tsx/subjects";
import { useEffect, useState } from "react";
import {
    StudyLibrarySessionType,
    SubjectType,
    useStudyLibraryStore,
} from "@/stores/study-library/use-study-library-store";
import { useAddSubject } from "@/routes/study-library/courses/levels/subjects/-services/addSubject";
import { useUpdateSubject } from "@/routes/study-library/courses/levels/subjects/-services/updateSubject";
import { useDeleteSubject } from "@/routes/study-library/courses/levels/subjects/-services/deleteSubject";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { SessionDropdown } from "../../../../../../components/common/study-library/study-library-session-dropdown";
import { getCourseSubjects } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSubjects";
// import { getLevelName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getLevelNameById";
import { useGetPackageSessionId } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getPackageSessionId";
import { useUpdateSubjectOrder } from "@/routes/study-library/courses/levels/subjects/-services/updateSubjectOrder";
import { orderSubjectPayloadType } from "@/routes/study-library/courses/-types/order-payload";
import { getLevelSessions } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSessionsForSubjects";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";
import useIntroJsTour from "@/hooks/use-intro";
import { StudyLibraryIntroKey } from "@/constants/storage/introKey";
import { studyLibrarySteps } from "@/constants/intro/steps";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { tabs, TabType } from "../-constants/constant";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {useModulesWithChaptersQuery} from "../../../-services/getModulesWithChapters"
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
    const [selectedTab, setSelectedTab] = useState("OUTLINE");
    const handleTabChange = (value: string) => {
        setSelectedTab(value);
    };

    const getTabClass = (isActive: boolean) =>
        `flex gap-1.5 rounded-none pb-2 pl-12 pr-12 pt-2 !shadow-none ${
            isActive
                ? "border-4px rounded-tl-sm rounded-tr-sm border !border-b-0 border-primary-200 !bg-primary-50"
                : "border-none bg-transparent"
        }`;
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
    
    useEffect(() => {

    }, [subjects]);

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

    const tabContent: Record<TabType, React.ReactNode> = {
        [TabType.OUTLINE]: (
            <div>
                {subjects.map((subject, index) => (
                    <Collapsible key={index}>
                        <CollapsibleTrigger>{subject.subject_name}</CollapsibleTrigger>
                        {/* <CollapsibleContent>{subject.description}</CollapsibleContent> */}
                    </Collapsible>
                ))}
            </div>
        ),
        [TabType.SUBJECTS]: (
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between gap-8">
                    <div className="flex w-full flex-col gap-2">
                        <div className="text-h3 font-semibold">{`Manage Batch Subjects`}</div>
                        <div className="text-subtitle">
                            Explore and manage resources for the batch. Click on a subject to view
                            and organize eBooks and video lectures, or upload new content to enrich
                            your learning centre.
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
                </div>
                <Subjects
                    subjects={subjects}
                    onDeleteSubject={handleDeleteSubject}
                    onEditSubject={handleEditSubject}
                    packageSessionIds={packageSessionIds}
                    onOrderChange={handleSubjectOrderChange}
                />
            </div>
        ),
        [TabType.STUDENT]: <div>student content</div>,
        [TabType.TEACHERS]: <div>teachers content</div>,
        [TabType.ASSESSMENT]: <div>assessment content</div>,
        [TabType.ASSIGNMENT]: <div>assignment content</div>,
        [TabType.GRADING]: <div>grading content</div>,
        [TabType.ANNOUNCEMENT]: <div>announcement content</div>,
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
            <Tabs value={selectedTab} onValueChange={handleTabChange}>
                <div className="flex flex-row justify-between">
                    <TabsList className="hide-scrollbar inline-flex h-auto justify-start gap-4 overflow-y-auto rounded-none border-b-[1px] !bg-transparent p-0">
                        {tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className={getTabClass(selectedTab === tab.value)}
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {tabs.map((tab) => (
                    <TabsContent key={tab.value} value={tab.value}>
                        {tabContent[tab.value as TabType]}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};
