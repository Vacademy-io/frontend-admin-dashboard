import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MyButton } from "@/components/design-system/button";
import { Share } from "@phosphor-icons/react";
import { EnrollBulkDialog } from "./enroll-bulk-dialog";

export const EnrollBulkButton = () => {
    return (
        <Dialog>
            <DialogTrigger>
                <MyButton buttonType="primary" scale="large" layoutVariant="default">
                    <span>
                        <Share />
                    </span>
                    Enroll in Bulk
                </MyButton>
            </DialogTrigger>
            <DialogContent className="w-[400px] max-w-[800px] p-0 font-normal">
                <EnrollBulkDialog />
            </DialogContent>
        </Dialog>
    );
};
