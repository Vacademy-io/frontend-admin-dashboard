// re-register-dialog.tsx
import { MyDialog } from "../../dialog";
import { ReactNode } from "react";
import { useDialogStore } from "../../../../routes/students/students-list/-hooks/useDialogStore";
import { MyButton } from "../../button";

interface ReRegisterDialogProps {
    trigger: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ReRegisterDialogContent = () => {
    const { selectedStudent, bulkActionInfo, isBulkAction } = useDialogStore();
    const displayText = isBulkAction ? bulkActionInfo?.displayText : selectedStudent?.full_name;

    return (
        <div className="flex flex-col gap-6 p-6 text-neutral-600">
            <div>
                <span className="text-primary-500">{displayText}</span> will be re-registered for
                the upcoming session 2025-26
            </div>
            <MyButton buttonType="primary" scale="large" layoutVariant="default">
                Re-register
            </MyButton>
        </div>
    );
};

export const ReRegisterDialog = ({ trigger, open, onOpenChange }: ReRegisterDialogProps) => {
    return (
        <MyDialog
            trigger={trigger}
            heading="Re-register for Next Session"
            dialogWidth="w-[400px] max-w-[400px]"
            content={<ReRegisterDialogContent />}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};
