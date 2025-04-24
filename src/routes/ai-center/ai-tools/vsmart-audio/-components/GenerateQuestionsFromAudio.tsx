import { useEffect, useRef, useState } from "react";
import { GenerateCard } from "../../../-components/GenerateCard";
import { useFileUpload } from "@/hooks/use-file-upload";
import { getInstituteId } from "@/constants/helper";
import {
    handleStartProcessUploadedAudioFile,
    handleGetQuestionsFromAudio,
} from "../../../-services/ai-center-service";
import { useMutation } from "@tanstack/react-query";
import { useAICenter } from "../../../-contexts/useAICenterContext";
import AITasksList from "@/routes/ai-center/-components/AITasksList";

export const GenerateQuestionsFromAudio = () => {
    const [taskName, setTaskName] = useState("");
    const instituteId = getInstituteId();
    const { uploadFile } = useFileUpload();
    const { setLoader, key, setKey } = useAICenter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileUploading, setFileUploading] = useState(false);

    const handleUploadClick = () => {
        setKey("audio");
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
                    await handleCallApi(response.pdf_id);
                }
            }
            event.target.value = "";
        }
    };

    /* Polling */
    const MAX_POLL_ATTEMPTS = 10;
    const pollingCountRef = useRef(0);
    const pollingTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const pendingRef = useRef(false);

    const handleCallApi = async (audioId?: string) => {
        const idToUse = audioId;
        if (!idToUse) return;

        clearPolling();
        pollingCountRef.current = 0;
        pendingRef.current = false;

        // Make initial call
        pollGenerateQuestionsFromAudio(idToUse);
    };

    const pollGenerateQuestionsFromAudio = (audioId: string) => {
        if (pendingRef.current) {
            return;
        }
        getQuestionsFromAudioMutation.mutate({
            audioId: audioId,
            numQuestions: "",
            prompt: "",
            difficulty: "",
            language: "",
            taskName,
        });
    };

    const getQuestionsFromAudioMutation = useMutation({
        mutationFn: async ({
            audioId,
            numQuestions,
            prompt,
            difficulty,
            language,
            taskName,
        }: {
            audioId: string;
            numQuestions: string | null;
            prompt: string | null;
            difficulty: string | null;
            language: string | null;
            taskName: string;
        }) => {
            setLoader(true);
            setKey("audio");
            return handleGetQuestionsFromAudio(
                audioId,
                numQuestions,
                prompt,
                difficulty,
                language,
                taskName,
            );
        },
        onSuccess: (response, variables) => {
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
            scheduleNextPoll(variables.audioId);
        },
        onError: (_, variables) => {
            // If we were in a pending state, resume polling on error
            if (pendingRef.current) {
                pendingRef.current = false;
                scheduleNextPoll(variables.audioId);
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
            scheduleNextPoll(variables.audioId);
        },
    });

    const clearPolling = () => {
        if (pollingTimeoutIdRef.current) {
            setLoader(false);
            setKey(null);
            clearTimeout(pollingTimeoutIdRef.current);
            pollingTimeoutIdRef.current = null;
        }
    };

    const scheduleNextPoll = (audioId: string) => {
        setLoader(false);
        setKey(null);
        clearPolling(); // Clear any existing timeout

        // Only schedule next poll if not in pending state
        if (!pendingRef.current) {
            setLoader(true);
            setKey("audio");
            pollingTimeoutIdRef.current = setTimeout(() => {
                pollGenerateQuestionsFromAudio(audioId);
            }, 10000);
        }
    };

    useEffect(() => {
        return () => {
            clearPolling();
        };
    }, []);

    useEffect(() => {
        if (key === "audio") {
            if (fileUploading == true) setLoader(true);
        }
    }, [fileUploading, key]);

    return (
        <>
            <GenerateCard
                handleUploadClick={handleUploadClick}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                cardTitle="Generate Questions From Audio"
                cardDescription="Upload WAV/FLAC/MP3/AAC/M4A"
                inputFormat=".mp3,.wav,.flac,.aac,.m4a"
                keyProp="audio"
                taskName={taskName}
                setTaskName={setTaskName}
            />
            {getQuestionsFromAudioMutation.status === "success" && (
                <AITasksList heading="Vsmart Audio" enableDialog={true} />
            )}
        </>
    );
};
