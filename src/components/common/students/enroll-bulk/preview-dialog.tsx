// components/PreviewDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { MyButton } from "@/components/design-system/button";
import { BulkUploadTable } from "./bulk-upload-table";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import { toast } from "sonner";

interface PreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    headers: Header[];
    onEdit?: (rowIndex: number, columnId: string, value: string) => void;
}

// preview-dialog.tsx
export const PreviewDialog = ({ isOpen, onClose, headers, onEdit }: PreviewDialogProps) => {
    const handleClose = () => {
        onClose();
        toast.success("Students enrollment process completed");
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="h-[80vh] p-0 font-normal">
                <DialogHeader>
                    <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                        Upload Results
                    </div>
                </DialogHeader>
                <div className="flex-1 overflow-auto p-6">
                    <BulkUploadTable headers={headers} onEdit={onEdit} />
                </div>
                <DialogFooter className="border-t px-6 py-4">
                    <MyButton
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                        onClick={handleClose}
                    >
                        Close
                    </MyButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
