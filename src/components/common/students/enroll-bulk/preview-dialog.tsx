import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { MyButton } from "@/components/design-system/button";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import { useBulkUploadStore } from "@/stores/students/enroll-students-bulk/useBulkUploadStore";
// import { Warning } from "@phosphor-icons/react";
import { StatusColumnRenderer } from "./status-column-rendered";
import { Row } from "@tanstack/react-table";
import { SchemaFields } from "@/types/students/bulk-upload-types";
import { EditableBulkUploadTable } from "./bulk-upload-table";

interface PreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | null;
    headers: Header[];
    onEdit?: (rowIndex: number, columnId: string, value: string) => void;
}

export const PreviewDialog: React.FC<PreviewDialogProps> = ({
    isOpen,
    onClose,
    headers,
    onEdit,
}) => {
    const { csvData, csvErrors, setIsEditing } = useBulkUploadStore();

    // When the dialog closes, ensure edit mode is turned off
    React.useEffect(() => {
        if (!isOpen) {
            setIsEditing(false);
        }
    }, [isOpen, setIsEditing]);

    // Group errors by type for summary
    // const errorSummary = React.useMemo(() => {
    //     if (!csvErrors || csvErrors.length === 0) return null;

    //     const summary = {
    //         requiredMissing: 0,
    //         invalidFormat: 0,
    //         invalidEnum: 0,
    //         invalidDate: 0,
    //         other: 0,
    //     };

    //     csvErrors.forEach((error) => {
    //         if (error.message.includes("required")) {
    //             summary.requiredMissing++;
    //         } else if (error.message.includes("format")) {
    //             summary.invalidFormat++;
    //         } else if (error.message.includes("Invalid value for")) {
    //             summary.invalidEnum++;
    //         } else if (error.message.includes("date")) {
    //             summary.invalidDate++;
    //         } else {
    //             summary.other++;
    //         }
    //     });

    //     return summary;
    // }, [csvErrors]);

    // Count of affected rows
    // const affectedRows = React.useMemo(() => {
    //     if (!csvErrors || csvErrors.length === 0) return 0;

    //     const uniqueRows = new Set(csvErrors.map((err) => err.path[0]));
    //     return uniqueRows.size;
    // }, [csvErrors]);

    // Create a wrapped status column renderer with proper type safety
    const CustomStatusColumnRenderer = React.useCallback(
        ({ row }: { row: Row<SchemaFields> }) => {
            return <StatusColumnRenderer row={row} csvErrors={csvErrors} csvData={csvData} />;
        },
        [csvErrors, csvData],
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="h-[80vh] w-[80vw] max-w-[1200px] overflow-hidden p-0 font-normal">
                <DialogHeader className="h-full">
                    <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                        Preview Data
                    </div>
                </DialogHeader>

                {/* {csvErrors.length > 0 && (
                    <div className="mx-6 mt-4 rounded-md bg-danger-50 p-4">
                        <div className="flex items-center">
                            <Warning className="h-5 w-5 text-danger-500" />
                            <h3 className="ml-2 text-lg font-medium text-danger-700">
                                Found {csvErrors.length} validation issues in {affectedRows} rows
                            </h3>
                        </div>

                        {errorSummary && (
                            <div className="mt-2 text-sm text-danger-700">
                                <ul className="list-inside list-disc space-y-1 pl-5">
                                    {errorSummary.requiredMissing > 0 && (
                                        <li>
                                            {errorSummary.requiredMissing} required fields missing
                                        </li>
                                    )}
                                    {errorSummary.invalidEnum > 0 && (
                                        <li>
                                            {errorSummary.invalidEnum} fields with invalid options
                                        </li>
                                    )}
                                    {errorSummary.invalidDate > 0 && (
                                        <li>
                                            {errorSummary.invalidDate} fields with invalid date
                                            format
                                        </li>
                                    )}
                                    {errorSummary.invalidFormat > 0 && (
                                        <li>
                                            {errorSummary.invalidFormat} fields with invalid format
                                        </li>
                                    )}
                                    {errorSummary.other > 0 && (
                                        <li>{errorSummary.other} other validation errors</li>
                                    )}
                                </ul>
                                <p className="mt-2">
                                    Please check the STATUS column and fix these issues before
                                    proceeding.
                                </p>
                            </div>
                        )}
                    </div>
                )} */}

                <DialogDescription className="flex flex-col overflow-x-scroll p-6">
                    <EditableBulkUploadTable
                        headers={headers}
                        onEdit={onEdit}
                        statusColumnRenderer={CustomStatusColumnRenderer}
                    />
                </DialogDescription>
                <DialogFooter className="border-t px-6 py-4">
                    <div className="flex w-full justify-between">
                        <div>
                            {csvErrors.length > 0 && (
                                <span className="text-sm text-danger-600">
                                    Please fix validation errors before proceeding
                                </span>
                            )}
                        </div>
                        <MyButton
                            buttonType="primary"
                            scale="large"
                            layoutVariant="default"
                            onClick={onClose}
                        >
                            Close
                        </MyButton>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
