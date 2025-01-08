import { ImportFileImage } from "@/assets/svgs";
import { MyButton } from "@/components/design-system/button";
import { DialogFooter } from "@/components/ui/dialog";
import { DialogContent } from "@radix-ui/react-dialog";

export const AddPdfDialog = () => {
    return (
        <DialogContent className="flex flex-col items-center gap-6">
            {/* Add your PDF upload form content here */}
            <ImportFileImage />
            <DialogFooter>
                <MyButton buttonType="primary" layoutVariant="default" scale="large">
                    Add Pdf
                </MyButton>
            </DialogFooter>
        </DialogContent>
    );
};
