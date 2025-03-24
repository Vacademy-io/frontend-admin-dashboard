import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { BatchSelectionField } from "./BatchSelectionField";
import { LevelSelection } from "./LevelSelection";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
} from "@/components/ui/select";
import { SelectionModeType } from "../../../-schema/InviteFormSchema";
import { MyButton } from "@/components/design-system/button";
import { PencilSimple } from "phosphor-react";
import { useSessionsUtility } from "../../../-hooks/useAvailableSessions";
import { useBatchSelection } from "../../../-hooks/useBatchSelection";

interface SessionSelectionProps {
    course: string | null;
    courseSelectionMode: SelectionModeType;
    handleSessionLevelsSelected: (selected: boolean) => void;
}

/**
 * This component handles the session selection flow:
 * 1. Select session & mode (institute/student)
 * 2. Save session
 * 3. Select levels & mode
 * 4. Set limits for learner choices
 * 5. Save levels
 */
export const SessionSelection = ({
    course,
    courseSelectionMode,
    handleSessionLevelsSelected,
}: SessionSelectionProps) => {
    const { watch } = useFormContext();
    const { getAvailableSessions } = useSessionsUtility();
    const { addSession } = useBatchSelection();

    // Session selection state
    const [sessionSelectionMode, setSessionSelectionMode] = useState<SelectionModeType>(
        getSessionSelectionMode(courseSelectionMode),
    );
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [selectedSessionName, setSelectedSessionName] = useState<string>("");
    const [sessionSaved, setSessionSaved] = useState(false);

    // Level selection state
    const [maxLevelsSaved, setMaxLevelsSaved] = useState(false);

    // Available sessions from API
    const [availableSessions, setAvailableSessions] = useState<Array<{ id: string; name: string }>>(
        [],
    );

    // Get the current batches from the form
    const formBatches = watch("batches");

    // Update available sessions when course changes or when form batches change
    useEffect(() => {
        if (course) {
            const sessions = getAvailableSessions(course, formBatches);
            setAvailableSessions(sessions);
        } else {
            setAvailableSessions([]);
        }
    }, [course, formBatches, getAvailableSessions]);

    // Notify parent when levels are completely selected
    useEffect(() => {
        if (sessionSaved && maxLevelsSaved) {
            handleSessionLevelsSelected(true);
        } else {
            handleSessionLevelsSelected(false);
        }
    }, [sessionSaved, maxLevelsSaved, handleSessionLevelsSelected]);

    // Reset states when course changes
    useEffect(() => {
        setSelectedSessionId(null);
        setSelectedSessionName("");
        setSessionSaved(false);
        setMaxLevelsSaved(false);
    }, [course]);

    // Handler when levels are fully saved
    const handleMaxLevelsSaved = (levelsSaved: boolean) => {
        setMaxLevelsSaved(levelsSaved);
    };

    function getSessionSelectionMode(courseSelectionMode: SelectionModeType) {
        return courseSelectionMode === "student" ? "student" : "institute";
    }

    // Update session mode when course mode changes
    useEffect(() => {
        setSessionSelectionMode(getSessionSelectionMode(courseSelectionMode));
    }, [courseSelectionMode]);

    const onChangeSessionSelectionMode = (mode: SelectionModeType) => setSessionSelectionMode(mode);

    const handleSessionSelection = (sessionId: string) => {
        const session = availableSessions.find((s) => s.id === sessionId);
        if (session) {
            setSelectedSessionId(sessionId);
            setSelectedSessionName(session.name);
        }
    };

    const handleSaveSession = () => {
        if (course && selectedSessionId && selectedSessionName) {
            // Add the session to the form with default max level (updated later if needed)
            addSession(
                course,
                selectedSessionId,
                selectedSessionName,
                sessionSelectionMode,
                courseSelectionMode,
                1, // Default max levels, will be updated later
            );
            setSessionSaved(true);
        }
    };

    // Handler to edit level selections
    const handleEditLevels = () => {
        setMaxLevelsSaved(false);
    };

    return (
        <div className="flex flex-col gap-6 rounded-md border p-4">
            <BatchSelectionField
                title={"Session"}
                isPreSelectionDisabled={courseSelectionMode === "student"}
                mode={sessionSelectionMode}
                onChangeMode={onChangeSessionSelectionMode}
            />

            <div className="flex items-center gap-2">
                <div className="flex w-fit items-center gap-4">
                    <p>
                        {sessionSelectionMode === "institute" ? "Compulsory" : "Student Preference"}{" "}
                        Sessions
                        <span className="text-subtitle text-danger-600">*</span>
                    </p>
                    {sessionSaved && selectedSessionName}
                    <Select
                        onValueChange={handleSessionSelection}
                        value={selectedSessionId || undefined}
                        disabled={sessionSaved}
                    >
                        <SelectTrigger
                            className={`w-[180px] ${sessionSaved ? "hidden" : "visible"}`}
                        >
                            <SelectValue
                                placeholder={
                                    sessionSaved ? selectedSessionName : "Select a Session"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Available Sessions</SelectLabel>
                                {availableSessions.length > 0 ? (
                                    availableSessions.map((session) => (
                                        <SelectItem key={session.id} value={session.id}>
                                            {session.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-sessions" disabled>
                                        No available sessions
                                    </SelectItem>
                                )}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                {/* Save Session Button */}
                {selectedSessionId && !sessionSaved && (
                    <div className="mt-2">
                        <MyButton buttonType="primary" scale="small" onClick={handleSaveSession}>
                            Save Session
                        </MyButton>
                    </div>
                )}
            </div>

            {/* Level Selection Section */}
            {sessionSaved && (
                <div className="mt-2">
                    {maxLevelsSaved ? (
                        <div className="flex items-center justify-between rounded-md bg-gray-50 p-3">
                            <p>Level selections saved successfully</p>
                            <MyButton
                                buttonType="secondary"
                                scale="small"
                                layoutVariant="icon"
                                onClick={handleEditLevels}
                            >
                                <PencilSimple />
                            </MyButton>
                        </div>
                    ) : (
                        <LevelSelection
                            course={course}
                            session={selectedSessionId}
                            sessionSelectionMode={sessionSelectionMode}
                            courseSelectionMode={courseSelectionMode}
                            handleMaxLevelsSaved={handleMaxLevelsSaved}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
