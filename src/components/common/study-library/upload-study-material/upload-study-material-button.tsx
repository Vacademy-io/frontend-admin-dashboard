import { MyDialog } from "@/components/design-system/dialog";
import { MyButton } from "@/components/design-system/button";
import { BookOpenText } from "@phosphor-icons/react";
import { useState } from "react";
import { UploadStudyMaterialForm } from "./upload-study-material-form";

export const UploadStudyMaterialButton = () => {
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenChange = () => {
        setOpenDialog(!openDialog);
    };

    const triggerButton = (
        <MyButton buttonType="primary" scale="large" layoutVariant="default">
            <div className="flex items-center gap-2">
                <BookOpenText className="size-6" />
                <div>Upload Study Material</div>
            </div>
        </MyButton>
    );

    return (
        <MyDialog
            trigger={triggerButton}
            heading="Upload Study Material"
            dialogWidth="min-w-[400px]"
            open={openDialog}
            onOpenChange={handleOpenChange}
        >
            <UploadStudyMaterialForm />
        </MyDialog>
    );
};
