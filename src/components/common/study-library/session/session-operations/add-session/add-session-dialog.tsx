import { MyDialog } from "@/components/design-system/dialog";
import { AddSessionDataType, AddSessionForm } from "./add-session-form";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { SessionData } from "@/types/study-library/session-types";

interface AddSessionDialogProps {
    isAddSessionDiaogOpen: boolean;
    handleOpenAddSessionDialog: () => void;
    handleSubmit: (sessionData: AddSessionDataType) => void;
    trigger: ReactNode;
    initialValues?: SessionData;
    submitButton: JSX.Element;
    setDisableAddButton: Dispatch<SetStateAction<boolean>>;
}

export const AddSessionDialog = ({
    isAddSessionDiaogOpen,
    handleOpenAddSessionDialog,
    handleSubmit,
    trigger,
    initialValues,
    submitButton,
    setDisableAddButton,
}: AddSessionDialogProps) => {
    return (
        <MyDialog
            heading={initialValues ? "Edit session" : "Add session"}
            trigger={trigger}
            dialogWidth="w-[700px]"
            open={isAddSessionDiaogOpen}
            onOpenChange={handleOpenAddSessionDialog}
            footer={submitButton}
        >
            <AddSessionForm
                onSubmit={handleSubmit}
                initialValues={initialValues}
                setDisableAddButton={setDisableAddButton}
            />
        </MyDialog>
    );
};
