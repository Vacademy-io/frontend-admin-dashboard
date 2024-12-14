// TerminateRegistrationDialog.tsx
import { MyDialog } from "../../dialog";
import { ReactNode } from "react";
import { useDialogStore } from "../../utils/useDialogStore";
import { MyButton } from "../../button";

interface TerminateRegistrationDialogProps {
    trigger: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const TerminateRegistrationDialog = ({
    trigger,
    open,
    onOpenChange,
}: TerminateRegistrationDialogProps) => {
    const selectedStudent = useDialogStore((state) => state.selectedStudent);

    return (
        <MyDialog
            trigger={trigger}
            heading="Terminate Registration"
            dialogWidth="w-[400px] max-w-[400px]"
            content={
                <div className="flex flex-col gap-6 p-6 text-neutral-600">
                    <div>
                        Registration for{" "}
                        <span className="text-primary-500">{selectedStudent?.full_name}</span> will
                        be terminated
                    </div>
                    <MyButton buttonType="primary" scale="large" layoutVariant="default">
                        Terminate
                    </MyButton>
                </div>
            }
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};
