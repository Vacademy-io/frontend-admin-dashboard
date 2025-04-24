import { getInstituteId } from "@/constants/helper";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useEffect, useRef, useState } from "react";
import {
    handleConvertPDFToHTML,
    handleGenerateAssessmentQuestions,
    handleStartProcessUploadedFile,
} from "@/routes/ai-center/-services/ai-center-service";
import { useMutation } from "@tanstack/react-query";
import GeneratePageWiseAssessment from "./GeneratePageWiseAssessment";
import { GenerateAssessmentDialog } from "./GenerateAssessmentDialog";
import { GenerateCard } from "@/routes/ai-center/-components/GenerateCard";
import { useAICenter } from "@/routes/ai-center/-contexts/useAICenterContext";
import AITasksList from "@/routes/ai-center/-components/AITasksList";

const GenerateAIAssessmentComponent = () => {
    const [taskName, setTaskName] = useState("");
    const instituteId = getInstituteId();
    const { setLoader, key, setKey } = useAICenter();
    const { uploadFile } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [openAssessmentDialog, setOpenAssessmentDialog] = useState(false);
    const [uploadedFilePDFId, setUploadedFilePDFId] = useState("");
    const [htmlData, setHtmlData] = useState(null);
    const [openPageWiseAssessmentDialog, setOpenPageWiseAssessmentDialog] = useState(false);

    const handleOpenAssessmentDialog = (open: boolean) => {
        setOpenAssessmentDialog(open);
    };

    const handleUploadClick = () => {
        setKey("assessment");
        fileInputRef.current?.click();
    };

    const [fileUploading, setFileUploading] = useState(false);

    useEffect(() => {
        if (key === "assessment") {
            if (fileUploading == true) setLoader(true);
        }
    }, [fileUploading, key]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileId = await uploadFile({
                file,
                setIsUploading: setFileUploading,
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
            setLoader(false);
            setKey(null);
            clearTimeout(pollingTimeoutIdRef.current);
            pollingTimeoutIdRef.current = null;
        }
    };

    const generateAssessmentMutation = useMutation({
        mutationFn: ({
            pdfId,
            userPrompt,
            taskName,
        }: {
            pdfId: string;
            userPrompt: string;
            taskName: string;
        }) => {
            setLoader(true);
            setKey("assessment");
            return handleGenerateAssessmentQuestions(pdfId, userPrompt, taskName);
        },
        onSuccess: (response) => {
            // Check if response indicates pending state
            if (response?.status === "pending") {
                pendingRef.current = true;
                // Don't schedule next poll - we'll wait for an error to resume
                return;
            }

            // Reset pending state if response is no longer pending
            pendingRef.current = false;

            // If we have complete data, we're done
            if (response === "Done" || response?.questions) {
                setLoader(false);
                setKey(null);
                clearPolling();
                return;
            }

            // Otherwise schedule next poll
            scheduleNextPoll();
        },
        onError: () => {
            // If we were in a pending state, resume polling on error
            if (pendingRef.current) {
                pendingRef.current = false;
                scheduleNextPoll();
                return;
            }

            // Normal error handling
            pollingCountRef.current += 1;
            if (pollingCountRef.current >= MAX_POLL_ATTEMPTS) {
                setLoader(false);
                setKey(null);
                clearPolling();
                return;
            }

            // Schedule next poll on error (if not max attempts)
            scheduleNextPoll();
        },
    });

    const scheduleNextPoll = () => {
        setLoader(false);
        setKey(null);
        clearPolling(); // Clear any existing timeout

        // Only schedule next poll if not in pending state
        if (!pendingRef.current) {
            setLoader(true);
            setKey("assessment");
            console.log("Scheduling next poll in 10 seconds");
            pollingTimeoutIdRef.current = setTimeout(() => {
                pollGenerateAssessment();
            }, 10000);
        }
    };

    const pollGenerateAssessment = () => {
        // Don't call API if in pending state
        if (pendingRef.current) {
            return;
        }
        generateAssessmentMutation.mutate({
            pdfId: uploadedFilePDFId,
            userPrompt: "",
            taskName,
        });
    };

    const handleGenerateQuestionsForAssessment = () => {
        if (!uploadedFilePDFId) return;

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
        mutationFn: ({ pdfId, taskName }: { pdfId: string; taskName: string }) =>
            handleConvertPDFToHTML(pdfId, taskName),
        onSuccess: async (response) => {
            // Check if response indicates pending state
            if (response?.status === "pending") {
                convertPendingRef.current = true;
                // Don't schedule next poll - we'll wait for an error to resume
                return;
            }

            // Reset pending state
            convertPendingRef.current = false;

            // If conversion is complete and we have HTML data
            if (response === "Done" || response?.html) {
                stopConvertPolling();
                setHtmlData(response?.html);
                setOpenPageWiseAssessmentDialog(true);

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
            return;
        }
        handleConvertPDFToHTMLMutation.mutate({ pdfId: uploadedFilePDFId, taskName });
    };

    const handleConvertPDFToHTMLFn = () => {
        if (!uploadedFilePDFId) return;
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
            <GenerateCard
                handleUploadClick={handleUploadClick}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                cardTitle="Generate Assessment"
                cardDescription="Upload PDF/DOCX/PPT"
                inputFormat=".pdf,.doc,.docx,.ppt,.pptx,.html"
                keyProp="assessment"
                taskName={taskName}
                setTaskName={setTaskName}
            />
            <GenerateAssessmentDialog
                open={openAssessmentDialog}
                handleOpen={handleOpenAssessmentDialog}
                handleGenerateCompleteFile={handleGenerateQuestionsForAssessment}
                handleGeneratePageWise={handleConvertPDFToHTMLFn}
                allPagesGenerateQuestionsStatus={generateAssessmentMutation.status}
                pageWiseGenerateQuestionsStatus={handleConvertPDFToHTMLMutation.status}
            />
            {generateAssessmentMutation.status === "success" && (
                <AITasksList heading="Vsmart Upload" enableDialog={true} />
            )}
            <GeneratePageWiseAssessment
                openPageWiseAssessmentDialog={openPageWiseAssessmentDialog}
                setOpenPageWiseAssessmentDialog={setOpenPageWiseAssessmentDialog}
                htmlData={htmlData}
            />
        </div>
    );
};

export default GenerateAIAssessmentComponent;
