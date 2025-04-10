import { Dialog, DialogContent, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { MyButton } from "@/components/design-system/button";
import { EnrollManuallyButton } from "./enroll-manually/enroll-manually-button";
import { EnrollBulkButton } from "@/routes/students/students-list/-components/enroll-bulk/enroll-bulk-button";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { cn } from "@/lib/utils";
import { useDialogStore } from "@/stores/students/students-list/useDialogStore";

export const EnrollStudentsButton = () => {
    const { getCourseFromPackage } = useInstituteDetailsStore();
    const { isEnrollStudentsOpen, setEnrollStudentsOpen } = useDialogStore();

    return (
        <Dialog open={isEnrollStudentsOpen} onOpenChange={setEnrollStudentsOpen}>
            <DialogTrigger
                disabled={getCourseFromPackage().length === 0}
                className={cn(
                    getCourseFromPackage().length === 0 && "pointer-events-none opacity-55",
                )}
            >
                <MyButton
                    buttonType="primary"
                    scale="large"
                    layoutVariant="default"
                    id="enroll-students"
                >
                    Enroll Students
                </MyButton>
            </DialogTrigger>
            <DialogContent className="p-0 font-normal">
                <DialogTitle>
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
                </DialogTitle>
            </DialogContent>
        </Dialog>
    );
};
