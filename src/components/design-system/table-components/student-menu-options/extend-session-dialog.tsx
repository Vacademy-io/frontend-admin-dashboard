// extend-session-dialog.tsx
import { MyDialog } from "../../dialog";
import React, { ReactNode } from "react";
import { useDialogStore } from "../../utils/useDialogStore";
import { useState } from "react";
import { MyButton } from "../../button";
import { MyInput } from "../../input";

interface ExtendSessionDialogProps {
    trigger: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ExtendSessionDialogContent = () => {
    const { selectedStudent, bulkActionInfo, isBulkAction } = useDialogStore();
    const displayText = isBulkAction ? bulkActionInfo?.displayText : selectedStudent?.full_name;

    const [date, setDate] = useState("");

    const handleInputChange = (value: React.ChangeEvent<HTMLInputElement>) => {
        setDate(value.target.value);
    };

    return (
        <div className="flex flex-col gap-6 p-6 text-neutral-600">
            <div>
                Session duration for <span className="text-primary-500">{displayText}</span> will be
                extended
            </div>
            <MyInput
                inputType="date"
                inputPlaceholder="DD/MM/YY"
                input={date}
                onChangeFunction={handleInputChange}
                required={true}
                label="Extend till"
                className="w-fit text-neutral-600"
            />
            <MyButton
                buttonType="primary"
                scale="large"
                layoutVariant="default"
                disable={date == ""}
            >
                Extend Session
            </MyButton>
        </div>
    );
};

export const ExtendSessionDialog = ({ trigger, open, onOpenChange }: ExtendSessionDialogProps) => {
    return (
        <MyDialog
            trigger={trigger}
            heading="Extend Session"
            dialogWidth="w-[400px] max-w-[400px]"
            content={<ExtendSessionDialogContent />}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};
