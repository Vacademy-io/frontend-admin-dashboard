import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { MyButton } from "@/components/design-system/button";
import { ImportFileImage } from "@/assets/svgs";
import { useBulkUploadInit } from "@/hooks/student-list-section/enroll-student-bulk/useBulkUploadInit";
import { useState, useCallback } from "react";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";

import { useDropzone } from "react-dropzone"; // You'll need to install react-dropzone

const generateCSV = (headers: Header[]) => {
    // Sort headers by order
    const sortedHeaders = [...headers].sort((a, b) => a.order - b.order);

    // Generate header row
    const headerRow = sortedHeaders.map((header) => header.column_name).join(",");

    // Generate sample data rows
    const sampleRows = Array.from({ length: 3 }, (_, rowIndex) =>
        sortedHeaders.map((header) => header.sample_values[rowIndex] || "").join(","),
    );

    // Combine header and data rows
    const csvContent = [headerRow, ...sampleRows].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "student_enrollment_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

interface FileState {
    file: File | null;
    error?: string;
}

export const UploadCSVButton = ({ disable }: { disable: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);

    const [fileState, setFileState] = useState<FileState>({ file: null });

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: unknown[]) => {
        // Handle only CSV files
        if (rejectedFiles.length > 0) {
            setFileState({ file: null, error: "Please upload only CSV files" });
            return;
        }

        const file = acceptedFiles[0];
        if (file?.type !== "text/csv" && !file?.name.endsWith(".csv")) {
            setFileState({ file: null, error: "Please upload only CSV files" });
            return;
        }

        setFileState({ file: file });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
        },
        maxFiles: 1,
    });

    const { data, isLoading, isError } = useBulkUploadInit(
        {
            instituteId: "c70f40a5-e4d3-4b6c-a498-e612d0d4b133",
            sessionId: "1",
        },
        {
            enabled: isOpen,
        },
    );

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
    };

    const handleDownloadTemplate = () => {
        if (data?.headers) {
            generateCSV(data.headers);
        }
    };

    return (
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
                        ) : isError ? (
                            <div>Error loading CSV configuration</div>
                        ) : data ? (
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
                                        {data.instructions.map((instruction, index) => (
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
                        ) : null}
                    </DialogDescription>
                    <DialogFooter className="px-6 py-4">
                        <div className="flex w-full justify-between">
                            <MyButton
                                buttonType="secondary"
                                scale="large"
                                layoutVariant="default"
                                type="button"
                            >
                                Preview
                            </MyButton>
                            <MyButton
                                buttonType="primary"
                                scale="large"
                                layoutVariant="default"
                                type="button"
                            >
                                Done
                            </MyButton>
                        </div>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
