/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { LevelCard } from "./level-card";
import { useRouter } from "@tanstack/react-router";
import { SessionDropdown } from "../../../../../components/common/study-library/study-library-session-dropdown";
import { useSidebar } from "@/components/ui/sidebar";
import { getCourseSessions } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSessionsForLevels";
import { getCourseLevels } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getLevelWithDetails";
import {
    StudyLibrarySessionType,
    useStudyLibraryStore,
} from "@/stores/study-library/use-study-library-store";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";
import { AddLevelButton } from "./add-level-button";
import { AddLevelData } from "./add-level-form";
import { toast } from "sonner";
import { useAddLevel } from "@/routes/study-library/courses/levels/-services/add-level";
import { useDeleteLevel } from "@/routes/study-library/courses/levels/-services/delete-level";
import useIntroJsTour from "@/hooks/use-intro";
import { StudyLibraryIntroKey } from "@/constants/storage/introKey";
import { studyLibrarySteps } from "@/constants/intro/steps";
import { useUpdateLevel } from "@/routes/study-library/courses/levels/-services/update-level";
import { EmptyLevelPage } from "@/svgs";

export const LevelPage = () => {
    const { open } = useSidebar();
    const router = useRouter();
    const searchParams = router.state.location.search;
    const [courseId, setCourseId] = useState(searchParams.courseId);
    const { setSelectedSession } = useSelectedSessionStore();
    const addLevelMutation = useAddLevel();
    const deleteLevelMutation = useDeleteLevel();
    const updateLevelMutation = useUpdateLevel();
    const { studyLibraryData } = useStudyLibraryStore();
    // Ensure hooks always run
    const [sessionList, setSessionList] = useState(courseId ? getCourseSessions(courseId) : []);
    const initialSession: StudyLibrarySessionType | undefined = sessionList[0] ?? undefined;

    const [currentSession, setCurrentSession] = useState<StudyLibrarySessionType | undefined>(
        () => initialSession,
    );

    useEffect(() => {
        setCourseId(searchParams.courseId);
        setSessionList(courseId ? getCourseSessions(courseId) : []);
        setCurrentSession(sessionList[0] ?? undefined);
    }, [searchParams.courseId]);

    // Get levels only if session is selected
    const initialLevelList = currentSession ? getCourseLevels(courseId!, currentSession.id) : [];

    const [levelList, setLevelList] = useState(initialLevelList);

    const handleSessionChange = (value: string | StudyLibrarySessionType) => {
        if (typeof value !== "string" && value) {
            setCurrentSession(value);
        }
    };

    const handleLeveLDelete = (levelId: string) => {
        deleteLevelMutation.mutate(levelId, {
            onSuccess: () => {
                toast.success("Level deleted successfully");
            },
            onError: (error) => {
                toast.error(error.message || "Failed to delete level");
            },
        });
    };

    useIntroJsTour({
        key: StudyLibraryIntroKey.assignYearStep,
        steps: studyLibrarySteps.assignYearStep,
    });

    useEffect(() => {
        setSelectedSession(currentSession);
        const newLevelList = currentSession ? getCourseLevels(courseId!, currentSession.id) : [];
        setLevelList(newLevelList);
    }, [currentSession, courseId]);

    useEffect(() => {
        const newLevelList = currentSession ? getCourseLevels(courseId!, currentSession.id) : [];
        setLevelList(newLevelList);
    }, [studyLibraryData, courseId]);

    const handleAddLevel = ({
        requestData,
        packageId,
        sessionId,
    }: {
        requestData: AddLevelData;
        packageId?: string;
        sessionId?: string;
        levelId?: string;
    }) => {
        addLevelMutation.mutate(
            { requestData: requestData, packageId: packageId || "", sessionId: sessionId || "" },
            {
                onSuccess: () => {
                    toast.success("Level added successfully");
                },
                onError: (error) => {
                    toast.error(error.message || "Failed to add course");
                },
            },
        );
    };

    const handleLevelUpdate = ({ requestData }: { requestData: AddLevelData }) => {
        updateLevelMutation.mutate(
            { requestData },
            {
                onSuccess: () => {
                    toast.success("Level updated successfully");
                },
                onError: (error) => {
                    toast.error(error.message || "Failed to update level");
                },
            },
        );
    };

    const LevelHeader = () => {
        return (
            <div className="flex items-center gap-8">
                <div className="flex flex-col gap-2">
                    <div className="text-h3 font-semibold">Level Management</div>
                    <div className="text-subtitle">
                        Effortlessly manage classes, subjects, and resources to ensure students have
                        access to the best education materials. Organize, upload, and track study
                        resources for all levels in one place.
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <AddLevelButton onSubmit={handleAddLevel} />
                </div>
            </div>
        );
    };

    return (
        <div className="relative flex flex-1 flex-col gap-8 text-neutral-600">
            {!courseId ? (
                <div>Course not found</div>
            ) : sessionList.length === 0 ? (
                <div className="flex flex-1 flex-col">
                    {LevelHeader()}
                    <div className="flex w-full flex-1 flex-col items-center justify-center gap-4">
                        <div className="w-fit">
                            <EmptyLevelPage />
                        </div>
                        <div className="text-center">No level have been created yet.</div>
                    </div>
                </div>
            ) : (
                <>
                    {LevelHeader()}

                    <div className="flex items-center gap-6">
                        <SessionDropdown
                            currentSession={currentSession ?? undefined} // Convert null to undefined
                            onSessionChange={handleSessionChange}
                            className="text-title font-semibold"
                            sessionList={sessionList}
                        />
                    </div>

                    <div
                        className={`grid ${
                            open ? "grid-cols-4 gap-4" : "grid-cols-5 gap-8"
                        } justify-between`}
                    >
                        {levelList.map((level, key) => (
                            <div key={key}>
                                <LevelCard
                                    level={level}
                                    onDelete={handleLeveLDelete}
                                    onEdit={handleLevelUpdate}
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
