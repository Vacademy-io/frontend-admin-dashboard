import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { useState } from "react";
// import { AddSubjectForm } from "./add-subject-form";
import { Plus } from "phosphor-react";

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
            dialogWidth="w-[400px]"
            open={openDialog}
            onOpenChange={handleOpenChange}
        >
            {/* <AddSubjectForm
                onSubmitSuccess={(subject) => {
                    onAddSubject(subject);
                    handleOpenChange();
                }}
            /> */}
            add your course here
        </MyDialog>
    );
};
