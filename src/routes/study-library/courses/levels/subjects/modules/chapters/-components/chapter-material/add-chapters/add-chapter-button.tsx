import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { AddChapterForm } from "./add-chapter-form";

const triggerButton = (
    <MyButton scale="large" id="add-chapters">
        <Plus /> Add Chapter
    </MyButton>
);

export const AddChapterButton = () => {
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenChange = () => {
        setOpenDialog(!openDialog);
    };

    const handleSubmitSuccess = () => {
        handleOpenChange();
    };

    return (
        <MyDialog
            trigger={triggerButton}
            heading="Add Chapter"
            dialogWidth="min-w-[800px]"
            open={openDialog}
            onOpenChange={handleOpenChange}
        >
            <AddChapterForm onSubmitSuccess={handleSubmitSuccess} mode="create" />
        </MyDialog>
    );
};
