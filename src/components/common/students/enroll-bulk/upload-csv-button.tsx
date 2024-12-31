import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { MyButton } from "@/components/design-system/button";
import { ImportFileImage } from "@/assets/svgs";
import { useBulkUploadInit } from "@/hooks/student-list-section/enroll-student-bulk/useBulkUploadInit";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
    validateCsvData,
    createAndDownloadCsv,
    convertExcelDateToDesiredFormat,
} from "./utils/csv-utils";
import { createSchemaFromHeaders } from "./utils/bulk-upload-validation";
import { useBulkUploadStore } from "@/stores/students/enroll-students-bulk/useBulkUploadStore";
import { BulkUploadTable } from "./bulk-upload-table";
import { SchemaFields } from "@/types/students/bulk-upload-types";
import { toast } from "sonner";
import { submitBulkUpload } from "@/hooks/student-list-section/enroll-student-bulk/submit-bulk-upload";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";
import Papa from "papaparse";

interface FileState {
    file: File | null;
    error?: string;
}

interface UploadCSVButtonProps {
    disable: boolean;
}

interface PreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | null;
    headers: Header[];
    onEdit?: (rowIndex: number, columnId: string, value: string) => void;
}

interface ResponseRow {
    STATUS: string;
    STATUS_MESSAGE: string;
    ERROR: string;
    [key: string]: string; // for other potential fields
}

const PreviewDialog = ({ isOpen, onClose, headers, onEdit }: PreviewDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="h-[80vh] w-[80vw] max-w-[1200px] overflow-hidden p-0 font-normal">
                <DialogHeader className="h-full">
                    <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                        Preview Data
                    </div>
                </DialogHeader>
                <DialogDescription className="flex flex-col overflow-x-scroll p-6">
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
            </DialogContent>
        </Dialog>
    );
};

