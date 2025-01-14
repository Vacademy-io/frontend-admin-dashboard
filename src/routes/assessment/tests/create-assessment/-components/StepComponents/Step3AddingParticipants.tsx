import { StepContentProps } from "@/types/step-content-props";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { MyButton } from "@/components/design-system/button";
import { z } from "zod";
import testAccessSchema from "../../-utils/add-participants-schema";
import { Separator } from "@/components/ui/separator";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MyInput } from "@/components/design-system/input";
import { Copy, DotsSixVertical, DownloadSimple, Plus, TrashSimple } from "phosphor-react";
import QRCode from "react-qr-code";
import {
    copyToClipboard,
    getStepKey,
    handleDownloadQRCode,
    syncStep3DataWithStore,
    transformBatchData,
} from "../../-utils/helper";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import SelectField from "@/components/design-system/select-field";
import { timeLimit } from "@/constants/dummy-data";
import { AddingParticipantsTab } from "../AddingParticipantsTab";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { MainViewQuillEditor } from "@/components/quill/MainViewQuillEditor";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    getAssessmentDetails,
    getAssessmentDetailsData,
    handlePostStep3Data,
} from "../../-services/assessment-services";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useSavedAssessmentStore } from "../../-utils/global-states";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAssessmentUrlStore } from "../../-utils/zustand-global-states/step1-basic-info";
import { useTestAccessStore } from "../../-utils/zustand-global-states/step3-adding-participants";

type TestAccessFormType = z.infer<typeof testAccessSchema>;

interface TestInputField {
    id: number;
    type: string;
    name: string;
    oldKey: boolean;
    isRequired: boolean;
    options?: { id: number; value: string }[];
}

