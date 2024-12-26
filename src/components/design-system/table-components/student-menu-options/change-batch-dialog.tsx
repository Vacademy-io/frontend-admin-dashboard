import { MyDialog } from "../../dialog";
import { ReactNode } from "react";
import { useDialogStore } from "../../utils/useDialogStore";
import { BatchDropdown } from "@/components/common/students/batch-dropdown";
import { MyButton } from "../../button";
import { useState } from "react";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

interface ChangeBatchDialogProps {
    trigger: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
// change-batch-dialog.tsx
// change-batch-dialog.tsx
const ChangeBatchDialogContent = () => {
    const { selectedStudent, bulkActionInfo, isBulkAction } = useDialogStore();
    const displayText = isBulkAction ? bulkActionInfo?.displayText : selectedStudent?.full_name;

    const [isFormValid, setIsFormValid] = useState({
        session: false,
    });

    const handleSessionValidation = (isValid: boolean) => {
        setIsFormValid((prev) => ({ ...prev, session: isValid }));
    };

    // Get the current session from the package_session_id
    const { instituteDetails } = useInstituteDetailsStore();
    const currentBatchInfo = instituteDetails?.batches_for_sessions.find(
        (batch) => batch.id === selectedStudent?.package_session_id,
    );
    const currentSession = currentBatchInfo?.session.session_name;

    return (
        <div className="flex flex-col gap-6 p-6 text-neutral-600">
            <div>
                Batch for <span className="text-primary-500">{displayText}</span> will be changed to
                the following
            </div>
            <BatchDropdown
                handleSessionValidation={handleSessionValidation}
                session={currentSession}
                currentPackageSessionId={
                    !isBulkAction ? selectedStudent?.package_session_id : undefined
                }
            />
            <MyButton
                buttonType="primary"
                scale="large"
                layoutVariant="default"
                disable={!isFormValid.session}
            >
                Change Group/Batch
            </MyButton>
        </div>
    );
};

export const ChangeBatchDialog = ({ trigger, open, onOpenChange }: ChangeBatchDialogProps) => {
    return (
        <MyDialog
            trigger={trigger}
            heading="Change Batch"
            content={<ChangeBatchDialogContent />}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};
