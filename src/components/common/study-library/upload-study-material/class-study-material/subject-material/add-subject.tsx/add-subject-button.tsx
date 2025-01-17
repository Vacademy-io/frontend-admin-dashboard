import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { useState } from "react";
import { AddSubjectForm } from "./add-subject-form";
import { Subject } from "./subjects";

const triggerButton = (
    <MyButton buttonType="primary" layoutVariant="default" scale="large">
        Add Subject
    </MyButton>
);

interface AddSubjectButtonProps {
    onAddSubject: (subject: Subject) => void;
}

export const AddSubjectButton = ({ onAddSubject }: AddSubjectButtonProps) => {
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenChange = () => {
        setOpenDialog(!openDialog);
    };

    return (
        <MyDialog
            trigger={triggerButton}
            heading="Add Subject"
            dialogWidth="w-[400px]"
            open={openDialog}
            onOpenChange={handleOpenChange}
        >
            <AddSubjectForm
                onSubmitSuccess={(subject) => {
                    onAddSubject(subject);
                    handleOpenChange();
                }}
            />
        </MyDialog>
    );
};
