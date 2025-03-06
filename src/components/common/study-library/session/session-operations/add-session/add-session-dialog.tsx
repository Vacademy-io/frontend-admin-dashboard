import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { AddSessionDataType, AddSessionForm } from "./add-session-form";

export const AddSessionDialog = () => {
    const [isAddSessionDiaogOpen, setIsAddSessionDiaogOpen] = useState(false);

    const handleOpenAddSessionDialog = () => {
        setIsAddSessionDiaogOpen(!isAddSessionDiaogOpen);
    };
    const handleAddSession = (sessionData: AddSessionDataType) => {
        console.log("sessionData: ", sessionData);
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
