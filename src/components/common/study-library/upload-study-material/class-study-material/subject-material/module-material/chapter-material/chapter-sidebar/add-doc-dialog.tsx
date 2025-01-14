import { ImportFileImage } from "@/assets/svgs";
import { MyButton } from "@/components/design-system/button";
import { DialogFooter } from "@/components/ui/dialog";
// import { DialogContent } from "@radix-ui/react-dialog";
import { useState, useRef, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { FileUploadComponent } from "@/components/design-system/file-upload";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import mammoth from "mammoth";
import { FileType } from "@/types/file-upload";
import { html } from "@yoopta/exports";
import { createYooptaEditor, YooptaContentValue, YooEditor } from "@yoopta/editor";
import { SidebarContentItem } from "@/types/study-library/chapter-sidebar";

interface FormData {
    docFile: FileList | null;
}

/**
 * Preprocesses raw HTML content for compatibility with Yoopta Editor.
 * This function removes unwanted styles, normalizes tags, and ensures a cleaner structure.
 *
 * @param htmlString - The raw HTML string to preprocess.
 * @returns A cleaned and normalized HTML string.
 */
export const preprocessHTML = (htmlString: string): string => {
    if (!htmlString) return "";

    let cleanHTML = htmlString;

    // Remove inline styles to avoid breaking Yoopta formatting
    cleanHTML = cleanHTML.replace(/style="[^"]*"/g, "");

    // Normalize tags (e.g., converting `strong` to `b` or `em` to `i`)
    cleanHTML = cleanHTML.replace(/<strong>/g, "<b>").replace(/<\/strong>/g, "</b>");
    cleanHTML = cleanHTML.replace(/<em>/g, "<i>").replace(/<\/em>/g, "</i>");

    // Remove empty or unsupported tags
    cleanHTML = cleanHTML.replace(/<[^>]+><\/[^>]+>/g, ""); // Removes empty tags like `<p></p>`
    cleanHTML = cleanHTML.replace(
        /<(script|style|iframe|meta|link|object|embed|applet)[^>]*>.*?<\/\1>/g,
        "",
    );

    // Handle images (remove or keep them in base64 format)
    cleanHTML = cleanHTML.replace(/<img[^>]*>/g, (match) => {
        if (match.includes('src="data:image')) {
            return match; // Keep base64 images if needed
        }
        return ""; // Remove other images
    });

    // Normalize headers (e.g., convert H1–H6 to consistent tags or adjust for Yoopta needs)
    cleanHTML = cleanHTML.replace(/<h[1-6]>/g, "<h1>").replace(/<\/h[1-6]>/g, "</h1>");

    // Remove non-breaking spaces and excessive whitespace
    cleanHTML = cleanHTML.replace(/&nbsp;/g, " ");
    cleanHTML = cleanHTML.replace(/\s\s+/g, " ");

    // Wrap plain text in <p> tags if needed
    cleanHTML = cleanHTML.replace(/^(?!<[a-z][\s\S]*>)([\s\S]+)/i, "<p>$1</p>");

    return cleanHTML.trim();
};

export const AddDocDialog = () => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const addItem = useContentStore((state) => state.addItem);
    const editor = useMemo(() => createYooptaEditor(), []);

    const form = useForm<FormData>({
        defaultValues: {
            docFile: null,
        },
    });

    const handleFileSubmit = async (selectedFile: File) => {
        const allowedTypes = {
            "application/msword": [".doc"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        };

        if (!Object.keys(allowedTypes).includes(selectedFile.type)) {
            setError("Please upload only document files (DOC, DOCX)");
            return;
        }

        setError(null);
        setFile(selectedFile);
        form.setValue("docFile", [selectedFile] as unknown as FileList);
        toast.success("File selected successfully");
    };

    const convertDocToHtml = async (file: File, editor: YooEditor): Promise<YooptaContentValue> => {
        console.log("Starting document conversion...", file.type);

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async () => {
                try {
                    const arrayBuffer = reader.result as ArrayBuffer;
                    const result = await mammoth.convertToHtml({ arrayBuffer });

                    console.log("Raw HTML output from mammoth:", result.value);

                    if (!result || !result.value) {
                        reject(new Error("Document conversion failed - no content"));
                        return;
                    }

                    // Preprocess the HTML to handle unsupported elements
                    const preprocessedHTML = preprocessHTML(result.value);
                    console.log("preprocessHTML: ", preprocessedHTML);

                    // Convert HTML to Yoopta format
                    const yooptaContent = html.deserialize(editor, preprocessedHTML);
                    console.log("Deserialized Yoopta content:", yooptaContent);

                    const htmlString = "<h1>First title</h1>";
                    const abc = html.deserialize(editor, htmlString);
                    console.log("Deserialized Yoopta content2:", abc);

                    resolve(yooptaContent);
                } catch (error) {
                    console.error("Error during conversion:", error);
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error("Failed to read document file"));
            };

            reader.readAsArrayBuffer(file);
        });
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file first");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        try {
            console.log("Starting upload process for file:", file.name);

            const yooptaContent = await convertDocToHtml(file, editor);
            console.log("Document successfully converted to Yoopta format:", yooptaContent);

            // Cast the content to solve type issue
            const newItem: SidebarContentItem = {
                id: crypto.randomUUID(),
                type: "doc",
                name: file.name,
                url: "",
                content: yooptaContent as YooptaContentValue,
                createdAt: new Date(),
            };

            addItem(newItem);
            console.log("Item successfully added to store");

            setUploadProgress(100);
            toast.success("Document converted successfully!");

            setFile(null);
            form.reset();
        } catch (err) {
            console.error("Upload handling error:", err);
            const errorMessage =
                err instanceof Error ? err.message : "Conversion failed. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            clearInterval(progressInterval);
            setIsUploading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpload)} className="flex flex-col gap-6 p-6">
                <FileUploadComponent
                    fileInputRef={fileInputRef}
                    onFileSubmit={handleFileSubmit}
                    control={form.control}
                    name="docFile"
                    acceptedFileTypes={
                        [
                            "application/msword",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        ] as FileType[]
                    }
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
                                        Drag and drop a document here, or click to select
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
                            Converting... {uploadProgress}%
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
                        {isUploading ? "Converting..." : "Convert Document"}
                    </MyButton>
                </DialogFooter>
            </form>
        </Form>
    );
};
