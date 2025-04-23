import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MyButton } from "@/components/design-system/button";

interface GenerateDialogProps {
    open: boolean;
    handleOpen: (open: boolean) => void;
    handleGenerateCompleteFile: () => void;
    handleGeneratePageWise: () => void;
}

export const GenerateAssessmentDialog = ({
    open,
    handleOpen,
    handleGenerateCompleteFile,
    handleGeneratePageWise,
}: GenerateDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogContent className="p-0">
                <h1 className="rounded-t-lg bg-primary-50 p-4 font-semibold text-primary-500">
                    Generate Assessment
                </h1>
                <div className="my-4 flex flex-col items-center justify-center gap-4">
                    <MyButton
                        type="submit"
                        scale="medium"
                        buttonType="secondary"
                        layoutVariant="default"
                        className="w-48 text-sm"
                        onClick={handleGenerateCompleteFile}
                    >
                        Generate Complete File
                    </MyButton>
                    <MyButton
                        type="submit"
                        scale="medium"
                        buttonType="secondary"
                        layoutVariant="default"
                        className="w-48 text-sm"
                        onClick={handleGeneratePageWise}
                    >
                        Generate Page Wise
                    </MyButton>
                </div>
            </DialogContent>
        </Dialog>
    );
};
