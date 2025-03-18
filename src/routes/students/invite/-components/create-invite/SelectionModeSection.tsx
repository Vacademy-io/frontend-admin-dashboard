import { MyDropdown } from "@/components/common/students/enroll-manually/dropdownForPackageItems";
import { MyInput } from "@/components/design-system/input";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFormContext } from "react-hook-form";
import { InviteFormType } from "./InviteFormSchema";

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

    return (
        <div className="flex flex-col gap-4">
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
                                >
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem
                                            value="institute"
                                            id={`${type}-institute`}
                                        />
                                        <label htmlFor={`${type}-institute`}>
                                            Institute assigns
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="student" id={`${type}-student`} />
                                        <label htmlFor={`${type}-student`}>Student chooses</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="both" id={`${type}-both`} />
                                        <label htmlFor={`${type}-both`}>Both</label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
            <div className="flex gap-12">
                {(selectionMode === "institute" || selectionMode === "both") && (
                    <div className="flex w-fit flex-col gap-2">
                        <p>
                            {title} <span className="text-primary-500">*</span>
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
                                            currentValue={field.value}
                                            handleChange={field.onChange}
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
