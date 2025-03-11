import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { useState } from "react";
import { Plus } from "phosphor-react";
import { AddCourseData, AddCourseForm } from "./add-course/add-course-form";

const triggerButton = (
    <MyButton buttonType="primary" layoutVariant="default" scale="large" id="create-new-course">
        <Plus />
        Create Course
    </MyButton>
);

interface AddCourseButtonProps {
    onSubmit: ({ requestData }: { requestData: AddCourseData }) => void;
    courseButton?: JSX.Element;
}

export const AddCourseButton = ({ onSubmit, courseButton }: AddCourseButtonProps) => {
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenChange = () => {
        setOpenDialog(!openDialog);
    };

    return (
        <MyDialog
            trigger={courseButton ? courseButton : triggerButton}
            heading="Add Course"
            dialogWidth="w-[700px]"
            open={openDialog}
            onOpenChange={handleOpenChange}
        >
            <AddCourseForm onSubmitCourse={onSubmit} setOpenDialog={setOpenDialog} />
        </MyDialog>
    );
};
