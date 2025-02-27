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
import { validateCsvData, createAndDownloadCsv } from "./utils/csv-utils";
import { useBulkUploadStore } from "@/stores/students/enroll-students-bulk/useBulkUploadStore";
import {
    CSVFormatFormType,
    enrollBulkFormType,
    SchemaFields,
} from "@/types/students/bulk-upload-types";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { TokenKey } from "@/constants/auth/tokens";
import { useBulkUploadMutation } from "@/hooks/student-list-section/enroll-student-bulk/useBulkUploadMutation";
import { PreviewDialog } from "./preview-dialog";

interface FileState {
    file: File | null;
    error?: string;
}

interface UploadCSVButtonProps {
    disable?: boolean;
    packageDetails: enrollBulkFormType;
    csvFormatDetails: CSVFormatFormType;
}

export const UploadCSVButton = ({
    disable,
    packageDetails,
    csvFormatDetails,
}: UploadCSVButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [fileState, setFileState] = useState<FileState>({ file: null });
    const { mutateAsync } = useBulkUploadMutation();
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];
    const { csvData, setCsvData, setCsvErrors } = useBulkUploadStore();

    const requestPayload = {
        auto_generate_config: {
            auto_generate_username: csvFormatDetails.autoGenerateUsername,
            auto_generate_password: csvFormatDetails.autoGeneratePassword,
            auto_generate_enrollment_id: csvFormatDetails.autoGenerateEnrollmentId,
        },
        optional_fields_config: {
            include_address_line: false,
            include_region: csvFormatDetails.state,
            include_city: csvFormatDetails.city,
            include_pin_code: csvFormatDetails.pincode,
            include_father_name: csvFormatDetails.fatherName,
            include_mother_name: csvFormatDetails.motherName,
            include_parents_mobile_number: csvFormatDetails.parentMobile,
            include_parents_email: csvFormatDetails.parentEmail,
            include_linked_institute_name: csvFormatDetails.collegeName,
        },
        expiry_and_status_config: {
            include_expiry_days: csvFormatDetails.setCommonExpiryDate,
            include_enrollment_status: csvFormatDetails.addStudentStatus,
            expiry_days: parseInt(csvFormatDetails.daysFromToday),
            enrollment_status: csvFormatDetails.studentStatus,
        },
    };

    const { data, isLoading } = useBulkUploadInit(
        {
            instituteId: INSTITUTE_ID || "",
            sessionId: packageDetails.session.id,
            bulkUploadInitRequest: requestPayload,
        },
        {
            enabled: isOpen,
        },
    );

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

            if (!data?.headers) {
                setFileState({ file: null, error: "Headers configuration not available" });
                return;
            }

            setFileState({ file });

            try {
                // Pass headers to the validation function
                const result = await validateCsvData(file, data.headers);
                setCsvData(result.data);
                setCsvErrors(result.errors);

                // Show error summary if any errors exist
                if (result.errors.length > 0) {
                    console.warn(`Found ${result.errors.length} validation errors in the CSV`);
                    // Could use toast notification here to alert user about errors
                    // toast.warning(`Found ${result.errors.length} validation errors. Please check and fix the highlighted fields.`);
                }
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
            // setCsvErrors([]);
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

    const uploadCsv = async () => {
        if (!csvData || !data?.submit_api) return;

        try {
            const response = await mutateAsync({
                data: csvData,
                instituteId: data.submit_api.request_params.instituteId,
                bulkUploadInitRequest: requestPayload,
            });
            setCsvData(csvData);
            setShowPreview(true);
            console.log("csv respones: ", response);
        } catch (error) {
            console.error("Error in handleDoneClick:", error);
        }
    };

    const handleDoneClick = async () => {
        uploadCsv();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <MyButton
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                        disabled={disable || false}
                        type="submit"
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
                                    disabled={!fileState.file}
                                >
                                    Done
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
