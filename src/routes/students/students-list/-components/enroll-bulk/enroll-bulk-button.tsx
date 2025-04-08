import { MyButton } from "@/components/design-system/button";
import { Share } from "@phosphor-icons/react";
import { EnrollBulkDialog } from "./enroll-bulk-dialog";
import { MyDialog } from "@/components/design-system/dialog";

export const EnrollBulkButton = () => {
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
        >
            <EnrollBulkDialog />
        </MyDialog>
    );
};
