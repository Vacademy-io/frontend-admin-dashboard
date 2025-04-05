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
        // <Dialog>
        //     <DialogTrigger>
        // <MyButton buttonType="primary" scale="large" layoutVariant="default">
        //     <span>
        //         <Share />
        //     </span>
        //     Enroll in Bulk
        //  </MyButton>
        //     </DialogTrigger>
        //     <DialogContent className="w-[400px] max-w-[800px] p-0 font-normal">
        //         <EnrollBulkDialog />
        //     </DialogContent>
        // </Dialog>
        <MyDialog heading="Enroll in Bulk" trigger={bulkTrigger}>
            <EnrollBulkDialog />
        </MyDialog>
    );
};
