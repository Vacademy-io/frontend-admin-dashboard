import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { AddSessionDataType, AddSessionForm } from "./add-session-form";
import { useAddSession } from "@/services/study-library/session-management/addSession";
import { toast } from "sonner";

export const AddSessionDialog = () => {
    const [isAddSessionDiaogOpen, setIsAddSessionDiaogOpen] = useState(false);
    const addSessionMutation = useAddSession();

    const handleOpenAddSessionDialog = () => {
        setIsAddSessionDiaogOpen(!isAddSessionDiaogOpen);
    };
    const handleAddSession = (sessionData: AddSessionDataType) => {
        addSessionMutation.mutate(
            { requestData: sessionData },
            {
                onSuccess: () => {
                    toast.success("Session added successfully");
                    setIsAddSessionDiaogOpen(false);
                },
                onError: (error) => {
                    toast.error(error.message || "Failed to add course");
                },
            },
        );
    };

    return (
        <MyDialog
            heading="Add session"
            trigger={
                <MyButton>
                    {" "}
                    <Plus /> Add New Session
                </MyButton>
            }
            dialogWidth="w-[700px]"
            open={isAddSessionDiaogOpen}
            onOpenChange={handleOpenAddSessionDialog}
        >
            <AddSessionForm onSubmit={handleAddSession} />
        </MyDialog>
    );
};
