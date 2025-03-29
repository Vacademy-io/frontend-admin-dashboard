import { LevelField, SelectionMode } from "@/routes/students/invite/-schema/InviteFormSchema";
import { useLevelManager } from "../../../../-hooks/useLevelManager";
import { BatchSelectionMode } from "../BatchSelectionMode";
import { useEffect, useState } from "react";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useForm, FormProvider } from "react-hook-form";
import { MaxLimitField } from "../MaxLimitField";
import { MyButton } from "@/components/design-system/button";
import { Check, PencilSimple } from "phosphor-react";
import EnhancedMultiSelect from "../MultiSelectDropdown";

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

// Define form values type
interface LevelFormValues {
    compulsoryLevels: string[];
    learnerChoiceLevels: string[];
    roleType: string[];
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
    const [isMaxSaved, setIsMaxSaved] = useState<boolean>(false);
    const [activeDropdown, setActiveDropdown] = useState<
        "compulsoryLevels" | "learnerChoiceLevels" | null
    >(null);

    useEffect(() => {
        if (!isSaved) {
            setIsMaxSaved(false);
        }
    }, [isSaved]);

    const { getLevelsFromPackage, getPackageSessionId } = useInstituteDetailsStore();

    // Get the raw level list
    const rawLevelList = getLevelsFromPackage({ courseId, sessionId });

    // Create options in both formats
    // Enhanced options for the EnhancedMultiSelect component
    const enhancedOptions = rawLevelList.map((level) => ({
        id: level.id,
        name: level.name,
    }));

    // Create a form for the multi-select fields with the roleType field that MultiSelectDropdown expects
    const localForm = useForm<LevelFormValues>({
        defaultValues: {
            compulsoryLevels: preSelectedLevels.map((level) => level.id),
            learnerChoiceLevels: learnerChoiceLevels.map((level) => level.id),
            roleType: [], // Add this to match what MultiSelectDropdown expects
        },
    });

    // Bridge between roleType and actual fields
    useEffect(() => {
        const roleTypeValues = localForm.watch("roleType");
        if (Array.isArray(roleTypeValues) && activeDropdown) {
            localForm.setValue(activeDropdown, roleTypeValues as string[]);
        }
    }, [localForm.watch("roleType"), activeDropdown]);

    // Initialize roleType with appropriate values based on active dropdown
    useEffect(() => {
        if (activeDropdown) {
            const currentValues = localForm.getValues(activeDropdown) as string[];
            localForm.setValue("roleType", currentValues);
        } else if (localSelectionMode === "institute" || localSelectionMode === "both") {
            setActiveDropdown("compulsoryLevels");
        } else if (localSelectionMode === "student") {
            setActiveDropdown("learnerChoiceLevels");
        }
    }, [activeDropdown, localSelectionMode]);

    // Handle local selection mode changes (doesn't affect form yet)
    const handleLocalSelectionModeChange = (mode: SelectionMode) => {
        setLocalSelectionMode(mode);

        // Reset values for both dropdowns when changing mode
        localForm.setValue("compulsoryLevels", []);
        localForm.setValue("learnerChoiceLevels", []);
        localForm.setValue("roleType", []);

        // Set appropriate active dropdown based on mode
        if (mode === "institute") {
            setActiveDropdown("compulsoryLevels");
        } else if (mode === "student") {
            setActiveDropdown("learnerChoiceLevels");
        } else if (mode === "both") {
            localForm.setValue("compulsoryLevels", []);
            localForm.setValue("learnerChoiceLevels", []);
            setActiveDropdown(null);
        }
    };

