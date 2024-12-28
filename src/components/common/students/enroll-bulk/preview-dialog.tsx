// components/PreviewDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { MyButton } from "@/components/design-system/button";
import { BulkUploadTable } from "./bulk-upload-table";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";

interface PreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    headers: Header[];
    onEdit?: (rowIndex: number, columnId: string, value: string) => void;
}

// preview-dialog.tsx
export const PreviewDialog = ({ isOpen, onClose, headers, onEdit }: PreviewDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="h-[80vh] p-0 font-normal">
                <div className="flex h-full flex-col">
                    <DialogHeader className="flex-none">
                        <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                            Student List Preview
                        </div>
                    </DialogHeader>

                    {/* Main content area with proper scroll containers */}
                    <div className="flex-1 p-6">
                        <div className="h-full">
                            {/* Enable both horizontal and vertical scrolling */}
                            <div className="no-scrollbar overflow-x-scroll">
                                <BulkUploadTable headers={headers} onEdit={onEdit} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-none border-t px-6 py-4">
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
