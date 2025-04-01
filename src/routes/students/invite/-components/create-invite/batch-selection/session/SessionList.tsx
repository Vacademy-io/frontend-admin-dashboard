import { useSessionManager } from "../../../../-hooks/useSessionManager";
import { PreSelectedCourse } from "@/routes/students/invite/-schema/InviteFormSchema";
import { SessionSelection } from "./SessionSelection";
import { MyButton } from "@/components/design-system/button";
import { useEffect, useState } from "react";
import { MaxLimitField } from "../MaxLimitField";

interface SessionListProps {
    courseId: string;
    isCourseCompulsory: boolean;
    maxSessions?: number;
    handleIsAddingSession: (value: boolean) => void;
    isAddingSession: boolean;
}

// Type guard
// eslint-disable-next-line
function isPreSelectedCourse(course: any): course is PreSelectedCourse {
    return "preSelectedSessions" in course;
}

export const SessionList = ({
    courseId,
    isCourseCompulsory,
    maxSessions,
    handleIsAddingSession,
    isAddingSession,
}: SessionListProps) => {
    const { getCourse, getAllAvailableSessions, setMaxSessions } = useSessionManager(
        courseId,
        isCourseCompulsory,
    );
    const { course } = getCourse();
    const [isMaxLimitSaved, setIsMaxLimitSaved] = useState(false);
    useEffect(() => {
        console.log("is max limit saved: ", isMaxLimitSaved);
    }, []);
    const handleIsMaxLimitSaved = (value: boolean) => setIsMaxLimitSaved(value);
    const availableSessions = getAllAvailableSessions();

    const preSelectedSessions =
        course && isPreSelectedCourse(course) ? course.preSelectedSessions || [] : [];
    const learnerChoiceSessions = course ? course.learnerChoiceSessions || [] : [];
    const currentMaxSessions = maxSessions || course?.maxSessions || 0;

    // Handle max sessions change
    const handleMaxSessionsChange = (value: number) => {
        const success = setMaxSessions(value);
        if (success) {
            console.log("Max sessions updated to:", value);
        }
    };

    // Handle save all button click
    const handleSaveAll = () => {
        handleIsAddingSession(false);
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between gap-2">
                <p className="text-subtitle font-semibold underline">Sessions</p>

                {/* Show Save All button when not adding a session */}
                {!isAddingSession &&
                    (learnerChoiceSessions.length > 0 || preSelectedSessions.length > 0) && (
                        <MyButton onClick={handleSaveAll} type="button" scale="small">
                            Save All
                        </MyButton>
                    )}

                {/* MaxLimitField will handle its own editing/saving state */}
                {learnerChoiceSessions.length > 0 && (
                    <MaxLimitField
                        title="Session"
                        maxAllowed={10}
                        maxValue={currentMaxSessions}
                        onMaxChange={handleMaxSessionsChange}
                        handleIsMaxLimitSaved={handleIsMaxLimitSaved}
                    />
                )}
            </div>

            {preSelectedSessions.length === 0 &&
                learnerChoiceSessions.length === 0 &&
                !isAddingSession && (
                    <p className="text-body text-neutral-500">No sessions added yet</p>
                )}

            {/* Add Session button or Session form */}
            {availableSessions.length > 0 && !isAddingSession && (
                <MyButton
                    onClick={() => handleIsAddingSession(true)}
                    type="button"
                    scale="small"
                    buttonType="text"
                    className="w-fit px-0 text-primary-500"
                >
                    Add session
                </MyButton>
            )}

            {/* Session Selection form when adding a session */}
            {isAddingSession && (
                <div className="flex items-center gap-1">
                    <SessionSelection
                        courseId={courseId}
                        isCourseCompulsory={isCourseCompulsory}
                        handleIsAddingSession={handleIsAddingSession}
                    />
                </div>
            )}
        </div>
    );
};
