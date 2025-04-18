import { getInstituteId } from "@/constants/helper";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useEffect, useRef, useState } from "react";
import {
    handleConvertPDFToHTML,
    handleGenerateAssessmentQuestions,
    // handleGetQuestionsFromHTMLUrl,
    handleStartProcessUploadedFile,
} from "../../-services/ai-center-service";
import { useMutation } from "@tanstack/react-query";
import { AIAssessmentResponseInterface } from "@/types/ai/generate-assessment/generate-complete-assessment";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { generateCompleteAssessmentFormSchema } from "../../-utils/generate-complete-assessment-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { transformQuestionsToGenerateAssessmentAI } from "../../-utils/helper";
import { GenerateCard } from "../GenerateCard";
import GenerateCompleteAssessment from "../GenerateCompleteAssessment";
import { useAICenter } from "../../-contexts/useAICenterContext";
const GenerateAiQuestionFromImageComponent = () => {
    const instituteId = getInstituteId();
    const { uploadFile } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { setLoader, key, setKey } = useAICenter();
    // const [openAssessmentDialog, setOpenAssessmentDialog] = useState(false);
    const [uploadedFilePDFId, setUploadedFilePDFId] = useState("");
    const [assessmentData, setAssessmentData] = useState<AIAssessmentResponseInterface>({
        title: "",
        tags: [],
        difficulty: "",
        description: "",
        subjects: [],
        classes: [],
        questions: [],
    });
    const [openCompleteAssessmentDialog, setOpenCompleteAssessmentDialog] = useState(false);
    const [propmtInput, setPropmtInput] = useState("");
    const [isMoreQuestionsDialog, setIsMoreQuestionsDialog] = useState(false);
    // const [htmlData, setHtmlData] = useState(null);
    // const [openPageWiseAssessmentDialog, setOpenPageWiseAssessmentDialog] = useState(false);

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

    const handleUploadClick = () => {
        setKey("image");
        fileInputRef.current?.click();
    };

    const [fileUploading, setFileUploading] = useState(false);

    useEffect(() => {
        if (key === "image") {
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
        mutationFn: ({ pdfId, userPrompt }: { pdfId: string; userPrompt: string }) => {
            setLoader(true);
            setKey("image");
            return handleGenerateAssessmentQuestions(pdfId, userPrompt);
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
            setKey("image");
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
        generateAssessmentMutation.mutate({ pdfId: uploadedFilePDFId, userPrompt: propmtInput });
    };

    const handleGenerateQuestionsForAssessment = (fileId?: string) => {
        if (!fileId && !uploadedFilePDFId) return;

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
            // Check if response indicates pending state
            if (response?.status === "pending") {
                convertPendingRef.current = true;
                // Don't schedule next poll - we'll wait for an error to resume
                return;
            }

            // Reset pending state
            convertPendingRef.current = false;

            // // If conversion is complete and we have HTML data
            // if (response?.html) {
            //     stopConvertPolling();
            //     setHtmlData(response?.html);
            //     setOpenPageWiseAssessmentDialog(true);
            //     // try {
            //     //     const questionsData = await handleGetQuestionsFromHTMLUrl(response.html, "");
            //     //     console.log("✅ Questions Data:", questionsData);
            //     // } catch (error) {
            //     //     console.error("⛔️ Error processing HTML:", error);
            //     // }

            //     return;
            // }

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
        handleConvertPDFToHTMLMutation.mutate({ pdfId: uploadedFilePDFId });
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
                cardTitle="Extract Questions from Image"
                cardDescription="Upload JPG/JPEG/PNG"
                inputFormat=".jpg,.jpeg,.png"
                keyProp="image"
            />
            {assessmentData.questions.length > 0 && (
                <GenerateCompleteAssessment
                    form={form}
                    openCompleteAssessmentDialog={openCompleteAssessmentDialog}
                    setOpenCompleteAssessmentDialog={setOpenCompleteAssessmentDialog}
                    assessmentData={assessmentData}
                    handleGenerateQuestionsForAssessment={handleGenerateQuestionsForAssessment}
                    propmtInput={propmtInput}
                    setPropmtInput={setPropmtInput}
                    isMoreQuestionsDialog={isMoreQuestionsDialog}
                    setIsMoreQuestionsDialog={setIsMoreQuestionsDialog}
                    keyProp="image"
                />
            )}
        </div>
    );
};

export default GenerateAiQuestionFromImageComponent;
