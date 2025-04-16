import { useEffect, useRef, useState } from "react";
import { GenerateCard } from "../GenerateCard";
import { useFileUpload } from "@/hooks/use-file-upload";
import { getInstituteId } from "@/constants/helper";
import {
    handleStartProcessUploadedAudioFile,
    handleGetQuestionsFromAudio,
} from "../../-services/ai-center-service";
import { useMutation } from "@tanstack/react-query";
import { generateCompleteAssessmentFormSchema } from "../../-utils/generate-complete-assessment-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AIAssessmentResponseInterface } from "@/types/ai/generate-assessment/generate-complete-assessment";
import GenerateCompleteAssessment from "../generate-assessment/GenerateCompleteAssessment";
import { transformQuestionsToGenerateAssessmentAI } from "../../-utils/helper";

export const GenerateQuestionsFromAudio = ({
    handleLoader,
}: {
    handleLoader: (value: boolean) => void;
}) => {
    const instituteId = getInstituteId();
    const { uploadFile } = useFileUpload();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedAudioId, setUploadedAudioId] = useState("");
    const [openCompleteAssessmentDialog, setOpenCompleteAssessmentDialog] = useState(false);
    const [propmtInput, setPropmtInput] = useState("");
    const [isMoreQuestionsDialog, setIsMoreQuestionsDialog] = useState(false);
    const [assessmentData, setAssessmentData] = useState<AIAssessmentResponseInterface>({
        title: "",
        tags: [],
        difficulty: "",
        description: "",
        subjects: [],
        classes: [],
        questions: [],
    });

    const form = useForm<z.infer<typeof generateCompleteAssessmentFormSchema>>({
        resolver: zodResolver(generateCompleteAssessmentFormSchema),
        mode: "onChange",
        defaultValues: {
            questionPaperId: "1",
            isFavourite: false,
            title: "",
            createdOn: new Date(),
            yearClass: "",
            subject: "",
            questionsType: "",
            optionsType: "",
            answersType: "",
            explanationsType: "",
            fileUpload: undefined,
            questions: [],
        },
    });

    /* Generate Assessment Complete */
    const MAX_POLL_ATTEMPTS = 10;
    const pollingCountRef = useRef(0);
    const pollingTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const pendingRef = useRef(false);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleLoader(true);
            const fileId = await uploadFile({
                file,
                setIsUploading,
                userId: "your-user-id",
                source: instituteId,
                sourceId: "STUDENTS",
            });
            if (fileId) {
                const response = await handleStartProcessUploadedAudioFile(fileId);
                console.log("response", response);
                if (response) {
                    setUploadedAudioId(response.pdf_id);
                    await handleCallApi(response.pdf_id);
                }
            }
            event.target.value = "";
        }
    };

    const handleCallApi = async (audioId?: string) => {
        const idToUse = audioId || uploadedAudioId;
        console.log("idToUse", idToUse);
        if (!idToUse) return;
        console.log("inside call api function");

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
        handleLoader(true);
        getQuestionsFromAudioMutation.mutate({
            audioId: audioId,
            numQuestions: 10,
            prompt: "",
            difficulty: "Medium",
            language: "English",
        });
    };

    const getQuestionsFromAudioMutation = useMutation({
        mutationFn: async ({
            audioId,
            numQuestions,
            prompt,
            difficulty,
            language,
        }: {
            audioId: string;
            numQuestions: number | null;
            prompt: string | null;
            difficulty: string | null;
            language: string | null;
        }) => {
            return handleGetQuestionsFromAudio(audioId, numQuestions, prompt, difficulty, language);
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
            if (response?.status === "completed" || response?.questions) {
                setAssessmentData((prev) => ({
                    ...prev,
                    questions: [...(prev.questions ?? []), ...(response?.questions ?? [])],
                }));
                const addedQuestions = [
                    ...(assessmentData.questions ?? []),
                    ...(response?.questions ?? []),
                ];
                const transformQuestionsData =
                    transformQuestionsToGenerateAssessmentAI(addedQuestions);
                form.reset({
                    ...form.getValues(),
                    title: assessmentData?.title,
                    questions: transformQuestionsData,
                });
                form.trigger();
                clearPolling();
                setOpenCompleteAssessmentDialog(true);
                setPropmtInput("");
                setIsMoreQuestionsDialog(false);
                handleLoader(false);
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
                clearPolling();
                handleLoader(false);
                return;
            }

            // Schedule next poll on error (if not max attempts)
            scheduleNextPoll();
        },
    });

    const clearPolling = () => {
        if (pollingTimeoutIdRef.current) {
            clearTimeout(pollingTimeoutIdRef.current);
            pollingTimeoutIdRef.current = null;
        }
    };

    const scheduleNextPoll = () => {
        clearPolling(); // Clear any existing timeout

        // Only schedule next poll if not in pending state
        if (!pendingRef.current) {
            console.log("Scheduling next poll in 10 seconds");
            pollingTimeoutIdRef.current = setTimeout(() => {
                pollGenerateQuestionsFromAudio(uploadedAudioId);
            }, 10000);
        }
    };

    useEffect(() => {
        return () => {
            clearPolling();
        };
    }, []);

    return (
        <div>
            <GenerateCard
                handleUploadClick={handleUploadClick}
                isUploading={isUploading}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                cardTitle="Generate Questions From Audio"
                cardDescription="Upload WAV/FLAC/MP3/AAC/M4A"
                inputFormat=".mp3,.wav,.flac,.aac,.m4a"
            />
            {assessmentData.questions.length > 0 && (
                <GenerateCompleteAssessment
                    form={form}
                    openCompleteAssessmentDialog={openCompleteAssessmentDialog}
                    setOpenCompleteAssessmentDialog={setOpenCompleteAssessmentDialog}
                    assessmentData={assessmentData}
                    handleGenerateQuestionsForAssessment={handleCallApi}
                    propmtInput={propmtInput}
                    setPropmtInput={setPropmtInput}
                    isMoreQuestionsDialog={isMoreQuestionsDialog}
                    setIsMoreQuestionsDialog={setIsMoreQuestionsDialog}
                />
            )}
        </div>
    );
};
