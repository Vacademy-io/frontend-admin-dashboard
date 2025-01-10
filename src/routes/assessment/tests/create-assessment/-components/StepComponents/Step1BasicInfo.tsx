import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { StepContentProps } from "@/types/step-content-props";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { useFilterDataForAssesment } from "../../../-utils.ts/useFiltersData";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { MyInput } from "@/components/design-system/input";
import SelectField from "@/components/design-system/select-field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { timeLimit } from "@/constants/dummy-data";
import { BasicInfoFormSchema } from "../../-utils/basic-info-form-schema";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
    getAssessmentDetails,
    getAssessmentDetailsData,
    handlePostStep1Data,
} from "../../-services/assessment-services";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import {
    formatDateTimeLocal,
    getFieldOptions,
    getStepKey,
    getTimeLimitString,
    syncStep1DataWithStore,
} from "../../-utils/helper";
import { MainViewQuillEditor } from "@/components/quill/MainViewQuillEditor";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { getIdBySubjectName } from "@/routes/assessment/question-papers/-utils/helper";
import { useSavedAssessmentStore } from "../../-utils/global-states";
import { useBasicInfoStore } from "../../-utils/zustand-global-states/step1-basic-info";

const Step1BasicInfo: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    const storeDataStep1 = useBasicInfoStore((state) => state);
    const { setSavedAssessmentId } = useSavedAssessmentStore();
    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { data: assessmentDetails, isLoading } = useSuspenseQuery(
        getAssessmentDetails({
            assessmentId: null,
            instituteId: instituteDetails?.id,
            type: "EXAM",
        }),
    );
    const { SubjectFilterData } = useFilterDataForAssesment(instituteDetails);

    const form = useForm<z.infer<typeof BasicInfoFormSchema>>({
        resolver: zodResolver(BasicInfoFormSchema),
        defaultValues: {
            status: "",
            testCreation: {
                assessmentName: "",
                subject: "",
                assessmentInstructions: "",
                liveDateRange: {
                    startDate: "", // Default start date
                    endDate: "", // Default end date
                },
            },
            testDuration: {
                entireTestDuration: {
                    checked: true, // Default to true
                    testDuration: {
                        hrs: "",
                        min: "",
                    }, // Default duration in HH:MM:SS
                },
                sectionWiseDuration: false, // Default to false
                questionWiseDuration: false,
            },
            assessmentPreview: {
                checked: false, // Default to true
                previewTimeLimit: timeLimit[0], // Default preview time
            },
            submissionType: "",
            durationDistribution: "",
            evaluationType: "",
            switchSections: false, // Default to false
            raiseReattemptRequest: false, // Default to true
            raiseTimeIncreaseRequest: false, // Default to false
        },
        mode: "onChange", // Validate as user types
    });

    const { handleSubmit, control, watch, getValues } = form;

    // Watch form fields
    const assessmentName = watch("testCreation.assessmentName");
    const subject = watch("testCreation.subject");
    const liveDateRangeStartDate = watch("testCreation.liveDateRange.startDate");
    const liveDateRangeEndDate = watch("testCreation.liveDateRange.endDate");

    // Determine if all fields are filled
    const isFormValid1 =
        !!assessmentName &&
        !!subject &&
        !!liveDateRangeStartDate &&
        !!liveDateRangeEndDate &&
        Object.entries(form.formState.errors).length === 0 &&
        watch("testDuration.entireTestDuration").checked &&
        (getValues("testDuration.entireTestDuration.testDuration.hrs") ||
            getValues("testDuration.entireTestDuration.testDuration.min"));

    const isFormValid2 =
        !!assessmentName &&
        !!subject &&
        !!liveDateRangeStartDate &&
        !!liveDateRangeEndDate &&
        Object.entries(form.formState.errors).length === 0 &&
        watch("testDuration.sectionWiseDuration");

    const handleSubmitStep1Form = useMutation({
        mutationFn: ({
            data,
            assessmentId,
            instituteId,
            type,
        }: {
            data: z.infer<typeof BasicInfoFormSchema>;
            assessmentId: string | null;
            instituteId: string | undefined;
            type: string;
        }) => handlePostStep1Data(data, assessmentId, instituteId, type),
        onSuccess: async (data) => {
            try {
                setSavedAssessmentId(data.assessment_id);
                handleCompleteCurrentStep();
                // Ensure data is accessed correctly
                const responseData = await getAssessmentDetailsData({
                    assessmentId: data?.assessment_id,
                    instituteId: instituteDetails?.id,
                    type: "EXAM",
                });
                syncStep1DataWithStore(responseData, currentStep, instituteDetails);
            } catch (error) {
                console.error("Error fetching assessment details:", error);
            }
        },
        onError: (error: unknown) => {
            console.log("Error in mutation:", error);
        },
    });

    const onSubmit = (data: z.infer<typeof BasicInfoFormSchema>) => {
        const modifiedData = {
            ...data,
            testCreation: {
                ...data.testCreation,
                subject: getIdBySubjectName(
                    instituteDetails?.subjects || [],
                    data.testCreation.subject,
                ),
            },
        };
        handleSubmitStep1Form.mutate({
            data: modifiedData,
            assessmentId: null,
            instituteId: instituteDetails?.id,
            type: "EXAM",
        });
    };

    const onInvalid = (err: unknown) => {
        console.log(err);
    };

    useEffect(() => {
        form.reset({
            status: storeDataStep1.status
                ? storeDataStep1.status
                : completedSteps[currentStep]
                  ? "COMPLETE"
                  : "INCOMPLETE",
            testCreation: {
                assessmentName: storeDataStep1?.testCreation?.assessmentName || "",
                subject: storeDataStep1?.testCreation?.subject || "",
                assessmentInstructions: storeDataStep1?.testCreation?.assessmentInstructions || "",
                liveDateRange: {
                    startDate: formatDateTimeLocal(
                        storeDataStep1?.testCreation?.liveDateRange?.startDate,
                    ),
                    endDate: formatDateTimeLocal(
                        storeDataStep1?.testCreation?.liveDateRange?.endDate,
                    ),
                },
            },
            testDuration: {
                entireTestDuration: {
                    checked:
                        storeDataStep1?.durationDistribution === "ASSESSMENT"
                            ? storeDataStep1?.testDuration?.entireTestDuration?.checked
                            : assessmentDetails[currentStep]?.default_values?.duration_distribution
                                    ?.value === "ASSESSMENT"
                              ? true
                              : false,
                    testDuration: {
                        hrs:
                            storeDataStep1?.testDuration?.entireTestDuration?.testDuration?.hrs !==
                            undefined
                                ? String(
                                      storeDataStep1.testDuration.entireTestDuration.testDuration
                                          .hrs,
                                  )
                                : "",
                        min:
                            storeDataStep1?.testDuration?.entireTestDuration?.testDuration?.min !==
                            undefined
                                ? String(
                                      storeDataStep1.testDuration.entireTestDuration.testDuration
                                          .min,
                                  )
                                : "",
                    },
                },
                sectionWiseDuration:
                    storeDataStep1?.durationDistribution === "SECTION"
                        ? storeDataStep1?.testDuration?.sectionWiseDuration
                        : assessmentDetails[currentStep]?.default_values?.duration_distribution
                                ?.value === "SECTION"
                          ? true
                          : false, // Default to false
                questionWiseDuration:
                    storeDataStep1?.durationDistribution === "QUESTION"
                        ? storeDataStep1?.testDuration?.questionWiseDuration
                        : assessmentDetails[currentStep]?.default_values?.duration_distribution
                                ?.value === "QUESTION"
                          ? true
                          : false, // Default to false
            },
            assessmentPreview: {
                checked:
                    storeDataStep1?.assessmentPreview?.checked ||
                    assessmentDetails[currentStep]?.default_values?.assessment_preview
                        ?.send_value_id ||
                    false, // Default to true
                previewTimeLimit:
                    storeDataStep1?.assessmentPreview?.previewTimeLimit !== undefined
                        ? getTimeLimitString(
                              storeDataStep1?.assessmentPreview?.previewTimeLimit,
                              timeLimit,
                          )
                        : timeLimit[0], // Default preview time
            },
            submissionType:
                storeDataStep1?.submissionType ||
                assessmentDetails[currentStep]?.default_values?.submission_type?.value ||
                "",
            durationDistribution:
                storeDataStep1?.durationDistribution ||
                assessmentDetails[currentStep]?.default_values?.duration_distribution?.value ||
                "",
            evaluationType:
                storeDataStep1?.evaluationType ||
                assessmentDetails[currentStep]?.default_values?.evaluation_type?.value ||
                "",
            switchSections:
                storeDataStep1?.switchSections ||
                assessmentDetails[currentStep]?.default_values?.can_switch_section?.send_value_id ||
                false, // Default to false
            raiseReattemptRequest:
                storeDataStep1?.raiseReattemptRequest ||
                assessmentDetails[currentStep]?.default_values?.reattempt_consent?.send_value_id ||
                false, // Default to true
            raiseTimeIncreaseRequest:
                storeDataStep1?.raiseTimeIncreaseRequest ||
                assessmentDetails[currentStep]?.default_values?.add_time_consent?.send_value_id ||
                false, // Default to false
        });
    }, []);

    if (isLoading || handleSubmitStep1Form.status === "pending") return <DashboardLoader />;

    return (
        <FormProvider {...form}>
            <form>
                <div className="m-0 flex items-center justify-between p-0">
                    <h1>Basic Information</h1>
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="primary"
                        disable={
                            watch("testDuration.entireTestDuration").checked
                                ? !isFormValid1
                                : !isFormValid2
                        }
                        onClick={handleSubmit(onSubmit, onInvalid)}
                    >
                        Next
                    </MyButton>
                </div>
                <Separator className="my-4" />
                <div className="gap- flex flex-col gap-6">
                    <div className="flex w-full items-start justify-start gap-4">
                        <FormField
                            control={control}
                            name="testCreation.assessmentName"
                            render={({ field: { ...field } }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyInput
                                            inputType="text"
                                            inputPlaceholder="Add Title"
                                            input={field.value}
                                            labelStyle="font-thin"
                                            onChangeFunction={field.onChange}
                                            error={
                                                form.formState.errors.testCreation?.assessmentName
                                                    ?.message
                                            }
                                            required={true}
                                            size="large"
                                            label="Assessment Name"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {getStepKey({
                            assessmentDetails,
                            currentStep,
                            key: "subject_selection",
                        }) && (
                            <SelectField
                                label="Subject"
                                name="testCreation.subject"
                                labelStyle="font-thin"
                                options={SubjectFilterData.map((option, index) => ({
                                    value: option.name,
                                    label: option.name,
                                    _id: index,
                                }))}
                                control={form.control}
                                className="w-56 font-thin"
                                required={
                                    getStepKey({
                                        assessmentDetails,
                                        currentStep,
                                        key: "subject_selection",
                                    }) === "REQUIRED"
                                }
                            />
                        )}
                    </div>
                    <h1 className="-mb-5 font-thin">Assessment Instructions</h1>
                    <FormField
                        control={control}
                        name="testCreation.assessmentInstructions"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <MainViewQuillEditor
                                        onChange={field.onChange}
                                        value={field.value}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <h1>Live Date Range</h1>
                    <div className="-mt-2 flex items-start gap-4">
                        {getStepKey({
                            assessmentDetails,
                            currentStep,
                            key: "boundation_start_date",
                        }) && (
                            <FormField
                                control={control}
                                name="testCreation.liveDateRange.startDate"
                                render={({ field: { ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="datetime-local"
                                                input={field.value}
                                                onChangeFunction={field.onChange}
                                                error={
                                                    form.formState.errors.testCreation
                                                        ?.liveDateRange?.startDate?.message
                                                }
                                                required={
                                                    getStepKey({
                                                        assessmentDetails,
                                                        currentStep,
                                                        key: "boundation_start_date",
                                                    }) === "REQUIRED"
                                                }
                                                size="large"
                                                label="Start Date & Time"
                                                labelStyle="font-thin"
                                                {...field}
                                                className="w-full"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}
                        {getStepKey({
                            assessmentDetails,
                            currentStep,
                            key: "boundation_end_date",
                        }) && (
                            <FormField
                                control={control}
                                name="testCreation.liveDateRange.endDate"
                                render={({ field: { ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="datetime-local"
                                                input={field.value}
                                                onChangeFunction={field.onChange}
                                                error={
                                                    form.formState.errors.testCreation
                                                        ?.liveDateRange?.endDate?.message
                                                }
                                                required={
                                                    getStepKey({
                                                        assessmentDetails,
                                                        currentStep,
                                                        key: "boundation_end_date",
                                                    }) === "REQUIRED"
                                                }
                                                size="large"
                                                label="End Date & Time"
                                                labelStyle="font-thin"
                                                {...field}
                                                className="w-full"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                    <Separator />
                    <h1>Attempt Settings</h1>
                    <h1>Assessment Duration Settings</h1>
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
                    {watch("testDuration").entireTestDuration.checked &&
                        getStepKey({
                            assessmentDetails,
                            currentStep,
                            key: "duration",
                        }) && (
                            <div className="flex items-center gap-4 text-sm font-thin">
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
                                                        const inputValue = e.target.value.replace(
                                                            /[^0-9]/g,
                                                            "",
                                                        ); // Sanitize input
                                                        field.onChange(inputValue); // Update field value
                                                    }}
                                                    error={
                                                        form.formState.errors.testDuration
                                                            ?.entireTestDuration?.testDuration?.hrs
                                                            ?.message
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
                                                        const inputValue = e.target.value.replace(
                                                            /[^0-9]/g,
                                                            "",
                                                        ); // Remove non-numeric characters
                                                        field.onChange(inputValue); // Call onChange with the sanitized value
                                                    }}
                                                    error={
                                                        form.formState.errors.testDuration
                                                            ?.entireTestDuration?.testDuration?.min
                                                            ?.message
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
                    {getStepKey({
                        assessmentDetails,
                        currentStep,
                        key: "evaluation_type",
                    }) && (
                        <SelectField
                            label="Evaluation Type"
                            name="evaluationType"
                            options={
                                assessmentDetails[currentStep]?.field_options?.evaluation_type?.map(
                                    (distribution, index) => ({
                                        value: distribution.value,
                                        label: distribution.value,
                                        _id: index,
                                    }),
                                ) || [] // Fallback to an empty array if undefined
                            }
                            control={form.control}
                            className="w-56 font-thin"
                            required={
                                getStepKey({
                                    assessmentDetails,
                                    currentStep,
                                    key: "evaluation_type",
                                }) === "REQUIRED"
                            }
                        />
                    )}
                    {getStepKey({
                        assessmentDetails,
                        currentStep,
                        key: "submission_type",
                    }) && (
                        <SelectField
                            label="Submission Type"
                            name="submissionType"
                            options={
                                assessmentDetails[currentStep]?.field_options?.submission_type?.map(
                                    (distribution, index) => ({
                                        value: distribution.value,
                                        label: distribution.value,
                                        _id: index,
                                    }),
                                ) || [] // Fallback to an empty array if undefined
                            }
                            control={form.control}
                            className="w-56 font-thin"
                            required={
                                getStepKey({
                                    assessmentDetails,
                                    currentStep,
                                    key: "submission_type",
                                }) === "REQUIRED"
                            }
                        />
                    )}
                    {getStepKey({
                        assessmentDetails,
                        currentStep,
                        key: "assessment_preview",
                    }) && (
                        <FormField
                            control={form.control}
                            name="assessmentPreview.checked"
                            render={({ field }) => (
                                <FormItem className="flex w-1/2 items-center justify-between">
                                    <FormLabel>
                                        Allow Assessment Preview
                                        {getStepKey({
                                            assessmentDetails,
                                            currentStep,
                                            key: "assessment_preview",
                                        }) === "REQUIRED" && (
                                            <span className="text-subtitle text-danger-600">*</span>
                                        )}
                                    </FormLabel>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )}
                    {watch("assessmentPreview.checked") && (
                        <SelectField
                            label="Preview Time Limit"
                            labelStyle="font-thin"
                            name="assessmentPreview.previewTimeLimit"
                            options={timeLimit.map((option, index) => ({
                                value: option,
                                label: option,
                                _id: index,
                            }))}
                            control={form.control}
                            required
                            className="w-56 font-thin"
                        />
                    )}
                    {getStepKey({
                        assessmentDetails,
                        currentStep,
                        key: "can_switch_section",
                    }) && (
                        <FormField
                            control={form.control}
                            name="switchSections"
                            render={({ field }) => (
                                <FormItem className="flex w-1/2 items-center justify-between">
                                    <FormLabel>
                                        Allow students to switch between sections
                                        {getStepKey({
                                            assessmentDetails,
                                            currentStep,
                                            key: "can_switch_section",
                                        }) === "REQUIRED" && (
                                            <span className="text-subtitle text-danger-600">*</span>
                                        )}
                                    </FormLabel>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )}
                    {getStepKey({
                        assessmentDetails,
                        currentStep,
                        key: "reattempt_consent",
                    }) && (
                        <FormField
                            control={form.control}
                            name="raiseReattemptRequest"
                            render={({ field }) => (
                                <FormItem className="flex w-1/2 items-center justify-between">
                                    <FormLabel>
                                        Allow students to raise reattempt request
                                        {getStepKey({
                                            assessmentDetails,
                                            currentStep,
                                            key: "reattempt_consent",
                                        }) === "REQUIRED" && (
                                            <span className="text-subtitle text-danger-600">*</span>
                                        )}
                                    </FormLabel>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )}
                    {getStepKey({
                        assessmentDetails,
                        currentStep,
                        key: "add_time_consent",
                    }) && (
                        <FormField
                            control={form.control}
                            name="raiseTimeIncreaseRequest"
                            render={({ field }) => (
                                <FormItem className="flex w-1/2 items-center justify-between">
                                    <FormLabel>
                                        Allow students to raise time increase request
                                        {getStepKey({
                                            assessmentDetails,
                                            currentStep,
                                            key: "add_time_consent",
                                        }) === "REQUIRED" && (
                                            <span className="text-subtitle text-danger-600">*</span>
                                        )}
                                    </FormLabel>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )}
                </div>
            </form>
        </FormProvider>
    );
};

export default Step1BasicInfo;
