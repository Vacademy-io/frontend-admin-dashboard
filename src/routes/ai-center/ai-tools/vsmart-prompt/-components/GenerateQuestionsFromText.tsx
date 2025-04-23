import { MyButton } from "@/components/design-system/button";
import { StarFour, UploadSimple } from "phosphor-react";
import { QuestionsFromTextDialog } from "./QuestionsFromTextDialog";
import { useRef, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { handleGetQuestionsFromText } from "../../../-services/ai-center-service";
import { transformQuestionsToGenerateAssessmentAI } from "../../../-utils/helper";
import { generateCompleteAssessmentFormSchema } from "../../../-utils/generate-complete-assessment-schema";
import { AIAssessmentResponseInterface } from "@/types/ai/generate-assessment/generate-complete-assessment";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import GenerateCompleteAssessment from "../../../-components/GenerateCompleteAssessment";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useAICenter } from "../../../-contexts/useAICenterContext";
import { GetImagesForAITools } from "@/routes/ai-center/-helpers/GetImagesForAITools";
import { AIToolPageData } from "@/routes/ai-center/-constants/AIToolPageData";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
    text: z.string().min(1),
    num: z.number().min(1),
    class_level: z.string().min(1),
    topics: z.string().min(1),
    question_type: z.string().min(1),
    question_language: z.string().min(1),
});

export type QuestionsFromTextData = z.infer<typeof formSchema>;

export const GenerateQuestionsFromText = () => {
    const [open, setOpen] = useState(false);
    const [openCompleteAssessmentDialog, setOpenCompleteAssessmentDialog] = useState(false);
    const [isMoreQuestionsDialog, setIsMoreQuestionsDialog] = useState(false);
    const [propmtInput, setPropmtInput] = useState("");
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
    const dialogForm = useForm<QuestionsFromTextData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            text: "",
            num: undefined,
            class_level: "",
            topics: "",
            question_type: "",
            question_language: "",
        },
    });
    const { key: keyContext, loader, setLoader, setKey } = useAICenter();

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
            setLoader(true);
            setKey("text");
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
                // Don't schedule next poll - we'll wait for an error to resume
                return;
            }

            // Reset pending state if response is no longer pending
            pendingRef.current = false;

            // If we have complete data, we're done
            if (response?.status === "completed" || response?.questions) {
                setLoader(false);
                setKey(null);
                dialogForm.reset();
                handleOpenChange(false);
                setIsMoreQuestionsDialog(false);
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
            // If we were in a pending state, resume polling on error
            if (pendingRef.current) {
                pendingRef.current = false;
                scheduleNextPoll(variables);
                return;
            }

            // Normal error handling
            pollingCountRef.current += 1;
            if (pollingCountRef.current >= MAX_POLL_ATTEMPTS) {
                setLoader(false);
                setKey(null);
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
            setLoader(false);
            setKey(null);
            clearTimeout(pollingTimeoutIdRef.current);
            pollingTimeoutIdRef.current = null;
        }
    };

    const scheduleNextPoll = (data: QuestionsFromTextData) => {
        setLoader(false);
        setKey(null);
        clearPolling(); // Clear any existing timeout

        // Only schedule next poll if not in pending state
        if (!pendingRef.current) {
            setLoader(true);
            setKey("text");
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
            {loader ? (
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

    const toolData = AIToolPageData["text"];
    return (
        <>
            {toolData && (
                <div className="flex w-full flex-col gap-4 px-8 text-neutral-600">
                    <div className="flex items-center gap-2 text-h2 font-semibold">
                        <StarFour size={30} weight="fill" className="text-primary-500" />{" "}
                        {toolData.heading}
                    </div>
                    {GetImagesForAITools(toolData.key)}
                    <div className="flex flex-col gap-1">
                        <p className="text-h3 font-semibold">How to use {toolData.heading}</p>
                        <p className="text-subtitle">{toolData.instructionsHeading}</p>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-6">
                        {toolData.instructions.map((steps, index) => (
                            <div key={index}>
                                <div className="flex gap-2 text-title font-semibold">
                                    <p className="text-primary-500">Step {index + 1}</p>
                                    <p>{steps.stepHeading}</p>
                                </div>
                                <p>{steps.stepSubHeading}</p>
                                <ul className="flex flex-col text-body">
                                    {steps.steps.map((step, index) => (
                                        <li key={index}>
                                            <p>{step}</p>
                                        </li>
                                    ))}
                                </ul>
                                <p>{steps.stepFooter}</p>
                            </div>
                        ))}
                    </div>
                    <div>
                        {loader && keyContext == "text" ? (
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
                                className="text-sm"
                                onClick={handleUploadClick}
                                disable={loader && keyContext != "text" && keyContext != ""}
                            >
                                <UploadSimple size={32} />
                                Upload
                            </MyButton>
                        )}
                    </div>
                </div>
            )}
            <QuestionsFromTextDialog
                open={open}
                onOpenChange={handleOpenChange}
                onSubmitSuccess={handleSubmitSuccess}
                submitButton={submitButton}
                handleDisableSubmitBtn={handleDisableSubmitBtn}
                submitForm={submitFormFn}
                form={dialogForm}
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
                    dialogForm={dialogForm}
                    keyProp="text"
                />
            )}
        </>
    );
};
