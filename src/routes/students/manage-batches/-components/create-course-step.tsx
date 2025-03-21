// CreateCourseStep.tsx
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { MyDropdown } from "@/components/common/students/enroll-manually/dropdownForPackageItems";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { Plus } from "phosphor-react";
import { AddCourseButton } from "@/components/common/study-library/add-course/add-course-button";
import { MyButton } from "@/components/design-system/button";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";

export const CreateCourseStep = () => {
    const { getCourseFromPackage, instituteDetails } = useInstituteDetailsStore();
    const [courseList, setCourseList] = useState(getCourseFromPackage());
    const form = useFormContext();

    const handleAddCourse = () => {};

    useEffect(() => {
        setCourseList(getCourseFromPackage());
    }, [instituteDetails]);

    return (
        <div className="flex flex-col gap-6">
            <div className="text-regular">
                Step 1 <span className="font-semibold">Select Course</span>
            </div>

            <FormField
                control={form.control}
                name="courseCreationType"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <RadioGroup
                                className="flex gap-10"
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="existing" id="existing" />
                                    <label htmlFor="existing">Pre-existing course</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="new" id="new" />
                                    <label htmlFor="new">Create new course</label>
                                </div>
                            </RadioGroup>
                        </FormControl>
                    </FormItem>
                )}
            />

            <div className="flex flex-col gap-1">
                <div>
                    Course
                    <span className="text-subtitle text-danger-600">*</span>
                </div>

                {courseList.length > 0 && form.watch("courseCreationType") === "existing" && (
                    <FormField
                        control={form.control}
                        name="selectedCourse"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <MyDropdown
                                        currentValue={field.value}
                                        dropdownList={courseList}
                                        handleChange={field.onChange}
                                        placeholder="Select course"
                                        required={true}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}

                {form.watch("courseCreationType") === "new" && (
                    <AddCourseButton
                        onSubmit={handleAddCourse}
                        courseButton={
                            <MyButton
                                type="button"
                                buttonType="text"
                                layoutVariant="default"
                                scale="small"
                                className="w-fit text-primary-500 hover:bg-white active:bg-white"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <Plus /> Add Course
                            </MyButton>
                        }
                    />
                )}
            </div>
        </div>
    );
};
