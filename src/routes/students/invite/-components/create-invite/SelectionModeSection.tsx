import { MyDropdown } from "@/components/common/students/enroll-manually/dropdownForPackageItems";
import { MyInput } from "@/components/design-system/input";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFormContext } from "react-hook-form";
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
    const { control, watch } = useFormContext<InviteFormType>();

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

    const selectionModeField = fieldMapping[type].selectionMode;
    const selectedValueField = fieldMapping[type].selectedValue;
    const maxValueField = fieldMapping[type].maxValue;

    const selectionMode = watch(selectionModeField);

    // Get selected values which could be strings or DropdownItemType
    const selectedCourseValue = watch("selectedCourse");
    const selectedSessionValue = watch("selectedSession");

    const getIdFromValue = (
        value?: string | { id: string; name: string } | null,
    ): string | undefined => {
        if (!value) return undefined;
        if (typeof value === "string") return value;
        if (typeof value === "object" && "id" in value) return value.id;
        return undefined;
    };

    // Get IDs for course and session
    const selectedCourseId = getIdFromValue(selectedCourseValue);
    const selectedSessionId = getIdFromValue(selectedSessionValue);

    // Determine if this section should be disabled based on dependencies
    const isDisabled =
        (type === "session" && !selectedCourseId) ||
        (type === "level" && (!selectedCourseId || !selectedSessionId));

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
                                            disabled={isDisabled}
                                        />
                                        <label htmlFor={`${type}-institute`}>
                                            Institute assigns
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem
                                            value="student"
                                            id={`${type}-student`}
                                            disabled={isDisabled}
                                        />
                                        <label htmlFor={`${type}-student`}>Student chooses</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem
                                            value="both"
                                            id={`${type}-both`}
                                            disabled={isDisabled}
                                        />
                                        <label htmlFor={`${type}-both`}>Both</label>
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
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyDropdown
                                            dropdownList={dropdownList}
                                            placeholder={`Select ${title}`}
                                            currentValue={
                                                field.value === null ? undefined : field.value
                                            }
                                            handleChange={field.onChange}
                                            disable={isDisabled}
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
                                            input={field.value?.toString() || ""}
                                            inputType="number"
                                            onChangeFunction={(e) =>
                                                field.onChange(parseInt(e.target.value) || 0)
                                            }
                                            className="w-[70px]"
                                            inputPlaceholder="00"
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
