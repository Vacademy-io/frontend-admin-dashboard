import { MyButton } from "@/components/design-system/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadSimple } from "phosphor-react";
import { QuestionsFromTextData, QuestionsFromTextDialog } from "./QuestionsFromTextDialog";
import { useRef, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { handleGetQuestionsFromText } from "../../-services/ai-center-service";
import { transformQuestionsToGenerateAssessmentAI } from "../../-utils/helper";
import { generateCompleteAssessmentFormSchema } from "../../-utils/generate-complete-assessment-schema";
import { AIAssessmentResponseInterface } from "@/types/ai/generate-assessment/generate-complete-assessment";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import GenerateCompleteAssessment from "../generate-assessment/GenerateCompleteAssessment";
import { DashboardLoader } from "@/components/core/dashboard-loader";

export const GenerateQuestionsFromText = () => {
    const [open, setOpen] = useState(false);
    const [openCompleteAssessmentDialog, setOpenCompleteAssessmentDialog] = useState(false);
    const [isMoreQuestionsDialog, setIsMoreQuestionsDialog] = useState(false);
    const [propmtInput, setPropmtInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [disableSubmitBtn, setDisableSubmitBtn] = useState(true);
    const formSubmitRef = useRef(() => {});
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

    const handleDisableSubmitBtn = (value: boolean) => {
        setDisableSubmitBtn(value);
    };
    const handleUploadClick = () => {
        setOpen(true);
    };
    const handleOpenChange = (open: boolean) => {
        setOpen(open);
    };
    /* Generate Assessment Complete */
    const MAX_POLL_ATTEMPTS = 10;
    const pollingCountRef = useRef(0);
    const pollingTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const pendingRef = useRef(false);

    const handleSubmitSuccess = (data: QuestionsFromTextData) => {
        clearPolling();
        pollingCountRef.current = 0;
        pendingRef.current = false;

        pollGenerateQuestionsFromText(data);
    };

    const pollGenerateQuestionsFromText = (data: QuestionsFromTextData) => {
        if (pendingRef.current) {
            setIsUploading(true);
            return;
        }
        getQuestionsFromTextMutation.mutate({
            text: data.text,
            num: data.num,
            class_level: data.class_level,
            topics: data.topics,
            question_type: data.question_type,
            question_language: data.question_language,
        });
    };

    const getQuestionsFromTextMutation = useMutation({
        mutationFn: async (data: {
            text: string;
            num: number;
            class_level: string;
            topics: string;
            question_type: string;
            question_language: string;
        }) => {
            console.log("inside get questions from text mutation");
            setIsUploading(true);
            return handleGetQuestionsFromText(
                data.text,
                data.num,
                data.class_level,
                data.topics,
                data.question_type,
                data.question_language,
            );
        },
        onSuccess: (response, variables) => {
            // Check if response indicates pending state
            if (response?.status === "pending") {
                pendingRef.current = true;
                setIsUploading(true);
                // Don't schedule next poll - we'll wait for an error to resume
                return;
            }

            // Reset pending state if response is no longer pending
            pendingRef.current = false;

            // If we have complete data, we're done
            if (response?.status === "completed" || response?.questions) {
                setIsUploading(false);
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
                handleOpenChange(false);
                clearPolling();
                setOpenCompleteAssessmentDialog(true);
                setPropmtInput("");
                return;
            }

            // Otherwise schedule next poll
            scheduleNextPoll({
                text: variables.text,
                num: variables.num,
                class_level: variables.class_level,
                topics: variables.topics,
                question_type: variables.question_type,
                question_language: variables.question_language,
            });
        },
        onError: (error, variables) => {
            setIsUploading(false);
            // If we were in a pending state, resume polling on error
            if (pendingRef.current) {
                pendingRef.current = false;
                scheduleNextPoll(variables);
                return;
            }

            // Normal error handling
            pollingCountRef.current += 1;
            if (pollingCountRef.current >= MAX_POLL_ATTEMPTS) {
                handleOpenChange(false);
                clearPolling();
                return;
            }

            // Schedule next poll on error (if not max attempts)
            scheduleNextPoll(variables);
        },
    });

    const clearPolling = () => {
        if (pollingTimeoutIdRef.current) {
            setIsUploading(false);
            clearTimeout(pollingTimeoutIdRef.current);
            pollingTimeoutIdRef.current = null;
        }
    };

    const scheduleNextPoll = (data: QuestionsFromTextData) => {
        clearPolling(); // Clear any existing timeout

        // Only schedule next poll if not in pending state
        if (!pendingRef.current) {
            setIsUploading(true);
            pollingTimeoutIdRef.current = setTimeout(() => {
                pollGenerateQuestionsFromText(data);
            }, 10000);
        }
    };

    useEffect(() => {
        return () => {
            clearPolling();
        };
    }, []);

    const submitButton = (
        <div className="flex w-full items-center justify-center">
            {isUploading ? (
                <MyButton>
                    <DashboardLoader height="60px" size={20} color="#ffffff" />
                </MyButton>
            ) : (
                <MyButton disable={disableSubmitBtn} onClick={() => formSubmitRef.current()}>
                    Generate Questions
                </MyButton>
            )}
        </div>
    );

    const submitFormFn = (submitFn: () => void) => {
        formSubmitRef.current = submitFn;
    };

    return (
        <div>
            <Card className="w-[300px] cursor-pointer bg-primary-50">
                <CardHeader>
                    <CardTitle>Generate Questions From Text</CardTitle>
                    <CardDescription>Add text content</CardDescription>
                </CardHeader>
                <CardContent>
                    {isUploading ? (
                        <MyButton
                            type="button"
                            scale="medium"
                            buttonType="primary"
                            layoutVariant="default"
                            className="w-full text-sm"
                        >
                            <DashboardLoader size={20} color="#ffffff" />
                        </MyButton>
                    ) : (
                        <MyButton
                            type="button"
                            scale="medium"
                            buttonType="primary"
                            layoutVariant="default"
                            className="w-full text-sm"
                            onClick={handleUploadClick}
                        >
                            <UploadSimple size={32} />
                            Upload
                        </MyButton>
                    )}
                </CardContent>
            </Card>
            <QuestionsFromTextDialog
                open={open}
                onOpenChange={handleOpenChange}
                onSubmitSuccess={handleSubmitSuccess}
                submitButton={submitButton}
                handleDisableSubmitBtn={handleDisableSubmitBtn}
                submitForm={submitFormFn}
            />
            {assessmentData.questions.length > 0 && (
                <GenerateCompleteAssessment
                    form={form}
                    openCompleteAssessmentDialog={openCompleteAssessmentDialog}
                    setOpenCompleteAssessmentDialog={setOpenCompleteAssessmentDialog}
                    assessmentData={assessmentData}
                    handleSubmitSuccessForText={handleSubmitSuccess}
                    handleGenerateQuestionsForAssessment={() => {}}
                    propmtInput={propmtInput}
                    setPropmtInput={setPropmtInput}
                    isMoreQuestionsDialog={isMoreQuestionsDialog}
                    setIsMoreQuestionsDialog={setIsMoreQuestionsDialog}
                    submitButtonForText={submitButton}
                    handleDisableSubmitBtn={handleDisableSubmitBtn}
                    submitFormFn={submitFormFn}
                />
            )}
        </div>
    );
};
