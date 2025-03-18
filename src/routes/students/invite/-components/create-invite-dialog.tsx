import { MyDialog } from "@/components/design-system/dialog";
import { MyInput } from "@/components/design-system/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { MyDropdown } from "@/components/common/students/enroll-manually/dropdownForPackageItems";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useEffect, useState } from "react";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import { Copy, DotsSixVertical, PencilSimple, Plus, TrashSimple } from "phosphor-react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Create schema for form validation
const inviteFormSchema = z.object({
    inviteLink: z.string().min(1, "Invite link is required"),
    activeStatus: z.boolean(),
    custom_fields: z.array(
        z.object({
            id: z.number(),
            type: z.string(),
            name: z.string(),
            oldKey: z.boolean(),
            isRequired: z.boolean(),
            options: z
                .array(
                    z.object({
                        id: z.number(),
                        value: z.string(),
                        disabled: z.boolean(),
                    }),
                )
                .optional(),
        }),
    ),
    courseSelectionMode: z.enum(["institute", "student", "both"]),
    sessionSelectionMode: z.enum(["institute", "student", "both"]),
    levelSelectionMode: z.enum(["institute", "student", "both"]),
    selectedCourse: z.string().optional(),
    maxCourses: z.number().optional(),
    selectedSession: z.string().optional(),
    maxSessions: z.number().optional(),
    selectedLevel: z.string().optional(),
    maxLevels: z.number().optional(),
    studentExpiryDays: z.number(),
    inviteeEmail: z.string().email().optional(),
    generatedInviteLink: z.string(),
});

