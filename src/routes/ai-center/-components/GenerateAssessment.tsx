import { getInstituteId } from "@/constants/helper";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useEffect, useRef, useState } from "react";
import {
    handleConvertPDFToHTML,
    handleGenerateAssessmentQuestions,
    handleGetQuestionsFromHTMLUrl,
    handleStartProcessUploadedFile,
} from "../-services/ai-center-service";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MyButton } from "@/components/design-system/button";
import { UploadSimple } from "phosphor-react";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const GenerateAIAssessmentComponent = () => {
    const instituteId = getInstituteId();
    const { uploadFile } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [openAssessmentDialog, setOpenAssessmentDialog] = useState(false);
    const [uploadedFilePDFId, setUploadedFilePDFId] = useState("");

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileId = await uploadFile({
                file,
                setIsUploading,
                userId: "your-user-id",
                source: instituteId,
                sourceId: "STUDENTS",
            });
            if (fileId) {
                const response = await handleStartProcessUploadedFile(fileId);
                if (response) {
                    setOpenAssessmentDialog(true);
                    setUploadedFilePDFId(response.pdf_id);
                }
            }
            event.target.value = "";
        }
    };

    const [assessmentData, setAssessmentData] = useState(null);
    console.log(assessmentData);

    const MAX_POLL_ATTEMPTS = 10;
    const pollingCountRef = useRef(0);
    const pollingIntervalIdRef = useRef<NodeJS.Timeout | null>(null);

    const clearPolling = () => {
        if (pollingIntervalIdRef.current) {
            clearInterval(pollingIntervalIdRef.current);
            pollingIntervalIdRef.current = null;
        }
    };

    const generateAssessmentMutation = useMutation({
        mutationFn: ({ pdfId }: { pdfId: string }) => handleGenerateAssessmentQuestions(pdfId),
        onSuccess: (response) => {
            // ✅ Save data
            setAssessmentData(response);

            // ✅ If response is done (adjust condition based on real response structure)
            if (response?.status === 200 || response?.completed) {
                clearPolling();
            } else {
                pollingCountRef.current += 1;
                if (pollingCountRef.current >= MAX_POLL_ATTEMPTS) {
                    clearPolling();
                }
            }
        },
        onError: () => {
            pollingCountRef.current += 1;
            if (pollingCountRef.current >= MAX_POLL_ATTEMPTS) {
                clearPolling();
            }
        },
    });

    const pollGenerateAssessment = () => {
        generateAssessmentMutation.mutate({ pdfId: uploadedFilePDFId });
    };

    const handleGenerateQuestionsForAssessment = () => {
        if (!uploadedFilePDFId || pollingIntervalIdRef.current) return;

        pollingCountRef.current = 0;
        pollGenerateAssessment(); // first call immediately

        pollingIntervalIdRef.current = setInterval(() => {
            pollGenerateAssessment();
        }, 10000);
    };

    // ✅ Optional: clean up on unmount
    useEffect(() => {
        return () => {
            clearPolling();
        };
    }, []);

    const convertPollingCountRef = useRef(0);
    const convertPollingIntervalIdRef = useRef<NodeJS.Timeout | null>(null);
    const MAX_CONVERT_ATTEMPTS = 10;

    const handleConvertPDFToHTMLMutation = useMutation({
        mutationFn: ({ pdfId }: { pdfId: string }) => handleConvertPDFToHTML(pdfId),
        onSuccess: async (response) => {
            // ✅ Check if status is 200 and stop polling
            if (response) {
                stopConvertPolling();

                // Optional: get questions from HTML if needed
                const questionsData = await handleGetQuestionsFromHTMLUrl(response.html);
                console.log("✅ Questions Data:", questionsData);
            } else {
                console.log("ℹ️ Still polling, status:", response?.status);
            }
        },
        onError: (error: unknown) => {
            console.error("⛔️ Convert Error:", error);
        },
    });

    const stopConvertPolling = () => {
        if (convertPollingIntervalIdRef.current) {
            clearInterval(convertPollingIntervalIdRef.current);
            convertPollingIntervalIdRef.current = null;
        }
    };

    const pollConvertPDFToHTML = () => {
        handleConvertPDFToHTMLMutation.mutate({ pdfId: uploadedFilePDFId });
        convertPollingCountRef.current += 1;
        if (convertPollingCountRef.current >= MAX_CONVERT_ATTEMPTS) {
            stopConvertPolling();
        }
    };

    const handleConvertPDFToHTMLFn = () => {
        if (!uploadedFilePDFId || convertPollingIntervalIdRef.current) return;

        convertPollingCountRef.current = 0;
        pollConvertPDFToHTML(); // immediate call

        convertPollingIntervalIdRef.current = setInterval(() => {
            pollConvertPDFToHTML();
        }, 10000);
    };

    // Cleanup interval on component unmount
    useEffect(() => {
        return () => {
            stopConvertPolling();
        };
    }, []);
    return (
        <div className="flex items-center justify-start gap-8">
            <Card className="w-[300px] cursor-pointer bg-primary-50">
                <CardHeader>
                    <CardTitle>Generate Assessment</CardTitle>
                    <CardDescription>Upload PDF/DOCX/PPT</CardDescription>
                </CardHeader>
                <CardContent>
                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="primary"
                        layoutVariant="default"
                        className="w-full text-sm"
                        onClick={handleUploadClick}
                    >
                        {isUploading ? (
                            <DashboardLoader size={20} color="#ffffff" />
                        ) : (
                            <>
                                <UploadSimple size={32} />
                                Upload
                            </>
                        )}
                    </MyButton>
                    <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.html"
                    />
                </CardContent>
            </Card>

            <Dialog open={openAssessmentDialog} onOpenChange={setOpenAssessmentDialog}>
                <DialogContent className="p-0">
                    <h1 className="rounded-t-lg bg-primary-50 p-4 font-semibold text-primary-500">
                        Generate Assessment
                    </h1>
                    <div className="my-4 flex flex-col items-center justify-center gap-4">
                        <MyButton
                            type="submit"
                            scale="medium"
                            buttonType="secondary"
                            layoutVariant="default"
                            className="w-48 text-sm"
                            onClick={handleGenerateQuestionsForAssessment}
                        >
                            Generate Complete File
                        </MyButton>
                        <MyButton
                            type="submit"
                            scale="medium"
                            buttonType="secondary"
                            layoutVariant="default"
                            className="w-48 text-sm"
                            onClick={handleConvertPDFToHTMLFn}
                        >
                            Generate Page Wise
                        </MyButton>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GenerateAIAssessmentComponent;
