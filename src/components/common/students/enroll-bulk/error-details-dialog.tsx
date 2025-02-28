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
import { Warning } from "@phosphor-icons/react";

interface ErrorDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    errors: ValidationError[];
    rowData: SchemaFields;
    isApiError?: boolean;
}

// Error Details Dialog Component
export const ErrorDetailsDialog = ({
    isOpen,
    onClose,
    errors,
    rowData,
    isApiError = false,
}: ErrorDetailsDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[800px] max-w-[900px] p-0 font-normal">
                <DialogHeader>
                    <div className="flex items-center bg-danger-50 px-6 py-4 text-h3 font-semibold text-danger-600">
                        <Warning className="mr-2 h-5 w-5" />
                        {isApiError ? "Upload Error" : "Validation Errors"}
                    </div>
                </DialogHeader>

                <div className="p-6">
                    {isApiError ? (
                        // Display API errors
                        <div className="space-y-4">
                            <div className="rounded-md bg-danger-50 p-4">
                                <h3 className="mb-2 text-lg font-medium text-danger-700">
                                    Upload failed for this entry
                                </h3>
                                <div className="whitespace-pre-wrap text-danger-600">
                                    {rowData.ERROR ||
                                        rowData.STATUS_MESSAGE ||
                                        "Unknown error occurred during upload."}
                                </div>
                            </div>

                            <div className="mt-4">
                                <h3 className="mb-2 text-lg font-medium">Row Data</h3>
                                <Table className="border">
                                    <TableHeader className="bg-neutral-100">
                                        <TableRow>
                                            <TableHead className="w-1/3 border-r p-3 font-semibold text-neutral-700">
                                                Field
                                            </TableHead>
                                            <TableHead className="w-2/3 p-3 font-semibold text-neutral-700">
                                                Value
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(rowData)
                                            .filter(
                                                ([key]) =>
                                                    key !== "ERROR" &&
                                                    key !== "STATUS" &&
                                                    key !== "STATUS_MESSAGE",
                                            )
                                            .map(([key, value]) => (
                                                <TableRow key={key}>
                                                    <TableCell className="border-r p-3 font-medium">
                                                        {key.replace(/_/g, " ")}
                                                    </TableCell>
                                                    <TableCell className="p-3">
                                                        {value?.toString() || "N/A"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        // Display validation errors
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
                    )}
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
