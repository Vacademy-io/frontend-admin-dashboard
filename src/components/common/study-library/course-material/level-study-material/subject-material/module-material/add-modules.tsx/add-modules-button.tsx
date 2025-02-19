import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { useState } from "react";
import { AddModulesForm } from "./add-modules-form";
import { Module } from "@/stores/study-library/use-modules-with-chapters-store";

const triggerButton = (
    <MyButton buttonType="primary" scale="large" layoutVariant="default" id="add-modules">
        Add Module
    </MyButton>
);

interface AddModuleButtonProps {
    onAddModule: (module: Module) => void;
}

export const AddModulesButton = ({ onAddModule }: AddModuleButtonProps) => {
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenChange = () => {
        setOpenDialog(!openDialog);
    };

    return (
        <MyDialog
            trigger={triggerButton}
            heading="Add Module"
            dialogWidth="w-[400px]"
            open={openDialog}
            onOpenChange={handleOpenChange}
        >
            <AddModulesForm
                onSubmitSuccess={(module) => {
                    onAddModule(module);
                    handleOpenChange();
                }}
            />
        </MyDialog>
    );
};
