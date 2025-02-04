import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { useState } from "react";
import { Plus } from "phosphor-react";
import { AddCourseForm } from "./add-course-form";

const triggerButton = (
    <MyButton buttonType="primary" layoutVariant="default" scale="large">
        <Plus />
        Create Course
    </MyButton>
);

export const AddCourseButton = () => {
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenChange = () => {
        setOpenDialog(!openDialog);
    };

    return (
        <MyDialog
            trigger={triggerButton}
            heading="Add Course"
            dialogWidth="w-[430px]"
            open={openDialog}
            onOpenChange={handleOpenChange}
        >
            <AddCourseForm />
        </MyDialog>
    );
};
