import { StudyMaterialDetailsForm } from "@/components/common/study-library/upload-study-material/study-material-details-form";
import { MyDialog } from "@/components/design-system/dialog";
import { Dispatch, SetStateAction } from "react";

interface CopyTo {
    openDialog: "copy" | "move" | "delete" | null;
    setOpenDialog: Dispatch<SetStateAction<"copy" | "move" | "delete" | null>>;
}

export const CopyToDialog = ({ openDialog, setOpenDialog }: CopyTo) => {
    return (
        <MyDialog
            heading="Copy to"
            dialogWidth="w-[400px]"
            open={openDialog == "copy"}
            onOpenChange={() => setOpenDialog(null)}
        >
            <StudyMaterialDetailsForm
                fields={["course", "session", "level", "subject", "module", "chapter"]}
                onFormSubmit={() => {}}
                submitButtonName="Copy"
            />
        </MyDialog>
    );
};
