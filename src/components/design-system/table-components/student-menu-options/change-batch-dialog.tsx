import { MyDialog } from "../../dialog";
import { ReactNode } from "react";
import { useDialogStore } from "../../utils/useDialogStore";
import { BatchDropdown } from "@/components/common/students/batch-dropdown";
import { MyButton } from "../../button";
import { useState } from "react";

interface ChangeBatchDialogProps {
    trigger: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ChangeBatchDialogContent = ({ student_name }: { student_name: string }) => {
    const [isFormValid, setIsFormValid] = useState({
        session: false,
    });

    const handleSessionValidation = (isValid: boolean) => {
        setIsFormValid((prev) => ({ ...prev, session: isValid }));
    };

    return (
        <div className="flex flex-col gap-6 p-6 text-neutral-600">
            <div>
                {" "}
                Batch for <span className="text-primary-500">{student_name}</span> will be changed
                to the following
            </div>
            <BatchDropdown handleSessionValidation={handleSessionValidation} />
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
    const selectedStudent = useDialogStore((state) => state.selectedStudent);

    return (
        <MyDialog
            trigger={trigger}
            heading="Change Batch"
            content={<ChangeBatchDialogContent student_name={selectedStudent?.full_name || ""} />}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};
