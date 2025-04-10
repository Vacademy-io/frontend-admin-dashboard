import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { X } from "@phosphor-icons/react";
import { useState, useEffect, useRef } from "react";
import { StatusChips } from "@/components/design-system/chips";
import { useStudentSidebar } from "@/routes/students/students-list/-context/selected-student-sidebar-context";
import { useMutation } from "@tanstack/react-query";
import { FileUploadComponent } from "@/components/design-system/file-upload";
import { MyButton } from "@/components/design-system/button";
import { useFileUpload } from "@/hooks/use-file-upload";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { TokenKey } from "@/constants/auth/tokens";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { handleUpdateAttempt } from "@/routes/assessment/assessment-list/assessment-details/$assessmentId/$examType/$assesssmentType/$assessmentTab/-services/assessment-details-services";

interface FormData {
    file: FileList | null;
    fileId: string;
}
export const ParticipantSidebar = ({
    assessmentId,
    examType,
}: {
    assessmentId: string;
    examType: string;
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const { state } = useSidebar();
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const [error, setError] = useState<string | null>(null);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];
    const { toggleSidebar } = useSidebar();
    const { uploadFile, getPublicUrl, isUploading: isUploadingFile } = useFileUpload();
    const [fileId, setFileId] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { selectedStudent } = useStudentSidebar();
    const navigate = useNavigate();

    const form = useForm<FormData>({
        defaultValues: {
            file: null,
            fileId: "",
        },
    });

    const [imageUrl, setImageUrl] = useState<string>(
        "https://vacademy-media-storage.s3.ap-south-1.amazonaws.com/c71fe692-681a-4604-8c06-28f795cf7fdd/SUBJECTS/d0de7001-bef5-41be-bf1d-f0df7eaeb501-screenshot_2025-03-29_at_5.34.29_pm.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250329T120455Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86399&X-Amz-Credential=AKIA3ISBV4TNEO3NCERX%2F20250329%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=f7bd604cf93f4d3161db36fc60cf7eddcd2402a89ff6a9b516a39be3017e2883",
    );
    useEffect(() => {
        if (state == "expanded") {
            document.body.classList.add("sidebar-open");
        } else {
            document.body.classList.remove("sidebar-open");
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove("sidebar-open");
        };
    }, [state]);

    useEffect(() => {
        const fetchImageUrl = async () => {
            if (selectedStudent?.face_file_id) {
                try {
                    const url = await getPublicUrl(selectedStudent.face_file_id);
                    setImageUrl(url);
                } catch (error) {
                    console.error("Failed to fetch image URL:", error);
                }
            }
        };

        fetchImageUrl();
    }, [selectedStudent?.face_file_id]);

    const uploadAttempt = useMutation({
        mutationFn: async (payload: { attemptId: string; fileId: string }) => {
            const data = await handleUpdateAttempt(payload.attemptId, payload.fileId);
            return data;
        },
        onSuccess: () => {
            toast.success("Attempt uploaded successfully");
            setFileId(undefined);
        },
    });

    const handleFileSubmit = async (file: File) => {
        try {
            setIsUploading(true);
            const uploadedFileId = await uploadFile({
                file,
                setIsUploading,
                userId: "your-user-id",
                source: INSTITUTE_ID,
                sourceId: "SUBJECTS",
            });

            if (uploadedFileId) {
                setFileId(uploadedFileId);
                form.setValue("fileId", uploadedFileId);
                toast.success("File uploaded to server");
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpload = async (data: FormData) => {
        setIsUploading(true);
        setError(null);
        console.log(data);
        try {
            if (fileId) {
                form.setValue("fileId", fileId);
                form.reset();
                if (selectedStudent?.attempt_id)
                    await uploadAttempt.mutateAsync({
                        attemptId: selectedStudent?.attempt_id,
                        fileId,
                    });
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Upload failed. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Sidebar side="right">
            <SidebarContent
                className={`sidebar-content flex flex-col gap-10 border-r-2 border-r-neutral-300 bg-primary-50 p-6 text-neutral-600`}
            >
                <SidebarHeader>
                    <div className={`flex flex-col items-center justify-center gap-10`}>
                        <div className={`flex w-full items-center justify-between`}>
                            <div className="text-h3 font-semibold text-primary-500">
                                Participant Details
                            </div>
                            <X
                                className="size-6 cursor-pointer text-neutral-500"
                                onClick={() => {
                                    toggleSidebar();
                                }}
                            />
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarMenu className="no-scrollbar flex size-full flex-col gap-10 overflow-y-scroll">
                    <SidebarMenuItem className="flex w-full flex-col gap-6">
                        <div className="flex w-full items-center justify-center rounded-full">
                            <img
                                src={imageUrl}
                                alt="face profile"
                                className={`mx-auto size-60 rounded-full`}
                            />
                        </div>
                        <div className="flex w-full items-center justify-center gap-4">
                            <div className="text-h3 font-semibold text-neutral-600">
                                {selectedStudent?.full_name}
                            </div>
                            <StatusChips status={selectedStudent?.status || "ACTIVE"} />
                        </div>
                    </SidebarMenuItem>

                    <SidebarMenuItem className="mt-auto flex justify-between">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleUpload)}>
                                <FileUploadComponent
                                    fileInputRef={fileInputRef}
                                    onFileSubmit={handleFileSubmit}
                                    control={form.control}
                                    name="file"
                                    isUploading={isUploading}
                                    error={error}
                                    className=""
                                />

                                <MyButton
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading || isUploadingFile}
                                    buttonType="secondary"
                                    scale="large"
                                    layoutVariant="default"
                                    type="button"
                                    className={cn("block", fileId && "hidden")}
                                >
                                    {isUploading ? "Uploading" : "Upload Attempt"}
                                </MyButton>

                                <MyButton
                                    buttonType="primary"
                                    scale="large"
                                    layoutVariant="default"
                                    type="submit"
                                    disabled={isUploading}
                                    className={cn("block", !fileId && "hidden")}
                                >
                                    {"Submit"}
                                </MyButton>
                            </form>
                        </Form>
                        <MyButton
                            buttonType="primary"
                            scale="large"
                            layoutVariant="default"
                            type="submit"
                            disabled={isUploading}
                            onClick={() => {
                                if (selectedStudent?.attempt_id)
                                    navigate({
                                        to: "/evaluation/evaluate/$assessmentId/$attemptId/$examType",
                                        params: {
                                            attemptId: selectedStudent?.attempt_id,
                                            assessmentId: assessmentId,
                                            examType: examType,
                                        },
                                    });
                            }}
                        >
                            Evaluate
                        </MyButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
};
