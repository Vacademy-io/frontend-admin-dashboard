import React, { useEffect } from "react";
import { z } from "zod";
import sectionDetailsSchema from "../../-utils/section-details-schema";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "phosphor-react";
import { Accordion } from "@/components/ui/accordion";
import { StepContentProps } from "@/types/step-content-props";
import { getAssessmentDetailsData, handlePostStep2Data } from "../../-services/assessment-services";
import { useMutation } from "@tanstack/react-query";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useSavedAssessmentStore } from "../../-utils/global-states";
import { zodResolver } from "@hookform/resolvers/zod";
import Step2SectionInfo from "./Step2SectionInfo";

type SectionFormType = z.infer<typeof sectionDetailsSchema>;

const Step2AddingQuestions: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    const { savedAssessmentId } = useSavedAssessmentStore();
    const { instituteDetails } = useInstituteDetailsStore();

    const form = useForm<SectionFormType>({
        resolver: zodResolver(sectionDetailsSchema),
        defaultValues: {
            status: "",
            section: [
                {
                    sectionName: "",
                    uploaded_question_paper: null,
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
    console.log(allSections);
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
            type: string;
        }) => handlePostStep2Data(data, assessmentId, instituteId, type),
        onSuccess: async (data) => {
            try {
                handleCompleteCurrentStep();
                // Ensure data is accessed correctly
                const responseData = await getAssessmentDetailsData({
                    assessmentId: data?.assessment_id,
                    instituteId: instituteDetails?.id,
                    type: "EXAM",
                });
                console.log("Fetched assessment details:", responseData);
            } catch (error) {
                console.error("Error fetching assessment details:", error);
            }
        },
        onError: (error: unknown) => {
            console.log("Error in mutation:", error);
        },
    });

    const onSubmit = (data: z.infer<typeof sectionDetailsSchema>) => {
        handleSubmitStep2Form.mutate({
            data: data,
            assessmentId: savedAssessmentId,
            instituteId: instituteDetails?.id,
            type: "EXAM",
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
            sectionName: `Section ${allSections.length + 1}`,
            uploaded_question_paper: null,
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

    useEffect(() => {
        form.reset({
            status: completedSteps[currentStep] ? "COMPLETE" : "INCOMPLETE",
            section: [
                {
                    sectionName: `Section ${allSections.length}`,
                    uploaded_question_paper: null,
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
        });
    }, []);

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
                                disable={allSections.some(
                                    (section) =>
                                        !section.uploaded_question_paper ||
                                        !section.section_duration?.hrs ||
                                        !section.section_duration?.min ||
                                        !section.marks_per_question,
                                )}
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
