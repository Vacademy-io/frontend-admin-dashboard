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
import { Warning, ArrowDown } from "@phosphor-icons/react";
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

    // When the dialog closes, ensure edit mode is turned off
    React.useEffect(() => {
        if (!isOpen) {
            setIsEditing(false);
        }
    }, [isOpen, setIsEditing]);

    // Enhance headers with response columns if uploadCompleted is true
    const enhancedHeaders = React.useMemo(() => {
        if (uploadCompleted && uploadResponse && uploadResponse.length > 0) {
            // Get all keys from the response that aren't in the current headers
            const currentHeaderNames = new Set(headers.map((h) => h.column_name));
            const firstResponseRow = uploadResponse[0] || {};
            const responseKeys = Object.keys(firstResponseRow || {}).filter(
                (key) =>
                    !currentHeaderNames.has(key) && key !== "ERROR" && key !== "STATUS_MESSAGE",
            );

            // Add STATUS and STATUS_MESSAGE if they're not included yet
            const extraHeaders: Header[] = responseKeys.map((key, index) => ({
                column_name: key,
                type: "text",
                optional: true,
                order: 1000 + index, // Put these at the end
                options: null,
                send_option_id: null,
                option_ids: null,
                format: null,
                regex: null,
                regex_error_message: null,
                sample_values: [],
            }));

            // Add ERROR column specifically
            if (Object.keys(firstResponseRow).includes("ERROR")) {
                extraHeaders.push({
                    column_name: "ERROR",
                    type: "text",
                    optional: true,
                    order: 1100, // Put this at the very end
                    options: null,
                    send_option_id: null,
                    option_ids: null,
                    format: null,
                    regex: null,
                    regex_error_message: null,
                    sample_values: [],
                });
            }

            return [...headers, ...extraHeaders];
        }
        return headers;
    }, [headers, uploadCompleted, uploadResponse]);

    // Group errors by type for summary
    const errorSummary = React.useMemo(() => {
        if (!csvErrors || csvErrors.length === 0) return null;

        const summary = {
            requiredMissing: 0,
            invalidFormat: 0,
            invalidEnum: 0,
            invalidDate: 0,
            other: 0,
        };

        csvErrors.forEach((error) => {
            if (error.message.includes("required")) {
                summary.requiredMissing++;
            } else if (error.message.includes("format")) {
                summary.invalidFormat++;
            } else if (error.message.includes("Invalid value for")) {
                summary.invalidEnum++;
            } else if (error.message.includes("date")) {
                summary.invalidDate++;
            } else {
                summary.other++;
            }
        });

        return summary;
    }, [csvErrors]);

    // Count of affected rows
    const affectedRows = React.useMemo(() => {
        if (!csvErrors || csvErrors.length === 0) return 0;

        const uniqueRows = new Set(csvErrors.map((err) => err.path[0]));
        return uniqueRows.size;
    }, [csvErrors]);

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

    // Statistics for upload response
    const uploadStats = React.useMemo(() => {
        if (!uploadResponse || uploadResponse.length === 0) return null;

        let successful = 0;
        let failed = 0;

        uploadResponse.forEach((row) => {
            if (row.STATUS === "true") {
                successful++;
            } else {
                failed++;
            }
        });

        return { successful, failed, total: uploadResponse.length };
    }, [uploadResponse]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="h-[80vh] w-[80vw] max-w-[1200px] overflow-hidden p-0 font-normal">
                <DialogHeader className="h-full">
                    <div className="flex items-center justify-between bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                        <span>{uploadCompleted ? "Upload Results" : "Preview Data"}</span>

                        {uploadCompleted && onDownloadResponse && (
                            <MyButton
                                buttonType="secondary"
                                scale="small"
                                layoutVariant="default"
                                onClick={onDownloadResponse}
                            >
                                <ArrowDown className="mr-1 h-4 w-4" />
                                Download Response
                            </MyButton>
                        )}
                    </div>
                </DialogHeader>

                {uploadCompleted && uploadStats && (
                    <div
                        className={`mx-6 mt-4 rounded-md p-4 ${
                            uploadStats.failed > 0 ? "bg-warning-50" : "bg-success-50"
                        }`}
                    >
                        <div className="flex items-center">
                            {uploadStats.failed > 0 ? (
                                <Warning className="h-5 w-5 text-warning-500" />
                            ) : (
                                <div className="h-5 w-5 text-success-500">✓</div>
                            )}
                            <h3
                                className={`ml-2 text-lg font-medium ${
                                    uploadStats.failed > 0 ? "text-warning-700" : "text-success-700"
                                }`}
                            >
                                Upload Summary: {uploadStats.successful} successful,{" "}
                                {uploadStats.failed} failed
                            </h3>
                        </div>
                        {uploadStats.failed > 0 && (
                            <p className="mt-2 text-sm text-warning-700">
                                Some entries were not uploaded successfully. Please check the ERROR
                                column for details.
                            </p>
                        )}
                    </div>
                )}

                {!uploadCompleted && csvErrors.length > 0 && (
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
                )}

                <DialogDescription className="flex flex-col overflow-x-scroll p-6">
                    <EditableBulkUploadTable
                        headers={enhancedHeaders}
                        onEdit={onEdit}
                        statusColumnRenderer={CustomStatusColumnRenderer}
                    />
                </DialogDescription>
                <DialogFooter className="border-t px-6 py-4">
                    <div className="flex w-full justify-between">
                        <div>
                            {!uploadCompleted && csvErrors.length > 0 && (
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
