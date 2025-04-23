import { useEffect, useRef, useState } from "react";
import { GenerateCard } from "../../../-components/GenerateCard";
import { useFileUpload } from "@/hooks/use-file-upload";
import { getInstituteId } from "@/constants/helper";
import {
    handleStartProcessUploadedAudioFile,
    handleGetQuestionsFromAudio,
} from "../../../-services/ai-center-service";
import { useMutation } from "@tanstack/react-query";
import { generateCompleteAssessmentFormSchema } from "../../../-utils/generate-complete-assessment-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AIAssessmentResponseInterface } from "@/types/ai/generate-assessment/generate-complete-assessment";
import GenerateCompleteAssessment from "../../../-components/GenerateCompleteAssessment";
import { transformQuestionsToGenerateAssessmentAI } from "../../../-utils/helper";
import { useAICenter } from "../../../-contexts/useAICenterContext";

export const GenerateQuestionsFromAudio = () => {
    const instituteId = getInstituteId();
    const { uploadFile } = useFileUpload();
    const { setLoader, key, setKey } = useAICenter();
    const fileInputRef = useRef<HTMLInputElement>(null);
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
    const [numQuestions, setNumQuestions] = useState<number | null>(null);
    const [difficulty, setDifficulty] = useState<string | null>(null);
    const [language, setLanguage] = useState<string | null>(null);
    const [audioId, setAudioId] = useState<string | undefined>();

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
        setKey("audio");
        fileInputRef.current?.click();
    };

    const [fileUploading, setFileUploading] = useState(false);

    useEffect(() => {
        if (key === "audio") {
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
                const response = await handleStartProcessUploadedAudioFile(fileId);
                if (response) {
                    setAudioId(response.pdf_id);
                    await handleCallApi(response.pdf_id);
                }
            }
            event.target.value = "";
        }
    };

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
            numQuestions: numQuestions,
            prompt: propmtInput,
            difficulty: difficulty,
            language: language,
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
            setLoader(true);
            setKey("audio");
            return handleGetQuestionsFromAudio(audioId, numQuestions, prompt, difficulty, language);
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
            if (response?.status === "completed" || response?.questions) {
                setLoader(false);
                setKey(null);
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
                setNumQuestions(null);
                setDifficulty(null);
                setLanguage(null);
                return;
            }

            // Otherwise schedule next poll
            scheduleNextPoll(variables.audioId);
        },
        onError: (error, variables) => {
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
                setNumQuestions(null);
                setDifficulty(null);
                setLanguage(null);
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

    return (
        <div>
            <GenerateCard
                handleUploadClick={handleUploadClick}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                cardTitle="Generate Questions From Audio"
                cardDescription="Upload WAV/FLAC/MP3/AAC/M4A"
                inputFormat=".mp3,.wav,.flac,.aac,.m4a"
                keyProp="audio"
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
                    numQuestions={numQuestions}
                    setNumQuestions={setNumQuestions}
                    difficulty={difficulty}
                    setDifficulty={setDifficulty}
                    language={language}
                    setLanguage={setLanguage}
                    audioId={audioId}
                    keyProp="audio"
                />
            )}
        </div>
    );
};
