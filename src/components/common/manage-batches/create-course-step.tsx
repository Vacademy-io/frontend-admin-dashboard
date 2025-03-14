import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { MyDropdown } from "../students/enroll-manually/dropdownForPackageItems";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { DropdownValueType } from "../students/enroll-manually/dropdownTypesForPackageItems";
import { Plus } from "phosphor-react";
import { AddCourseButton } from "../study-library/course-material/add-course-button";
import { MyButton } from "@/components/design-system/button";

export const CreateCourseStep = () => {
    const { getCourseFromPackage, instituteDetails } = useInstituteDetailsStore();
    const [courseList, setCourseList] = useState(getCourseFromPackage());
    const [selectedCourse, setSelectedCourse] = useState<DropdownValueType | undefined>(undefined);

    const handleAddCourse = () => {};

    const handleCourseChange = (e: DropdownValueType) => {
        setSelectedCourse(e);
    };

    useEffect(() => {
        setCourseList(getCourseFromPackage());
    }, [instituteDetails]);

    return (
        <div className="flex flex-col gap-6">
            <div className="text-regular">
                Step 1 <span className="font-semibold">Select Course</span>
            </div>
            <RadioGroup className="flex gap-10">
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="true" id="existing" />
                    <label htmlFor="existing">Pre-existing course</label>
                </div>
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="false" id="new" />
                    <label htmlFor="new">Create new course</label>
                </div>
            </RadioGroup>
            <div className="flex flex-col gap-1">
                <div>
                    Course
                    <span className="text-subtitle text-danger-600">*</span>
                </div>
                {courseList.length > 0 && (
                    <MyDropdown
                        currentValue={selectedCourse}
                        dropdownList={courseList}
                        handleChange={handleCourseChange}
                        placeholder="Select course"
                        required={true}
                    />
                )}
                <AddCourseButton
                    onSubmit={handleAddCourse}
                    courseButton={
                        <MyButton
                            type="button" // Set explicit type to button to prevent form submission
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
            </div>
        </div>
    );
};