    // Handle dropdown focus to set active dropdown
    const handleDropdownFocus = (fieldName: "compulsoryLevels" | "learnerChoiceLevels") => {
        setActiveDropdown(fieldName);
        localForm.setValue("roleType", localForm.getValues(fieldName) as string[]);
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
        const values = localForm.getValues("compulsoryLevels") as string[];
        if (Array.isArray(values)) {
            setCompulsorySelected(values);
        }
    }, [localForm.watch("compulsoryLevels")]);

    useEffect(() => {
        const values = localForm.getValues("learnerChoiceLevels") as string[];
        if (Array.isArray(values)) {
            setLearnerChoiceSelected(values);
        }
    }, [localForm.watch("learnerChoiceLevels")]);

    // Filter options for each dropdown to exclude levels selected in the other
    const compulsoryEnhancedOptions = enhancedOptions.filter(
        (option) => !learnerChoiceSelected.includes(option.id),
    );

    const learnerChoiceOptions = enhancedOptions.filter(
        (option) => !compulsorySelected.includes(option.id),
    );

    // Handle save button click
    const handleSaveLevels = () => {
        // Update the selection mode in the form
        changeLevelSelectionMode(localSelectionMode);

        // Get the current values from the form
        const compulsoryLevelIds = localForm.getValues("compulsoryLevels") as string[];
        const learnerChoiceLevelIds = localForm.getValues("learnerChoiceLevels") as string[];

        // Clear existing levels to avoid duplicates
        preSelectedLevels.forEach((level) => {
            deleteLevel(level.id, true);
        });

        learnerChoiceLevels.forEach((level) => {
            deleteLevel(level.id, false);
        });

        // Prepare arrays to hold the new levels
        const newCompulsoryLevels: LevelField[] = [];
        const newLearnerChoiceLevels: LevelField[] = [];

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

                    // Also add to our local array
                    newCompulsoryLevels.push({
                        id: level.id,
                        name: level.name,
                        packageSessionId,
                    });
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

                    // Also add to our local array
                    newLearnerChoiceLevels.push({
                        id: level.id,
                        name: level.name,
                        packageSessionId,
                    });
                }
            });
        }

        // Create an updated selectedLevels array
        const updatedSelectedLevels = [
            ...newCompulsoryLevels.map((level) => ({ ...level, type: "compulsory" as const })),
            ...newLearnerChoiceLevels.map((level) => ({
                ...level,
                type: "learnerChoice" as const,
            })),
        ];

        // We need to add state to track these updated values
        setSelectedLevels(updatedSelectedLevels);

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

    const handleSaveMaxLevels = () => {
        // Update max levels in the form
        setMaxLevels(localMaxLevels);
        setIsMaxSaved(true);
    };

    // Get the current learner choice levels length
    const learnerChoiceLength = getLearnerChoiceLevelsLength();

    // Prepare data for the saved view
    const [selectedLevels, setSelectedLevels] = useState([
        ...preSelectedLevels.map((level) => ({ ...level, type: "compulsory" as const })),
        ...learnerChoiceLevels.map((level) => ({ ...level, type: "learnerChoice" as const })),
    ]);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <h3 className="text-subtitle font-semibold underline">Levels</h3>
                {isSaved ? (
                    <div className="flex gap-3">
                        <MyButton
                            onClick={handleEdit}
                            buttonType="secondary"
                            type="button"
                            layoutVariant="icon"
                            scale="small"
                        >
                            <PencilSimple size={16} />
                        </MyButton>
                        {isSaved && !isMaxSaved && learnerChoiceSelected.length > 0 && (
                            <div className="flex gap-2">
                                <MaxLimitField
                                    title="Level"
                                    maxAllowed={learnerChoiceLength}
                                    maxValue={localMaxLevels}
                                    onMaxChange={handleMaxLevelChange}
                                />
                                <MyButton
                                    onClick={handleSaveMaxLevels}
                                    className="flex items-center gap-1"
                                    buttonType="secondary"
                                    type="button"
                                    layoutVariant="icon"
                                >
                                    <Check size={16} />
                                </MyButton>
                            </div>
                        )}
                    </div>
                ) : localSelectionMode == "student" ? (
                    learnerChoiceSelected.length > 0 && (
                        <MyButton
                            onClick={handleSaveLevels}
                            className="w-fit"
                            type="button"
                            scale="small"
                        >
                            Save Levels
                        </MyButton>
                    )
                ) : localSelectionMode == "institute" ? (
                    compulsorySelected.length > 0 && (
                        <div className="flex items-center gap-3">
                            <MyButton onClick={handleSaveLevels} className="w-fit" type="button">
                                Save
                            </MyButton>
                        </div>
                    )
                ) : (
                    (compulsorySelected.length > 0 || learnerChoiceLevels.length > 0) && (
                        <div className="flex items-center gap-3">
                            <MyButton onClick={handleSaveLevels} className="w-fit" type="button">
                                Save
                            </MyButton>
                        </div>
                    )
                )}
            </div>
            {!isSaved ? (
                <>
                    <BatchSelectionMode
                        title="Level"
                        parentSelectionMode={isSessionCompulsory ? "institute" : "student"}
                        bothEnabled={true}
                        mode={localSelectionMode}
                        onChangeMode={handleLocalSelectionModeChange}
                    />

                    <FormProvider {...localForm}>
                        <div className="flex flex-col gap-5">
                            {/* Compulsory Levels Dropdown - Show only if mode is institute or both */}
                            {(localSelectionMode === "institute" ||
                                localSelectionMode === "both") && (
                                <div
                                    onClick={() => handleDropdownFocus("compulsoryLevels")}
                                    onFocus={() => handleDropdownFocus("compulsoryLevels")}
                                >
                                    <EnhancedMultiSelect
                                        form={localForm}
                                        control={localForm.control}
                                        name="compulsoryLevels"
                                        label="Compulsory"
                                        options={compulsoryEnhancedOptions}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            {/* Learner Choice Levels Dropdown - Show only if mode is student or both */}
                            {(localSelectionMode === "student" ||
                                localSelectionMode === "both") && (
                                <div
                                    onClick={() => handleDropdownFocus("learnerChoiceLevels")}
                                    onFocus={() => handleDropdownFocus("learnerChoiceLevels")}
                                >
                                    <EnhancedMultiSelect
                                        form={localForm}
                                        control={localForm.control}
                                        name="learnerChoiceLevels"
                                        label="Learner Choice"
                                        options={learnerChoiceOptions}
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </div>
                    </FormProvider>
                </>
            ) : (
                <div className="flex flex-col gap-2">
                    {selectedLevels.map((level) => (
                        <div key={level.id} className={`w-fit text-body text-neutral-600`}>
                            {level.name}{" "}
                            {level.type === "compulsory" ? "(Compulsory)" : "(Optional)"}
                        </div>
                    ))}

                    {selectedLevels.length === 0 && (
                        <p className="text-gray-500">No levels selected</p>
                    )}
                </div>
            )}
        </div>
    );
};
