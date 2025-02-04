import React, { useEffect, useRef } from "react";
import { z } from "zod";
import sectionDetailsSchema from "../../-utils/section-details-schema";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "phosphor-react";
import { Accordion } from "@/components/ui/accordion";
import { StepContentProps } from "@/types/assessments/step-content-props";
import { getAssessmentDetails, handlePostStep2Data } from "../../-services/assessment-services";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useSavedAssessmentStore } from "../../-utils/global-states";
import { zodResolver } from "@hookform/resolvers/zod";
import Step2SectionInfo from "./Step2SectionInfo";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { getFieldOptions, getStepKey, syncStep2DataWithStore } from "../../-utils/helper";
import { useSectionDetailsStore } from "../../-utils/zustand-global-states/step2-add-questions";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useParams } from "@tanstack/react-router";
import { useTestAccessStore } from "../../-utils/zustand-global-states/step3-adding-participants";
import { getSubjectNameById } from "@/routes/assessment/question-papers/-utils/helper";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MyInput } from "@/components/design-system/input";
type SectionFormType = z.infer<typeof sectionDetailsSchema>;

const Step2AddingQuestions: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    const queryClient = useQueryClient();
    const params = useParams({ strict: false });
    const examType = params.examtype ?? ""; // Ensure it's a string
    const assessmentId = params.assessmentId ?? ""; // Ensure it's string | null
    const storeDataStep2 = useSectionDetailsStore((state) => state);
    const { savedAssessmentId } = useSavedAssessmentStore();
    const { instituteDetails } = useInstituteDetailsStore();
    const { data: assessmentDetails, isLoading } = useSuspenseQuery(
        getAssessmentDetails({
            assessmentId: assessmentId !== "defaultId" ? assessmentId : savedAssessmentId,
            instituteId: instituteDetails?.id,
            type: "EXAM",
        }),
    );

    const form = useForm<SectionFormType>({
        resolver: zodResolver(sectionDetailsSchema),
        defaultValues: {
            status: completedSteps[currentStep] ? "COMPLETE" : "INCOMPLETE",
            testDuration: {
                entireTestDuration: {
                    checked: true, // Default to true
                    testDuration: {
                        hrs: "",
                        min: "",
                    },
                },
                sectionWiseDuration: false, // Default to false
                questionWiseDuration: false,
            },
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
            oldData: SectionFormType["section"];
            data: z.infer<typeof sectionDetailsSchema>;
            assessmentId: string | null;
            instituteId: string | undefined;
            type: string | undefined;
        }) => handlePostStep2Data(oldData, data, assessmentId, instituteId, type),
        onSuccess: async () => {
            if (assessmentId !== "defaultId") {
                useTestAccessStore.getState().reset();
                window.history.back();
                toast.success("Step 2 data has been updated successfully!", {
                    className: "success-toast",
                    duration: 2000,
                });
                queryClient.invalidateQueries({ queryKey: ["GET_ASSESSMENT_DETAILS"] });
            } else {
                syncStep2DataWithStore(form);
                toast.success("Step 2 data has been saved successfully!", {
                    className: "success-toast",
                    duration: 2000,
                });
                handleCompleteCurrentStep();
            }
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
            oldData: oldData.current.section,
            data: data,
            assessmentId: assessmentId !== "defaultId" ? assessmentId : savedAssessmentId,
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

    useEffect(() => {
        if (assessmentId !== "defaultId") {
            const sections = assessmentDetails[currentStep]?.saved_data?.sections;
            form.reset({
                status: assessmentDetails[currentStep]?.status,
                testDuration: {
                    entireTestDuration: {
                        checked:
                            assessmentDetails[currentStep]?.saved_data?.duration_distribution ===
                            "ASSESSMENT"
                                ? true
                                : false,
                        testDuration: {
                            hrs:
                                assessmentDetails[currentStep]?.saved_data
                                    ?.duration_distribution === "ASSESSMENT" &&
                                assessmentDetails[currentStep]?.saved_data?.duration != null &&
                                (assessmentDetails[currentStep]?.saved_data?.duration ?? 0) > 0
                                    ? String(
                                          Math.floor(
                                              (assessmentDetails[currentStep]?.saved_data
                                                  ?.duration ?? 0) / 60,
                                          ),
                                      )
                                    : "",
                            min:
                                assessmentDetails[currentStep]?.saved_data
                                    ?.duration_distribution === "ASSESSMENT" &&
                                assessmentDetails[currentStep]?.saved_data?.duration != null &&
                                (assessmentDetails[currentStep]?.saved_data?.duration ?? 0) > 0
                                    ? String(
                                          Math.floor(
                                              (assessmentDetails[currentStep]?.saved_data
                                                  ?.duration ?? 0) % 60,
                                          ),
                                      )
                                    : "",
                        },
                    },
                    sectionWiseDuration:
                        assessmentDetails[currentStep]?.saved_data?.duration_distribution ===
                        "SECTION"
                            ? true
                            : false, // Default to false
                    questionWiseDuration:
                        assessmentDetails[currentStep]?.saved_data?.duration_distribution ===
                        "QUESTION"
                            ? true
                            : false, // Default to false
                },
                section:
                    Array.isArray(sections) && sections.length > 0
                        ? sections.map((sectionDetails) => ({
                              sectionId: sectionDetails.id || "", // Default empty if not available
                              sectionName: sectionDetails.name || "",
                              questionPaperTitle: "",
                              uploaded_question_paper: "",
                              subject: getSubjectNameById(
                                  instituteDetails?.subjects || [],
                                  assessmentDetails[0]?.saved_data?.subject_selection ?? "",
                              ),
                              yearClass: "",
                              question_duration: {
                                  hrs: String(Math.floor(sectionDetails.duration / 60)) || "",
                                  min: String(sectionDetails.duration % 60) || "",
                              },
                              section_description: sectionDetails.description || "",
                              section_duration: {
                                  hrs: String(Math.floor(sectionDetails.duration / 60)) || "",
                                  min: String(sectionDetails.duration % 60) || "",
                              },
                              marks_per_question: "",
                              total_marks: String(sectionDetails.total_marks) || "",
                              negative_marking: {
                                  checked: false,
                                  value: "",
                              },
                              partial_marking: false,
                              cutoff_marks: {
                                  checked: sectionDetails.cutoff_marks > 0 ? true : false,
                                  value: String(sectionDetails.cutoff_marks) || "",
                              },
                              problem_randomization: sectionDetails.problem_randomization || false,
                              adaptive_marking_for_each_question: [],
                          }))
                        : [
                              {
                                  sectionId: "",
                                  sectionName: `Section ${allSections.length}`,
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
            });
        }
    }, []);

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
                                disable={
                                    assessmentId === "defaultId"
                                        ? allSections.some((section) => {
                                              // Check if the question paper is uploaded
                                              const isQuestionPaperMissing =
                                                  !section.uploaded_question_paper;

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
                                              const isMarksPerQuestionMissing =
                                                  !section.marks_per_question;

                                              // Return true if any of the above conditions are true
                                              return (
                                                  isQuestionPaperMissing ||
                                                  isSectionDurationMissing ||
                                                  isQuestionDurationMissing ||
                                                  isMarksPerQuestionMissing
                                              );
                                          })
                                        : false
                                }
                                onClick={handleSubmit(onSubmit, onInvalid)}
                            >
                                Next
                            </MyButton>
                        </div>
                        <Separator className="my-4" />
                        {getStepKey({
                            assessmentDetails,
                            currentStep,
                            key: "duration_distribution",
                        }) && (
                            <FormField
                                control={form.control}
                                name="testDuration" // Use the parent key to handle both fields
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={(value) => {
                                                    form.setValue(
                                                        "testDuration.entireTestDuration.checked",
                                                        value === "ASSESSMENT",
                                                    );
                                                    form.setValue(
                                                        "testDuration.sectionWiseDuration",
                                                        value === "SECTION",
                                                    );
                                                    form.setValue(
                                                        "testDuration.questionWiseDuration",
                                                        value === "QUESTION",
                                                    );
                                                }}
                                                defaultValue={
                                                    field.value.entireTestDuration.checked
                                                        ? "ASSESSMENT"
                                                        : field.value.sectionWiseDuration
                                                          ? "SECTION"
                                                          : "QUESTION"
                                                }
                                                className="flex items-center gap-6"
                                            >
                                                {getFieldOptions({
                                                    assessmentDetails,
                                                    currentStep,
                                                    key: "duration_distribution",
                                                    value: "ASSESSMENT",
                                                }) && (
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="ASSESSMENT" />
                                                        </FormControl>
                                                        <FormLabel className="font-thin">
                                                            Entire Assessment Duration
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                                {getFieldOptions({
                                                    assessmentDetails,
                                                    currentStep,
                                                    key: "duration_distribution",
                                                    value: "SECTION",
                                                }) && (
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="SECTION" />
                                                        </FormControl>
                                                        <FormLabel className="font-thin">
                                                            Section-Wise Duration
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                                {getFieldOptions({
                                                    assessmentDetails,
                                                    currentStep,
                                                    key: "duration_distribution",
                                                    value: "QUESTION",
                                                }) && (
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="QUESTION" />
                                                        </FormControl>
                                                        <FormLabel className="font-thin">
                                                            Question-Wise Duration
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}
                        {form.watch("testDuration").entireTestDuration.checked &&
                            getStepKey({
                                assessmentDetails,
                                currentStep,
                                key: "duration",
                            }) && (
                                <div className="mt-4 flex items-center gap-4 text-sm font-thin">
                                    <h1>
                                        Entire Test Duration
                                        {getStepKey({
                                            assessmentDetails,
                                            currentStep,
                                            key: "duration",
                                        }) === "REQUIRED" && (
                                            <span className="text-subtitle text-danger-600">*</span>
                                        )}
                                    </h1>
                                    <FormField
                                        control={control}
                                        name="testDuration.entireTestDuration.testDuration.hrs"
                                        render={({ field: { ...field } }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <MyInput
                                                        inputType="text" // Keep the input type as text
                                                        inputPlaceholder="00"
                                                        input={field.value}
                                                        onKeyPress={(e) => {
                                                            const charCode = e.key;
                                                            if (!/[0-9]/.test(charCode)) {
                                                                e.preventDefault(); // Prevent non-numeric input
                                                            }
                                                        }}
                                                        onChangeFunction={(e) => {
                                                            const inputValue =
                                                                e.target.value.replace(
                                                                    /[^0-9]/g,
                                                                    "",
                                                                ); // Sanitize input
                                                            field.onChange(inputValue); // Update field value
                                                        }}
                                                        error={
                                                            form.formState.errors.testDuration
                                                                ?.entireTestDuration?.testDuration
                                                                ?.hrs?.message
                                                        }
                                                        size="large"
                                                        {...field}
                                                        className="w-11"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <span>hrs</span>
                                    <span>:</span>
                                    <FormField
                                        control={control}
                                        name="testDuration.entireTestDuration.testDuration.min"
                                        render={({ field: { ...field } }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <MyInput
                                                        inputType="text"
                                                        inputPlaceholder="00"
                                                        input={field.value}
                                                        onKeyPress={(e) => {
                                                            const charCode = e.key;
                                                            if (!/[0-9]/.test(charCode)) {
                                                                e.preventDefault(); // Prevent non-numeric input
                                                            }
                                                        }}
                                                        onChangeFunction={(e) => {
                                                            const inputValue =
                                                                e.target.value.replace(
                                                                    /[^0-9]/g,
                                                                    "",
                                                                ); // Remove non-numeric characters
                                                            field.onChange(inputValue); // Call onChange with the sanitized value
                                                        }}
                                                        error={
                                                            form.formState.errors.testDuration
                                                                ?.entireTestDuration?.testDuration
                                                                ?.min?.message
                                                        }
                                                        size="large"
                                                        {...field}
                                                        className="w-11"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <span>minutes</span>
                                </div>
                            )}
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
