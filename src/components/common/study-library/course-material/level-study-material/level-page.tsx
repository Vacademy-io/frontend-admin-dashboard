/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { LevelCard } from "./level-card";
import { useRouter } from "@tanstack/react-router";
import { SessionDropdown } from "../../study-library-session-dropdown";
import { useSidebar } from "@/components/ui/sidebar";
import { MyButton } from "@/components/design-system/button";
import { Plus } from "phosphor-react";
import { getCourseSessions } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSessionsForLevels";
import { getCourseLevels } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getLevelWithDetails";
import { StudyLibrarySessionType } from "@/stores/study-library/use-study-library-store";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";

export const LevelPage = () => {
    const { open } = useSidebar();
    const router = useRouter();
    const searchParams = router.state.location.search;
    const courseId = searchParams.courseId;
    const { setSelectedSession } = useSelectedSessionStore();

    // Ensure hooks always run
    const sessionList = courseId ? getCourseSessions(courseId) : [];
    const initialSession: StudyLibrarySessionType | undefined = sessionList[0] ?? undefined;

    const [currentSession, setCurrentSession] = useState<StudyLibrarySessionType | undefined>(
        () => initialSession,
    );

    // Get levels only if session is selected
    const LevelList = currentSession ? getCourseLevels(courseId!, currentSession.id) : [];

    const handleSessionChange = (value: string | StudyLibrarySessionType) => {
        if (typeof value !== "string" && value) {
            setCurrentSession(value);
        }
    };

    const handleLeveLDelete = () => {};
    const handleLevelEdit = () => {};

    useEffect(() => {
        setSelectedSession(currentSession);
    }, [currentSession]);

    return (
        <div className="relative flex flex-col gap-8 text-neutral-600">
            {!courseId ? (
                <div>Course not found</div>
            ) : sessionList.length === 0 ? (
                <div>No sessions found</div>
            ) : (
                <>
                    <div className="flex items-center gap-20">
                        <div className="flex flex-col gap-2">
                            <div className="text-h3 font-semibold">Class & Resource Management</div>
                            <div className="text-subtitle">
                                Effortlessly manage classes, subjects, and resources to ensure
                                students have access to the best education materials. Organize,
                                upload, and track study resources for 8th, 9th, and 10th classes all
                                in one place.
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <MyButton buttonType="primary" scale="large" layoutVariant="default">
                                <Plus />
                                Add Year/Class
                            </MyButton>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <SessionDropdown
                            currentSession={currentSession ?? undefined} // Convert null to undefined
                            onSessionChange={handleSessionChange}
                            className="text-title font-semibold"
                            sessionList={sessionList}
                        />
                    </div>

                    <div className={`grid grid-cols-3 ${open ? "gap-4" : "gap-8"} justify-between`}>
                        {LevelList.map((level, key) => (
                            <div key={key}>
                                <LevelCard
                                    level={level}
                                    onDelete={handleLeveLDelete}
                                    onEdit={handleLevelEdit}
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
