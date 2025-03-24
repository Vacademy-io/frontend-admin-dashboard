import { MyDialog } from "@/components/design-system/dialog";
import { MyInput } from "@/components/design-system/input";
import { Switch } from "@/components/ui/switch";
import { useEffect, useRef, useState } from "react";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { Check, Copy } from "phosphor-react";
import { FormProvider } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { InviteFormType } from "../../-schema/InviteFormSchema";
import { useInviteForm } from "../../-hooks/useInviteForm";
import { CustomFieldsSection } from "./CustomFieldsSection";
import { CourseSelection } from "./batch-selection-fields.tsx/CourseSelection";
// import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { MaxLimitField } from "./batch-selection-fields.tsx/MaxLimitField";
import { ShowSelectedBatchDetails } from "./ShowSelectedBatchDetails";

interface CreateInviteDialogProps {
    initialValues?: InviteFormType;
    triggerButton?: JSX.Element;
    submitButton: JSX.Element;
    open?: boolean;
    onOpenChange?: () => void;
    submitForm?: (fn: () => void) => void;
    onCreateInvite?: (invite: InviteFormType) => void;
    inviteLink?: string | null;
}

// Define a type for email entries
interface EmailEntry {
    id: string;
    value: string;
}

export const CreateInviteDialog = ({
    initialValues,
    triggerButton,
    submitButton,
    open,
    onOpenChange,
    submitForm,
    onCreateInvite,
    inviteLink,
}: CreateInviteDialogProps) => {
    const {
        form,
        toggleIsRequired,
        handleAddOpenFieldValues,
        handleDeleteOpenField,
        handleCopyClick,
        copySuccess,
    } = useInviteForm(initialValues);

    const {
        control,
        reset,
        getValues,
        setValue,
        watch,
        formState: { errors },
    } = form;
    const [emailError, setEmailError] = useState<string | null>(null);
    const emptyEmailsError = errors.inviteeEmails?.message;
    // const {getCourseFromPackage, instituteDetails} = useInstituteDetailsStore();
    const [areMaxSessionsSaved, setAreMaxSessionsSaved] = useState(false);
    const [areMaxCourseSaved, setAreMaxCourseSaved] = useState(false);
    const [courseSaved, setCourseSaved] = useState(false);

    const handleAreMaxSessionsSaved = (saved: boolean) => setAreMaxSessionsSaved(saved);

    const handleAddCourse = () => {
        // add selected course here
        handleAreMaxSessionsSaved(false);
    };

    // Watch the email input to validate in real-time
    const emailInput = watch("inviteeEmail");
    // Watch the email list to ensure UI updates
    const emailList = watch("inviteeEmails") || [];

    // Validate email format in real-time
    useEffect(() => {
        if (!emailInput) {
            setEmailError(null);
            return;
        }

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);
        if (!isValidEmail) {
            setEmailError("Please enter a valid email address");
        } else {
            setEmailError(null);
        }
    }, [emailInput]);

    // Function to generate a unique ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    // Function to handle adding an email
    const handleAddEmail = () => {
        const email = getValues("inviteeEmail");

        // Validate email format
        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setEmailError("Please enter a valid email address");
            return;
        }

        // Check if email already exists
        const currentEmails = getValues("inviteeEmails") || [];
        if (currentEmails.some((entry: EmailEntry) => entry.value === email)) {
            setEmailError("This email has already been added");
            return;
        }

        // Add email to the array with a unique ID
        const newEmail: EmailEntry = {
            id: generateId(),
            value: email,
        };

        setValue("inviteeEmails", [...currentEmails, newEmail]);

        // Clear input and error
        setValue("inviteeEmail", "");
        setEmailError(null);
    };

    // Function to remove an email by ID
    const handleRemoveEmail = (idToRemove: string) => {
        const currentEmails = getValues("inviteeEmails") || [];
        setValue(
            "inviteeEmails",
            currentEmails.filter((entry: EmailEntry) => entry.id !== idToRemove),
        );
    };

    useEffect(() => {
        if (open && initialValues) {
            reset(initialValues);
        }
    }, [open, initialValues, reset]);

    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (submitForm) {
            submitForm(() => {
                if (formRef.current) {
                    formRef.current.requestSubmit();
                }
            });
        }
    }, [submitForm]);

    const value = getValues("batches");

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
                <form
                    ref={formRef}
                    onSubmit={form.handleSubmit((data: InviteFormType) => {
                        console.log("Form values:", data);
                        // Continue with valid form data
                        onCreateInvite && onCreateInvite(data);
                    })}
                >
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
                                                label="Invite Link Name"
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
                        {/* <SelectionModeSection
                            title="Course"
                            type="course"
                            dropdownList={courseList}
                        />

                        <SelectionModeSection
                            title="Session"
                            type="session"
                            dropdownList={sessionList.filter(() =>
                                watch("preSelectedCourses") ? true : false,
                            )}
                        />

                        <SelectionModeSection
                            title="Level"
                            type="level"
                            dropdownList={levelList.filter(() =>
                                watch("preSelectedCourses") && watch("preSelectedSessions")
                                    ? true
                                    : false,
                            )}
                        /> */}
                        {areMaxCourseSaved ? (
                            <ShowSelectedBatchDetails batch={value} />
                        ) : (
                            <div>
                                {courseSaved ? (
                                    <div className="flex items-center justify-between gap-2">
                                        <ShowSelectedBatchDetails batch={value} />
                                        <div className="flex items-center gap-2">
                                            <MaxLimitField title="Course" maxAllowed={1} />
                                            <MyButton
                                                buttonType="secondary"
                                                scale="medium"
                                                layoutVariant="icon"
                                                type="button"
                                                onClick={() => setAreMaxCourseSaved(true)}
                                            >
                                                <Check />
                                            </MyButton>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <CourseSelection
                                                handleAreMaxSessionsSaved={
                                                    handleAreMaxSessionsSaved
                                                }
                                                areMaxSessionsSaved={areMaxSessionsSaved}
                                            />
                                            {areMaxSessionsSaved && (
                                                <MyButton
                                                    buttonType="primary"
                                                    scale="small"
                                                    onClick={() => setCourseSaved(true)}
                                                >
                                                    Save all courses
                                                </MyButton>
                                            )}
                                        </div>
                                        <div>
                                            {areMaxSessionsSaved && !courseSaved && (
                                                <MyButton
                                                    buttonType="text"
                                                    className="text-primary-500"
                                                    onClick={() => handleAddCourse()}
                                                >
                                                    Add course
                                                </MyButton>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

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
                        <div className="flex flex-col gap-3">
                            <div className="flex items-end justify-between gap-10">
                                <FormField
                                    control={control}
                                    name="inviteeEmail"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <p>
                                                Enter invitee email
                                                <span className="text-primary-500">*</span>
                                            </p>
                                            <FormControl>
                                                <MyInput
                                                    placeholder="you@email.com"
                                                    inputType="email"
                                                    input={field.value || ""}
                                                    onChangeFunction={field.onChange}
                                                    className="w-full"
                                                    // required={true}
                                                    error={
                                                        emailError ||
                                                        (emailList.length === 0
                                                            ? emptyEmailsError
                                                            : undefined)
                                                    }
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
                                    onClick={handleAddEmail}
                                    disabled={!!emailError || !emailInput}
                                    className={`${
                                        emailError || emptyEmailsError ? "mb-7" : "mb-0"
                                    }`}
                                >
                                    Add
                                </MyButton>
                            </div>

                            {/* Display added emails */}
                            <div className="flex flex-wrap gap-2">
                                {emailList?.map((entry: EmailEntry) => (
                                    <div
                                        key={entry.id}
                                        className="text-primary-700 flex items-center gap-2 rounded-lg border border-primary-300 bg-primary-50 px-3"
                                    >
                                        <span>{entry.value}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveEmail(entry.id)}
                                            className="hover:text-primary-700 text-primary-500"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Generated Invite Link */}

                        {/*<p className="text-subtitle font-semibold">Invite Link</p>
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
                            /> */}
                        {inviteLink && inviteLink != null && (
                            <div className="flex flex-col gap-10">
                                <Separator />
                                <div className="flex w-fit items-center gap-4">
                                    <p className="w-[50%] overflow-hidden text-ellipsis whitespace-nowrap rounded-lg border border-neutral-300 p-2 text-neutral-500">
                                        {inviteLink}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <MyButton
                                            buttonType="secondary"
                                            scale="medium"
                                            layoutVariant="icon"
                                            onClick={() => handleCopyClick(inviteLink)}
                                            type="button"
                                        >
                                            <Copy />
                                        </MyButton>
                                        {copySuccess === inviteLink && (
                                            <span className="text-caption text-primary-500">
                                                Copied!
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </FormProvider>
        </MyDialog>
    );
};
