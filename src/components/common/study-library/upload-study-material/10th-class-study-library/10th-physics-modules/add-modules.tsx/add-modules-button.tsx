import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { useState } from "react";
import { AddModulesForm } from "./add-modules-form";
import { ModuleType } from "./modules";

interface AddModuleButtonProps {
    onAddModule: (module: ModuleType) => void;
}

export const AddModulesButton = ({ onAddModule }: AddModuleButtonProps) => {
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenChange = () => {
        setOpenDialog(!openDialog);
    };

    const triggerButton = (
        <MyButton buttonType="primary" scale="large" layoutVariant="default">
            Add Module
        </MyButton>
    );

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
