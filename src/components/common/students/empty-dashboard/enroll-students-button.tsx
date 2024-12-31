import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog";
import { MyButton } from "@/components/design-system/button";
import { EnrollManuallyButton } from "../enroll-manually/enroll-manually-button";
import { EnrollBulkButton } from "./enroll-bulk/enroll-bulk-button";

export const EnrollStudentsButton = () => {
    return (
        <Dialog>
            <DialogTrigger>
                <MyButton buttonType="primary" scale="large" layoutVariant="default">
                    Enroll Students
                </MyButton>
            </DialogTrigger>
            <DialogContent className="p-0 font-normal">
                <DialogHeader>
                    <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                        Enroll Students
                    </div>
                    <DialogDescription className="flex flex-col items-center justify-center gap-6 p-6 text-neutral-600">
                        <EnrollManuallyButton />
                        <MyButton buttonType="secondary" scale="large" layoutVariant="default">
                            Enroll From Requests
                        </MyButton>
                        <EnrollBulkButton />
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
