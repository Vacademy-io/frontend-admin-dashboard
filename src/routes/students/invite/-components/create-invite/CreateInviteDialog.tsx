import { MyDialog } from "@/components/design-system/dialog";
import { MyInput } from "@/components/design-system/input";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { Copy } from "phosphor-react";
import { FormProvider } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { InviteFormType } from "./InviteFormSchema";
import { useInviteForm } from "./useInviteForm";
import { CustomFieldsSection } from "./CustomFieldsSection";
import { SelectionModeSection } from "./SelectionModeSection";

interface CreateInviteDialogProps {
    initialValues?: InviteFormType;
    triggerButton?: JSX.Element;
    submitButton: JSX.Element;
    open?: boolean;
    onOpenChange?: () => void;
}

export const CreateInviteDialog = ({
    initialValues,
    triggerButton,
    submitButton,
    open,
    onOpenChange,
}: CreateInviteDialogProps) => {
    const {
        form,
        courseList,
        sessionList,
        levelList,
        toggleIsRequired,
        handleAddOpenFieldValues,
        handleDeleteOpenField,
        handleCopyClick,
        copySuccess,
    } = useInviteForm(initialValues);

    const { control, reset, getValues } = form;

    useEffect(() => {
        if (open && initialValues) {
            reset(initialValues);
        }
    }, [open, initialValues, reset]);

    return (
        <MyDialog
            heading="Invite Students"
            footer={submitButton}
            trigger={triggerButton}
            dialogWidth="w-[60vw]"
            open={open}
            onOpenChange={onOpenChange}
        >
            <FormProvider {...form}>
                <form>
                    <div className="flex flex-col gap-10">
                        {/* Invite Link & Active Status */}
                        <div className="flex justify-between gap-4">
                            <FormField
                                control={control}
                                name="inviteLink"
                                render={({ field }) => (
                                    <FormItem className="w-[80%]">
                                        <FormControl>
                                            <MyInput
                                                label="Invite Link"
                                                required={true}
                                                inputType="text"
                                                inputPlaceholder="Enter invite link name"
                                                input={field.value}
                                                onChangeFunction={field.onChange}
                                                className="w-full"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="flex w-fit gap-2">
                                <p className="text-subtitle font-semibold">Active Status</p>
                                <FormField
                                    control={control}
                                    name="activeStatus"
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
                        </div>

                        {/* Custom Fields Section */}
                        <CustomFieldsSection
                            toggleIsRequired={toggleIsRequired}
                            handleAddOpenFieldValues={handleAddOpenFieldValues}
                            handleDeleteOpenField={handleDeleteOpenField}
                        />

                        {/* Course, Session, Level Selection Sections */}
                        <SelectionModeSection
                            title="Course"
                            type="course"
                            dropdownList={courseList}
                        />

                        <SelectionModeSection
                            title="Session"
                            type="session"
                            dropdownList={sessionList}
                        />

                        <SelectionModeSection title="Level" type="level" dropdownList={levelList} />

                        {/* Student Expiry Date */}
                        <div className="flex items-center gap-6">
                            <p className="text-subtitle font-semibold">Student expiry date</p>
                            <div className="flex items-center gap-2">
                                <FormField
                                    control={control}
                                    name="studentExpiryDays"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <MyInput
                                                    input={field.value?.toString() || ""}
                                                    inputType="number"
                                                    onChangeFunction={(e) =>
                                                        field.onChange(
                                                            parseInt(e.target.value) || 0,
                                                        )
                                                    }
                                                    className="w-[70px]"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <p>days</p>
                            </div>
                        </div>

                        {/* Invitee Email */}
                        <div className="flex items-end justify-between gap-10">
                            <FormField
                                control={control}
                                name="inviteeEmail"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <MyInput
                                                label="Enter invitee email"
                                                required={true}
                                                placeholder="you@email.com"
                                                inputType="email"
                                                input={field.value || ""}
                                                onChangeFunction={field.onChange}
                                                className="w-full"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <MyButton
                                buttonType="secondary"
                                scale="large"
                                layoutVariant="default"
                                type="button"
                            >
                                Add
                            </MyButton>
                        </div>

                        <Separator />

                        {/* Generated Invite Link */}
                        <div className="flex w-fit items-center gap-4">
                            <p className="text-subtitle font-semibold">Invite Link</p>
                            <FormField
                                control={control}
                                name="generatedInviteLink"
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                input={field.value}
                                                onChangeFunction={field.onChange}
                                                className="w-fit text-wrap"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="flex items-center gap-2">
                                <MyButton
                                    buttonType="secondary"
                                    scale="medium"
                                    layoutVariant="icon"
                                    onClick={() =>
                                        handleCopyClick(getValues("generatedInviteLink"))
                                    }
                                    type="button"
                                >
                                    <Copy />
                                </MyButton>
                                {copySuccess === getValues("generatedInviteLink") && (
                                    <span className="text-caption text-primary-500">Copied!</span>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </MyDialog>
    );
};
