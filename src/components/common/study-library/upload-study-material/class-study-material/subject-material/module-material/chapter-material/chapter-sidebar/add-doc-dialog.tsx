// import { ImportFileImage } from "@/assets/svgs";
// import { MyButton } from "@/components/design-system/button";
// import { DialogFooter } from "@/components/ui/dialog";
// import { DialogContent } from "@radix-ui/react-dialog";

// export const AddDocDialog = () => {
//     return (
//         <DialogContent className="flex flex-col items-center gap-6">
//             {/* Add your PDF upload form content here */}
//             <ImportFileImage />
//             <DialogFooter>
//                 <MyButton buttonType="primary" layoutVariant="default" scale="large">
//                     Add Doc
//                 </MyButton>
//             </DialogFooter>
//         </DialogContent>
//     );
// };

import { ImportFileImage } from "@/assets/svgs";
import { MyButton } from "@/components/design-system/button";
import { DialogFooter, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { FileUploadComponent } from "@/components/design-system/file-upload";
import { Form } from "@/components/ui/form";

interface FormData {
    docFile: FileList | null;
}

export const AddDocDialog = () => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<FormData>({
        defaultValues: {
            docFile: null,
        },
    });

    const handleFileSubmit = async (selectedFile: File) => {
        const allowedTypes = [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            setError("Please upload only document files (DOC, DOCX, XLS, XLSX)");
            return;
        }

        setError(null);
        setFile(selectedFile);
        form.setValue("docFile", [selectedFile] as unknown as FileList);
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

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsUploading(false);
                    toast.success("File uploaded successfully!");
                    return 100;
                }
                return prev + 10;
            });
        }, 200);

        // Cleanup
        return () => clearInterval(interval);
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        setUploadProgress(0);
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
                        name="docFile"
                        isUploading={isUploading}
                        error={error}
                        className="flex flex-col items-center rounded-lg border-[2px] border-dashed border-primary-500 pb-6"
                        //include accepted file type
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
                                            Drag and drop a document file here, or click to select
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </FileUploadComponent>

                    {isUploading && (
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
                            {isUploading ? "Uploading..." : "Upload Document"}
                        </MyButton>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};
