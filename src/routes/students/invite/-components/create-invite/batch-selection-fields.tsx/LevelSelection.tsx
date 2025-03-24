import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { BatchSelectionField } from "./BatchSelectionField";
import { MultiSelect } from "../MultiSelect";
import { SelectionModeType } from "../../../-schema/InviteFormSchema";
import { MaxLimitField } from "./MaxLimitField";
import { MyButton } from "@/components/design-system/button";
import { Check } from "phosphor-react";
import { useLevelsUtility } from "../../../-hooks/useAvailableLevels";
import { useBatchSelection } from "../../../-hooks/useBatchSelection";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

interface LevelSelectionProps {
    course: string | null;
    session: string | null;
    sessionSelectionMode: SelectionModeType;
    courseSelectionMode: SelectionModeType;
    handleMaxLevelsSaved: (maxLevels: boolean) => void;
}

interface LevelOption {
    value: string;
    label: string;
}

/**
 * This component handles the level selection flow:
 * 1. Select level selection mode (institute/student/both)
 * 2. Select levels
 * 3. Set limits for student choices (if applicable)
 * 4. Save the selections
 */
export const LevelSelection = ({
    course,
    session,
    sessionSelectionMode,
    courseSelectionMode,
    handleMaxLevelsSaved,
}: LevelSelectionProps) => {
    const { watch } = useFormContext();
    const { getAvailableLevels, getAvailableLevelsByType } = useLevelsUtility();
    const { addLevels } = useBatchSelection();
    const { getPackageSessionId } = useInstituteDetailsStore();

    // Level selection mode state
    const [levelSelectionMode, setLevelSelectionMode] = useState<SelectionModeType>(
        getLevelSelectionMode(sessionSelectionMode),
    );

    // Level selection state
    const [selectedCompulsoryLevelIds, setSelectedCompulsoryLevelIds] = useState<string[]>([]);
    const [selectedStudentPreferenceLevelIds, setSelectedStudentPreferenceLevelIds] = useState<
        string[]
    >([]);

    // Level data state
    const [availableLevels, setAvailableLevels] = useState<Array<{ id: string; name: string }>>([]);
    const [compulsoryLevels, setCompulsoryLevels] = useState<Array<{ id: string; name: string }>>(
        [],
    );
    const [studentPreferenceLevels, setStudentPreferenceLevels] = useState<
        Array<{ id: string; name: string }>
    >([]);

    const [maxStudentPreferenceLevels, setMaxStudentPreferenceLevels] = useState<number>(1);

    useEffect(() => {
        console.log(maxStudentPreferenceLevels);
    }, []);

    // Tracking state
    const [areLevelsSaved, setAreLevelsSaved] = useState(false);
    const [levelNamesMap, setLevelNamesMap] = useState<Record<string, string>>({});
    const [packageSessionIdsMap, setPackageSessionIdsMap] = useState<Record<string, string>>({});

    // Get the current batches from the form
    const formBatches = watch("batches");

    // Fetch available levels when course/session changes or when selections change
    useEffect(() => {
        if (course && session) {
            // For single dropdown view
            const levels = getAvailableLevels(course, session, formBatches);
            setAvailableLevels(levels);

            // For dual dropdown view (when "both" is selected)
            const { compulsoryLevels, studentPreferenceLevels } = getAvailableLevelsByType(
                course,
                session,
                formBatches,
                selectedCompulsoryLevelIds,
                selectedStudentPreferenceLevelIds,
            );
            setCompulsoryLevels(compulsoryLevels);
            setStudentPreferenceLevels(studentPreferenceLevels);

            // Create mappings for level names and packageSessionIds
            const namesMap: Record<string, string> = {};
            const packageSessionIds: Record<string, string> = {};

            [...levels, ...compulsoryLevels, ...studentPreferenceLevels].forEach((level) => {
                namesMap[level.id] = level.name;

                // Get package session ID for each level and store in map
                if (course && session && level.id) {
                    const packageSessionId = getPackageSessionId({
                        courseId: course,
                        sessionId: session,
                        levelId: level.id,
                    });
                    if (packageSessionId) {
                        packageSessionIds[level.id] = packageSessionId;
                    }
                }
            });

            setLevelNamesMap(namesMap);
            setPackageSessionIdsMap(packageSessionIds);
        } else {
            // Reset state when course/session is unavailable
            setAvailableLevels([]);
            setCompulsoryLevels([]);
            setStudentPreferenceLevels([]);
            setLevelNamesMap({});
            setPackageSessionIdsMap({});
        }
    }, [
        course,
        session,
        formBatches,
        selectedCompulsoryLevelIds,
        selectedStudentPreferenceLevelIds,
        getAvailableLevels,
        getAvailableLevelsByType,
        getPackageSessionId,
    ]);

    // Reset selections when course or session changes
    useEffect(() => {
        setSelectedCompulsoryLevelIds([]);
        setSelectedStudentPreferenceLevelIds([]);
        setAreLevelsSaved(false);
    }, [course, session]);

    // Determine level selection mode based on session mode
    function getLevelSelectionMode(sessionSelectionMode: SelectionModeType): SelectionModeType {
        return sessionSelectionMode === "student" ? "student" : "institute";
    }

    // Update level mode when session mode changes
    useEffect(() => {
        setLevelSelectionMode(getLevelSelectionMode(sessionSelectionMode));
    }, [sessionSelectionMode]);

    const onChangeLevelSelectionMode = (mode: SelectionModeType) => setLevelSelectionMode(mode);

    // Convert available levels to options for MultiSelect
    const levelOptions: LevelOption[] = availableLevels.map((level) => ({
        value: level.id,
        label: level.name,
    }));

    // Create options for compulsory levels dropdown
    const compulsoryLevelOptions: LevelOption[] = compulsoryLevels.map((level) => ({
        value: level.id,
        label: level.name,
    }));

    // Create options for student preference levels dropdown
    const studentPreferenceLevelOptions: LevelOption[] = studentPreferenceLevels.map((level) => ({
        value: level.id,
        label: level.name,
    }));

    // Handle compulsory level selection changes
    const handleCompulsoryLevelChange = (selectedValues: string[]) => {
        setSelectedCompulsoryLevelIds(selectedValues);
    };

    // Handle student preference level selection changes
    const handleStudentPreferenceLevelChange = (selectedValues: string[]) => {
        setSelectedStudentPreferenceLevelIds(selectedValues);
    };

    // Get all selected level IDs
    const getAllSelectedLevelIds = () => {
        return [...selectedCompulsoryLevelIds, ...selectedStudentPreferenceLevelIds];
    };

    // Handle changes to max student preference levels
    const handleMaxStudentPreferenceLevelsChange = (value: number) => {
        setMaxStudentPreferenceLevels(value);
    };

    // Save level selections to the form
    const handleSaveLevels = () => {
        if (course && session && levelSelectionMode) {
            // Handle both mode (compulsory and student preference)
            if (levelSelectionMode === "both") {
                // Add compulsory levels
                if (selectedCompulsoryLevelIds.length > 0) {
                    addLevels(
                        course,
                        session,
                        selectedCompulsoryLevelIds,
                        levelNamesMap,
                        "institute",
                        courseSelectionMode,
                        sessionSelectionMode,
                        packageSessionIdsMap,
                    );
                }

                // Add student preference levels
                if (selectedStudentPreferenceLevelIds.length > 0) {
                    addLevels(
                        course,
                        session,
                        selectedStudentPreferenceLevelIds,
                        levelNamesMap,
                        "student",
                        courseSelectionMode,
                        sessionSelectionMode,
                        packageSessionIdsMap,
                    );
                }
            } else {
                // Handle single mode (either institute or student)
                const selectedLevelIds =
                    levelSelectionMode === "institute"
                        ? selectedCompulsoryLevelIds
                        : selectedStudentPreferenceLevelIds;

                if (selectedLevelIds.length > 0) {
                    addLevels(
                        course,
                        session,
                        selectedLevelIds,
                        levelNamesMap,
                        levelSelectionMode,
                        courseSelectionMode,
                        sessionSelectionMode,
                        packageSessionIdsMap,
                    );
                }
            }
        }

        // Mark levels as saved and notify parent
        setAreLevelsSaved(true);
        if (getAllSelectedLevelIds().length > 0) {
            handleMaxLevelsSaved(true);
        }
    };

    // If levels are already saved, show summary
    if (areLevelsSaved) {
        return (
            <div className="flex justify-between gap-3 rounded-md bg-gray-50 p-3">
                <p>
                    {getAllSelectedLevelIds().length} Levels Selected (
                    {selectedCompulsoryLevelIds.length} Compulsory,{" "}
                    {selectedStudentPreferenceLevelIds.length} Student Preference)
                </p>
                <div className="flex items-center gap-2">
                    {(levelSelectionMode === "student" ||
                        (levelSelectionMode === "both" &&
                            selectedStudentPreferenceLevelIds.length > 0)) && (
                        <MaxLimitField
                            title="Levels"
                            maxAllowed={selectedStudentPreferenceLevelIds.length}
                            isDisabled={true}
                        />
                    )}
                    <MyButton
                        buttonType="secondary"
                        scale="medium"
                        layoutVariant="icon"
                        type="button"
                        onClick={() => handleMaxLevelsSaved(true)}
                    >
                        <Check />
                    </MyButton>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <BatchSelectionField
                title={"Level"}
                isPreSelectionDisabled={sessionSelectionMode === "student"}
                mode={levelSelectionMode}
                onChangeMode={onChangeLevelSelectionMode}
                bothEnabled={sessionSelectionMode === "institute"}
            />

            {/* Level selection UI based on mode */}
            {levelSelectionMode === "both" ? (
                // Show two dropdowns for both compulsory and student preference levels
                <div className="flex flex-col gap-4">
                    {/* Compulsory Levels Dropdown */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                            <p>
                                Compulsory Levels
                                <span className="text-subtitle text-danger-600">*</span>
                            </p>
                            <MultiSelect
                                options={compulsoryLevelOptions}
                                onValueChange={handleCompulsoryLevelChange}
                                value={selectedCompulsoryLevelIds}
                                placeholder="Select Compulsory Levels"
                                disabled={compulsoryLevels.length === 0}
                            />
                        </div>
                    </div>

                    {/* Student Preference Levels Dropdown */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                            <p>
                                Student Preference Levels
                                <span className="text-subtitle text-danger-600">*</span>
                            </p>
                            <MultiSelect
                                options={studentPreferenceLevelOptions}
                                onValueChange={handleStudentPreferenceLevelChange}
                                value={selectedStudentPreferenceLevelIds}
                                placeholder="Select Student Preference Levels"
                                disabled={studentPreferenceLevels.length === 0}
                            />
                        </div>
                        {selectedStudentPreferenceLevelIds.length > 0 && (
                            <MaxLimitField
                                title="Student Preference Levels"
                                maxAllowed={selectedStudentPreferenceLevelIds.length}
                                onMaxChange={handleMaxStudentPreferenceLevelsChange}
                            />
                        )}
                    </div>
                </div>
            ) : (
                // Show single dropdown for either compulsory or student preference levels
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                        <p>
                            {levelSelectionMode === "institute"
                                ? "Compulsory"
                                : "Student Preference"}{" "}
                            Levels
                            <span className="text-subtitle text-danger-600">*</span>
                        </p>
                        <MultiSelect
                            options={levelOptions}
                            onValueChange={
                                levelSelectionMode === "institute"
                                    ? handleCompulsoryLevelChange
                                    : handleStudentPreferenceLevelChange
                            }
                            value={
                                levelSelectionMode === "institute"
                                    ? selectedCompulsoryLevelIds
                                    : selectedStudentPreferenceLevelIds
                            }
                            placeholder={`Select Levels`}
                            disabled={availableLevels.length === 0}
                        />
                    </div>
                    {levelSelectionMode === "student" &&
                        selectedStudentPreferenceLevelIds.length > 0 && (
                            <MaxLimitField
                                title={"Student Preference Levels"}
                                maxAllowed={selectedStudentPreferenceLevelIds.length}
                                onMaxChange={handleMaxStudentPreferenceLevelsChange}
                            />
                        )}
                </div>
            )}

            {/* Save button - show when any levels are selected */}
            <div className="mt-4 flex justify-end">
                {getAllSelectedLevelIds().length > 0 && (
                    <MyButton
                        buttonType="primary"
                        scale="small"
                        layoutVariant="default"
                        type="button"
                        onClick={handleSaveLevels}
                    >
                        Save
                    </MyButton>
                )}
            </div>
        </div>
    );
};
