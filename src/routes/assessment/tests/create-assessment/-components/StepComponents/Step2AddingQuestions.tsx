import React, { useEffect } from "react";
import { z } from "zod";
import sectionDetailsSchema from "../../-utils/question-paper-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { PencilSimpleLine, TrashSimple } from "phosphor-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { MainViewQuillEditor } from "@/components/quill/MainViewQuillEditor";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { StepContentProps } from "@/types/step-content-props";
import { MyInput } from "@/components/design-system/input";
import { Switch } from "@/components/ui/switch";

const Step2AddingQuestions: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    console.log(currentStep, completedSteps);
    const form = useForm<z.infer<typeof sectionDetailsSchema>>({
        resolver: zodResolver(sectionDetailsSchema),
        defaultValues: {
            section: [
                {
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

    const { handleSubmit, getValues, control, setValue, watch } = form;
    const allSections = watch("section"); // Watches the `section` array for changes
    console.log(getValues());

    const onSubmit = (data: z.infer<typeof sectionDetailsSchema>) => {
        console.log(data);
        handleCompleteCurrentStep();
    };

    const onInvalid = (err: unknown) => {
        console.log(err);
    };

    useEffect(() => {
        form.reset({
            section: [
                {
                    uploaded_question_paper: null,
                    section_description: "",
                    section_duration: "",
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

    const handleDescriptionChange = (value: string, index: number) => {
        // Update only the specific section without adding new ones
        setValue(`section.${index}.section_description`, value, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    if (allSections.length === 0) return <DashboardLoader />;

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
                <div className="m-0 flex items-center justify-between p-0">
                    <h1>Add Questions</h1>
                    <MyButton type="submit" scale="large" buttonType="primary">
                        Next
                    </MyButton>
                </div>
                <Separator className="my-4" />
                <Accordion type="single" collapsible>
                    {allSections.map((_, index) => (
                        <AccordionItem value={`section-${index}`} key={index}>
                            <AccordionTrigger className="flex items-center justify-between">
                                <span className="flex-grow text-left text-primary-500">
                                    Section {index + 1}
                                </span>
                                <div className="flex items-center gap-4">
                                    <PencilSimpleLine size={20} className="text-neutral-600" />
                                    <TrashSimple size={20} className="text-danger-400" />
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-8">
                                <div className="flex items-center justify-start gap-5">
                                    <h3>Upload Question Paper</h3>
                                    <MyButton
                                        type="button"
                                        scale="large"
                                        buttonType="secondary"
                                        className="font-thin"
                                    >
                                        Upload From Device
                                    </MyButton>
                                    <MyButton
                                        type="button"
                                        scale="large"
                                        buttonType="secondary"
                                        className="font-thin"
                                    >
                                        Create Manually
                                    </MyButton>
                                    <MyButton
                                        type="button"
                                        scale="large"
                                        buttonType="secondary"
                                        className="font-thin"
                                    >
                                        Choose Saved Paper
                                    </MyButton>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h1 className="font-thin">Section Description</h1>
                                    <FormField
                                        control={control}
                                        name={`section.${index}.section_description`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <MainViewQuillEditor
                                                        onChange={(value) =>
                                                            handleDescriptionChange(value, index)
                                                        }
                                                        value={field.value}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex w-96 items-center justify-between text-sm font-thin">
                                    <h1 className="font-normal">Section Duration</h1>
                                    <div className="flex items-center gap-4">
                                        <FormField
                                            control={control}
                                            name={`section.${index}.section_duration.hrs`}
                                            render={({ field: { ...field } }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <MyInput
                                                            inputType="text"
                                                            inputPlaceholder="00"
                                                            input={field.value}
                                                            onChangeFunction={(e) => {
                                                                const inputValue =
                                                                    e.target.value.replace(
                                                                        /[^0-9]/g,
                                                                        "",
                                                                    ); // Remove non-numeric characters
                                                                field.onChange(inputValue); // Call onChange with the sanitized value
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
                                            name={`section.${index}.section_duration.min`}
                                            render={({ field: { ...field } }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <MyInput
                                                            inputType="text"
                                                            inputPlaceholder="00"
                                                            input={field.value}
                                                            onChangeFunction={(e) => {
                                                                const inputValue =
                                                                    e.target.value.replace(
                                                                        /[^0-9]/g,
                                                                        "",
                                                                    ); // Remove non-numeric characters
                                                                field.onChange(inputValue); // Call onChange with the sanitized value
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
                                </div>
                                <div className="flex items-center gap-4 text-sm font-thin">
                                    <div className="flex flex-col font-normal">
                                        <h1>Marks Per Question</h1>
                                        <h1>(Default)</h1>
                                    </div>
                                    <FormField
                                        control={control}
                                        name={`section.${index}.marks_per_question`}
                                        render={({ field: { ...field } }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <MyInput
                                                        inputType="text"
                                                        inputPlaceholder="00"
                                                        input={field.value}
                                                        onChangeFunction={(e) => {
                                                            const inputValue =
                                                                e.target.value.replace(
                                                                    /[^0-9]/g,
                                                                    "",
                                                                ); // Remove non-numeric characters
                                                            field.onChange(inputValue); // Call onChange with the sanitized value
                                                        }}
                                                        error={
                                                            form.formState.errors.testCreation
                                                                ?.assessmentName?.message
                                                        }
                                                        size="large"
                                                        {...field}
                                                        className="ml-4 w-11"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <span>Total Marks</span>
                                    <span>:</span>
                                    <FormField
                                        control={control}
                                        name={`section.${index}.total_marks`}
                                        render={({ field: { ...field } }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <MyInput
                                                        inputType="text"
                                                        inputPlaceholder="00"
                                                        input={field.value}
                                                        onChangeFunction={(e) => {
                                                            const inputValue =
                                                                e.target.value.replace(
                                                                    /[^0-9]/g,
                                                                    "",
                                                                ); // Remove non-numeric characters
                                                            field.onChange(inputValue); // Call onChange with the sanitized value
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
                                </div>
                                <div className="flex w-1/2 items-center justify-between">
                                    <div className="flex w-52 items-center justify-between gap-4">
                                        <h1>Negative Marking</h1>
                                        <FormField
                                            control={control}
                                            name={`section.${index}.negative_marking.value`}
                                            render={({ field: { ...field } }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <MyInput
                                                            disabled={
                                                                form.getValues(
                                                                    `section.${index}.negative_marking.checked`,
                                                                )
                                                                    ? false
                                                                    : true
                                                            }
                                                            inputType="text"
                                                            inputPlaceholder="00"
                                                            input={field.value}
                                                            onChangeFunction={(e) => {
                                                                const inputValue =
                                                                    e.target.value.replace(
                                                                        /[^0-9]/g,
                                                                        "",
                                                                    ); // Remove non-numeric characters
                                                                field.onChange(inputValue); // Call onChange with the sanitized value
                                                            }}
                                                            error={
                                                                form.formState.errors.testCreation
                                                                    ?.assessmentName?.message
                                                            }
                                                            size="large"
                                                            {...field}
                                                            className="mr-2 w-11"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={control}
                                        name={`section.${index}.negative_marking.checked`}
                                        render={({ field }) => (
                                            <FormItem>
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
                                <FormField
                                    control={form.control}
                                    name={`section.${index}.partial_marking`}
                                    render={({ field }) => (
                                        <FormItem className="flex w-1/2 items-center justify-between">
                                            <FormLabel>Partial Marking</FormLabel>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="flex w-1/2 items-center justify-between">
                                    <div className="flex w-52 items-center justify-between gap-4">
                                        <h1>Cut off Marks</h1>
                                        <FormField
                                            control={control}
                                            name={`section.${index}.cutoff_marks.value`}
                                            render={({ field: { ...field } }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <MyInput
                                                            disabled={
                                                                form.getValues(
                                                                    `section.${index}.cutoff_marks.checked`,
                                                                )
                                                                    ? false
                                                                    : true
                                                            }
                                                            inputType="text"
                                                            inputPlaceholder="00"
                                                            input={field.value}
                                                            onChangeFunction={(e) => {
                                                                const inputValue =
                                                                    e.target.value.replace(
                                                                        /[^0-9]/g,
                                                                        "",
                                                                    ); // Remove non-numeric characters
                                                                field.onChange(inputValue); // Call onChange with the sanitized value
                                                            }}
                                                            error={
                                                                form.formState.errors.testCreation
                                                                    ?.assessmentName?.message
                                                            }
                                                            size="large"
                                                            {...field}
                                                            className="mr-2 w-11"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={control}
                                        name={`section.${index}.cutoff_marks.checked`}
                                        render={({ field }) => (
                                            <FormItem>
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
                                <FormField
                                    control={form.control}
                                    name={`section.${index}.problem_randomization`}
                                    render={({ field }) => (
                                        <FormItem className="flex w-1/2 items-center justify-between">
                                            <FormLabel>Problem Randamization</FormLabel>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </form>
        </FormProvider>
    );
};

export default Step2AddingQuestions;
