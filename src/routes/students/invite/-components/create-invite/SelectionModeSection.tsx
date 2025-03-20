// SelectionModeSection.tsx
import { MultiSelect } from "./MultiSelect";
import { MyInput } from "@/components/design-system/input";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import { InviteFormType } from "./-schema/InviteFormSchema";

// Create a mapping from type to field names
type TypeToFieldMap = {
    course: {
        selectionMode: "courseSelectionMode";
        selectedValue: "selectedCourse";
        maxValue: "maxCourses";
    };
    session: {
        selectionMode: "sessionSelectionMode";
        selectedValue: "selectedSession";
        maxValue: "maxSessions";
    };
    level: {
        selectionMode: "levelSelectionMode";
        selectedValue: "selectedLevel";
        maxValue: "maxLevels";
    };
};

interface SelectionModeSectionProps {
    title: string;
    type: keyof TypeToFieldMap;
    dropdownList: { id: string; name: string }[];
}

export const SelectionModeSection = ({ title, type, dropdownList }: SelectionModeSectionProps) => {
    const { control, watch, setValue, getValues } = useFormContext<InviteFormType>();

    // Use the mapping to get the correct field names
    const fieldMapping: TypeToFieldMap = {
        course: {
            selectionMode: "courseSelectionMode",
            selectedValue: "selectedCourse",
            maxValue: "maxCourses",
        },
        session: {
            selectionMode: "sessionSelectionMode",
            selectedValue: "selectedSession",
            maxValue: "maxSessions",
        },
        level: {
            selectionMode: "levelSelectionMode",
            selectedValue: "selectedLevel",
            maxValue: "maxLevels",
        },
    };

    const [maxAllowed, setMaxAllowed] = useState(0);
    const selectionModeField = fieldMapping[type].selectionMode;
    const selectedValueField = fieldMapping[type].selectedValue;
    const maxValueField = fieldMapping[type].maxValue;

    // Watch all necessary fields
    const courseSelectionMode = watch("courseSelectionMode");
    const sessionSelectionMode = watch("sessionSelectionMode");
    const levelSelectionMode = watch("levelSelectionMode");
    const selectionMode = watch(selectionModeField);
    const selectedCourse = watch("selectedCourse") || [];
    const selectedSession = watch("selectedSession") || [];
    const selectedLevel = watch("selectedLevel") || [];

    useEffect(() => {
        switch (type) {
            case "course": {
                courseSelectionMode === "both"
                    ? setMaxAllowed(selectedCourse.length)
                    : setMaxAllowed(dropdownList.length);
                break;
            }
            case "session": {
                sessionSelectionMode === "both"
                    ? setMaxAllowed(selectedSession.length)
                    : setMaxAllowed(dropdownList.length);
                break;
            }
            case "level": {
                levelSelectionMode === "both"
                    ? setMaxAllowed(selectedLevel.length)
                    : setMaxAllowed(dropdownList.length);
                break;
            }
        }
    }, [
        type,
        courseSelectionMode,
        sessionSelectionMode,
        levelSelectionMode,
        selectedCourse,
        selectedLevel,
        selectedSession,
        dropdownList.length,
    ]);

    useEffect(() => {
        if (maxAllowed > 0) {
            const currentValue = getValues(maxValueField);

            // If the current value is greater than the new maxAllowed, update it
            if (currentValue && currentValue > maxAllowed) {
                setValue(maxValueField, maxAllowed);
            }

            // If the field doesn't have a value yet, set it to 1 (or another default)
            if (!currentValue) {
                setValue(maxValueField, 1);
            }
        } else {
            setValue(maxValueField, 1);
        }
    }, [maxAllowed, getValues, setValue, maxValueField]);

    // Convert the dropdown list to MultiSelect format
    const multiSelectOptions = dropdownList.map((item) => ({
        label: item.name,
        value: item.id,
    }));

    // Determine if this section should be disabled based on dependencies
    const isSectionDisabled = (): boolean => {
        if (type === "course") {
            return false; // Course selection is always enabled
        }

        if (type === "session") {
            // If course selection mode is institute or both, session gets enabled only when courses are selected
            return (
                (courseSelectionMode === "institute" || courseSelectionMode === "both") &&
                selectedCourse.length === 0
            );
        }

        if (type === "level") {
            const courseCondition =
                (courseSelectionMode === "institute" || courseSelectionMode === "both") &&
                selectedCourse.length === 0;
            const sessionCondition =
                (sessionSelectionMode === "institute" || sessionSelectionMode === "both") &&
                selectedSession.length === 0;

            return courseCondition || sessionCondition;
        }

        return false;
    };

    const isDisabled = isSectionDisabled();

    // Determine if radio options should be disabled based on parent selection mode
    const isRadioDisabled = (optionValue: string): boolean => {
        if (isDisabled) return true;

        // Session's selectionMode options based on courseSelectionMode
        if (type === "session") {
            if (courseSelectionMode === "student") {
                // If course is set to student-only, session can only be student
                return optionValue !== "student";
            } else if (courseSelectionMode === "both") {
                // If course is set to both, session can be student or both, but not institute
                return optionValue === "institute";
            }
        }

        // Level's selectionMode options based on both course and session selectionModes
        if (type === "level") {
            if (sessionSelectionMode === "student") {
                // If session is set to student-only, level can only be student
                return optionValue !== "student";
            } else if (sessionSelectionMode === "both") {
                // If session is set to both, level can be student or both, but not institute
                return optionValue === "institute";
            }

            // If we get here, sessionSelectionMode is "institute", so we check courseSelectionMode
            if (courseSelectionMode === "student") {
                // If course is student-only, all child selections must also be student-only
                return optionValue !== "student";
            } else if (courseSelectionMode === "both") {
                // If course is both, no child selection can be institute-only
                return optionValue === "institute";
            }
        }

        return false;
    };

    // Effect to enforce proper selection mode based on parent selection
    useEffect(() => {
        if (type === "session" && courseSelectionMode === "student") {
            setValue("sessionSelectionMode", "student");
        } else if (
            type === "session" &&
            courseSelectionMode === "both" &&
            sessionSelectionMode === "institute"
        ) {
            setValue("sessionSelectionMode", "both");
        }

        if (type === "level") {
            if (sessionSelectionMode === "student") {
                setValue("levelSelectionMode", "student");
            } else if (sessionSelectionMode === "both" && levelSelectionMode === "institute") {
                setValue("levelSelectionMode", "both");
            } else if (courseSelectionMode === "student" && sessionSelectionMode === "institute") {
                setValue("levelSelectionMode", "student");
            } else if (
                courseSelectionMode === "both" &&
                sessionSelectionMode === "institute" &&
                levelSelectionMode === "institute"
            ) {
                setValue("levelSelectionMode", "both");
            }
        }
    }, [courseSelectionMode, sessionSelectionMode, type, setValue, levelSelectionMode]);

    // Get the currently selected values in the right format for MultiSelect
    const getSelectedValues = (): string[] => {
        const selection = watch(selectedValueField) || [];
        return selection.map((item) => item.id);
    };

    return (
        <div className={`flex flex-col gap-4 ${isDisabled ? "opacity-50" : ""}`}>
            <div className="flex items-center gap-6">
                <p className="text-subtitle font-semibold">{title} Selection Mode</p>
                <FormField
                    control={control}
                    name={selectionModeField}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <RadioGroup
                                    className="flex items-center gap-6"
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={isDisabled}
                                >
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem
                                            value="institute"
                                            id={`${type}-institute`}
                                            disabled={isRadioDisabled("institute")}
                                        />
                                        <label
                                            htmlFor={`${type}-institute`}
                                            className={
                                                isRadioDisabled("institute")
                                                    ? "text-neutral-400"
                                                    : ""
                                            }
                                        >
                                            Institute assigns
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem
                                            value="student"
                                            id={`${type}-student`}
                                            disabled={isRadioDisabled("student")}
                                        />
                                        <label
                                            htmlFor={`${type}-student`}
                                            className={
                                                isRadioDisabled("student") ? "text-neutral-400" : ""
                                            }
                                        >
                                            Student chooses
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem
                                            value="both"
                                            id={`${type}-both`}
                                            disabled={isRadioDisabled("both")}
                                        />
                                        <label
                                            htmlFor={`${type}-both`}
                                            className={
                                                isRadioDisabled("both") ? "text-neutral-400" : ""
                                            }
                                        >
                                            Both
                                        </label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
            <div className="flex items-start gap-12">
                {(selectionMode === "institute" || selectionMode === "both") && (
                    <div className="flex w-fit flex-col gap-2">
                        <p>
                            {title} <span className="text-subtitle text-danger-600">*</span>
                        </p>
                        <FormField
                            control={control}
                            name={selectedValueField}
                            render={(field) => (
                                <FormItem>
                                    <FormControl>
                                        <MultiSelect
                                            options={multiSelectOptions}
                                            onValueChange={(values) => {
                                                // Convert selected values to the correct format
                                                const newSelectedValues = values.map((value) => {
                                                    const matchingItem = dropdownList.find(
                                                        (item) => item.id === value,
                                                    );
                                                    return (
                                                        matchingItem || { id: value, name: value }
                                                    );
                                                });
                                                field.field.onChange(newSelectedValues);
                                            }}
                                            defaultValue={getSelectedValues()}
                                            placeholder={`Select ${title}`}
                                            disabled={isDisabled}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                )}
                {(selectionMode === "student" || selectionMode === "both") && (
                    <div className="flex items-center gap-6">
                        <p>Number of {type}s student can enroll into</p>
                        <FormField
                            control={control}
                            name={maxValueField}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyInput
                                            input={field.value?.toString() || "1"}
                                            inputType="number"
                                            onChangeFunction={(e) => {
                                                const value = parseInt(e.target.value) || 0;
                                                // Ensure the value is between 1 and maxAllowed
                                                if (value < 1) {
                                                    field.onChange(1);
                                                } else if (value > maxAllowed) {
                                                    field.onChange(maxAllowed);
                                                } else {
                                                    field.onChange(value);
                                                }
                                            }}
                                            className="w-[70px]"
                                            inputPlaceholder="1"
                                            disabled={isDisabled}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
