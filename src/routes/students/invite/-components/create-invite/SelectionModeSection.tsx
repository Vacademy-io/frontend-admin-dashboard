// Modified SelectionModeSection.tsx
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
                courseSelectionMode == "both"
                    ? setMaxAllowed(selectedCourse.length)
                    : setMaxAllowed(dropdownList.length);
                break;
            }
            case "session": {
                sessionSelectionMode == "both"
                    ? setMaxAllowed(selectedSession.length)
                    : setMaxAllowed(dropdownList.length);
                break;
            }
            case "level": {
                levelSelectionMode == "both"
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
    }, [maxAllowed]);

    // Convert the dropdown list to MultiSelect format
    const multiSelectOptions = dropdownList.map((item) => ({
        label: item.name,
        value: item.id,
    }));

    // Determine if this section should be disabled based on dependencies
    const isDisabled =
        (type === "session" &&
            (courseSelectionMode === "institute" || courseSelectionMode === "both"
                ? selectedCourse.length === 0
                : false)) ||
        (type === "level" &&
            (((courseSelectionMode === "institute" || courseSelectionMode === "both") &&
                selectedCourse.length === 0) ||
                ((sessionSelectionMode === "institute" || sessionSelectionMode === "both") &&
                    selectedSession.length === 0)));

    // Determine if radio options should be disabled
    const isRadioDisabled = (optionValue: string): boolean => {
        if (isDisabled) return true;

        // Session-specific rules
        if (type === "session" && courseSelectionMode === "student") {
            return optionValue !== "student";
        }

        // Level-specific rules
        if (type === "level" && sessionSelectionMode === "student") {
            return optionValue !== "student";
        }

        return false;
    };

    // Effect to enforce proper selection mode based on parent selection
    useEffect(() => {
        if (type === "session" && courseSelectionMode === "student") {
            setValue("sessionSelectionMode", "student");
        }

        if (type === "level" && sessionSelectionMode === "student") {
            setValue("levelSelectionMode", "student");
        }
    }, [courseSelectionMode, sessionSelectionMode]);

    // Get the currently selected values in the right format for MultiSelect
    const getSelectedValues = (): string[] => {
        const selection = watch(selectedValueField) || [];
        if (Array.isArray(selection)) {
            return selection.map((item) => (typeof item === "string" ? item : item.id));
        }
        return [];
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
                                            onValueChange={field.field.onChange}
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
