import { getInstituteId } from "@/constants/helper";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useEffect, useRef, useState } from "react";
import {
    handleSortSplitPDF,
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
import SortAndSplitTopicQuestionsPreview from "./SortAndSplitTopicQuestionsPreview";
import { useAICenter } from "../../-contexts/useAICenterContext";
const SortAndSplitTopicQuestions = () => {
    const instituteId = getInstituteId();
    const { uploadFile } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
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
    const { setLoader, key, setKey } = useAICenter();
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
        setKey("sort-split-pdf");
        fileInputRef.current?.click();
    };

    const [fileUploading, setFileUploading] = useState(false);

    useEffect(() => {
        if (key === "sort-split-pdf") {
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
            setKey("sort-split-pdf");
            return handleSortSplitPDF(pdfId, userPrompt);
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
            setKey("sort-split-pdf");
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

    const handleGenerateQuestionsForAssessment = (pdfId = uploadedFilePDFId) => {
        if (!uploadedFilePDFId) return;

        clearPolling();
        pollingCountRef.current = 0;
        pendingRef.current = false;

        // Use pdfId in your mutation call
        generateAssessmentMutation.mutate({ pdfId: pdfId, userPrompt: propmtInput });
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

    return (
        <div className="flex items-center justify-start gap-8">
            <GenerateCard
                handleUploadClick={handleUploadClick}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                cardTitle="Sort and split topic questions from PDF"
                cardDescription="Upload PDF/DOCX/PPT"
                inputFormat=".pdf,.doc,.docx,.ppt,.pptx,.html"
                keyProp="sort-split-pdf"
            />
            {assessmentData.questions.length > 0 && (
                <SortAndSplitTopicQuestionsPreview
                    form={form}
                    openCompleteAssessmentDialog={openCompleteAssessmentDialog}
                    setOpenCompleteAssessmentDialog={setOpenCompleteAssessmentDialog}
                    assessmentData={assessmentData}
                    handleGenerateQuestionsForAssessment={handleGenerateQuestionsForAssessment}
                    propmtInput={propmtInput}
                    setPropmtInput={setPropmtInput}
                    isMoreQuestionsDialog={isMoreQuestionsDialog}
                    setIsMoreQuestionsDialog={setIsMoreQuestionsDialog}
                />
            )}
        </div>
    );
};

export default SortAndSplitTopicQuestions;
