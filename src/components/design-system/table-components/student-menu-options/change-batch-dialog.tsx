// components/change-batch-dialog.tsx
import { MyDialog } from "../../dialog";
import { ReactNode, useState } from "react";
import { useDialogStore } from "../../utils/useDialogStore";
import { BatchDropdown } from "@/components/common/students/batch-dropdown";
import { MyButton } from "../../button";
import { useUpdateBatchMutation } from "@/services/student-list-section/useStudentOperations";
import { useBulkUpdateBatchMutation } from "@/services/student-list-section/useBulkOperations";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";

interface ChangeBatchDialogProps {
    trigger: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ChangeBatchDialogContent = () => {
    const { selectedStudent, bulkActionInfo, isBulkAction, closeAllDialogs } = useDialogStore();

    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [isFormValid, setIsFormValid] = useState({
        session: false,
    });

    const { mutate: updateSingleBatch, isPending: isSinglePending } = useUpdateBatchMutation();
    const { mutate: updateBulkBatch, isPending: isBulkPending } = useBulkUpdateBatchMutation();
    const { instituteDetails } = useInstituteDetailsStore();

    const displayText = isBulkAction ? bulkActionInfo?.displayText : selectedStudent?.full_name;

    const handleSessionValidation = (isValid: boolean) => {
        setIsFormValid((prev) => ({ ...prev, session: isValid }));
    };

    const handleBatchChange = (batchId: string) => {
        setSelectedBatchId(batchId);
    };

    const handleSubmit = () => {
        if (isBulkAction && bulkActionInfo?.selectedStudents) {
            updateBulkBatch(
                {
                    students: bulkActionInfo.selectedStudents.map((student) => ({
                        userId: student.user_id,
                        currentPackageSessionId: student.package_session_id || "",
                    })),
                    newPackageSessionId: selectedBatchId,
                },
                {
                    onSuccess: closeAllDialogs,
                },
            );
        } else if (selectedStudent) {
            updateSingleBatch(
                {
                    students: [
                        {
                            userId: selectedStudent.user_id,
                            currentPackageSessionId: selectedStudent.package_session_id || "",
                        },
                    ],
                    newPackageSessionId: selectedBatchId,
                },
                {
                    onSuccess: closeAllDialogs,
                },
            );
        }
    };

    const currentBatchInfo = isBulkAction
        ? null
        : instituteDetails?.batches_for_sessions.find(
              (batch) => batch.id === selectedStudent?.package_session_id,
          );

    const currentSession = currentBatchInfo?.session.session_name;
    const isLoading = isSinglePending || isBulkPending;

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
                onBatchSelect={handleBatchChange}
            />
            <MyButton
                buttonType="primary"
                scale="large"
                layoutVariant="default"
                disable={!isFormValid.session || isLoading}
                onClick={handleSubmit}
            >
                {isLoading ? "Updating..." : "Change Group/Batch"}
            </MyButton>
        </div>
    );
};

export const ChangeBatchDialog = ({ trigger, open, onOpenChange }: ChangeBatchDialogProps) => {
    return (
        <MyDialog
            trigger={trigger}
            heading="Change Batch"
            dialogWidth="w-[400px] max-w-[400px]"
            content={<ChangeBatchDialogContent />}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};
