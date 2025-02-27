import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { MyButton } from "@/components/design-system/button";
import { ValidationError, SchemaFields } from "@/types/students/bulk-upload-types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ErrorDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    errors: ValidationError[];
    rowData: SchemaFields;
}

// Error Details Dialog Component
export const ErrorDetailsDialog = ({
    isOpen,
    onClose,
    errors,
    rowData,
}: ErrorDetailsDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[800px] max-w-[900px] p-0 font-normal">
                <DialogHeader>
                    <div className="bg-danger-50 px-6 py-4 text-h3 font-semibold text-danger-600">
                        Validation Errors
                    </div>
                </DialogHeader>

                <div className="p-6">
                    <Table className="border">
                        <TableHeader className="bg-neutral-100">
                            <TableRow>
                                <TableHead className="w-1/5 border-r p-3 font-semibold text-neutral-700">
                                    Position
                                </TableHead>
                                <TableHead className="w-1/4 border-r p-3 font-semibold text-neutral-700">
                                    Error
                                </TableHead>
                                <TableHead className="w-1/3 border-r p-3 font-semibold text-neutral-700">
                                    Resolution
                                </TableHead>
                                <TableHead className="w-1/5 p-3 font-semibold text-neutral-700">
                                    Current Value
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {errors.map((error, index) => (
                                <TableRow key={index}>
                                    <TableCell className="border-r p-3">
                                        {`In row ${error.path[0] + 1} of ${error.path[1]}`}
                                    </TableCell>
                                    <TableCell className="border-r p-3 text-danger-600">
                                        {error.message}
                                    </TableCell>
                                    <TableCell className="border-r p-3 text-success-600">
                                        {error.resolution}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {error.currentVal ||
                                            rowData[error.path[1]]?.toString() ||
                                            "N/A"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

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
            </DialogContent>
        </Dialog>
    );
};
