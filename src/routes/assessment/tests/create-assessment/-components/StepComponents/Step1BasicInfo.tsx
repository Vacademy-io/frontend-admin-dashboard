import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { StepContentProps } from "@/types/step-content-props";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { useFilterDataForAssesment } from "../../../-utils.ts/useFiltersData";
import { useInstituteDetailsStore } from "@/stores/student-list/useInstituteDetailsStore";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { MyInput } from "@/components/design-system/input";
import SelectField from "@/components/design-system/select-field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { timeLimit } from "@/constants/dummy-data";

const BasicInfoFormSchema = z.object({
    testCreation: z.object({
        assessmentName: z.string(),
        subject: z.string(),
        assessmentInstructions: z.string(),
        liveDateRange: z.object({
            startDate: z.string(), // Refine with date validation if necessary
            endDate: z.string(),
        }),
    }),
    testDuration: z.object({
        entireTestDuration: z.object({
            checked: z.boolean(),
            testDuration: z.object({
                hrs: z.string(), // Validate as a two-digit number
                min: z.string(), // Validate as a two-digit number (0-59)
            }),
        }),
        sectionWiseDuration: z.boolean(),
    }),
    assessmentPreview: z.object({
        checked: z.boolean(),
        previewTimeLimit: z.string(),
    }),
    switchSections: z.boolean(),
    raiseReattemptRequest: z.boolean(),
    raiseTimeIncreaseRequest: z.boolean(),
});

const Step1BasicInfo: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    const { instituteDetails } = useInstituteDetailsStore();

    const { SubjectFilterData } = useFilterDataForAssesment(instituteDetails);

    const form = useForm<z.infer<typeof BasicInfoFormSchema>>({
        resolver: zodResolver(BasicInfoFormSchema),
        defaultValues: {
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
            },
            assessmentPreview: {
                checked: false, // Default to true
                previewTimeLimit: "", // Default preview time
            },
            switchSections: false, // Default to false
            raiseReattemptRequest: false, // Default to true
            raiseTimeIncreaseRequest: false, // Default to false
        },
        mode: "onChange", // Validate as user types
    });

    const { handleSubmit, control, watch } = form;

    const onSubmit = (data: z.infer<typeof BasicInfoFormSchema>) => {
        console.log(data);
    };

    const onInvalid = (err: unknown) => {
        console.log(err);
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
                <div className="m-0 flex items-center justify-between p-0">
                    <h1>Basic Information</h1>
                    <MyButton type="submit" scale="large" buttonType="primary">
                        Next
                    </MyButton>
                </div>
                <Separator className="my-4" />
                <div className="gap- flex flex-col gap-6">
                    <div className="flex w-full items-center justify-start gap-4">
                        <FormField
                            control={control}
                            name="testCreation.assessmentName"
                            render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyInput
                                            inputType="text"
                                            inputPlaceholder="Add Title"
                                            input={value}
                                            labelStyle="font-thin"
                                            onChangeFunction={onChange}
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
                        <SelectField
                            label="Subject"
                            name="subject"
                            labelStyle="font-thin"
                            options={SubjectFilterData.map((option, index) => ({
                                value: option.name,
                                label: option.name,
                                _id: index,
                            }))}
                            control={form.control}
                            required
                            className="w-56 font-thin"
                        />
                    </div>
                    <FormField
                        control={control}
                        name="testCreation.assessmentInstructions"
                        render={({ field: { onChange, value, ...field } }) => (
                            <FormItem>
                                <FormControl>
                                    <MyInput
                                        inputType="text"
                                        inputPlaceholder="Assessment Instructions"
                                        labelStyle="font-thin"
                                        input={value}
                                        onChangeFunction={onChange}
                                        error={
                                            form.formState.errors.testCreation?.assessmentName
                                                ?.message
                                        }
                                        size="large"
                                        label="Assessment Instructions"
                                        {...field}
                                        className="my-1 w-full"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <h1>Live Date Range</h1>
                    <div className="-mt-2 flex items-center gap-4">
                        <FormField
                            control={control}
                            name="testCreation.liveDateRange.startDate"
                            render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyInput
                                            inputType="datetime-local"
                                            input={value}
                                            onChangeFunction={onChange}
                                            error={
                                                form.formState.errors.testCreation?.assessmentName
                                                    ?.message
                                            }
                                            required={true}
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
                        <FormField
                            control={control}
                            name="testCreation.liveDateRange.endDate"
                            render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyInput
                                            inputType="datetime-local"
                                            input={value}
                                            onChangeFunction={onChange}
                                            error={
                                                form.formState.errors.testCreation?.assessmentName
                                                    ?.message
                                            }
                                            required={true}
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
                    </div>
                    <Separator />
                    <h1>Attempt Settings</h1>
                    <h1>Assessment Duration Settings</h1>
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
                                                value === "entire",
                                            );
                                            form.setValue(
                                                "testDuration.sectionWiseDuration",
                                                value === "sectionWise",
                                            );
                                        }}
                                        defaultValue={
                                            field.value.entireTestDuration.checked
                                                ? "entire"
                                                : "sectionWise"
                                        }
                                        className="flex items-center gap-6"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="entire" />
                                            </FormControl>
                                            <FormLabel className="font-thin">
                                                Entire Assessment Duration
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="sectionWise" />
                                            </FormControl>
                                            <FormLabel className="font-thin">
                                                Section-Wise Duration
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {watch("testDuration").entireTestDuration.checked && (
                        <div className="flex items-center gap-4 text-sm font-thin">
                            <h1>Entire Test Duration</h1>
                            <FormField
                                control={control}
                                name="testDuration.entireTestDuration.testDuration.hrs"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                inputPlaceholder="00"
                                                input={value}
                                                onChangeFunction={(e) => {
                                                    const inputValue = e.target.value.replace(
                                                        /[^0-9]/g,
                                                        "",
                                                    ); // Remove non-numeric characters
                                                    onChange(inputValue); // Call onChange with the sanitized value
                                                }}
                                                error={
                                                    form.formState.errors.testCreation
                                                        ?.assessmentName?.message
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
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                inputPlaceholder="00"
                                                input={value}
                                                onChangeFunction={(e) => {
                                                    const inputValue = e.target.value.replace(
                                                        /[^0-9]/g,
                                                        "",
                                                    ); // Remove non-numeric characters
                                                    onChange(inputValue); // Call onChange with the sanitized value
                                                }}
                                                error={
                                                    form.formState.errors.testCreation
                                                        ?.assessmentName?.message
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
                    <FormField
                        control={form.control}
                        name="assessmentPreview.checked"
                        render={({ field }) => (
                            <FormItem className="flex w-1/2 items-center justify-between">
                                <FormLabel>Allow Assessment Preview</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {watch("assessmentPreview").checked && (
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
                    <FormField
                        control={form.control}
                        name="switchSections"
                        render={({ field }) => (
                            <FormItem className="flex w-1/2 items-center justify-between">
                                <FormLabel>Allow students to switch between sections</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="raiseReattemptRequest"
                        render={({ field }) => (
                            <FormItem className="flex w-1/2 items-center justify-between">
                                <FormLabel>Allow students to raise reattempt request</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="raiseTimeIncreaseRequest"
                        render={({ field }) => (
                            <FormItem className="flex w-1/2 items-center justify-between">
                                <FormLabel>Allow students to raise time increase request</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </form>
        </FormProvider>
    );
};

export default Step1BasicInfo;
