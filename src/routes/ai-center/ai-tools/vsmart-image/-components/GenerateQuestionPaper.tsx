import { getInstituteId } from "@/constants/helper";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useEffect, useRef, useState } from "react";
import {
    handleGenerateAssessmentQuestions,
    handleStartProcessUploadedFile,
} from "@/routes/ai-center/-services/ai-center-service";
import { useMutation } from "@tanstack/react-query";
import { GenerateCard } from "@/routes/ai-center/-components/GenerateCard";
import { useAICenter } from "@/routes/ai-center/-contexts/useAICenterContext";
const GenerateAiQuestionFromImageComponent = () => {
    const [taskName, setTaskName] = useState("");
    const instituteId = getInstituteId();
    const { uploadFile } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { setLoader, key, setKey } = useAICenter();
    const [fileUploading, setFileUploading] = useState(false);

    const handleUploadClick = () => {
        setKey("image");
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
            setKey("image");
            return handleGenerateAssessmentQuestions(pdfId, userPrompt, taskName);
        },
        onSuccess: (response, { pdfId }) => {
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
            scheduleNextPoll(pdfId);
        },
        onError: (_, { pdfId }) => {
            // If we were in a pending state, resume polling on error
            if (pendingRef.current) {
                pendingRef.current = false;
                scheduleNextPoll(pdfId);
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
            scheduleNextPoll(pdfId);
        },
    });

    const scheduleNextPoll = (pdfId: string) => {
        setLoader(false);
        setKey(null);
        clearPolling(); // Clear any existing timeout

        // Only schedule next poll if not in pending state
        if (!pendingRef.current) {
            setLoader(true);
            setKey("image");
            console.log("Scheduling next poll in 10 seconds");
            pollingTimeoutIdRef.current = setTimeout(() => {
                pollGenerateAssessment(pdfId);
            }, 10000);
        }
    };

    const pollGenerateAssessment = (pdfId: string) => {
        // Don't call API if in pending state
        if (pendingRef.current) {
            return;
        }
        generateAssessmentMutation.mutate({
            pdfId: pdfId,
            userPrompt: "",
            taskName,
        });
    };

    const handleGenerateQuestionsForAssessment = (pdfId: string) => {
        if (!pdfId) return;

        clearPolling();
        pollingCountRef.current = 0;
        pendingRef.current = false;

        // Make initial call
        pollGenerateAssessment(pdfId);
    };

    useEffect(() => {
        return () => {
            clearPolling();
        };
    }, []);

    useEffect(() => {
        if (key === "image") {
            if (fileUploading == true) setLoader(true);
        }
    }, [fileUploading, key]);

    return (
        <GenerateCard
            handleUploadClick={handleUploadClick}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            cardTitle="Extract Questions from Image"
            cardDescription="Upload JPG/JPEG/PNG"
            inputFormat=".jpg,.jpeg,.png"
            keyProp="image"
            taskName={taskName}
            setTaskName={setTaskName}
        />
    );
};

export default GenerateAiQuestionFromImageComponent;
