// delete-student-dialog.tsx
import { MyDialog } from "../../dialog";
import { ReactNode } from "react";
import { useDialogStore } from "../../utils/useDialogStore";
import { MyButton } from "../../button";

interface DeleteStudentDialogProps {
    trigger: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DeleteStudentDialogContent = () => {
    const { selectedStudent, bulkActionInfo, isBulkAction } = useDialogStore();
    const displayText = isBulkAction ? bulkActionInfo?.displayText : selectedStudent?.full_name;

    return (
        <div className="flex flex-col gap-6 p-6 text-neutral-600">
            <div>
                Are you sure you want to delete{" "}
                <span className="text-primary-500">{displayText}</span>?
            </div>
            <MyButton buttonType="primary" scale="large" layoutVariant="default">
                Delete
            </MyButton>
        </div>
    );
};

export const DeleteStudentDialog = ({ trigger, open, onOpenChange }: DeleteStudentDialogProps) => {
    return (
        <MyDialog
            trigger={trigger}
            heading="Delete"
            dialogWidth="w-[400px] max-w-[400px]"
            content={<DeleteStudentDialogContent />}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};
