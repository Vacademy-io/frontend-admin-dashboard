import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { BatchSelectionField } from "./BatchSelectionField";
import { MultiSelect } from "../MultiSelect";
import { SelectionModeType } from "../../../-schema/InviteFormSchema";
import { MaxLimitField } from "./MaxLimitField";
import { MyButton } from "@/components/design-system/button";
import { Check } from "phosphor-react";
import { useLevelsUtility } from "../../../-hooks/useAvailableLevels";

interface LevelSelectionProps {
    course: string | null;
    session: string | null;
    sessionSelectionMode: SelectionModeType;
    handleMaxLevelsSaved: (maxLevels: boolean) => void;
}

interface LevelOption {
    value: string;
    label: string;
}

export const LevelSelection = ({
    course,
    session,
    sessionSelectionMode,
    handleMaxLevelsSaved,
}: LevelSelectionProps) => {
    const { watch } = useFormContext(); // Access the form context to get current form values
    const { getAvailableLevels, getAvailableLevelsByType } = useLevelsUtility();

    const [levelSelectionMode, setLevelSelectionMode] = useState<SelectionModeType>(
        getLevelSelectionMode(sessionSelectionMode),
    );
    const [areLevelsSaved, setAreLevelsSaved] = useState(false);
    const [availableLevels, setAvailableLevels] = useState<Array<{ id: string; name: string }>>([]);
    const [compulsoryLevels, setCompulsoryLevels] = useState<Array<{ id: string; name: string }>>(
        [],
    );
    const [studentPreferenceLevels, setStudentPreferenceLevels] = useState<
        Array<{ id: string; name: string }>
    >([]);
    const [selectedCompulsoryLevelIds, setSelectedCompulsoryLevelIds] = useState<string[]>([]);
    const [selectedStudentPreferenceLevelIds, setSelectedStudentPreferenceLevelIds] = useState<
        string[]
    >([]);

    // Get the current batches from the form
    const formBatches = watch("batches");

    // Update available levels when course or session changes or when form batches change
    useEffect(() => {
        if (course && session) {
            // For the single dropdown view
            const levels = getAvailableLevels(course, session, formBatches);
            setAvailableLevels(levels);

            // For the dual dropdown view (when "both" is selected)
            const { compulsoryLevels, studentPreferenceLevels } = getAvailableLevelsByType(
                course,
                session,
                formBatches,
                selectedCompulsoryLevelIds,
                selectedStudentPreferenceLevelIds,
            );
            setCompulsoryLevels(compulsoryLevels);
            setStudentPreferenceLevels(studentPreferenceLevels);
        } else {
            setAvailableLevels([]);
            setCompulsoryLevels([]);
            setStudentPreferenceLevels([]);
        }
    }, [
        course,
        session,
        formBatches,
        selectedCompulsoryLevelIds,
        selectedStudentPreferenceLevelIds,
    ]);

    // Reset selections when course or session changes
    useEffect(() => {
        setSelectedCompulsoryLevelIds([]);
        setSelectedStudentPreferenceLevelIds([]);
        setAreLevelsSaved(false);
    }, [course, session]);

    function getLevelSelectionMode(sessionSelectionMode: SelectionModeType) {
        return sessionSelectionMode === "student" ? "student" : "institute";
    }

    useEffect(() => {
        setLevelSelectionMode(getLevelSelectionMode(sessionSelectionMode));
    }, [sessionSelectionMode]);

    const onChangeLevelSelectionMode = (mode: SelectionModeType) => setLevelSelectionMode(mode);

    // Convert available levels to options format for MultiSelect component
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

    // Handle level selection changes
    const handleCompulsoryLevelChange = (selectedValues: string[]) => {
        setSelectedCompulsoryLevelIds(selectedValues);

        // This will trigger the useEffect to refresh available options in the other dropdown
        if (course && session) {
            const { compulsoryLevels, studentPreferenceLevels } = getAvailableLevelsByType(
                course,
                session,
                formBatches,
                selectedValues,
                selectedStudentPreferenceLevelIds,
            );
            setCompulsoryLevels(compulsoryLevels);
            setStudentPreferenceLevels(studentPreferenceLevels);
        }
    };

    const handleStudentPreferenceLevelChange = (selectedValues: string[]) => {
        setSelectedStudentPreferenceLevelIds(selectedValues);

        // This will trigger the useEffect to refresh available options in the other dropdown
        if (course && session) {
            const { compulsoryLevels, studentPreferenceLevels } = getAvailableLevelsByType(
                course,
                session,
                formBatches,
                selectedCompulsoryLevelIds,
                selectedValues,
            );
            setCompulsoryLevels(compulsoryLevels);
            setStudentPreferenceLevels(studentPreferenceLevels);
        }
    };

    // Combined selected level IDs for total count and validation
    const getAllSelectedLevelIds = () => {
        return [...selectedCompulsoryLevelIds, ...selectedStudentPreferenceLevelIds];
    };

    // Save levels and notify parent component
    const handleSaveLevels = () => {
        setAreLevelsSaved(true);

        // If there are selected levels, allow passing to next step
        if (getAllSelectedLevelIds().length > 0) {
            handleMaxLevelsSaved(true);
        }
    };

    // Render different UI based on selection mode and saved state
    if (areLevelsSaved) {
        return (
            <div className="flex justify-between gap-3">
                <p>
                    {getAllSelectedLevelIds().length} Levels Selected (
                    {selectedCompulsoryLevelIds.length} Compulsory,{" "}
                    {selectedStudentPreferenceLevelIds.length} Student Preference)
                </p>
                <div className="flex items-center gap-2">
                    <MaxLimitField title="Levels" maxAllowed={getAllSelectedLevelIds().length} />
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

            {/* Determine what UI to show based on levelSelectionMode */}
            {levelSelectionMode === "both" ? (
                // Show two separate dropdowns when "both" is selected
                <div className="flex gap-4">
                    {/* Compulsory Levels Dropdown */}
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
                            disabled={availableLevels.length === 0}
                        />
                    </div>

                    {/* Student Preference Levels Dropdown */}
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
                            disabled={availableLevels.length === 0}
                        />
                    </div>
                </div>
            ) : (
                // Show single dropdown when either "institute" or "student" is selected
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                        <div className="flex w-fit items-center gap-4">
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
                    </div>
                </div>
            )}

            {/* Save button - show when any levels are selected */}
            <div className="flex justify-end">
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