const Step3AddingParticipants: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    const storeDataStep3 = useTestAccessStore((state) => state);
    console.log("storeDataStep3", storeDataStep3);
    const { assessmentUrl } = useAssessmentUrlStore();
    const { savedAssessmentId } = useSavedAssessmentStore();
    const [openTestInputFields, setOpenTestInputFields] = useState<TestInputField[]>([
        {
            id: 0,
            type: "textfield",
            name: "Full Name",
            oldKey: true,
            isRequired: true,
        },
        {
            id: 1,
            type: "textfield",
            name: "Email",
            oldKey: true,
            isRequired: true,
        },
        {
            id: 2,
            type: "textfield",
            name: "Phone Number",
            oldKey: true,
            isRequired: true,
        },
    ]);
    const [selectedOptionValue, setSelectedOptionValue] = useState("textfield");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [textFieldValue, setTextFieldValue] = useState("");
    const [dropdownOptions, setDropdownOptions] = useState<
        {
            id: number;
            value: string;
        }[]
    >([]);
    const form = useForm<TestAccessFormType>({
        resolver: zodResolver(testAccessSchema),
        defaultValues: {
            status: "",
            closed_test: true,
            open_test: {
                checked: false,
                start_date: "",
                end_date: "",
                instructions: "",
                name: "",
                email: "",
                phone: "",
                custom_fields: {}, // Default to an empty object for custom fields
            },
            select_batch: {
                checked: false,
                batch_details: {},
            },
            select_individually: {
                checked: false,
                student_details: [],
            },
            join_link: assessmentUrl,
            show_leaderboard: false,
            notify_student: {
                when_assessment_created: false,
                before_assessment_goes_live: {
                    checked: false,
                    value: "",
                },
                when_assessment_live: false,
                when_assessment_report_generated: false,
            },
            notify_parent: {
                when_assessment_created: false,
                before_assessment_goes_live: {
                    checked: false,
                    value: "",
                },
                when_assessment_live: false,
                when_student_appears: false,
                when_student_finishes_test: false,
                when_assessment_report_generated: false,
            },
        },
        mode: "onChange",
    });
    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { data: assessmentDetails, isLoading } = useSuspenseQuery(
        getAssessmentDetails({
            assessmentId: null,
            instituteId: instituteDetails?.id,
            type: "EXAM",
        }),
    );
    const { batches_for_sessions } = instituteDetails || {};
    const transformedBatches = transformBatchData(batches_for_sessions || []);
    const { handleSubmit, getValues, control, watch, setValue } = form;

    const handleSubmitStep3Form = useMutation({
        mutationFn: ({
            data,
            assessmentId,
            instituteId,
            type,
        }: {
            data: z.infer<typeof testAccessSchema>;
            assessmentId: string | null;
            instituteId: string | undefined;
            type: string;
        }) => handlePostStep3Data(data, assessmentId, instituteId, type),
        onSuccess: async (data) => {
            const responseData = await getAssessmentDetailsData({
                assessmentId: data?.assessment_id,
                instituteId: instituteDetails?.id,
                type: "EXAM",
            });
            console.log(responseData);
            syncStep3DataWithStore(form);
            toast.success("Step 3 data has been saved successfully!", {
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

    const onSubmit = (data: z.infer<typeof testAccessSchema>) => {
        handleSubmitStep3Form.mutate({
            data: data,
            assessmentId: savedAssessmentId,
            instituteId: instituteDetails?.id,
            type: "EXAM",
        });
    };

    const onInvalid = (err: unknown) => {
        console.log(err);
    };

    const toggleIsRequired = (id: number) => {
        setOpenTestInputFields((prevFields) =>
            prevFields.map((field) =>
                field.id === id ? { ...field, isRequired: !field.isRequired } : field,
            ),
        );
    };

    const handleAddDropdownOptions = () => {
        setDropdownOptions((prevOptions) => [
            ...prevOptions,
            { id: prevOptions.length, value: `option ${prevOptions.length + 1}` },
        ]);
    };

    const handleAddOpenFieldValues = (type: string, name: string, oldKey: boolean) => {
        setOpenTestInputFields((prevFields) => [
            ...prevFields,
            {
                id: openTestInputFields.length,
                type,
                name,
                oldKey,
                isRequired: true,
            },
        ]);
        setValue("open_test.custom_fields", {
            ...getValues("open_test.custom_fields"),
            [name]: {
                id: openTestInputFields.length,
                type,
                name,
                oldKey,
                isRequired: true,
            },
        });
    };

    const handleDeleteOpenField = (id: number) => {
        setOpenTestInputFields((prevFields) => prevFields.filter((field) => field.id !== id));
    };

    const handleDeleteOptionField = (id: number) => {
        setDropdownOptions(
            (prevFields) =>
                prevFields
                    .filter((field) => field.id !== id)
                    .map((field, index) => ({ id: index, value: `option ${index + 1}` })), // Recalculate IDs and values
        );
    };

    // Function to close the dialog
    const handleCloseDialog = (type: string, name: string, oldKey: boolean) => {
        setOpenTestInputFields((prevFields) => [
            ...prevFields,
            {
                id: openTestInputFields.length,
                type,
                name,
                oldKey,
                ...(type === "dropdown" && { options: dropdownOptions }),
                isRequired: true,
            },
        ]);
        setValue("open_test.custom_fields", {
            ...getValues("open_test.custom_fields"),
            [name]: {
                id: openTestInputFields.length,
                type,
                name,
                oldKey,
                ...(type === "dropdown" && { options: dropdownOptions }),
                isRequired: true,
            },
        });
        setIsDialogOpen(false);
        setTextFieldValue("");
        setDropdownOptions([]);
    };

    useEffect(() => {
        form.reset({
            status: storeDataStep3.status
                ? storeDataStep3.status
                : completedSteps[currentStep]
                  ? "COMPLETE"
                  : "INCOMPLETE",
            closed_test: storeDataStep3.closed_test,
            open_test: {
                checked: storeDataStep3.open_test.checked,
                start_date: storeDataStep3.open_test.start_date,
                end_date: storeDataStep3.open_test.end_date,
                instructions: storeDataStep3.open_test.instructions,
                name: storeDataStep3.open_test.name,
                email: storeDataStep3.open_test.email,
                phone: storeDataStep3.open_test.phone,
                custom_fields: storeDataStep3.open_test.custom_fields,
            },
            select_batch: {
                checked: storeDataStep3.select_batch.checked,
                batch_details: storeDataStep3.select_batch.batch_details,
            },
            select_individually: {
                checked: storeDataStep3.select_individually.checked,
                student_details: storeDataStep3.select_individually.student_details,
            },
            join_link: storeDataStep3.join_link,
            show_leaderboard: storeDataStep3.show_leaderboard,
            notify_student: {
                when_assessment_created: storeDataStep3.notify_student.when_assessment_created,
                before_assessment_goes_live: {
                    checked: storeDataStep3.notify_student.before_assessment_goes_live.checked,
                    value: storeDataStep3.notify_student.before_assessment_goes_live.value,
                },
                when_assessment_live: storeDataStep3.notify_student.when_assessment_live,
                when_assessment_report_generated:
                    storeDataStep3.notify_student.when_assessment_report_generated,
            },
            notify_parent: {
                when_assessment_created: storeDataStep3.notify_parent.when_assessment_created,
                before_assessment_goes_live: {
                    checked: storeDataStep3.notify_parent.before_assessment_goes_live.checked,
                    value: storeDataStep3.notify_parent.before_assessment_goes_live.value,
                },
                when_assessment_live: storeDataStep3.notify_parent.when_assessment_live,
                when_student_appears: storeDataStep3.notify_parent.when_student_appears,
                when_student_finishes_test: storeDataStep3.notify_parent.when_student_finishes_test,
                when_assessment_report_generated:
                    storeDataStep3.notify_parent.when_assessment_report_generated,
            },
        });
    }, []);

    if (isLoading || handleSubmitStep3Form.status === "pending") return <DashboardLoader />;

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
                <div className="m-0 flex items-center justify-between p-0">
                    <h1>Add Participants</h1>
                    <MyButton type="submit" scale="large" buttonType="primary">
                        Next
                    </MyButton>
                </div>
                <Separator className="my-4" />
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                        <h1>Participant Access Settings</h1>
                        <FormField
                            control={form.control}
                            name="closed_test" // Use the parent key to handle both fields
                            render={() => (
                                <FormItem className="space-y-3">
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(value) => {
                                                form.setValue(
                                                    "closed_test",
                                                    value === "CLOSE_TEST",
                                                );
                                                form.setValue(
                                                    "open_test.checked",
                                                    value === "OPEN_TEST",
                                                );
                                            }}
                                            defaultValue={"CLOSE_TEST"}
                                            className="flex flex-col gap-3"
                                        >
                                            {getStepKey({
                                                assessmentDetails,
                                                currentStep,
                                                key: "closed_link",
                                            }) === "REQUIRED" && (
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="CLOSE_TEST" />
                                                    </FormControl>
                                                    <FormLabel className="font-semibold">
                                                        Closed Test:{" "}
                                                        <span className="font-thin">
                                                            Restrict the Assessment to specific
                                                            participants by assigning it to
                                                            institute batches or selecting
                                                            individual students.
                                                        </span>
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                            {getStepKey({
                                                assessmentDetails,
                                                currentStep,
                                                key: "open_link",
                                            }) === "REQUIRED" && (
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="OPEN_TEST" />
                                                    </FormControl>
                                                    <FormLabel className="font-semibold">
                                                        Open Test:{" "}
                                                        <span className="font-thin">
                                                            Allow anyone to register for this
                                                            Assessment via a shared link. Institute
                                                            students can also be pre-registered by
                                                            selecting batches or individuals.
                                                        </span>
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    {watch("open_test.checked") && (
                        <>
                            <div className="mt-2 flex flex-col gap-4">
                                <h1>Assessment Registration</h1>
                                <div className="-mt-2 flex items-center gap-4">
                                    {getStepKey({
                                        assessmentDetails,
                                        currentStep,
                                        key: "registration_open_date",
                                    }) === "REQUIRED" && (
                                        <FormField
                                            control={control}
                                            name="open_test.start_date"
                                            render={({ field: { ...field } }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <MyInput
                                                            inputType="datetime-local"
                                                            input={field.value}
                                                            onChangeFunction={field.onChange}
                                                            error={
                                                                form.formState.errors.open_test
                                                                    ?.start_date?.message
                                                            }
                                                            required
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
                                        key: "registration_close_date",
                                    }) === "REQUIRED" && (
                                        <FormField
                                            control={control}
                                            name="open_test.end_date"
                                            render={({ field: { ...field } }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <MyInput
                                                            inputType="datetime-local"
                                                            input={field.value}
                                                            onChangeFunction={field.onChange}
                                                            error={
                                                                form.formState.errors.open_test
                                                                    ?.end_date?.message
                                                            }
                                                            required
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
                            </div>
                            <div className="mt-2 flex flex-col gap-6">
                                <h1 className="-mb-5">About Assessment Registration</h1>
                                <FormField
                                    control={control}
                                    name="open_test.instructions"
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
                            </div>
                            {getStepKey({
                                assessmentDetails,
                                currentStep,
                                key: "registration_form_fields",
                            }) === "REQUIRED" && (
                                <div className="flex w-full flex-col gap-4">
                                    <h1>Registration Input Field</h1>
                                    <div className="flex flex-col gap-4">
                                        {openTestInputFields.map((fields, index) => {
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-4"
                                                >
                                                    <div className="flex w-3/4 items-center justify-between rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2">
                                                        <h1 className="text-sm">
                                                            {fields.name}
                                                            {fields.oldKey && (
                                                                <span className="text-subtitle text-danger-600">
                                                                    *
                                                                </span>
                                                            )}
                                                            {!fields.oldKey &&
                                                                fields.isRequired && (
                                                                    <span className="text-subtitle text-danger-600">
                                                                        *
                                                                    </span>
                                                                )}
                                                        </h1>
                                                        <div className="flex items-center gap-6">
                                                            {!fields.oldKey && (
                                                                <MyButton
                                                                    type="button"
                                                                    scale="small"
                                                                    buttonType="secondary"
                                                                    className="min-w-6 !rounded-sm !p-0"
                                                                    onClick={() =>
                                                                        handleDeleteOpenField(
                                                                            fields.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <TrashSimple className="!size-4 text-danger-500" />
                                                                </MyButton>
                                                            )}
                                                            <DotsSixVertical size={20} />
                                                        </div>
                                                    </div>
                                                    {!fields.oldKey && (
                                                        <>
                                                            <h1 className="text-sm">Required</h1>
                                                            <Switch
                                                                checked={fields.isRequired}
                                                                onCheckedChange={() =>
                                                                    toggleIsRequired(fields.id)
                                                                }
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-2 flex items-center gap-6">
                                        {!openTestInputFields.some(
                                            (field) => field.name === "Gender",
                                        ) && (
                                            <MyButton
                                                type="button"
                                                scale="medium"
                                                buttonType="secondary"
                                                onClick={() =>
                                                    handleAddOpenFieldValues(
                                                        "textfield",
                                                        "Gender",
                                                        false,
                                                    )
                                                }
                                            >
                                                <Plus size={32} /> Add Gender
                                            </MyButton>
                                        )}
                                        {!openTestInputFields.some(
                                            (field) => field.name === "State",
                                        ) && (
                                            <MyButton
                                                type="button"
                                                scale="medium"
                                                buttonType="secondary"
                                                onClick={() =>
                                                    handleAddOpenFieldValues(
                                                        "textfield",
                                                        "State",
                                                        false,
                                                    )
                                                }
                                            >
                                                <Plus size={32} /> Add State
                                            </MyButton>
                                        )}
                                        {!openTestInputFields.some(
                                            (field) => field.name === "City",
                                        ) && (
                                            <MyButton
                                                type="button"
                                                scale="medium"
                                                buttonType="secondary"
                                                onClick={() =>
                                                    handleAddOpenFieldValues(
                                                        "textfield",
                                                        "City",
                                                        false,
                                                    )
                                                }
                                            >
                                                <Plus size={32} /> Add City
                                            </MyButton>
                                        )}
                                        {!openTestInputFields.some(
                                            (field) => field.name === "School/College",
                                        ) && (
                                            <MyButton
                                                type="button"
                                                scale="medium"
                                                buttonType="secondary"
                                                onClick={() =>
                                                    handleAddOpenFieldValues(
                                                        "textfield",
                                                        "School/College",
                                                        false,
                                                    )
                                                }
                                            >
                                                <Plus size={32} /> Add School/College
                                            </MyButton>
                                        )}

                                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                            <DialogTrigger>
                                                <MyButton
                                                    type="button"
                                                    scale="medium"
                                                    buttonType="secondary"
                                                >
                                                    <Plus size={32} /> Add Custom Field
                                                </MyButton>
                                            </DialogTrigger>
                                            <DialogContent className="p-0">
                                                <h1 className="rounded-lg bg-primary-50 p-4 text-primary-500">
                                                    Add Custom Field
                                                </h1>
                                                <div className="flex flex-col gap-4 px-4">
                                                    <h1>
                                                        Select the type of custom field you want to
                                                        add:
                                                    </h1>
                                                    <RadioGroup
                                                        defaultValue={selectedOptionValue}
                                                        onValueChange={(value) =>
                                                            setSelectedOptionValue(value)
                                                        }
                                                        className="flex items-center gap-6"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem
                                                                value="textfield"
                                                                id="option-one"
                                                            />
                                                            <Label htmlFor="option-one">
                                                                Text Field
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem
                                                                value="dropdown"
                                                                id="option-two"
                                                            />
                                                            <Label htmlFor="option-two">
                                                                Dropdown
                                                            </Label>
                                                        </div>
                                                    </RadioGroup>
                                                    {selectedOptionValue === "textfield" ? (
                                                        <div className="flex flex-col gap-1">
                                                            <h1>
                                                                Text Field Name
                                                                <span className="text-subtitle text-danger-600">
                                                                    *
                                                                </span>
                                                            </h1>
                                                            <MyInput
                                                                inputType="text"
                                                                inputPlaceholder="Type Here"
                                                                input={textFieldValue}
                                                                onChangeFunction={(e) =>
                                                                    setTextFieldValue(
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                size="large"
                                                                className="w-full"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-1">
                                                            <h1>
                                                                Dropdown Name
                                                                <span className="text-subtitle text-danger-600">
                                                                    *
                                                                </span>
                                                            </h1>
                                                            <MyInput
                                                                inputType="text"
                                                                inputPlaceholder="Type Here"
                                                                input={textFieldValue}
                                                                onChangeFunction={(e) =>
                                                                    setTextFieldValue(
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                size="large"
                                                                className="w-full"
                                                            />
                                                            <h1 className="mt-4">
                                                                Dropdown Options
                                                            </h1>
                                                            <div className="flex flex-col gap-4">
                                                                {dropdownOptions.map((option) => {
                                                                    return (
                                                                        <div
                                                                            className="flex w-full items-center justify-between rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2"
                                                                            key={option.id} // Use unique identifier
                                                                        >
                                                                            <h1 className="text-sm">
                                                                                {option.value}
                                                                            </h1>
                                                                            <div className="flex items-center gap-6">
                                                                                {dropdownOptions.length >
                                                                                    1 && (
                                                                                    <MyButton
                                                                                        type="button"
                                                                                        scale="medium"
                                                                                        buttonType="secondary"
                                                                                        onClick={() =>
                                                                                            handleDeleteOptionField(
                                                                                                option.id,
                                                                                            )
                                                                                        }
                                                                                        className="h-6 min-w-6 !rounded-sm px-1"
                                                                                    >
                                                                                        <TrashSimple className="!size-4 text-danger-500" />
                                                                                    </MyButton>
                                                                                )}
                                                                                <DotsSixVertical
                                                                                    size={20}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            <MyButton
                                                                type="button"
                                                                scale="small"
                                                                buttonType="secondary"
                                                                className="mt-2 w-20 min-w-4 border-none font-thin !text-primary-500"
                                                                onClick={handleAddDropdownOptions}
                                                            >
                                                                <Plus size={18} />
                                                                Add
                                                            </MyButton>
                                                        </div>
                                                    )}
                                                    <div className="mb-6 flex justify-center">
                                                        <MyButton
                                                            type="button"
                                                            scale="medium"
                                                            buttonType="primary"
                                                            className="mt-4 w-fit"
                                                            onClick={() =>
                                                                handleCloseDialog(
                                                                    selectedOptionValue,
                                                                    textFieldValue,
                                                                    false,
                                                                )
                                                            }
                                                        >
                                                            Done
                                                        </MyButton>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <Dialog>
                                        <DialogTrigger className="flex justify-start">
                                            <MyButton
                                                type="button"
                                                scale="medium"
                                                buttonType="secondary"
                                                className="mt-4 w-fit"
                                            >
                                                Preview Registration Form
                                            </MyButton>
                                        </DialogTrigger>
                                        <DialogContent className="p-0">
                                            <h1 className="rounded-md bg-primary-50 p-4 font-semibold text-primary-500">
                                                Preview Registration Form
                                            </h1>
                                            <div className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto px-4 py-2">
                                                {openTestInputFields.map((testInputFields, idx) => {
                                                    return (
                                                        <div
                                                            className="flex flex-col items-start gap-4"
                                                            key={idx}
                                                        >
                                                            {testInputFields.type === "dropdown" ? (
                                                                <SelectField
                                                                    label={testInputFields.name}
                                                                    labelStyle="font-normal"
                                                                    name={"dje"}
                                                                    options={
                                                                        testInputFields?.options?.map(
                                                                            (option, index) => ({
                                                                                value: option.value,
                                                                                label: option.value,
                                                                                _id: index,
                                                                            }),
                                                                        ) || []
                                                                    }
                                                                    control={form.control}
                                                                    className="w-full font-thin"
                                                                    required={
                                                                        testInputFields.isRequired
                                                                            ? true
                                                                            : false
                                                                    }
                                                                />
                                                            ) : (
                                                                <div className="flex w-full flex-col gap-[0.4rem]">
                                                                    <h1 className="text-sm">
                                                                        {testInputFields.name}
                                                                        {testInputFields.isRequired && (
                                                                            <span className="text-subtitle text-danger-600">
                                                                                *
                                                                            </span>
                                                                        )}
                                                                    </h1>
                                                                    <MyInput
                                                                        inputType="text"
                                                                        inputPlaceholder={
                                                                            testInputFields.name
                                                                        }
                                                                        input=""
                                                                        onChangeFunction={() => {}}
                                                                        error={
                                                                            form.formState.errors
                                                                                .join_link?.message
                                                                        }
                                                                        size="large"
                                                                        disabled
                                                                        className="!min-w-full"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                <div className="mb-6 flex justify-center">
                                                    <MyButton
                                                        type="button"
                                                        scale="medium"
                                                        buttonType="primary"
                                                        className="mt-4 w-fit"
                                                    >
                                                        Register Now
                                                    </MyButton>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                        </>
                    )}
                    <AddingParticipantsTab batches={transformedBatches} form={form} />
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <h1>Join Link</h1>
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-4">
                                    <FormField
                                        control={control}
                                        name="join_link"
                                        render={({ field: { ...field } }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <MyInput
                                                        inputType="text"
                                                        inputPlaceholder="Join Link"
                                                        input={field.value}
                                                        onChangeFunction={field.onChange}
                                                        error={
                                                            form.formState.errors.join_link?.message
                                                        }
                                                        size="large"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <MyButton
                                        type="button"
                                        scale="small"
                                        buttonType="secondary"
                                        className="h-10 min-w-10"
                                        onClick={() => copyToClipboard(getValues("join_link"))}
                                    >
                                        <Copy size={32} />
                                    </MyButton>
                                </div>
                                <MyButton type="button" scale="large" buttonType="secondary">
                                    Generate New Link
                                </MyButton>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h1>QR Code</h1>
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-4">
                                    <FormField
                                        control={control}
                                        name="join_link"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <QRCode
                                                        value={field.value}
                                                        className="size-16"
                                                        id="qr-code-svg"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <MyButton
                                        type="button"
                                        scale="small"
                                        buttonType="secondary"
                                        className="h-10 min-w-10"
                                        onClick={handleDownloadQRCode}
                                    >
                                        <DownloadSimple size={32} />
                                    </MyButton>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <FormField
                        control={form.control}
                        name="show_leaderboard"
                        render={({ field }) => (
                            <FormItem className="my-2 flex w-1/2 items-center justify-between">
                                <FormLabel>Show Leaderboard to Participants</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <div className="flex w-3/4 justify-between">
                        {getStepKey({
                            assessmentDetails,
                            currentStep,
                            key: "notify_participants",
                        }) === "REQUIRED" && (
                            <div className="flex flex-col gap-4">
                                <h1>Notify Participants via Email:</h1>
                                <FormField
                                    control={control}
                                    name={`notify_student.when_assessment_created`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-end gap-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className={`size-5 rounded-sm border-2 shadow-none ${
                                                        field.value
                                                            ? "border-none bg-primary-500 text-white" // Blue background and red tick when checked
                                                            : "" // Default styles when unchecked
                                                    }`}
                                                />
                                            </FormControl>
                                            <FormLabel className="!mb-[3px] font-thin">
                                                When Assessment is created
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`notify_student.before_assessment_goes_live.checked`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-end gap-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className={`size-5 rounded-sm border-2 shadow-none ${
                                                        field.value
                                                            ? "border-none bg-primary-500 text-white" // Blue background and red tick when checked
                                                            : "" // Default styles when unchecked
                                                    }`}
                                                />
                                            </FormControl>
                                            <FormLabel className="!mb-[3px] font-thin">
                                                Before Assessment goes live
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                                {watch("notify_student.before_assessment_goes_live").checked && (
                                    <SelectField
                                        label="Notify Before"
                                        labelStyle="font-thin"
                                        name="notify_student.before_assessment_goes_live.value"
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
                                    control={control}
                                    name={`notify_student.when_assessment_live`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-end gap-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className={`size-5 rounded-sm border-2 shadow-none ${
                                                        field.value
                                                            ? "border-none bg-primary-500 text-white" // Blue background and red tick when checked
                                                            : "" // Default styles when unchecked
                                                    }`}
                                                />
                                            </FormControl>
                                            <FormLabel className="!mb-[3px] font-thin">
                                                When Assessment goes live
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`notify_student.when_assessment_report_generated`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-end gap-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className={`size-5 rounded-sm border-2 shadow-none ${
                                                        field.value
                                                            ? "border-none bg-primary-500 text-white" // Blue background and red tick when checked
                                                            : "" // Default styles when unchecked
                                                    }`}
                                                />
                                            </FormControl>
                                            <FormLabel className="!mb-[3px] font-thin">
                                                When assessment reports are generated
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                        {getStepKey({
                            assessmentDetails,
                            currentStep,
                            key: "notify_parents",
                        }) === "REQUIRED" && (
                            <div className="flex flex-col gap-4">
                                <h1>Notify Parents via Email:</h1>
                                <FormField
                                    control={control}
                                    name={`notify_parent.when_assessment_created`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-end gap-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className={`size-5 rounded-sm border-2 shadow-none ${
                                                        field.value
                                                            ? "border-none bg-primary-500 text-white" // Blue background and red tick when checked
                                                            : "" // Default styles when unchecked
                                                    }`}
                                                />
                                            </FormControl>
                                            <FormLabel className="!mb-[3px] font-thin">
                                                When Assessment is created
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`notify_parent.before_assessment_goes_live.checked`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-end gap-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className={`size-5 rounded-sm border-2 shadow-none ${
                                                        field.value
                                                            ? "border-none bg-primary-500 text-white" // Blue background and red tick when checked
                                                            : "" // Default styles when unchecked
                                                    }`}
                                                />
                                            </FormControl>
                                            <FormLabel className="!mb-[3px] font-thin">
                                                Before Assessment goes live
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                                {watch("notify_parent.before_assessment_goes_live").checked && (
                                    <SelectField
                                        label="Notify Before"
                                        labelStyle="font-thin"
                                        name="notify_parent.before_assessment_goes_live.value"
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
                                    control={control}
                                    name={`notify_parent.when_assessment_live`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-end gap-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className={`size-5 rounded-sm border-2 shadow-none ${
                                                        field.value
                                                            ? "border-none bg-primary-500 text-white" // Blue background and red tick when checked
                                                            : "" // Default styles when unchecked
                                                    }`}
                                                />
                                            </FormControl>
                                            <FormLabel className="!mb-[3px] font-thin">
                                                When Assessment goes live
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`notify_parent.when_student_appears`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-end gap-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className={`size-5 rounded-sm border-2 shadow-none ${
                                                        field.value
                                                            ? "border-none bg-primary-500 text-white" // Blue background and red tick when checked
                                                            : "" // Default styles when unchecked
                                                    }`}
                                                />
                                            </FormControl>
                                            <FormLabel className="!mb-[3px] font-thin">
                                                When students appears for the Assessment
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`notify_parent.when_student_finishes_test`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-end gap-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className={`size-5 rounded-sm border-2 shadow-none ${
                                                        field.value
                                                            ? "border-none bg-primary-500 text-white" // Blue background and red tick when checked
                                                            : "" // Default styles when unchecked
                                                    }`}
                                                />
                                            </FormControl>
                                            <FormLabel className="!mb-[3px] font-thin">
                                                When students finishes the Assessment
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`notify_parent.when_assessment_report_generated`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-end gap-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className={`size-5 rounded-sm border-2 shadow-none ${
                                                        field.value
                                                            ? "border-none bg-primary-500 text-white" // Blue background and red tick when checked
                                                            : "" // Default styles when unchecked
                                                    }`}
                                                />
                                            </FormControl>
                                            <FormLabel className="!mb-[3px] font-thin">
                                                When assessment reports are generated
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </FormProvider>
    );
};

export default Step3AddingParticipants;
