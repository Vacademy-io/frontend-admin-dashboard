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
    const { getAvailableLevels } = useLevelsUtility();

    const [levelSelectionMode, setLevelSelectionMode] = useState<SelectionModeType>(
        getLevelSelectionMode(sessionSelectionMode),
    );
    const [areLevelsSaved, setAreLevelsSaved] = useState(false);
    const [availableLevels, setAvailableLevels] = useState<Array<{ id: string; name: string }>>([]);
    const [selectedLevelIds, setSelectedLevelIds] = useState<string[]>([]);

    // Get the current batches from the form
    const formBatches = watch("batches");

    // Update available levels when course or session changes or when form batches change
    useEffect(() => {
        if (course && session) {
            const levels = getAvailableLevels(course, session, formBatches);
            setAvailableLevels(levels);
        } else {
            setAvailableLevels([]);
        }
    }, [course, session, formBatches]);

    // Reset selections when course or session changes
    useEffect(() => {
        setSelectedLevelIds([]);
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

    // Handle level selection changes
    const handleLevelChange = (selectedValues: string[]) => {
        setSelectedLevelIds(selectedValues);
    };

    // Save levels and notify parent component
    const handleSaveLevels = () => {
        setAreLevelsSaved(true);

        // If there are selected levels, allow passing to next step
        if (selectedLevelIds.length > 0) {
            handleMaxLevelsSaved(true);
        }
    };

    return areLevelsSaved ? (
        <div className="flex justify-between gap-3">
            <p>
                {selectedLevelIds.length}{" "}
                {levelSelectionMode === "institute" ? "Compulsory" : "Student Preference"} Level
                {selectedLevelIds.length !== 1 ? "s" : ""} Selected
            </p>
            <div className="flex items-center gap-2">
                <MaxLimitField title="Levels" maxAllowed={selectedLevelIds.length} />
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
    ) : (
        <div className="flex flex-col gap-4">
            <BatchSelectionField
                title={"Level"}
                isPreSelectionDisabled={sessionSelectionMode === "student"}
                mode={levelSelectionMode}
                onChangeMode={onChangeLevelSelectionMode}
            />
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
                            onValueChange={handleLevelChange}
                            value={selectedLevelIds}
                            placeholder={`Select Levels`}
                            disabled={availableLevels.length === 0}
                        />
                    </div>
                    <div>
                        {selectedLevelIds.length > 0 && (
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
            </div>
        </div>
    );
};
