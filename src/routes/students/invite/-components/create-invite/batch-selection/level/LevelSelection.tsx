import { LevelField, SelectionMode } from "@/routes/students/invite/-schema/InviteFormSchema";
import { useLevelManager } from "../../../../-hooks/useLevelManager";
import { BatchSelectionMode } from "../BatchSelectionMode";
import { useEffect, useState } from "react";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import MultiSelectDropdown from "@/components/design-system/multiple-select-field";
import { useForm, FormProvider } from "react-hook-form";
import { MaxLimitField } from "../MaxLimitField";
import { Badge } from "@/components/ui/badge";
import { MyButton } from "@/components/design-system/button";
import { Check, PencilSimple } from "phosphor-react";

interface LevelSelectionProps {
    courseId: string;
    isCourseCompulsory: boolean;
    sessionId: string;
    isSessionCompulsory: boolean;
    levelSelectionMode: SelectionMode;
    preSelectedLevels: LevelField[];
    learnerChoiceLevels: LevelField[];
    maxLevels: number;
}

export const LevelSelection = ({
    courseId,
    isCourseCompulsory,
    sessionId,
    isSessionCompulsory,
    levelSelectionMode,
    preSelectedLevels,
    learnerChoiceLevels,
    maxLevels,
}: LevelSelectionProps) => {
    const {
        getLearnerChoiceLevelsLength,
        addLevel,
        deleteLevel,
        changeLevelSelectionMode,
        setMaxLevels,
    } = useLevelManager(courseId, isCourseCompulsory, sessionId, isSessionCompulsory);

    // Local state for selection mode that doesn't affect the form until save
    const [localSelectionMode, setLocalSelectionMode] = useState<SelectionMode>(levelSelectionMode);
    const [localMaxLevels, setLocalMaxLevels] = useState<number>(maxLevels);
    const [isSaved, setIsSaved] = useState<boolean>(false);

    const { getLevelsFromPackage, getPackageSessionId } = useInstituteDetailsStore();

    // Transform levelList to match the MultiSelectDropdown component's options format
    const rawLevelList = getLevelsFromPackage({ courseId, sessionId });
    const levelOptions = rawLevelList.map((level) => ({
        _id: level.id,
        value: level.id,
        label: level.name,
    }));

    // Create a form for the multi-select fields with the roleType field that MultiSelectDropdown expects
    const localForm = useForm({
        defaultValues: {
            compulsoryLevels: preSelectedLevels.map((level) => level.id),
            learnerChoiceLevels: learnerChoiceLevels.map((level) => level.id),
            roleType: [], // Add this to match what MultiSelectDropdown expects
        },
    });

    // Handle local selection mode changes (doesn't affect form yet)
    const handleLocalSelectionModeChange = (mode: SelectionMode) => {
        setLocalSelectionMode(mode);

        // Reset appropriate dropdowns based on new mode
        if (mode === "institute") {
            localForm.setValue("learnerChoiceLevels", []);
        } else if (mode === "student") {
            localForm.setValue("compulsoryLevels", []);
        }
    };

    // Keep track of selected values in both dropdowns to filter options
    const [compulsorySelected, setCompulsorySelected] = useState<string[]>(
        preSelectedLevels.map((level) => level.id),
    );

    const [learnerChoiceSelected, setLearnerChoiceSelected] = useState<string[]>(
        learnerChoiceLevels.map((level) => level.id),
    );

    // Update state when selections change for filtering purposes only
    useEffect(() => {
        const values = localForm.getValues("compulsoryLevels");
        if (Array.isArray(values)) {
            setCompulsorySelected(values);
        }
    }, [localForm.watch("compulsoryLevels")]);

    useEffect(() => {
        const values = localForm.getValues("learnerChoiceLevels");
        if (Array.isArray(values)) {
            setLearnerChoiceSelected(values);
        }
    }, [localForm.watch("learnerChoiceLevels")]);

    // Filter options for each dropdown to exclude levels selected in the other
    const compulsoryOptions = levelOptions.filter(
        (option) => !learnerChoiceSelected.includes(option.value.toString()),
    );

    const learnerChoiceOptions = levelOptions.filter(
        (option) => !compulsorySelected.includes(option.value.toString()),
    );

    // Handle save button click
    const handleSave = () => {
        // Update the selection mode in the form
        changeLevelSelectionMode(localSelectionMode);

        // Update max levels in the form
        setMaxLevels(localMaxLevels);

        // Get the current values from the form
        const compulsoryLevelIds = localForm.getValues("compulsoryLevels") || [];
        const learnerChoiceLevelIds = localForm.getValues("learnerChoiceLevels") || [];

        // Clear existing levels to avoid duplicates
        preSelectedLevels.forEach((level) => {
            deleteLevel(level.id, true);
        });

        learnerChoiceLevels.forEach((level) => {
            deleteLevel(level.id, false);
        });

        // Add new compulsory levels
        if (Array.isArray(compulsoryLevelIds)) {
            compulsoryLevelIds.forEach((id) => {
                const level = rawLevelList.find((l) => l.id === id);
                if (level) {
                    const packageSessionId =
                        getPackageSessionId({
                            courseId: courseId,
                            sessionId: sessionId,
                            levelId: level.id,
                        }) || "";
                    addLevel(level.id, level.name, packageSessionId, true);
                }
            });
        }

        // Add new learner choice levels
        if (Array.isArray(learnerChoiceLevelIds)) {
            learnerChoiceLevelIds.forEach((id) => {
                const level = rawLevelList.find((l) => l.id === id);
                if (level) {
                    const packageSessionId =
                        getPackageSessionId({
                            courseId: courseId,
                            sessionId: sessionId,
                            levelId: level.id,
                        }) || "";
                    addLevel(level.id, level.name, packageSessionId, false);
                }
            });
        }

        // Set state to show saved view
        setIsSaved(true);
    };

    // Handle max level change
    const handleMaxLevelChange = (value: number) => {
        setLocalMaxLevels(value);
    };

    // Handle edit button click
    const handleEdit = () => {
        setIsSaved(false);
    };

    // Get the current learner choice levels length
    const learnerChoiceLength = getLearnerChoiceLevelsLength();

    // Prepare data for the saved view
    const selectedLevels = [
        ...preSelectedLevels.map((level) => ({ ...level, type: "compulsory" as const })),
        ...learnerChoiceLevels.map((level) => ({ ...level, type: "learnerChoice" as const })),
    ];

    return (
        <div className="flex flex-col gap-6">
            {!isSaved ? (
                <>
                    <BatchSelectionMode
                        title="Level"
                        parentSelectionMode={isSessionCompulsory ? "student" : "institute"}
                        bothEnabled={true}
                        mode={localSelectionMode}
                        onChangeMode={handleLocalSelectionModeChange}
                    />

                    <MaxLimitField
                        title="Level"
                        maxAllowed={learnerChoiceLength}
                        maxValue={localMaxLevels}
                        onMaxChange={handleMaxLevelChange}
                    />

                    <FormProvider {...localForm}>
                        <div className="flex flex-col gap-5">
                            {/* Compulsory Levels Dropdown - Show only if mode is institute or both */}
                            {(localSelectionMode === "institute" ||
                                localSelectionMode === "both") && (
                                <MultiSelectDropdown
                                    form={localForm}
                                    control={localForm.control}
                                    name="compulsoryLevels"
                                    label="Compulsory"
                                    options={compulsoryOptions}
                                    className="w-full"
                                />
                            )}

                            {/* Learner Choice Levels Dropdown - Show only if mode is student or both */}
                            {(localSelectionMode === "student" ||
                                localSelectionMode === "both") && (
                                <MultiSelectDropdown
                                    form={localForm}
                                    control={localForm.control}
                                    name="learnerChoiceLevels"
                                    label="Learner Choice"
                                    options={learnerChoiceOptions}
                                    className="w-full"
                                />
                            )}
                        </div>
                    </FormProvider>

                    <div className="flex items-center gap-3">
                        <MyButton onClick={handleSave} className="w-fit" type="button">
                            Save
                        </MyButton>
                        <MyButton
                            onClick={handleSave}
                            className="flex w-fit items-center gap-1"
                            buttonType="secondary"
                            type="button"
                        >
                            <Check size={16} />
                        </MyButton>
                    </div>
                </>
            ) : (
                <div className="flex flex-col gap-4">
                    {/* Saved view showing the level list */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Levels</h3>
                        <MyButton
                            onClick={handleEdit}
                            className="flex w-fit items-center gap-1"
                            buttonType="secondary"
                            type="button"
                        >
                            <PencilSimple size={16} />
                        </MyButton>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {selectedLevels.map((level) => (
                            <Badge
                                key={level.id}
                                className={`px-2 py-1 ${
                                    level.type === "compulsory"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-green-100 text-green-800"
                                }`}
                            >
                                {level.name}{" "}
                                {level.type === "compulsory" ? "(Compulsory)" : "(Learner Choice)"}
                            </Badge>
                        ))}

                        {selectedLevels.length === 0 && (
                            <p className="text-gray-500">No levels selected</p>
                        )}
                    </div>

                    <MaxLimitField
                        title="Level"
                        maxAllowed={learnerChoiceLength}
                        maxValue={localMaxLevels}
                        isDisabled={true}
                    />
                </div>
            )}
        </div>
    );
};