export type InviteFormType = z.infer<typeof inviteFormSchema>;

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
    const { instituteDetails, getCourseFromPackage, getLevelsFromPackage, getSessionFromPackage } =
        useInstituteDetailsStore();
    const [courseList, setCourseList] = useState(getCourseFromPackage());
    const [sessionList, setSessionList] = useState(getSessionFromPackage());
    const [levelList, setLevelList] = useState(getLevelsFromPackage());
    const [selectedOptionValue, setSelectedOptionValue] = useState("textfield");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [textFieldValue, setTextFieldValue] = useState("");
    const [dropdownOptions, setDropdownOptions] = useState<
        {
            id: number;
            value: string;
            disabled: boolean;
        }[]
    >([]);
    const [copySuccess, setCopySuccess] = useState<string | null>(null);

    useEffect(() => {
        setCourseList(getCourseFromPackage());
        setSessionList(getSessionFromPackage());
        setLevelList(getLevelsFromPackage());
    }, [instituteDetails]);

    // Initialize form
    const form = useForm<InviteFormType>({
        resolver: zodResolver(inviteFormSchema),
        defaultValues: {
            inviteLink: initialValues?.inviteLink || "",
            activeStatus: initialValues?.activeStatus || true,
            custom_fields: initialValues?.custom_fields || [
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
            ],
            courseSelectionMode: initialValues?.courseSelectionMode || "institute",
            sessionSelectionMode: initialValues?.sessionSelectionMode || "institute",
            levelSelectionMode: initialValues?.levelSelectionMode || "institute",
            studentExpiryDays: initialValues?.studentExpiryDays || 365,
            generatedInviteLink:
                initialValues?.generatedInviteLink || "https://forms.gle/example123",
        },
    });

    const { control, watch, setValue, getValues, reset } = form;
    const customFields = getValues("custom_fields");

    // Functions to handle custom fields
    const toggleIsRequired = (id: number) => {
        const updatedFields = customFields?.map((field) =>
            field.id === id ? { ...field, isRequired: !field.isRequired } : field,
        );
        setValue("custom_fields", updatedFields);
    };

    const handleAddDropdownOptions = () => {
        setDropdownOptions((prevOptions) => [
            ...prevOptions,
            { id: prevOptions.length, value: `option ${prevOptions.length + 1}`, disabled: true },
        ]);
    };

    const handleAddOpenFieldValues = (type: string, name: string, oldKey: boolean) => {
        // Add the new field to the array
        const updatedFields = [
            ...customFields,
            {
                id: customFields.length,
                type,
                name,
                oldKey,
                isRequired: true,
            },
        ];

        // Update the form state with the new array
        setValue("custom_fields", updatedFields);
    };

    const handleDeleteOpenField = (id: number) => {
        const updatedFields = customFields?.filter((field) => field.id !== id);
        setValue("custom_fields", updatedFields);
    };

    const handleDeleteOptionField = (id: number) => {
        setDropdownOptions((prevFields) => prevFields.filter((field) => field.id !== id));
    };

    // Function to close the dialog and add the new field
    const handleCloseDialog = (type: string, name: string, oldKey: boolean) => {
        // Create the new field
        const newField = {
            id: customFields.length,
            type,
            name,
            oldKey,
            ...(type === "dropdown" && { options: dropdownOptions }),
            isRequired: true,
        };

        // Add the new field to the array
        const updatedFields = [...customFields, newField];

        // Update the form state
        setValue("custom_fields", updatedFields);

        // Reset dialog and temporary values
        setIsDialogOpen(false);
        setTextFieldValue("");
        setDropdownOptions([]);
    };

    const handleValueChange = (id: number, newValue: string) => {
        setDropdownOptions((prevOptions) =>
            prevOptions.map((option) =>
                option.id === id ? { ...option, value: newValue } : option,
            ),
        );
    };

    const handleEditClick = (id: number) => {
        setDropdownOptions((prevOptions) =>
            prevOptions.map((option) =>
                option.id === id ? { ...option, disabled: !option.disabled } : option,
            ),
        );
    };

    const handleCopyClick = (link: string) => {
        navigator.clipboard
            .writeText(link)
            .then(() => {
                setCopySuccess(link);
                setTimeout(() => {
                    setCopySuccess(null);
                }, 2000);
            })
            .catch((err) => {
                console.log("Failed to copy link: ", err);
                toast.error("Copy failed");
            });
    };

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
            dialogWidth="w-[80vw]"
            open={open}
            onOpenChange={onOpenChange}
        >
            <FormProvider {...form}>
                <form>
                    <div className="flex flex-col gap-10">
                        <div className="flex items-center justify-between">
                            <FormField
                                control={control}
                                name="inviteLink"
                                render={({ field }) => (
                                    <FormItem className="w-[1300px]">
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

                            <div className="flex items-center gap-2">
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

                        {/* Registration Form Fields Section */}
                        <div className="flex flex-col gap-4">
                            <p className="text-title font-semibold">Invite input field</p>
                            <div className="flex flex-col gap-4">
                                {watch("custom_fields")?.map((fields, index) => {
                                    return (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="flex w-3/4 items-center justify-between rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2">
                                                <h1 className="text-sm">
                                                    {fields.name}
                                                    {fields.oldKey && (
                                                        <span className="text-subtitle text-danger-600">
                                                            *
                                                        </span>
                                                    )}
                                                    {!fields.oldKey && fields.isRequired && (
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
                                                                handleDeleteOpenField(fields.id)
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
                                {!customFields?.some((field) => field.name === "Gender") && (
                                    <MyButton
                                        type="button"
                                        scale="medium"
                                        buttonType="secondary"
                                        onClick={() =>
                                            handleAddOpenFieldValues("textfield", "Gender", false)
                                        }
                                    >
                                        <Plus size={32} /> Add Gender
                                    </MyButton>
                                )}
                                {!customFields?.some((field) => field.name === "State") && (
                                    <MyButton
                                        type="button"
                                        scale="medium"
                                        buttonType="secondary"
                                        onClick={() =>
                                            handleAddOpenFieldValues("textfield", "State", false)
                                        }
                                    >
                                        <Plus size={32} /> Add State
                                    </MyButton>
                                )}
                                {!customFields?.some((field) => field.name === "City") && (
                                    <MyButton
                                        type="button"
                                        scale="medium"
                                        buttonType="secondary"
                                        onClick={() =>
                                            handleAddOpenFieldValues("textfield", "City", false)
                                        }
                                    >
                                        <Plus size={32} /> Add City
                                    </MyButton>
                                )}
                                {!customFields?.some(
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
                                                Select the type of custom field you want to add:
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
                                                    <Label htmlFor="option-one">Text Field</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="dropdown"
                                                        id="option-two"
                                                    />
                                                    <Label htmlFor="option-two">Dropdown</Label>
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
                                                            setTextFieldValue(e.target.value)
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
                                                            setTextFieldValue(e.target.value)
                                                        }
                                                        size="large"
                                                        className="w-full"
                                                    />
                                                    <h1 className="mt-4">Dropdown Options</h1>
                                                    <div className="flex flex-col gap-4">
                                                        {dropdownOptions.map(
                                                            (option: {
                                                                id: number;
                                                                value: string;
                                                                disabled: boolean;
                                                            }) => {
                                                                return (
                                                                    <div
                                                                        className="flex w-full items-center justify-between rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-1"
                                                                        key={option.id}
                                                                    >
                                                                        <MyInput
                                                                            inputType="text"
                                                                            inputPlaceholder={
                                                                                option.value
                                                                            }
                                                                            input={option.value}
                                                                            onChangeFunction={(e) =>
                                                                                handleValueChange(
                                                                                    option.id,
                                                                                    e.target.value,
                                                                                )
                                                                            }
                                                                            size="large"
                                                                            disabled={
                                                                                option.disabled
                                                                            }
                                                                            className="border-none pl-0"
                                                                        />
                                                                        <div className="flex items-center gap-6">
                                                                            <MyButton
                                                                                type="button"
                                                                                scale="medium"
                                                                                buttonType="secondary"
                                                                                className="h-6 min-w-6 !rounded-sm px-1"
                                                                                onClick={() =>
                                                                                    handleEditClick(
                                                                                        option.id,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <PencilSimple
                                                                                    size={32}
                                                                                />
                                                                            </MyButton>
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
                                                            },
                                                        )}
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
                        </div>

                        {/* Course Selection Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-6">
                                <p className="text-subtitle font-semibold">Course Selection Mode</p>
                                <FormField
                                    control={control}
                                    name="courseSelectionMode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <RadioGroup
                                                    className="flex items-center gap-6"
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem
                                                            value="institute"
                                                            id="course-institute"
                                                        />
                                                        <label htmlFor="course-institute">
                                                            Institute assigns
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem
                                                            value="student"
                                                            id="course-student"
                                                        />
                                                        <label htmlFor="course-student">
                                                            Student chooses
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem
                                                            value="both"
                                                            id="course-both"
                                                        />
                                                        <label htmlFor="course-both">Both</label>
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex gap-12">
                                {(watch("courseSelectionMode") === "institute" ||
                                    watch("courseSelectionMode") === "both") && (
                                    <div className="flex w-fit flex-col gap-2">
                                        <p>
                                            Course <span className="text-primary-500">*</span>
                                        </p>
                                        <FormField
                                            control={control}
                                            name="selectedCourse"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <MyDropdown
                                                            dropdownList={courseList}
                                                            placeholder="Select Course"
                                                            currentValue={field.value}
                                                            handleChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                                {(watch("courseSelectionMode") === "student" ||
                                    watch("courseSelectionMode") === "both") && (
                                    <div className="flex items-center gap-6">
                                        <p>Number of courses student can enroll into</p>
                                        <FormField
                                            control={control}
                                            name="maxCourses"
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
                                                            inputPlaceholder="00"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Session Selection Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-6">
                                <p className="text-subtitle font-semibold">
                                    Session Selection Mode
                                </p>
                                <FormField
                                    control={control}
                                    name="sessionSelectionMode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <RadioGroup
                                                    className="flex items-center gap-6"
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem
                                                            value="institute"
                                                            id="session-institute"
                                                        />
                                                        <label htmlFor="session-institute">
                                                            Institute assigns
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem
                                                            value="student"
                                                            id="session-student"
                                                        />
                                                        <label htmlFor="session-student">
                                                            Student chooses
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem
                                                            value="both"
                                                            id="session-both"
                                                        />
                                                        <label htmlFor="session-both">Both</label>
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex gap-12">
                                {(watch("sessionSelectionMode") === "institute" ||
                                    watch("sessionSelectionMode") === "both") && (
                                    <div className="flex w-fit flex-col gap-2">
                                        <p>
                                            Session <span className="text-primary-500">*</span>
                                        </p>
                                        <FormField
                                            control={control}
                                            name="selectedSession"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <MyDropdown
                                                            dropdownList={sessionList}
                                                            placeholder="Select Session"
                                                            currentValue={field.value}
                                                            handleChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                                {(watch("sessionSelectionMode") === "student" ||
                                    watch("sessionSelectionMode") === "both") && (
                                    <div className="flex items-center gap-6">
                                        <p>Number of sessions student can enroll into</p>
                                        <FormField
                                            control={control}
                                            name="maxSessions"
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
                                                            inputPlaceholder="00"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Level Selection Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-6">
                                <p className="text-subtitle font-semibold">Level Selection Mode</p>
                                <FormField
                                    control={control}
                                    name="levelSelectionMode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <RadioGroup
                                                    className="flex items-center gap-6"
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem
                                                            value="institute"
                                                            id="level-institute"
                                                        />
                                                        <label htmlFor="level-institute">
                                                            Institute assigns
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem
                                                            value="student"
                                                            id="level-student"
                                                        />
                                                        <label htmlFor="level-student">
                                                            Student chooses
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem
                                                            value="both"
                                                            id="level-both"
                                                        />
                                                        <label htmlFor="level-both">Both</label>
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex gap-12">
                                {(watch("levelSelectionMode") === "institute" ||
                                    watch("levelSelectionMode") === "both") && (
                                    <div className="flex w-fit flex-col gap-2">
                                        <p>
                                            Level <span className="text-primary-500">*</span>
                                        </p>
                                        <FormField
                                            control={control}
                                            name="selectedLevel"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <MyDropdown
                                                            dropdownList={levelList}
                                                            placeholder="Select Level"
                                                            currentValue={field.value}
                                                            handleChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                                {(watch("levelSelectionMode") === "student" ||
                                    watch("levelSelectionMode") === "both") && (
                                    <div className="flex items-center gap-6">
                                        <p>Number of levels student can enroll into</p>
                                        <FormField
                                            control={control}
                                            name="maxLevels"
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
                                                            inputPlaceholder="00"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>

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
                                            handleCopyClick(form.getValues("generatedInviteLink"))
                                        }
                                        type="button"
                                    >
                                        <Copy />
                                    </MyButton>
                                    {copySuccess == form.getValues("generatedInviteLink") && (
                                        <span className="text-caption text-primary-500">
                                            Copied!
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </MyDialog>
    );
};
