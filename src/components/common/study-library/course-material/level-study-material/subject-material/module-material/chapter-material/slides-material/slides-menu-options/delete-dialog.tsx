import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { Dispatch, SetStateAction } from "react";

interface DeleteProps {
    openDialog: "copy" | "move" | "delete" | null;
    setOpenDialog: Dispatch<SetStateAction<"copy" | "move" | "delete" | null>>;
}

export const DeleteDialog = ({ openDialog, setOpenDialog }: DeleteProps) => {
    return (
        <MyDialog
            heading="Delete"
            dialogWidth="w-[400px]"
            open={openDialog == "delete"}
            onOpenChange={() => setOpenDialog(null)}
        >
            <div className="flex w-full flex-col gap-6">
                <p>Are you sure you want to delete this?</p>
                <MyButton>Delete</MyButton>
            </div>
        </MyDialog>
    );
};
