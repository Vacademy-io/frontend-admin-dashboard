import { ImportFileImage } from "@/assets/svgs";
import { MyButton } from "@/components/design-system/button";
import { DialogFooter, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useState, useRef } from "react";
import { INSTITUTE_ID } from "@/constants/urls";
import { usePDFStore } from "@/stores/study-library/temp-pdf-store";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { FileUploadComponent } from "@/components/design-system/file-upload";
import { Form } from "@/components/ui/form";

interface FormData {
    pdfFile: FileList | null;
}

export const AddPdfDialog = () => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const { setPdfUrl } = usePDFStore();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<FormData>({
        defaultValues: {
            pdfFile: null,
        },
    });

    const { uploadFile, getPublicUrl } = useFileUpload();

    const handleFileSubmit = async (selectedFile: File) => {
        if (!selectedFile.type.includes("pdf")) {
            setError("Please upload only PDF files");
            return;
        }

        setError(null);
        setFile(selectedFile);
        form.setValue("pdfFile", [selectedFile] as unknown as FileList);
        toast.success("File selected successfully");
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file first");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 200);

            const fileId = await uploadFile({
                file,
                setIsUploading,
                userId: "your-user-id",
                source: INSTITUTE_ID,
                sourceId: "PDF_DOCUMENTS",
            });

            if (fileId) {
                const url = await getPublicUrl(fileId);
                setFileUrl(url);
                setPdfUrl(url);
                setUploadProgress(100);
                setFile(null);
                form.reset();
                toast.success("File uploaded successfully!");
            }

            clearInterval(progressInterval);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Upload failed. Please try again.";
            setError(errorMessage);
            console.error("Upload error:", err);
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        setUploadProgress(0);
        setFileUrl(null);
        form.reset();
    };

    return (
        <DialogContent onCloseAutoFocus={handleClose}>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleUpload)}
                    className="flex flex-col gap-6 p-6"
                >
                    <FileUploadComponent
                        fileInputRef={fileInputRef}
                        onFileSubmit={handleFileSubmit}
                        control={form.control}
                        name="pdfFile"
                        acceptedFileTypes="application/pdf"
                        isUploading={isUploading}
                        error={error}
                    >
                        <div className="pointer-events-none">
                            <ImportFileImage />
                            <div className="mt-4 text-center">
                                {file ? (
                                    <>
                                        <p className="text-primary-600 font-medium">{file.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-neutral-600">
                                            Drag and drop a PDF file here, or click to select
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            (Only PDF files are accepted)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </FileUploadComponent>

                    {isUploading && (
                        <div className="w-full">
                            <Progress value={uploadProgress} className="h-2 bg-neutral-200" />
                            <p className="mt-2 text-sm text-neutral-600">
                                Uploading... {uploadProgress}%
                            </p>
                        </div>
                    )}

                    {fileUrl && !isUploading && (
                        <p className="text-sm font-medium text-green-600">
                            File uploaded successfully!
                        </p>
                    )}

                    <DialogFooter className="flex justify-end">
                        <div className="flex gap-4">
                            <MyButton
                                buttonType="secondary"
                                scale="large"
                                layoutVariant="default"
                                onClick={handleClose}
                                type="button"
                                disabled={isUploading}
                            >
                                Cancel
                            </MyButton>
                            <MyButton
                                buttonType="primary"
                                scale="large"
                                layoutVariant="default"
                                type="submit"
                                disabled={!file || isUploading}
                            >
                                {isUploading ? "Uploading..." : "Upload PDF"}
                            </MyButton>
                        </div>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};
