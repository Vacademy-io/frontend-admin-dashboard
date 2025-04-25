import { Separator } from "@/components/ui/separator";
import AITasksList from "@/routes/ai-center/-components/AITasksList";
import { AIToolPageData } from "@/routes/ai-center/-constants/AIToolPageData";
import { GetImagesForAITools } from "@/routes/ai-center/-helpers/GetImagesForAITools";
import { StarFour } from "phosphor-react";
import PlanLectureForm from "./PlanLectureForm";
import { useAICenter } from "@/routes/ai-center/-contexts/useAICenterContext";
import { PlanLectureAIFormSchema } from "@/routes/ai-center/-utils/plan-lecture-schema";
import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleGetPlanLecture } from "@/routes/ai-center/-services/ai-center-service";

const PlanLectureAI = () => {
    const queryClient = useQueryClient();
    const { key: keyContext, loader, setLoader, setKey } = useAICenter();
    const toolData = AIToolPageData["planLecture"];
    /* Generate Assessment Complete */
    const MAX_POLL_ATTEMPTS = 10;
    const pollingCountRef = useRef(0);
    const pollingTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const pendingRef = useRef(false);

    const handleSubmitSuccess = (data: PlanLectureAIFormSchema) => {
        clearPolling();
        pollingCountRef.current = 0;
        pendingRef.current = false;
        pollGenerateQuestionsFromText(data);
    };

    const pollGenerateQuestionsFromText = (data: PlanLectureAIFormSchema) => {
        if (pendingRef.current) {
            return;
        }
        getQuestionsFromTextMutation.mutate({
            taskName: data.taskName,
            prompt: data.prompt,
            level: data.level,
            teachingMethod: data.teachingMethod,
            language: data.language,
            lectureDuration: data.lectureDuration,
            isQuestionGenerated: data.isQuestionGenerated,
            isAssignmentHomeworkGenerated: data.isAssignmentHomeworkGenerated,
        });
    };

    const getQuestionsFromTextMutation = useMutation({
        mutationFn: async (data: PlanLectureAIFormSchema) => {
            setLoader(true);
            setKey("planLecture");
            return handleGetPlanLecture(
                data.taskName,
                data.prompt,
                data.level,
                data.teachingMethod,
                data.language,
                data.lectureDuration,
                data.isQuestionGenerated,
                data.isAssignmentHomeworkGenerated,
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
                queryClient.invalidateQueries({ queryKey: ["GET_INDIVIDUAL_AI_LIST_DATA"] });
                return;
            }

            // Otherwise schedule next poll
            scheduleNextPoll({
                taskName: variables.taskName,
                prompt: variables.prompt,
                level: variables.level,
                teachingMethod: variables.teachingMethod,
                language: variables.language,
                lectureDuration: variables.lectureDuration,
                isQuestionGenerated: variables.isQuestionGenerated,
                isAssignmentHomeworkGenerated: variables.isAssignmentHomeworkGenerated,
            });
        },
        onError: (_, variables) => {
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

    const scheduleNextPoll = (data: PlanLectureAIFormSchema) => {
        setLoader(false);
        setKey(null);
        clearPolling(); // Clear any existing timeout

        // Only schedule next poll if not in pending state
        if (!pendingRef.current) {
            setLoader(true);
            setKey("planLecture");
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

    return (
        <>
            {toolData && (
                <div className="flex w-full flex-col gap-4 px-8 text-neutral-600">
                    <div className="flex w-fit items-center justify-start gap-2">
                        <div className="flex items-center gap-2 text-h2 font-semibold">
                            <StarFour size={30} weight="fill" className="text-primary-500" />{" "}
                            {toolData.heading}
                        </div>
                        <AITasksList heading={toolData.heading} />
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
                        <PlanLectureForm
                            handleSubmitSuccess={handleSubmitSuccess}
                            keyContext={keyContext}
                            loader={loader}
                        />
                    </div>
                </div>
            )}
            {getQuestionsFromTextMutation.status === "success" && (
                <AITasksList heading="Vsmart Lecturer" enableDialog={true} />
            )}
        </>
    );
};

export default PlanLectureAI;
