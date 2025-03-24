import { StudyMaterialDetailsForm } from "@/routes/study-library/courses/-components/upload-study-material/study-material-details-form";
import { MyDialog } from "@/components/design-system/dialog";
import { Dispatch, SetStateAction } from "react";

interface MoveTo {
    openDialog: "copy" | "move" | "delete" | null;
    setOpenDialog: Dispatch<SetStateAction<"copy" | "move" | "delete" | null>>;
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
                fields={["course", "session", "level", "subject", "module", "chapter"]}
                onFormSubmit={() => {}}
                submitButtonName="Move"
            />
        </MyDialog>
    );
};
