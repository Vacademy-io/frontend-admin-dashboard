import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Share } from "@phosphor-icons/react";
import { MyButton } from "@/components/design-system/button";
import { EnrollManuallyButton } from "../enroll-manually/enroll-manually-button";

export const EnrollStudentsButton = () => {
    return (
        <Dialog>
            <DialogTrigger>
                <MyButton buttonType="primary" scale="large" layoutVariant="default">
                    Enroll Students
                </MyButton>
            </DialogTrigger>
            <DialogContent className="w-[400px] p-0 font-normal">
                <DialogHeader>
                    <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                        Enroll Students
                    </div>
                    <DialogDescription className="flex flex-col items-center justify-center gap-6 p-6 text-neutral-600">
                        <EnrollManuallyButton />
                        <MyButton buttonType="secondary" scale="large" layoutVariant="default">
                            Enroll From Requests
                        </MyButton>
                        <MyButton buttonType="primary" scale="large" layoutVariant="default">
                            <span>
                                <Share />
                            </span>
                            Enroll in Bulk
                        </MyButton>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
