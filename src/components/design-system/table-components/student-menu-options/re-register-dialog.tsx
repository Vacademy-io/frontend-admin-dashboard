// ReRegisterDialog.tsx
import { MyDialog } from "../../dialog";
import { ReactNode } from "react";
import { useDialogStore } from "../../utils/useDialogStore";
import { MyButton } from "../../button";

interface ReRegisterDialogProps {
    trigger: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ReRegisterDialog = ({ trigger, open, onOpenChange }: ReRegisterDialogProps) => {
    const selectedStudent = useDialogStore((state) => state.selectedStudent);

    return (
        <MyDialog
            trigger={trigger}
            heading="Re-register for Next Session"
            dialogWidth="w-[400px] max-w-[400px]"
            content={
                <div className="flex flex-col gap-6 p-6 text-neutral-600">
                    <div>
                        {" "}
                        <span className="text-primary-500">{selectedStudent?.full_name}</span> will
                        be re-registered for the upcoming session 2025-26
                    </div>
                    <MyButton buttonType="primary" scale="large" layoutVariant="default">
                        Re-register
                    </MyButton>
                </div>
            }
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};
