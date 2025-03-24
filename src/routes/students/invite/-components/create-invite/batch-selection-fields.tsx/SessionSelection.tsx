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

interface SessionSelectionProps {
    course: string | null;
    courseSelectionMode: SelectionModeType;
    handleSessionLevelsSelected: (selected: boolean) => void;
}

export const SessionSelection = ({
    course,
    courseSelectionMode,
    handleSessionLevelsSelected,
}: SessionSelectionProps) => {
    const { watch } = useFormContext(); // Access the form context to get current form values
    const { getAvailableSessions } = useSessionsUtility();

    const [sessionSelectionMode, setSessionSelectionMode] = useState<SelectionModeType>(
        getSessionSelectionMode(courseSelectionMode),
    );
    const [maxLevelsSaved, setMaxLevelsSaved] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
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
    }, [course, formBatches]);

    useEffect(() => {
        if (selectedSessionId != null && maxLevelsSaved) {
            handleSessionLevelsSelected(true);
        } else {
            handleSessionLevelsSelected(false);
        }
    }, [selectedSessionId, maxLevelsSaved, handleSessionLevelsSelected]);

    // Reset selected session and maxLevelsSaved when course changes
    useEffect(() => {
        setSelectedSessionId(null);
        setMaxLevelsSaved(false);
    }, [course]);

    const handleMaxLevelsSaved = (maxLevels: boolean) => setMaxLevelsSaved(maxLevels);

    function getSessionSelectionMode(courseSelectionMode: SelectionModeType) {
        return courseSelectionMode === "student" ? "student" : "institute";
    }

    useEffect(() => {
        setSessionSelectionMode(getSessionSelectionMode(courseSelectionMode));
    }, [courseSelectionMode]);

    const onChangeSessionSelectionMode = (mode: SelectionModeType) => setSessionSelectionMode(mode);

    return (
        <>
            <div className="flex flex-col gap-8">
                <BatchSelectionField
                    title={"Session"}
                    isPreSelectionDisabled={courseSelectionMode === "student"}
                    mode={sessionSelectionMode}
                    onChangeMode={onChangeSessionSelectionMode}
                />
                <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col items-start gap-2">
                        <div className="flex w-fit items-center gap-4">
                            <p>
                                {sessionSelectionMode === "institute"
                                    ? "Compulsory"
                                    : "Student Preference"}{" "}
                                Sessions
                                <span className="text-subtitle text-danger-600">*</span>
                            </p>
                            <Select
                                onValueChange={(value) => setSelectedSessionId(value)}
                                value={selectedSessionId || undefined}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a Session" />
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
                    </div>
                </div>
                {/* Add the condition to show the below section only if session is selected */}
                {selectedSessionId != null &&
                    (maxLevelsSaved ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <p>Level list from session</p>
                                <MyButton
                                    buttonType="secondary"
                                    scale="medium"
                                    layoutVariant="icon"
                                    onClick={() => setMaxLevelsSaved(false)}
                                >
                                    <PencilSimple />
                                </MyButton>
                            </div>
                        </div>
                    ) : (
                        <LevelSelection
                            course={course}
                            session={selectedSessionId}
                            sessionSelectionMode={sessionSelectionMode}
                            handleMaxLevelsSaved={handleMaxLevelsSaved}
                        />
                    ))}
            </div>
        </>
    );
};
