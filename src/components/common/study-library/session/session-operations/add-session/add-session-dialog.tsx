import { MyDialog } from "@/components/design-system/dialog";
import { AddSessionDataType, AddSessionForm } from "./add-session-form";
import { ReactNode } from "react";
import { SessionData } from "@/types/study-library/session-types";

interface AddSessionDialogProps {
    isAddSessionDiaogOpen: boolean;
    handleOpenAddSessionDialog: () => void;
    handleSubmit: (sessionData: AddSessionDataType) => void;
    trigger: ReactNode;
    initialValues?: SessionData;
}

export const AddSessionDialog = ({
    isAddSessionDiaogOpen,
    handleOpenAddSessionDialog,
    handleSubmit,
    trigger,
    initialValues,
}: AddSessionDialogProps) => {
    return (
        <MyDialog
            heading="Add session"
            trigger={trigger}
            dialogWidth="w-[700px]"
            open={isAddSessionDiaogOpen}
            onOpenChange={handleOpenAddSessionDialog}
        >
            <AddSessionForm onSubmit={handleSubmit} initialValues={initialValues} />
        </MyDialog>
    );
};
