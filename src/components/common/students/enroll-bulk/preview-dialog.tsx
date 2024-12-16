// components/PreviewDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { MyButton } from "@/components/design-system/button";
import { BulkUploadTable } from "./bulk-upload-table";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";

interface PreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    headers: Header[];
    onEdit?: (rowIndex: number, columnId: string, value: string) => void;
}

export const PreviewDialog = ({ isOpen, onClose, headers, onEdit }: PreviewDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[90vw] max-w-[1200px] p-0 font-normal">
                <DialogHeader>
                    <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                        Preview Data
                    </div>
                    <DialogDescription className="p-6">
                        <BulkUploadTable headers={headers} onEdit={onEdit} />
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="px-6 py-4">
                    <MyButton
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                        onClick={onClose}
                    >
                        Close
                    </MyButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
