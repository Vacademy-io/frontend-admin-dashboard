import { useSessionManager } from "../../../../-hooks/useSessionManager";
import { PreSelectedCourse } from "@/routes/students/invite/-schema/InviteFormSchema";
import { SessionSelection } from "./SessionSelection";
import { MyButton } from "@/components/design-system/button";
import { useState } from "react";
import { Check, PencilSimple } from "phosphor-react";
import { MaxLimitField } from "../MaxLimitField";

interface SessionListProps {
    courseId: string;
    isCourseCompulsory: boolean;
    maxSessions?: number;
}

// Type guard
// eslint-disable-next-line
function isPreSelectedCourse(course: any): course is PreSelectedCourse {
    return "preSelectedSessions" in course;
}

export const SessionList = ({ courseId, isCourseCompulsory, maxSessions }: SessionListProps) => {
    const { getCourse, getAllAvailableSessions, setMaxSessions } = useSessionManager(
        courseId,
        isCourseCompulsory,
    );
    const { course } = getCourse();
    const [isAddingSession, setIsAddingSession] = useState(false);
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [isMaxValueSaved, setIsMaxValueSaved] = useState(false);

    const availableSessions = getAllAvailableSessions();
    // Get preSelectedSessions
    const preSelectedSessions =
        course && isPreSelectedCourse(course) ? course.preSelectedSessions || [] : [];

    // Get learnerChoiceSessions (available for both course types)
    const learnerChoiceSessions = course ? course.learnerChoiceSessions || [] : [];

    // Default to 0 if maxSessions not provided in props and not on course
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
        setIsSavingAll(true);
        setIsAddingSession(false);
    };

    // Handle save max value button click
    const handleSaveMaxValue = () => {
        setIsMaxValueSaved(true);
    };

    // Handle edit max value button click
    const handleEditMaxValue = () => {
        setIsMaxValueSaved(false);
        setIsSavingAll(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
                <p className="text-title font-semibold">Sessions</p>

                {/* Show Save All button when not adding a session */}
                {!isAddingSession &&
                    (learnerChoiceSessions.length > 0 || preSelectedSessions.length > 0) && (
                        <MyButton onClick={handleSaveAll} type="button" scale="small">
                            Save All
                        </MyButton>
                    )}
            </div>

            {/* Sessions List */}
            <div className="flex flex-col gap-4">
                {/* Display Compulsory (PreSelected) Sessions if present */}
                {preSelectedSessions.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <p className="text-subtitle font-medium">Compulsory Sessions</p>
                        <ul className="list-disc pl-5">
                            {preSelectedSessions.map((session) => (
                                <SessionSelection
                                    key={session.id}
                                    courseId={courseId}
                                    isCourseCompulsory={isCourseCompulsory}
                                    sessionId={session.id}
                                    isSessionCompulsory={true}
                                />
                            ))}
                        </ul>
                    </div>
                )}

                {/* Display Learner Choice Sessions if present */}
                {learnerChoiceSessions.length > 0 && (
                    <div className="flex flex-col gap-2 border border-neutral-300">
                        <p className="text-subtitle font-medium">Learner Choice Sessions</p>
                        <ul className="list-disc pl-5">
                            {learnerChoiceSessions.map((session) => (
                                <SessionSelection
                                    key={session.id}
                                    courseId={courseId}
                                    isCourseCompulsory={isCourseCompulsory}
                                    sessionId={session.id}
                                    isSessionCompulsory={false}
                                />
                            ))}
                        </ul>
                    </div>
                )}

                {/* Show a message if no sessions are present */}
                {preSelectedSessions.length === 0 &&
                    learnerChoiceSessions.length === 0 &&
                    !isAddingSession && <p>No sessions added yet</p>}
            </div>

            {/* <Separator /> */}

            {/* Max Limit Field Section - visible when Save All clicked */}
            {isSavingAll && !isMaxValueSaved && (
                <div className="flex items-center gap-2">
                    <MaxLimitField
                        title="Session"
                        maxAllowed={10}
                        maxValue={currentMaxSessions}
                        onMaxChange={handleMaxSessionsChange}
                    />
                    <MyButton
                        buttonType="secondary"
                        scale="medium"
                        layoutVariant="icon"
                        onClick={handleSaveMaxValue}
                        type="button"
                    >
                        <Check />
                    </MyButton>
                </div>
            )}

            {/* Max Value Display with Edit Button - visible after saving max value */}
            {isSavingAll && isMaxValueSaved && (
                <div className="flex items-center justify-between rounded-md border border-neutral-200 p-3">
                    <div className="flex flex-col">
                        <p className="text-subtitle font-semibold">Maximum Sessions</p>
                        <p className="text-body">{currentMaxSessions}</p>
                    </div>
                    <MyButton
                        buttonType="secondary"
                        scale="small"
                        layoutVariant="icon"
                        onClick={handleEditMaxValue}
                        type="button"
                    >
                        <PencilSimple />
                    </MyButton>
                </div>
            )}

            {/* Add Session button or Session form */}
            {!isSavingAll && availableSessions.length > 0 && !isAddingSession && (
                <MyButton onClick={() => setIsAddingSession(true)} type="button" scale="small">
                    Add session
                </MyButton>
            )}

            {/* Session Selection form when adding a session */}
            {!isSavingAll && isAddingSession && (
                <div className="flex items-center gap-1">
                    <SessionSelection courseId={courseId} isCourseCompulsory={isCourseCompulsory} />
                    {/* <MyButton
                        buttonType="primary"
                        layoutVariant="icon"
                        onClick={() => setIsAddingSession(false)}
                        type="button"
                    >
                        <Check />
                    </MyButton> */}
                </div>
            )}
        </div>
    );
};
