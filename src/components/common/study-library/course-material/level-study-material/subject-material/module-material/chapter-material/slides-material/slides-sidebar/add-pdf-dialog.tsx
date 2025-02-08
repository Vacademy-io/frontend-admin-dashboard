// add-pdf-dialog.tsx
import { ImportFileImage } from "@/assets/svgs";
import { MyButton } from "@/components/design-system/button";
import { DialogFooter, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useState, useRef } from "react";
import { INSTITUTE_ID } from "@/constants/urls";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { FileUploadComponent } from "@/components/design-system/file-upload";
import { Form } from "@/components/ui/form";
import { useSlides } from "@/hooks/study-library/use-slides";
import { useRouter } from "@tanstack/react-router";

interface FormData {
    pdfFile: FileList | null;
}

export const AddPdfDialog = ({
    openState,
}: {
    openState?: ((open: boolean) => void) | undefined;
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const route = useRouter();
    const { chapterId } = route.state.location.search;
    const { addUpdateDocumentSlide } = useSlides(chapterId || "");

    const [fileUrl, setFileUrl] = useState<string | null>(null);

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
                setFile(null);
                form.reset();

                await addUpdateDocumentSlide({
                    id: crypto.randomUUID(),
                    title: file.name,
                    image_file_id: "",
                    description: file.name,
                    slide_order: 0,
                    document_slide: {
                        id: crypto.randomUUID(),
                        type: "PDF",
                        data: fileId,
                        title: file.name,
                        cover_file_id: "",
                    },
                    status: "DRAFT",
                    new_slide: true,
                });

                toast.success("PDF uploaded successfully!");
                openState?.(false);
            }

            clearInterval(progressInterval);
            openState && openState(false);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Upload failed. Please try again.";
            setError(errorMessage);
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
                        acceptedFileTypes={["application/pdf"]}
                        isUploading={isUploading}
                        error={error}
                        className="flex flex-col items-center rounded-lg border-[2px] border-dashed border-primary-500 pb-6 focus:outline-none"
                    >
                        <div className="pointer-events-none flex flex-col items-center gap-6">
                            <ImportFileImage />
                            <div className="text-center">
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
                                    </div>
                                )}
                            </div>
                        </div>
                    </FileUploadComponent>

                    {fileUrl && !isUploading && (
                        <div>
                            <Progress
                                value={uploadProgress}
                                className="h-2 bg-neutral-200 [&>div]:bg-primary-500"
                            />
                            <p className="mt-2 text-sm text-neutral-600">
                                Uploading... {uploadProgress}%
                            </p>
                        </div>
                    )}

                    <DialogFooter className="flex w-full items-center justify-center">
                        <MyButton
                            buttonType="primary"
                            scale="large"
                            layoutVariant="default"
                            type="submit"
                            disabled={!file || isUploading}
                            className="mx-auto"
                        >
                            {isUploading ? "Uploading..." : "Upload PDF"}
                        </MyButton>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};
