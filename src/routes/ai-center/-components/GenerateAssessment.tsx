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
    const [assessmentData, setAssessmentData] = useState(null);
    console.log(assessmentData);

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

    /* Generate Assessment Complete */
    const MAX_POLL_ATTEMPTS = 10;
    const pollingCountRef = useRef(0);
    const pollingTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const pendingRef = useRef(false);

    const clearPolling = () => {
        if (pollingTimeoutIdRef.current) {
            clearTimeout(pollingTimeoutIdRef.current);
            pollingTimeoutIdRef.current = null;
        }
    };

    const generateAssessmentMutation = useMutation({
        mutationFn: ({ pdfId }: { pdfId: string }) => handleGenerateAssessmentQuestions(pdfId),
        onSuccess: (response) => {
            console.log("API response:", response);

            // Check if response indicates pending state
            if (response?.status === "pending") {
                console.log("Assessment generation is pending");
                pendingRef.current = true;
                // Don't schedule next poll - we'll wait for an error to resume
                return;
            }

            // Reset pending state if response is no longer pending
            pendingRef.current = false;

            // If we have complete data, we're done
            if (response?.status === "completed" || response?.questions) {
                console.log("Assessment generation completed");
                setAssessmentData(response);
                clearPolling();
                return;
            }

            // Otherwise schedule next poll
            scheduleNextPoll();
        },
        onError: (error) => {
            console.log("Error in API call:", error);

            // If we were in a pending state, resume polling on error
            if (pendingRef.current) {
                console.log("Resuming polling after pending state");
                pendingRef.current = false;
                scheduleNextPoll();
                return;
            }

            // Normal error handling
            pollingCountRef.current += 1;
            if (pollingCountRef.current >= MAX_POLL_ATTEMPTS) {
                console.log("Max polling attempts reached");
                clearPolling();
                return;
            }

            // Schedule next poll on error (if not max attempts)
            scheduleNextPoll();
        },
    });

    const scheduleNextPoll = () => {
        clearPolling(); // Clear any existing timeout

        // Only schedule next poll if not in pending state
        if (!pendingRef.current) {
            console.log("Scheduling next poll in 10 seconds");
            pollingTimeoutIdRef.current = setTimeout(() => {
                pollGenerateAssessment();
            }, 10000);
        }
    };

    const pollGenerateAssessment = () => {
        // Don't call API if in pending state
        if (pendingRef.current) {
            console.log("Skipping poll - in pending state");
            return;
        }

        console.log("Polling API for assessment generation status");
        generateAssessmentMutation.mutate({ pdfId: uploadedFilePDFId });
    };

    const handleGenerateQuestionsForAssessment = () => {
        if (!uploadedFilePDFId) return;

        console.log("Starting assessment generation");
        clearPolling();
        pollingCountRef.current = 0;
        pendingRef.current = false;

        // Make initial call
        pollGenerateAssessment();
    };

    useEffect(() => {
        return () => {
            clearPolling();
        };
    }, []);

    /* Generate Assessment Pagewise */
    const convertPollingCountRef = useRef(0);
    const convertPollingTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const MAX_CONVERT_ATTEMPTS = 10;
    const convertPendingRef = useRef(false);

    const handleConvertPDFToHTMLMutation = useMutation({
        mutationFn: ({ pdfId }: { pdfId: string }) => handleConvertPDFToHTML(pdfId),
        onSuccess: async (response) => {
            console.log("Convert API response:", response);

            // Check if response indicates pending state
            if (response?.status === "pending") {
                console.log("ℹ️ Conversion is pending");
                convertPendingRef.current = true;
                // Don't schedule next poll - we'll wait for an error to resume
                return;
            }

            // Reset pending state
            convertPendingRef.current = false;

            // If conversion is complete and we have HTML data
            if (response?.html) {
                console.log("✅ Conversion complete, processing HTML");
                stopConvertPolling();

                try {
                    const questionsData = await handleGetQuestionsFromHTMLUrl(response.html);
                    console.log("✅ Questions Data:", questionsData);
                } catch (error) {
                    console.error("⛔️ Error processing HTML:", error);
                }

                return;
            }

            // If response exists but no HTML yet, schedule next poll
            scheduleNextConvertPoll();
        },
        onError: (error: unknown) => {
            console.error("⛔️ Convert Error:", error);

            // If we were in a pending state, resume polling on error
            if (convertPendingRef.current) {
                console.log("Resuming polling after pending state");
                convertPendingRef.current = false;
                scheduleNextConvertPoll();
                return;
            }

            // Increment count and check max attempts
            convertPollingCountRef.current += 1;
            if (convertPollingCountRef.current >= MAX_CONVERT_ATTEMPTS) {
                console.log("Max conversion polling attempts reached");
                stopConvertPolling();
                return;
            }

            // Schedule next poll if not max attempts yet
            scheduleNextConvertPoll();
        },
    });

    const stopConvertPolling = () => {
        if (convertPollingTimeoutIdRef.current) {
            clearTimeout(convertPollingTimeoutIdRef.current);
            convertPollingTimeoutIdRef.current = null;
        }
    };

    const scheduleNextConvertPoll = () => {
        stopConvertPolling(); // Clear any existing timeout

        // Only schedule next poll if not in pending state
        if (!convertPendingRef.current) {
            console.log("Scheduling next conversion poll in 10 seconds");
            convertPollingTimeoutIdRef.current = setTimeout(() => {
                pollConvertPDFToHTML();
            }, 10000);
        }
    };

    const pollConvertPDFToHTML = () => {
        // Don't call API if in pending state
        if (convertPendingRef.current) {
            console.log("Skipping conversion poll - in pending state");
            return;
        }

        console.log("Polling API for PDF to HTML conversion status");
        handleConvertPDFToHTMLMutation.mutate({ pdfId: uploadedFilePDFId });
    };

    const handleConvertPDFToHTMLFn = () => {
        if (!uploadedFilePDFId) return;

        console.log("Starting PDF to HTML conversion");
        stopConvertPolling();
        convertPollingCountRef.current = 0;
        convertPendingRef.current = false;

        // Make initial call
        pollConvertPDFToHTML();
    };

    // Cleanup on component unmount
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
