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

// PreviewDialog component
export const PreviewDialog = ({ isOpen, onClose, headers, onEdit }: PreviewDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="h-[80vh] w-[80vw] max-w-[1200px] p-0 font-normal">
                <div className="flex h-full flex-col">
                    <DialogHeader>
                        <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                            Preview Data
                        </div>
                    </DialogHeader>
                    <DialogDescription className="flex-1 overflow-hidden p-6">
                        <BulkUploadTable headers={headers} onEdit={onEdit} />
                    </DialogDescription>
                    <DialogFooter className="border-t px-6 py-4">
                        <MyButton
                            buttonType="primary"
                            scale="large"
                            layoutVariant="default"
                            onClick={onClose}
                        >
                            Close
                        </MyButton>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};
