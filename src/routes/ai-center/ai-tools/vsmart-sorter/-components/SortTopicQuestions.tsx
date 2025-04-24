import { getInstituteId } from "@/constants/helper";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useEffect, useRef, useState } from "react";
import {
    handleSortQuestionsPDF,
    handleStartProcessUploadedFile,
} from "../../../-services/ai-center-service";
import { useMutation } from "@tanstack/react-query";
import { GenerateCard } from "../../../-components/GenerateCard";
import { useAICenter } from "../../../-contexts/useAICenterContext";

const SortTopicQuestions = () => {
    const [taskName, setTaskName] = useState("");
    const instituteId = getInstituteId();
    const { setLoader, key, setKey } = useAICenter();
    const { uploadFile } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploadedFilePDFId, setUploadedFilePDFId] = useState("");
    const [fileUploading, setFileUploading] = useState(false);

    const handleUploadClick = () => {
        setKey("sortTopicsPdf");
        fileInputRef.current?.click();
    };

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
                    setUploadedFilePDFId(response.pdf_id);
                    handleGenerateQuestionsForAssessment(response.pdf_id);
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
            setKey("sortTopicsPdf");
            return handleSortQuestionsPDF(pdfId, userPrompt, taskName);
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
            if (response === "Done") {
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
            setKey("sortTopicsPdf");
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

    const handleGenerateQuestionsForAssessment = (pdfId = uploadedFilePDFId) => {
        if (!uploadedFilePDFId) return;

        clearPolling();
        pollingCountRef.current = 0;
        pendingRef.current = false;

        // Use pdfId in your mutation call
        generateAssessmentMutation.mutate({ pdfId: pdfId, userPrompt: "", taskName });
    };

    useEffect(() => {
        return () => {
            clearPolling();
        };
    }, []);

    useEffect(() => {
        if (uploadedFilePDFId) {
            handleGenerateQuestionsForAssessment(uploadedFilePDFId);
        }
    }, [uploadedFilePDFId]);

    useEffect(() => {
        if (key === "sortTopicsPdf") {
            if (fileUploading == true) setLoader(true);
        }
    }, [fileUploading, key]);

    return (
        <GenerateCard
            handleUploadClick={handleUploadClick}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            cardTitle="Sort topics of each question from PDF"
            cardDescription="Upload PDF/DOCX/PPT"
            inputFormat=".pdf,.doc,.docx,.ppt,.pptx,.html"
            keyProp="sortTopicsPdf"
            taskName={taskName}
            setTaskName={setTaskName}
        />
    );
};

export default SortTopicQuestions;