export const UploadCSVButton = ({ disable }: UploadCSVButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [fileState, setFileState] = useState<FileState>({ file: null });
    const { data, isLoading } = useBulkUploadInit(
        {
            instituteId: "c70f40a5-e4d3-4b6c-a498-e612d0d4b133",
            sessionId: "1",
        },
        {
            enabled: isOpen,
        },
    );
    const { setCsvData, setCsvErrors } = useBulkUploadStore();

    const onDrop = useCallback(
        async (acceptedFiles: File[], rejectedFiles: unknown[]) => {
            if (rejectedFiles.length > 0) {
                setFileState({ file: null, error: "Please upload only CSV files" });
                return;
            }

            const file = acceptedFiles[0];
            if (file?.type !== "text/csv" && !file?.name.endsWith(".csv")) {
                setFileState({ file: null, error: "Please upload only CSV files" });
                return;
            }

            if (!data?.headers) return;

            setFileState({ file });
            const schema = createSchemaFromHeaders(data.headers);
            console.log(schema);

            try {
                const result = await validateCsvData(file, schema);
                setCsvData(result.data);
                setCsvErrors(result.errors);
            } catch (err) {
                const error = err instanceof Error ? err.message : "Error parsing CSV";
                setFileState({ file: null, error });
                console.error("Error parsing CSV:", err);
            }
        },
        [data?.headers, setCsvData, setCsvErrors],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
        },
        maxFiles: 1,
    });

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setFileState({ file: null });
            setCsvData(undefined);
            setCsvErrors([]);
        }
        setIsOpen(open);
    };

    const handleEditCell = (rowIndex: number, columnId: string, value: string) => {
        console.log(`Editing cell: row ${rowIndex}, column ${columnId}, new value: ${value}`);
    };

    const handleDownloadTemplate = () => {
        if (data?.headers) {
            const sortedHeaders = [...data.headers].sort((a, b) => a.order - b.order);
            const headerRow = sortedHeaders.map((header) => header.column_name);
            const sampleRows = Array.from({ length: 3 }, (unused, rowIndex) =>
                sortedHeaders.map((header) => header.sample_values[rowIndex] || ""),
            );

            const templateData = sampleRows.map((row) => {
                return headerRow.reduce(
                    (acc, header, index) => {
                        acc[header] = row[index] || "";
                        return acc;
                    },
                    {} as Record<string, string | number | boolean>,
                );
            });

            createAndDownloadCsv(templateData as SchemaFields[], "student_enrollment_template.csv");
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { csvData } = useBulkUploadStore();

    const handleDoneClick = async () => {
        if (!csvData || !data?.submit_api) return;

        try {
            setIsSubmitting(true);

            const transformedData = csvData.map((row) => {
                const newRow = { ...row };
                data.headers.forEach((header) => {
                    // Handle package session IDs and other enum types
                    if (header.type === "enum" && header.send_option_id && header.option_ids) {
                        const displayValue = row[header.column_name] as string;
                        if (displayValue) {
                            for (const [id, value] of Object.entries(header.option_ids)) {
                                if (value === displayValue) {
                                    newRow[header.column_name] = id;
                                    break;
                                }
                            }
                        }
                    }

                    // Handle date formatting if needed
                    // if (header.type === "date" && header.format) {
                    //     const dateValue = row[header.column_name] as string;
                    //     if (dateValue) {
                    //         try {
                    //             // Parse DD-MM-YYYY format and convert to API expected format
                    //             const [day, month, year] = dateValue.split("-").map(num => num.padStart(2, '0'));
                    //             const formattedDate = `${year}-${month}-${day}T00:00:00.000Z`;
                    //             newRow[header.column_name] = formattedDate;
                    //         } catch (error) {
                    //             console.error(`Error formatting date for ${header.column_name}:`, error);
                    //             newRow[header.column_name] = dateValue;
                    //         }
                    //     }
                    // }
                    if (header.type === "date" && header.format) {
                        const dateValue = row[header.column_name] as string;
                        if (dateValue) {
                            // First convert to desired format if it's in Excel format
                            const formattedDateValue = convertExcelDateToDesiredFormat(dateValue);

                            // Validate the format
                            const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
                            if (!dateRegex.test(formattedDateValue)) {
                                console.error(
                                    `Invalid date format for ${header.column_name}: ${formattedDateValue}`,
                                );
                                return;
                            }

                            // Use the formatted date
                            newRow[header.column_name] = formattedDateValue;
                        }
                    }

                    // Handle numeric fields
                    if (header.type === "integer") {
                        const numValue = row[header.column_name];
                        if (numValue) {
                            newRow[header.column_name] = parseInt(numValue.toString(), 10);
                        }
                    }
                });
                return newRow;
            });

            const response = await submitBulkUpload({
                data: transformedData,
                instituteId: data.submit_api.request_params.instituteId,
            });

            // Parse the CSV response
            const parsedResponse = Papa.parse<ResponseRow>(response, {
                header: true,
            }).data;

            // Update the CSV data with response information
            const updatedCsvData = csvData.map((row, index) => {
                const responseRow = parsedResponse[index];
                if (!responseRow) return row;

                return {
                    ...row,
                    STATUS: responseRow.STATUS === "true" ? "Success" : "Failed",
                    STATUS_MESSAGE: responseRow.STATUS_MESSAGE || "",
                    ERROR: responseRow.ERROR || "",
                };
            });

            // Update the store with the response data
            setCsvData(updatedCsvData);
            setShowPreview(true);

            // Show success toast if no errors
            const hasErrors = parsedResponse.some((row) => row.STATUS !== "true");
            if (!hasErrors) {
                toast.success("All students enrolled successfully");
            } else {
                toast.error("Some students could not be enrolled. Please check the errors.");
            }
        } catch (error) {
            console.error("Error in handleDoneClick:", error);
            toast.error("Failed to enroll students");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <MyButton
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                        disabled={disable}
                    >
                        Upload CSV
                    </MyButton>
                </DialogTrigger>

                <DialogContent className="w-[800px] max-w-[800px] p-0 font-normal">
                    <DialogHeader>
                        <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                            Upload CSV
                        </div>
                        <DialogDescription className="flex flex-col items-center justify-center gap-6 p-6 text-neutral-600">
                            {isLoading ? (
                                <div>Loading...</div>
                            ) : (
                                <>
                                    <div
                                        {...getRootProps()}
                                        className={`h-[270px] w-[720px] cursor-pointer rounded-lg border-[1.5px] border-dashed border-primary-500 p-6 ${
                                            isDragActive ? "bg-primary-50" : "bg-white"
                                        } transition-colors duration-200 ease-in-out`}
                                    >
                                        <input {...getInputProps()} />
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <ImportFileImage />
                                            {!fileState.file && (
                                                <p className="text-center text-neutral-600">
                                                    Drag and drop a CSV file here, or click to
                                                    select one
                                                </p>
                                            )}
                                            {fileState.file && (
                                                <div className="text-center">
                                                    <p className="font-medium text-primary-500">
                                                        {fileState.file.name}
                                                    </p>
                                                    <p className="text-sm text-neutral-500">
                                                        {(fileState.file.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            )}
                                            {fileState.error && (
                                                <p className="text-sm text-danger-600">
                                                    {fileState.error}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="flex gap-1 text-center">
                                            {data?.instructions?.map((instruction, index) => (
                                                <p key={index}>{instruction}.</p>
                                            ))}
                                        </div>
                                        <MyButton
                                            className="cursor-pointer text-[18px] font-semibold text-primary-500"
                                            buttonType="text"
                                            layoutVariant="default"
                                            scale="medium"
                                            onClick={handleDownloadTemplate}
                                        >
                                            Download Template
                                        </MyButton>
                                    </div>
                                </>
                            )}
                        </DialogDescription>
                        <DialogFooter className="px-6 py-4">
                            <div className="flex w-full justify-between">
                                <MyButton
                                    buttonType="secondary"
                                    scale="large"
                                    layoutVariant="default"
                                    type="button"
                                    onClick={() => setShowPreview(true)}
                                    disabled={!fileState.file || !data?.headers}
                                >
                                    Preview
                                </MyButton>
                                <MyButton
                                    buttonType="primary"
                                    scale="large"
                                    layoutVariant="default"
                                    type="button"
                                    onClick={handleDoneClick}
                                    disabled={!fileState.file || isSubmitting}
                                >
                                    {isSubmitting ? "Submitting..." : "Done"}
                                </MyButton>
                            </div>
                        </DialogFooter>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {data?.headers && (
                <PreviewDialog
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                    file={fileState.file}
                    headers={data.headers}
                    onEdit={handleEditCell}
                />
            )}
        </>
    );
};
