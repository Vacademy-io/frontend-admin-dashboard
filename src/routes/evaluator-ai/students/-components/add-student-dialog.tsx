import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { MyDialog } from "@/components/design-system/dialog";
import { MyButton } from "@/components/design-system/button";
import { handleStartProcessUploadedFile } from "@/routes/ai-center/-services/ai-center-service";
import { UploadFileInS3Public } from "@/routes/signup/-services/signup-services";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StudentData {
    name: string;
    enrollId: string;
    pdfId: string;
}

export function StudentEnrollmentDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [enrollId, setEnrollId] = useState("");
    const [pdfId, setPdfId] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setPdfId("");
        }
    };

    const handleFileUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            const fileId = await UploadFileInS3Public(file, setIsUploading, "RESPONSES");
            if (fileId) {
                const response: { pdf_id: string } = await handleStartProcessUploadedFile(fileId);
                console.log(response.pdf_id);
                setPdfId(response.pdf_id);
                toast("File uploaded successfully");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !enrollId || !pdfId) {
            toast.warning("Please fill in all fields and upload a file.");
            return;
        }

        // Create student data object
        const studentData: StudentData = {
            name,
            enrollId,
            pdfId,
        };

        // Save to localStorage
        try {
            // Get existing students or initialize empty array
            const existingStudents = JSON.parse(localStorage.getItem("students") || "[]");

            // Add new student
            existingStudents.push(studentData);

            // Save back to localStorage
            localStorage.setItem("students", JSON.stringify(existingStudents));

            toast.success("Student enrolled successfully!");

            // Reset form
            setName("");
            setEnrollId("");
            setPdfId("");
            setFile(null);
            setOpen(false);
        } catch (error) {
            console.error("Error saving to localStorage:", error);
            toast.error("Failed to enroll student");
        }
    };

    return (
        <MyDialog
            heading="Student Enrollment"
            open={open}
            onOpenChange={setOpen}
            trigger={<Button variant="default">Enroll Student</Button>}
        >
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="Student name"
                            required
                        />
                    </div>
                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="enrollId" className="text-right">
                            Enrollment ID
                        </Label>
                        <Input
                            id="enrollId"
                            value={enrollId}
                            onChange={(e) => setEnrollId(e.target.value)}
                            className="col-span-3"
                            placeholder="Enrollment ID"
                            required
                        />
                    </div>
                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="file" className="text-right">
                            Upload Response
                        </Label>
                        <div className="w-full space-y-2">
                            <Input
                                id="file"
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf"
                            />
                            {file && !pdfId && (
                                <Button
                                    type="button"
                                    variant={"outline"}
                                    onClick={handleFileUpload}
                                    disabled={isUploading}
                                    size="sm"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        "Upload File"
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <MyButton
                        layoutVariant="default"
                        type="submit"
                        className={cn(
                            !name || !enrollId || !pdfId
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer",
                        )}
                        disabled={!name || !enrollId || !pdfId}
                    >
                        Enroll
                    </MyButton>
                </DialogFooter>
            </form>
        </MyDialog>
    );
}
