import { ReactNode } from "react";
import { useSubmissionsBulkActionsDialogStore } from "../bulk-actions-zustand-store/useSubmissionsBulkActionsDialogStore";
import { MyDialog } from "@/components/design-system/dialog";
import { MyButton } from "@/components/design-system/button";

interface ProvideDialogDialogProps {
    trigger: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ProvideRevaluateQuestionWiseDialogContent = () => {
    const { selectedStudent, bulkActionInfo, isBulkAction, closeAllDialogs } =
        useSubmissionsBulkActionsDialogStore();

    const displayText = isBulkAction ? bulkActionInfo?.displayText : selectedStudent?.student_name;

    const handleSubmit = () => {
        if (isBulkAction && bulkActionInfo?.selectedStudents) {
            console.log("bulk actions");
        } else if (selectedStudent) {
            console.log("individual student");
        }
        closeAllDialogs();
    };

    return (
        <div className="flex flex-col gap-6 px-4 pb-2 text-neutral-600">
            <h1>
                Are you sure you want to revaluate assessment question wise for&nbsp;
                <span className="text-primary-500">{displayText}</span>&nbsp;?
            </h1>
            <MyButton
                buttonType="primary"
                scale="large"
                layoutVariant="default"
                onClick={handleSubmit}
            >
                Done
            </MyButton>
        </div>
    );
};

export const ProvideRevaluateQuestionWiseDialog = ({
    trigger,
    open,
    onOpenChange,
}: ProvideDialogDialogProps) => {
    return (
        <MyDialog
            trigger={trigger}
            heading="Question Wise Revaluation"
            dialogWidth="w-[400px] max-w-[400px]"
            content={<ProvideRevaluateQuestionWiseDialogContent />}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};
