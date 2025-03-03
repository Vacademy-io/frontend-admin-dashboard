import React, { useState } from "react";
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
import { Warning } from "@phosphor-icons/react";
import { StatusColumnRenderer } from "./status-column-rendered";
import { Row } from "@tanstack/react-table";
import { SchemaFields } from "@/types/students/bulk-upload-types";
import { EditableBulkUploadTable } from "./bulk-upload-table";
import { UploadResultsTable } from "./upload-results-table";
import { ErrorDetailsDialog } from "./error-details-dialog";

interface PreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | null;
    headers: Header[];
    onEdit?: (rowIndex: number, columnId: string, value: string) => void;
    uploadCompleted?: boolean;
    uploadResponse?: SchemaFields[] | null;
    onDownloadResponse?: () => void;
}

export const PreviewDialog: React.FC<PreviewDialogProps> = ({
    isOpen,
    onClose,
    headers,
    onEdit,
    uploadCompleted = false,
    uploadResponse = null,
    onDownloadResponse,
}) => {
    const { csvData, csvErrors, setIsEditing } = useBulkUploadStore();
    const [selectedErrorRow, setSelectedErrorRow] = useState<number | null>(null);
    const [showErrorDialog, setShowErrorDialog] = useState(false);

    // When the dialog closes, ensure edit mode is turned off
    React.useEffect(() => {
        if (!isOpen) {
            setIsEditing(false);
        }
    }, [isOpen, setIsEditing]);

    // Create a wrapped status column renderer with proper type safety
    const CustomStatusColumnRenderer = React.useCallback(
        ({ row }: { row: Row<SchemaFields> }) => {
            return (
                <StatusColumnRenderer
                    row={row}
                    csvErrors={csvErrors}
                    csvData={uploadCompleted && uploadResponse ? uploadResponse : csvData}
                />
            );
        },
        [csvErrors, csvData, uploadCompleted, uploadResponse],
    );

    // Handler for viewing error details
    const handleViewError = (rowIndex: number) => {
        setSelectedErrorRow(rowIndex);
        setShowErrorDialog(true);
    };

    // Count of affected rows in validation
    const affectedRows = React.useMemo(() => {
        if (!csvErrors || csvErrors.length === 0) return 0;

        const uniqueRows = new Set(csvErrors.map((err) => err.path[0]));
        return uniqueRows.size;
    }, [csvErrors]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="no-scrollbar h-[80vh] w-[80vw] max-w-[1200px] overflow-hidden p-0 font-normal">
                {uploadCompleted && uploadResponse ? (
                    // Show upload results using the new component
                    <DialogDescription className="flex flex-col overflow-x-scroll p-6">
                        <UploadResultsTable
                            data={uploadResponse}
                            onViewError={handleViewError}
                            onClose={onClose}
                            onDownloadResponse={onDownloadResponse}
                        />
                    </DialogDescription>
                ) : (
                    // Show preview/validation UI
                    <>
                        <DialogHeader className="h-full">
                            <div className="flex items-center justify-between bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                                <span>Preview Data</span>
                            </div>
                        </DialogHeader>

                        {csvErrors.length > 0 && (
                            <div className="mx-6 mt-4 rounded-md bg-danger-50 p-4">
                                <div className="flex items-center">
                                    <Warning className="h-5 w-5 text-danger-500" />
                                    <h3 className="ml-2 text-lg font-medium text-danger-700">
                                        Found {csvErrors.length} validation issues in {affectedRows}{" "}
                                        rows
                                    </h3>
                                </div>
                                <p className="mt-2 text-sm text-danger-700">
                                    Please check the STATUS column and fix these issues before
                                    proceeding.
                                </p>
                            </div>
                        )}

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
                    </>
                )}
            </DialogContent>

            {/* Error details dialog */}
            {showErrorDialog && uploadResponse && selectedErrorRow !== null && (
                <ErrorDetailsDialog
                    isOpen={showErrorDialog}
                    onClose={() => setShowErrorDialog(false)}
                    errors={[
                        {
                            path: [selectedErrorRow, "ERROR"],
                            message: "Upload failed",
                            resolution: "Check the error details for more information",
                            currentVal: String(
                                uploadResponse[selectedErrorRow]?.ERROR || "Unknown error",
                            ),
                            format: "",
                        },
                    ]}
                    rowData={uploadResponse[selectedErrorRow] || {}}
                    isApiError={true}
                />
            )}
        </Dialog>
    );
};
