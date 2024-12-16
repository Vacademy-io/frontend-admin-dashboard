// terminate-registration-dialog.tsx
import { MyDialog } from "../../dialog";
import { ReactNode } from "react";
import { useDialogStore } from "../../utils/useDialogStore";
import { MyButton } from "../../button";

interface TerminateRegistrationDialogProps {
    trigger: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const TerminateRegistrationDialogContent = () => {
    const { selectedStudent, bulkActionInfo, isBulkAction } = useDialogStore();
    const displayText = isBulkAction ? bulkActionInfo?.displayText : selectedStudent?.full_name;

    return (
        <div className="flex flex-col gap-6 p-6 text-neutral-600">
            <div>
                Registration for <span className="text-primary-500">{displayText}</span> will be
                terminated
            </div>
            <MyButton buttonType="primary" scale="large" layoutVariant="default">
                Terminate
            </MyButton>
        </div>
    );
};

export const TerminateRegistrationDialog = ({
    trigger,
    open,
    onOpenChange,
}: TerminateRegistrationDialogProps) => {
    return (
        <MyDialog
            trigger={trigger}
            heading="Terminate Registration"
            dialogWidth="w-[400px] max-w-[400px]"
            content={<TerminateRegistrationDialogContent />}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};
