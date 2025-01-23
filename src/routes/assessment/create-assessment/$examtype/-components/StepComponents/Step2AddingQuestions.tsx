import React from "react";
import { z } from "zod";
import sectionDetailsSchema from "../../-utils/section-details-schema";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "phosphor-react";
import { Accordion } from "@/components/ui/accordion";
import { StepContentProps } from "@/types/step-content-props";
import { getAssessmentDetails, handlePostStep2Data } from "../../-services/assessment-services";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useSavedAssessmentStore } from "../../-utils/global-states";
import { zodResolver } from "@hookform/resolvers/zod";
import Step2SectionInfo from "./Step2SectionInfo";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { syncStep2DataWithStore } from "../../-utils/helper";
import { useSectionDetailsStore } from "../../-utils/zustand-global-states/step2-add-questions";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useParams } from "@tanstack/react-router";

type SectionFormType = z.infer<typeof sectionDetailsSchema>;

const Step2AddingQuestions: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    const params = useParams({ strict: false });
    const examType = params.examtype;
    const storeDataStep2 = useSectionDetailsStore((state) => state);
    const { savedAssessmentId } = useSavedAssessmentStore();
    const { instituteDetails } = useInstituteDetailsStore();
    const { data: assessmentDetails, isLoading } = useSuspenseQuery(
        getAssessmentDetails({
            assessmentId: savedAssessmentId,
            instituteId: instituteDetails?.id,
            type: "EXAM",
        }),
    );

    const form = useForm<SectionFormType>({
        resolver: zodResolver(sectionDetailsSchema),
        defaultValues: {
            status: completedSteps[currentStep] ? "COMPLETE" : "INCOMPLETE",
            section: storeDataStep2.section || [
                {
                    sectionId: "",
                    sectionName: "Section 1",
                    questionPaperTitle: "",
                    subject: "",
                    yearClass: "",
                    uploaded_question_paper: null,
                    question_duration: {
                        hrs: "",
                        min: "",
                    },
                    section_description: "",
                    section_duration: {
                        hrs: "",
                        min: "",
                    },
                    marks_per_question: "",
                    total_marks: "",
                    negative_marking: {
                        checked: false,
                        value: "",
                    },
                    partial_marking: false,
                    cutoff_marks: {
                        checked: false,
                        value: "",
                    },
                    problem_randomization: false,
                    adaptive_marking_for_each_question: [],
                },
            ],
        },
        mode: "onChange",
    });

    const { handleSubmit, getValues, control } = form;

    const allSections = getValues("section");

    const handleSubmitStep2Form = useMutation({
        mutationFn: ({
            data,
            assessmentId,
            instituteId,
            type,
        }: {
            data: z.infer<typeof sectionDetailsSchema>;
            assessmentId: string | null;
            instituteId: string | undefined;
            type: string | undefined;
        }) => handlePostStep2Data(data, assessmentId, instituteId, type),
        onSuccess: async () => {
            syncStep2DataWithStore(form);
            toast.success("Step 2 data has been saved successfully!", {
                className: "success-toast",
                duration: 2000,
            });
            handleCompleteCurrentStep();
        },
        onError: (error: unknown) => {
            if (error instanceof AxiosError) {
                toast.error(error.message, {
                    className: "error-toast",
                    duration: 2000,
                });
            } else {
                // Handle non-Axios errors if necessary
                console.error("Unexpected error:", error);
            }
        },
    });

    const onSubmit = (data: z.infer<typeof sectionDetailsSchema>) => {
        handleSubmitStep2Form.mutate({
            data: data,
            assessmentId: savedAssessmentId,
            instituteId: instituteDetails?.id,
            type: examType,
        });
    };

    const onInvalid = (err: unknown) => {
        console.log(err);
    };

    const { append } = useFieldArray({
        control,
        name: "section", // Matches the key in defaultValues
    });

    const handleAddSection = () => {
        append({
            sectionId: "",
            sectionName: `Section ${allSections.length + 1}`,
            questionPaperTitle: "",
            subject: "",
            yearClass: "",
            uploaded_question_paper: null,
            question_duration: {
                hrs: "",
                min: "",
            },
            section_description: "",
            section_duration: {
                hrs: "",
                min: "",
            },
            marks_per_question: "",
            total_marks: "",
            negative_marking: {
                checked: false,
                value: "",
            },
            partial_marking: false,
            cutoff_marks: {
                checked: false,
                value: "",
            },
            problem_randomization: false,
            adaptive_marking_for_each_question: [],
        });
    };

    if (isLoading || handleSubmitStep2Form.status === "pending") return <DashboardLoader />;

    return (
        <FormProvider {...form}>
            <form>
                {allSections.length > 0 && (
                    <>
                        <div className="m-0 flex items-center justify-between p-0">
                            <h1>Add Questions</h1>
                            <MyButton
                                type="button"
                                scale="large"
                                buttonType="primary"
                                disable={allSections.some((section) => {
                                    // Check if the question paper is uploaded
                                    const isQuestionPaperMissing = !section.uploaded_question_paper;

                                    // Check if section duration fields are valid based on durationDistribution
                                    const isSectionDurationMissing =
                                        assessmentDetails[currentStep - 1]?.saved_data
                                            ?.duration_distribution === "SECTION" &&
                                        !section.section_duration?.hrs &&
                                        !section.section_duration?.min;

                                    // Check if question duration fields are valid based on durationDistribution
                                    const isQuestionDurationMissing =
                                        assessmentDetails[currentStep - 1]?.saved_data
                                            ?.duration_distribution === "QUESTION" &&
                                        !section.question_duration?.hrs &&
                                        !section.question_duration?.min;

                                    // Check if marks per question is provided
                                    const isMarksPerQuestionMissing = !section.marks_per_question;

                                    // Return true if any of the above conditions are true
                                    return (
                                        isQuestionPaperMissing ||
                                        isSectionDurationMissing ||
                                        isQuestionDurationMissing ||
                                        isMarksPerQuestionMissing
                                    );
                                })}
                                onClick={handleSubmit(onSubmit, onInvalid)}
                            >
                                Next
                            </MyButton>
                        </div>
                        <Separator className="my-4" />
                        <Accordion type="single" collapsible>
                            {allSections.map((_, index) => (
                                <Step2SectionInfo
                                    key={index}
                                    form={form}
                                    index={index}
                                    currentStep={currentStep}
                                />
                            ))}
                        </Accordion>
                    </>
                )}
                <MyButton
                    type="button"
                    scale="large"
                    buttonType="secondary"
                    className={`${allSections.length > 0 ? "mt-8" : ""} font-thin`}
                    onClick={handleAddSection}
                >
                    <Plus size={32} />
                    Add Section
                </MyButton>
            </form>
        </FormProvider>
    );
};

export default Step2AddingQuestions;
