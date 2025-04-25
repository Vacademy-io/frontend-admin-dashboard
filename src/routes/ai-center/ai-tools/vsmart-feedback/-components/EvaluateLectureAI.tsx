import { GenerateCard } from "@/routes/ai-center/-components/GenerateCard";
import { getInstituteId } from "@/constants/helper";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAICenter } from "@/routes/ai-center/-contexts/useAICenterContext";
import {
    handleGenerateAssessmentQuestions,
    handleStartProcessUploadedAudioFile,
} from "@/routes/ai-center/-services/ai-center-service";
import AITasksList from "@/routes/ai-center/-components/AITasksList";
const EvaluateLectureAI = () => {
    const queryClient = useQueryClient();
    const [taskName, setTaskName] = useState("");
    const instituteId = getInstituteId();
    const { setLoader, key, setKey } = useAICenter();
    const { uploadFile } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [fileUploading, setFileUploading] = useState(false);

    const handleUploadClick = () => {
        setKey("evaluateLecture");
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
                const response = await handleStartProcessUploadedAudioFile(fileId);
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
            setKey("evaluateLecture");
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
            if (response === "Done") {
                setLoader(false);
                setKey(null);
                clearPolling();
                queryClient.invalidateQueries({ queryKey: ["GET_INDIVIDUAL_AI_LIST_DATA"] });
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
            setKey("evaluateLecture");
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

    const handleGenerateQuestionsForAssessment = (pdfId?: string) => {
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
        if (key === "question") {
            if (fileUploading == true) setLoader(true);
        }
    }, [fileUploading, key]);
    return (
        <>
            <GenerateCard
                handleUploadClick={handleUploadClick}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                cardTitle="Evaluate Lecture"
                cardDescription="Upload WAV/FLAC/MP3/AAC/M4A"
                inputFormat=".mp3,.wav,.flac,.aac,.m4a"
                keyProp="evaluateLecture"
                taskName={taskName}
                setTaskName={setTaskName}
            />
            {generateAssessmentMutation.status === "success" && (
                <AITasksList heading="Vsmart Feedback" enableDialog={true} />
            )}
        </>
    );
};

export default EvaluateLectureAI;
