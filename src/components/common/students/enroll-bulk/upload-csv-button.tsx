// upload-csv-button.tsx
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
import { useState } from "react";
import { Header } from "@/schemas/student/student-bulk-enroll/csv-bulk-init";

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

export const UploadCSVButton = ({ disable }: { disable: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);

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
            <DialogTrigger>
                <MyButton
                    buttonType="primary"
                    scale="large"
                    layoutVariant="default"
                    disabled={disable}
                >
                    Upload CSV
                </MyButton>
            </DialogTrigger>
            <DialogContent className="p-0 font-normal">
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
                                <div className="rounded-lg border-[1.5px] border-dashed border-primary-500">
                                    <ImportFileImage />
                                </div>
                                <div className="flex flex-col items-center text-body">
                                    {data.instructions.map((instruction, index) => (
                                        <p key={index}>{instruction}</p>
                                    ))}
                                    <MyButton
                                        className="cursor-pointer font-semibold text-primary-500"
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
