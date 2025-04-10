import React, { useState } from "react";
import { MyButton } from "@/components/design-system/button";
import { Header } from "@/routes/students/students-list/-schemas/student-bulk-enroll/csv-bulk-init";
import { useBulkUploadStore } from "@/routes/students/students-list/-stores/enroll-students-bulk/useBulkUploadStore";
import { Warning } from "@phosphor-icons/react";
// import { StatusColumnRenderer } from "./status-column-rendered";
// import { Row } from "@tanstack/react-table";
import { SchemaFields } from "@/routes/students/students-list/-types/bulk-upload-types";
import { EditableBulkUploadTable } from "./bulk-upload-table";
import { UploadResultsTable } from "./upload-results-table";
import { ErrorDetailsDialog } from "./error-details-dialog";
import { MyDialog } from "@/components/design-system/dialog";

interface PreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | null;
    headers: Header[];
    onEdit?: (rowIndex: number, columnId: string, value: string) => void;
    uploadCompleted?: boolean;
    uploadResponse?: SchemaFields[] | null;
    onDownloadResponse?: () => void;
    closeAllDialogs?: () => void; // New prop to close all dialogs
}

export const PreviewDialog: React.FC<PreviewDialogProps> = ({
    isOpen,
    onClose,
    headers,
    onEdit,
    uploadCompleted = false,
    uploadResponse = null,
    onDownloadResponse,
    closeAllDialogs,
}) => {
    const { csvErrors, setIsEditing } = useBulkUploadStore();
    const [selectedErrorRow, setSelectedErrorRow] = useState<number | null>(null);
    const [showErrorDialog, setShowErrorDialog] = useState(false);

    React.useEffect(() => {
        if (!isOpen) {
            setIsEditing(false);
        }
    }, [isOpen, setIsEditing]);

    // Handle close with option to close all dialogs
    const handleClose = () => {
        onClose();
        if (uploadCompleted && closeAllDialogs) {
            closeAllDialogs();
        }
    };

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

    const footer = (
        <footer className="">
            <div className="flex w-full justify-between">
                <MyButton
                    buttonType="primary"
                    scale="large"
                    layoutVariant="default"
                    onClick={handleClose}
                >
                    {uploadCompleted ? "Close" : "Go Back"}
                </MyButton>
            </div>
        </footer>
    );

    return (
        <MyDialog
            open={isOpen}
            onOpenChange={handleClose}
            heading={uploadCompleted && uploadResponse ? "Upload Response" : "Preview Data"}
            dialogWidth="w-[80vw]"
            footer={footer}
        >
            <div className="no-scrollbar max-h-[80vh] w-[80vw] overflow-x-hidden p-0 font-normal">
                {uploadCompleted && uploadResponse ? (
                    // Show upload results using the new component
                    <div className="no-scrollbar flex flex-col overflow-x-scroll">
                        <UploadResultsTable
                            data={uploadResponse}
                            onViewError={handleViewError}
                            onDownloadResponse={onDownloadResponse}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {csvErrors.length > 0 && (
                            <div className="rounded-md">
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

                        <div className="no-scrollbar flex flex-col">
                            <EditableBulkUploadTable headers={headers} onEdit={onEdit} />
                        </div>
                    </div>
                )}
            </div>

            {/* Error details dialog */}
            {showErrorDialog && uploadResponse && selectedErrorRow !== null && (
                <ErrorDetailsDialog
                    isOpen={showErrorDialog}
                    onClose={() => setShowErrorDialog(!showErrorDialog)}
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
        </MyDialog>
    );
};
