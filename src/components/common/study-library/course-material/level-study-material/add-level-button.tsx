import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { useState } from "react";
import { Plus } from "phosphor-react";
import { AddLevelData, AddLevelForm } from "./add-level-form";

const triggerButton = (
    <MyButton buttonType="primary" scale="large" layoutVariant="default">
        <Plus />
        Add Year/Class
    </MyButton>
);

interface AddLevelButtonProps {
    onSubmit: ({
        requestData,
        packageId,
        sessionId,
    }: {
        requestData: AddLevelData;
        packageId: string;
        sessionId: string;
    }) => void;
}

export const AddLevelButton = ({ onSubmit }: AddLevelButtonProps) => {
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenChange = () => {
        setOpenDialog(!openDialog);
    };

    return (
        <MyDialog
            trigger={triggerButton}
            heading="Add Level"
            dialogWidth="w-[430px]"
            open={openDialog}
            onOpenChange={handleOpenChange}
        >
            <AddLevelForm onSubmitSuccess={onSubmit} setOpenDialog={setOpenDialog} />
        </MyDialog>
    );
};
