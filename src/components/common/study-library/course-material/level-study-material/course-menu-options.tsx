import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { MyDropdown } from "@/components/design-system/dropdown";
import { CourseType } from "@/stores/study-library/use-study-library-store";
import { DotsThree } from "phosphor-react";
import { useState } from "react";
import { AddCourseData, AddCourseForm } from "../add-course-form";

interface CourseMenuOptionsProps {
    onDelete: (courseId: string) => void;
    onEdit: ({ courseId, requestData }: { requestData: AddCourseData; courseId?: string }) => void;
    course: CourseType;
}

export const CourseMenuOptions = ({ onDelete, onEdit, course }: CourseMenuOptionsProps) => {
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const DropdownList = ["Edit Course", "Delete Course"];

    const handleMenuOptionsChange = (value: string) => {
        if (value === "Delete Course") {
            onDelete(course.id);
        } else if (value === "Edit Course") {
            setOpenEditDialog(true);
        }
    };

    const handleOpenChange = () => {
        setOpenEditDialog(!openEditDialog);
    };

    return (
        <>
            <MyDropdown dropdownList={DropdownList} onSelect={handleMenuOptionsChange}>
                <MyButton
                    buttonType="secondary"
                    scale="small"
                    layoutVariant="icon"
                    className="flex items-center justify-center"
                >
                    <DotsThree />
                </MyButton>
            </MyDropdown>
            <MyDialog
                heading="Edit Course"
                dialogWidth="w-[430px]"
                open={openEditDialog}
                onOpenChange={handleOpenChange}
            >
                <AddCourseForm
                    initialValues={{
                        id: course.id,
                        course_name: course.package_name,
                        thumbnail_file_id: course.thumbnail_file_id,
                        contain_levels: false,
                        levels: [],
                    }}
                    onSubmitCourse={onEdit}
                    setOpenDialog={setOpenEditDialog}
                />
            </MyDialog>
        </>
    );
};
