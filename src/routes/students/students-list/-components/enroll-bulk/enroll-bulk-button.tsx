import { MyButton } from "@/components/design-system/button";
import { Share } from "@phosphor-icons/react";
import { EnrollBulkDialog } from "./enroll-bulk-dialog";
import { MyDialog } from "@/components/design-system/dialog";
import { useState } from "react";

export const EnrollBulkButton = () => {
    const [isOpen, setIsOpen] = useState(true);

    const bulkTrigger = (
        <MyButton buttonType="primary" scale="large" layoutVariant="default">
            <span>
                <Share />
            </span>
            Enroll in Bulk
        </MyButton>
    );

    return (
        <MyDialog
            heading="Enroll in Bulk"
            trigger={bulkTrigger}
            data-dialog-id="enroll-bulk-dialog"
            onOpenChange={(open) => {
                if (!open) {
                    // Close the dialog when it's being closed
                    setIsOpen(false);
                }
            }}
            open={isOpen}
        >
            <EnrollBulkDialog />
        </MyDialog>
    );
};
