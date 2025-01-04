import { StepContentProps } from "@/types/step-content-props";
import React from "react";
import { useTestAccessForm } from "../../-utils/useTestAccessForm";
import { FormProvider } from "react-hook-form";
import { MyButton } from "@/components/design-system/button";
import { z } from "zod";
import testAccessSchema from "../../-utils/add-participants-schema";
import { Separator } from "@/components/ui/separator";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MyInput } from "@/components/design-system/input";
import { Copy, DownloadSimple } from "phosphor-react";
import QRCode from "react-qr-code";
import { copyToClipboard, handleDownloadQRCode, transformBatchData } from "../../-utils/helper";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import SelectField from "@/components/design-system/select-field";
import { timeLimit } from "@/constants/dummy-data";
import { AddingParticipantsTab } from "../AddingParticipantsTab";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";

const Step3AddingParticipants: React.FC<StepContentProps> = ({
    currentStep,
    handleCompleteCurrentStep,
    completedSteps,
}) => {
    console.log(currentStep, completedSteps);
    const form = useTestAccessForm();
    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { batches_for_sessions } = instituteDetails || {};
    const transformedBatches = transformBatchData(batches_for_sessions || []);
    console.log(transformedBatches);
    const { handleSubmit, getValues, control, watch } = form;
    const onSubmit = (data: z.infer<typeof testAccessSchema>) => {
        console.log(data);
        handleCompleteCurrentStep();
    };

    const onInvalid = (err: unknown) => {
        console.log(err);
    };
    console.log(getValues());

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
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="CLOSE_TEST" />
                                                </FormControl>
                                                <FormLabel className="font-semibold">
                                                    Closed Test:{" "}
                                                    <span className="font-thin">
                                                        Restrict the Assessment to specific
                                                        participants by assigning it to institute
                                                        batches or selecting individual students.
                                                    </span>
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="OPEN_TEST" />
                                                </FormControl>
                                                <FormLabel className="font-semibold">
                                                    Open Test:{" "}
                                                    <span className="font-thin">
                                                        Allow anyone to register for this Assessment
                                                        via a shared link. Institute students can
                                                        also be pre-registered by selecting batches
                                                        or individuals.
                                                    </span>
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <AddingParticipantsTab batches={transformedBatches} />
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
                    </div>
                </div>
            </form>
        </FormProvider>
    );
};

export default Step3AddingParticipants;
