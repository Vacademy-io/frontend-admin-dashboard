import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { Plus } from "@phosphor-icons/react";
import { useState } from "react";

export const AddSessionDialog = () => {
    const [isAddSessionDiaogOpen, setIsAddSessionDiaogOpen] = useState(false);
    const handleOpenAddSessionDialog = () => {
        setIsAddSessionDiaogOpen(!isAddSessionDiaogOpen);
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
            adsf
        </MyDialog>
    );
};
