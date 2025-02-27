import { StudyMaterialDetailsForm } from "@/components/common/study-library/upload-study-material/study-material-details-form";
import { MyDialog } from "@/components/design-system/dialog";
import { Dispatch, SetStateAction } from "react";

interface MoveTo {
    openDialog: "copy" | "move" | "delete" | "edit" | null;
    setOpenDialog: Dispatch<SetStateAction<"copy" | "move" | "delete" | "edit" | null>>;
}

export const MoveToDialog = ({ openDialog, setOpenDialog }: MoveTo) => {
    return (
        <MyDialog
            heading="Move to"
            dialogWidth="w-[400px]"
            open={openDialog == "move"}
            onOpenChange={() => setOpenDialog(null)}
        >
            <StudyMaterialDetailsForm
                fields={["course", "session", "level", "subject", "module"]}
                onFormSubmit={() => {}}
                submitButtonName="Move"
            />
        </MyDialog>
    );
};
