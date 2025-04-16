import React, { useRef } from "react";
import { z } from "zod";
import sectionDetailsSchema from "../-utils/section-details-sechma";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "phosphor-react";
import { Accordion } from "@/components/ui/accordion";
import { StepContentProps } from "@/types/assessments/step-content-props";
import { handlePostStep2Data } from "../-services/assessment-services";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import Step2SectionInfo from "./Step2SectionInfo";
import { toast } from "sonner";
import { AxiosError } from "axios";
// import { useSectionDetailsStore } from "../../-utils/zustand-global-states/step2-add-questions";
import { DashboardLoader } from "@/components/core/dashboard-loader";

type SectionFormType = z.infer<typeof sectionDetailsSchema>;

const Step2AddingQuestions: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    // const storeDataStep2 = useSectionDetailsStore((state) => state);
    console.log(completedSteps);
    const form = useForm<SectionFormType>({
        resolver: zodResolver(sectionDetailsSchema),
        defaultValues: {
            status: "INCOMPLETE",
            section: [
                {
                    sectionId: "",
                    sectionName: `Section 1`,
                    questionPaperTitle: "",
                    subject: "",
                    yearClass: "",
                    uploaded_question_paper: null,
                    question_duration: {
                        hrs: "0",
                        min: "0",
                    },
                    section_description: "",
                    section_duration: {
                        hrs: "0",
                        min: "0",
                    },
                    marks_per_question: "0",
                    total_marks: "0",
                    negative_marking: {
                        checked: false,
                        value: "0",
                    },
                    partial_marking: false,
                    cutoff_marks: {
                        checked: false,
                        value: "0",
                    },
                    problem_randomization: false,
                    adaptive_marking_for_each_question: [],
                },
            ],
        },
        mode: "onChange",
    });

    const { handleSubmit, getValues, control } = form;
    // Store initial data in useRef to ensure it remains constant throughout the form updates
    const oldData = useRef(getValues());
    const allSections = getValues("section");

    const handleSubmitStep2Form = useMutation({
        mutationFn: ({
            oldData,
            data,
            assessmentId,
            instituteId,
            type,
        }: {
            oldData: z.infer<typeof sectionDetailsSchema>;
            data: z.infer<typeof sectionDetailsSchema>;
            assessmentId: string | null;
            instituteId: string | undefined;
            type: string | undefined;
        }) => handlePostStep2Data(oldData, data, assessmentId, instituteId, type),
        onSuccess: async () => {
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
            oldData: oldData.current,
            data: data,
            assessmentId: "defaultId",
            instituteId: "",
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
            sectionId: "",
            sectionName: `Section ${allSections.length + 1}`,
            questionPaperTitle: "",
            subject: "",
            yearClass: "",
            uploaded_question_paper: null,
            question_duration: {
                hrs: "0",
                min: "0",
            },
            section_description: "",
            section_duration: {
                hrs: "0",
                min: "0",
            },
            marks_per_question: "0",
            total_marks: "0",
            negative_marking: {
                checked: false,
                value: "0",
            },
            partial_marking: false,
            cutoff_marks: {
                checked: false,
                value: "0",
            },
            problem_randomization: false,
            adaptive_marking_for_each_question: [],
        });
    };

    if (handleSubmitStep2Form.status === "pending") return <DashboardLoader />;

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
                                onClick={handleSubmit(onSubmit, onInvalid)}
                            >
                                {"Next"}
                            </MyButton>
                        </div>

                        <Separator className="my-4" />
                        <Accordion type="single" collapsible defaultValue={`section-0`}>
                            {allSections.map((_, index) => (
                                <Step2SectionInfo
                                    key={index}
                                    form={form}
                                    index={index}
                                    currentStep={currentStep}
                                    oldData={oldData}
                                />
                            ))}
                        </Accordion>
                    </>
                )}
                <MyButton
                    type="button"
                    scale="large"
                    buttonType="secondary"
                    id="add-section"
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
