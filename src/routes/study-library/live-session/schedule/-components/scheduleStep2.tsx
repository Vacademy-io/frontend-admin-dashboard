import { useForm, Controller, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Separator } from '@radix-ui/react-separator';
import { MyButton } from '@/components/design-system/button';
import { MyRadioButton } from '@/components/design-system/radio';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { AccessType, InputType } from '../../-constants/enums';
import { useStudyLibraryStore } from '@/stores/study-library/use-study-library-store';
import { useState } from 'react';
import { MyDropdown } from '@/components/common/students/enroll-manually/dropdownForPackageItems';
import { DropdownValueType } from '@/components/common/students/enroll-manually/dropdownTypesForPackageItems';
import { DropdownItemType } from '@/components/common/students/enroll-manually/dropdownTypesForPackageItems';
import { MyInput } from '@/components/design-system/input';
import { copyToClipboard } from '@/routes/assessment/create-assessment/$assessmentId/$examtype/-utils/helper';
import { Copy, DotsSixVertical, DownloadSimple, Plus, TrashSimple } from 'phosphor-react';
import QRCode from 'react-qr-code';
import { handleDownloadQRCode } from '@/routes/homework-creation/create-assessment/$assessmentId/$examtype/-utils/helper';
import { Checkbox } from '@/components/ui/checkbox';
import { addCustomFiledSchema, addParticipantsSchema } from '../-schema/schema';
import { Sortable, SortableDragHandle, SortableItem } from '@/components/ui/sortable';
import { Switch } from '@/components/ui/switch';
import { MyDialog } from '@/components/design-system/dialog';
import SelectField from '@/components/design-system/select-field';
import { FieldErrors } from 'react-hook-form';

const TimeOptions = [
    { label: '5 minutes before', value: '5m' },
    { label: '10 minutes before', value: '10m' },
    { label: '30 minutes before', value: '30m' },
    { label: '1 hour before', value: '1h' },
];

export default function ScheduleStep2() {
    const { studyLibraryData } = useStudyLibraryStore();
    const [addCustomFieldDialog, setAddCustomFieldDialog] = useState<boolean>(false);
    const [previewDialog, setPreviewDialog] = useState<boolean>(false);

    const sessionList: DropdownItemType[] = Array.from(
        new Map(
            (
                studyLibraryData?.flatMap((item) =>
                    item.sessions.map((session) => ({
                        name: session.session_dto.session_name,
                        id: session.session_dto.id,
                    }))
                ) ?? []
            ).map((item) => [item.id, item])
        ).values()
    );

    const courses = studyLibraryData?.flatMap((item) =>
        item.sessions.map((session) => ({
            courseName: item.course.package_name,
            courseId: item.course.id,
            sessionId: session.session_dto.id,
            levels: session.level_with_details.map((level) => ({
                name: level.name,
                id: level.id,
            })),
        }))
    );

    const initialSession: DropdownItemType | undefined = {
        id: sessionList[0]?.id || '',
        name: sessionList[0]?.name || '',
    };
    const [currentSession, setCurrentSession] = useState<DropdownItemType | undefined>(
        () => initialSession
    );

    const form = useForm<z.infer<typeof addParticipantsSchema>>({
        resolver: zodResolver(addParticipantsSchema),
        defaultValues: {
            accessType: AccessType.PRIVATE,
            batchSelectionType: 'batch',
            selectedLevels: [],
            selectedLearners: [],
            joinLink: '',
            notifyBy: {
                mail: true,
                whatsapp: true,
            },
            notifySettings: {
                onCreate: true,
                beforeLive: true,
                beforeLiveTime: [],
                onLive: true,
            },
            fields: [
                { label: 'Full Name', required: true, isDefault: true, type: InputType.TEXT },
                { label: 'Email', required: true, isDefault: true, type: InputType.TEXT },
                { label: 'Mobile Number', required: false, isDefault: false, type: InputType.TEXT },
                { label: 'State', required: true, isDefault: false, type: InputType.TEXT },
                { label: 'City/Village', required: true, isDefault: false, type: InputType.TEXT },
            ],
        },
    });
    const addCustomFieldform = useForm<z.infer<typeof addCustomFiledSchema>>({
        resolver: zodResolver(addCustomFiledSchema),
        defaultValues: {
            fieldType: 'text',
            options: [{ optionField: 'Option 1' }, { optionField: 'Option 2' }],
        },
    });

    const {
        control: customControl,
        watch: customWatch,
        register,
        handleSubmit: handleCustomSubmit,
    } = addCustomFieldform;

    const filedType = customWatch('fieldType');
    const {
        fields: customOptionsFields,
        move: customMove,
        append: customAppend,
    } = useFieldArray({
        control: customControl,
        name: 'options',
    });

    const { control, handleSubmit, watch, getValues } = form;
    const { fields, move, append, remove } = useFieldArray({
        control,
        name: 'fields',
    });
    const accessType = watch('accessType');
    const {
        fields: beforeLiveFields,
        append: beforeLiveAppend,
        remove: beforeLiveRemove,
    } = useFieldArray({
        control,
        name: 'notifySettings.beforeLiveTime',
    });

    const handleSessionChange = (value: DropdownValueType) => {
        if (value && typeof value === 'object' && 'id' in value && 'name' in value) {
            setCurrentSession(value as DropdownItemType);
        }
    };

    const onSubmitClick = (data: z.infer<typeof addParticipantsSchema>) => {
        console.log('Submitted:', data);
    };

    const onCustomSubmit = (data: z.infer<typeof addCustomFiledSchema>) => {
        console.log('data ', data);
        append({
            label: data.fieldName,
            isDefault: false,
            required: true,
            type: data.options.length > 0 ? InputType.DROPDOWN : InputType.TEXT,
            options: data.options.map((option) => ({
                name: option.optionField,
                label: option.optionField,
            })),
        });
        setAddCustomFieldDialog(false);
    };

    const onError = (errors: FieldErrors<typeof addParticipantsSchema>) => {
        console.log('Validation errors:', errors);
        // You can show a toast or scroll to the first error here
    };

    return (
        <>
            <FormProvider {...form}>
                <form
                    onSubmit={handleSubmit(onSubmitClick, onError)}
                    className="flex flex-col gap-4"
                >
                    <div className="m-0 flex items-center justify-between p-0">
                        <h1>Add Participants</h1>
                        <MyButton type="submit" scale="large" buttonType="primary">
                            Finish
                        </MyButton>
                    </div>
                    <Separator className="my-4" />

                    {/* Access Type */}
                    <div className="flex flex-col gap-4 font-medium">
                        <div className="font-bold">Participant Access Settings</div>
                        <FormField
                            control={control}
                            name="accessType"
                            render={({ field }) => (
                                <MyRadioButton
                                    name="meetingType"
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={[
                                        {
                                            label: (
                                                <div className="flex flex-row gap-1">
                                                    <div className="font-bold">Private Class:</div>
                                                    Restrict the class to specific participants by
                                                    assigning it to institute batches or selecting
                                                    individual learners.
                                                </div>
                                            ),
                                            value: AccessType.PRIVATE,
                                        },
                                        {
                                            label: (
                                                <div className="flex flex-row gap-1">
                                                    <div className="font-bold">Public Class:</div>
                                                    Allow anyone to join this class via a shared
                                                    link.
                                                </div>
                                            ),
                                            value: AccessType.PUBLIC,
                                        },
                                    ]}
                                    className="flex flex-col gap-4"
                                />
                            )}
                        />
                    </div>

                    {accessType === AccessType.PUBLIC && (
                        <>
                            <Sortable
                                value={fields}
                                onMove={({ activeIndex, overIndex }) =>
                                    move(activeIndex, overIndex)
                                }
                            >
                                {fields.map((field, index) => (
                                    <SortableItem key={field.id} value={field.id} asChild>
                                        <div className="flex items-center gap-6 rounded  p-3">
                                            <div className="flex w-3/4 items-center justify-between rounded-md border bg-neutral-50 p-2 shadow">
                                                <Controller
                                                    control={control}
                                                    name={`fields.${index}.label`}
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            className="w-full border-none bg-transparent outline-none"
                                                            placeholder="Enter label"
                                                        />
                                                    )}
                                                />
                                                {!field.isDefault && (
                                                    <div
                                                        className="mr-2 cursor-pointer rounded border-2 p-1 text-red-300"
                                                        onClick={() => remove(index)}
                                                    >
                                                        <TrashSimple />
                                                    </div>
                                                )}
                                                <SortableDragHandle className="cursor-grab border-none shadow-none">
                                                    <DotsSixVertical />
                                                </SortableDragHandle>
                                            </div>
                                            {!field.isDefault && (
                                                <div className="flex items-center gap-4">
                                                    <Controller
                                                        control={control}
                                                        name={`fields.${index}.required`}
                                                        render={({ field }) => (
                                                            <label className="flex items-center gap-2">
                                                                <span className="text-sm">
                                                                    Required
                                                                </span>
                                                                <Switch
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            </label>
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </SortableItem>
                                ))}
                            </Sortable>

                            {/* adding customs fields and new registration form options */}
                            <div className="flex flex-row gap-4 p-3">
                                <MyButton
                                    buttonType="secondary"
                                    onClick={() => {
                                        setAddCustomFieldDialog(!addCustomFieldDialog);
                                    }}
                                >
                                    <Plus></Plus> Add Custom Field
                                </MyButton>
                                <MyButton
                                    buttonType="secondary"
                                    onClick={() => {
                                        setPreviewDialog(true);
                                    }}
                                >
                                    Preview Registration Form
                                </MyButton>
                            </div>
                        </>
                    )}

                    <div className="w-full max-w-[260px]">
                        <MyDropdown
                            currentValue={currentSession ?? undefined}
                            dropdownList={sessionList}
                            placeholder="Select Session"
                            handleChange={handleSessionChange}
                        />
                    </div>
                    <div className="flex flex-row gap-10">
                        {courses
                            ?.filter((course) => course.sessionId === currentSession?.id)
                            .map((course) => {
                                const fieldName = 'selectedLevels' as const;

                                // All level IDs for this course
                                const courseLevels = course.levels.map((level) => ({
                                    courseId: course.courseId,
                                    sessionId: course.sessionId,
                                    levelId: level.id,
                                }));

                                // Is every level in this course selected?
                                const allSelected = courseLevels.every((levelItem) =>
                                    watch(fieldName)?.some(
                                        (selected) =>
                                            selected.courseId === levelItem.courseId &&
                                            selected.sessionId === levelItem.sessionId &&
                                            selected.levelId === levelItem.levelId
                                    )
                                );

                                return (
                                    <div key={course.courseId} className="mb-6">
                                        <FormField
                                            control={control}
                                            name={fieldName}
                                            render={({ field }) => (
                                                <FormItem className="mb-2 flex flex-row items-center gap-2">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={allSelected}
                                                            onCheckedChange={(checked) => {
                                                                const updated = [
                                                                    ...(field.value || []),
                                                                ];

                                                                if (checked) {
                                                                    // Add all missing levels for this course
                                                                    courseLevels.forEach(
                                                                        (levelItem) => {
                                                                            const exists =
                                                                                updated.some(
                                                                                    (item) =>
                                                                                        item.courseId ===
                                                                                            levelItem.courseId &&
                                                                                        item.sessionId ===
                                                                                            levelItem.sessionId &&
                                                                                        item.levelId ===
                                                                                            levelItem.levelId
                                                                                );
                                                                            if (!exists)
                                                                                updated.push(
                                                                                    levelItem
                                                                                );
                                                                        }
                                                                    );
                                                                } else {
                                                                    // Remove all levels for this course
                                                                    for (const levelItem of courseLevels) {
                                                                        const index =
                                                                            updated.findIndex(
                                                                                (item) =>
                                                                                    item.courseId ===
                                                                                        levelItem.courseId &&
                                                                                    item.sessionId ===
                                                                                        levelItem.sessionId &&
                                                                                    item.levelId ===
                                                                                        levelItem.levelId
                                                                            );
                                                                        if (index > -1)
                                                                            updated.splice(
                                                                                index,
                                                                                1
                                                                            );
                                                                    }
                                                                }

                                                                field.onChange(updated);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-semibold">
                                                        {course.courseName}
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />

                                        <div className="ml-4 space-y-2">
                                            {course.levels.map((level) => {
                                                const levelData = {
                                                    courseId: course.courseId,
                                                    sessionId: course.sessionId,
                                                    levelId: level.id,
                                                };

                                                const isChecked = watch(fieldName)?.some(
                                                    (item) =>
                                                        item.courseId === levelData.courseId &&
                                                        item.sessionId === levelData.sessionId &&
                                                        item.levelId === levelData.levelId
                                                );

                                                return (
                                                    <FormField
                                                        key={`${course.courseId}-${level.id}`}
                                                        control={control}
                                                        name={fieldName}
                                                        render={({ field }) => (
                                                            <FormItem className="flex items-center gap-2">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={isChecked}
                                                                        onCheckedChange={(
                                                                            checked
                                                                        ) => {
                                                                            const updated = [
                                                                                ...(field.value ||
                                                                                    []),
                                                                            ];

                                                                            if (checked) {
                                                                                updated.push(
                                                                                    levelData
                                                                                );
                                                                            } else {
                                                                                const index =
                                                                                    updated.findIndex(
                                                                                        (item) =>
                                                                                            item.courseId ===
                                                                                                levelData.courseId &&
                                                                                            item.sessionId ===
                                                                                                levelData.sessionId &&
                                                                                            item.levelId ===
                                                                                                levelData.levelId
                                                                                    );
                                                                                if (index > -1)
                                                                                    updated.splice(
                                                                                        index,
                                                                                        1
                                                                                    );
                                                                            }

                                                                            field.onChange(updated);
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    {level.name}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    <Separator className="my-4" />
                    <div
                        className="flex flex-row items-center gap-20 font-bold"
                        id="join-link-qr-code"
                    >
                        <div className="flex flex-col gap-2">
                            <h1>Join Link</h1>
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-4">
                                    <FormField
                                        control={control}
                                        name="joinLink"
                                        render={({ field: { ...field } }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <MyInput
                                                        inputType="text"
                                                        inputPlaceholder="Join Link"
                                                        input={field.value}
                                                        onChangeFunction={field.onChange}
                                                        error={
                                                            form.formState.errors.joinLink?.message
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
                                        onClick={() => copyToClipboard(getValues('joinLink'))}
                                    >
                                        <Copy size={32} />
                                    </MyButton>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h1>QR Code</h1>
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-4">
                                    <FormField
                                        control={control}
                                        name="joinLink"
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
                                        onClick={() => handleDownloadQRCode('qr-code-svg')}
                                    >
                                        <DownloadSimple size={32} />
                                    </MyButton>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Separator className="my-4" />

                    <div className="flex flex-col gap-4">
                        <div className="font-bold">Notification Settings</div>

                        <div className="flex flex-row gap-8">
                            <FormField
                                control={control}
                                name={`notifyBy.mail`}
                                render={({ field }) => (
                                    <FormItem className="flex items-end gap-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className={`size-5 rounded-sm border-2 shadow-none ${
                                                    field.value
                                                        ? 'border-none bg-primary-500 text-white' // Blue background and red tick when checked
                                                        : '' // Default styles when unchecked
                                                }`}
                                            />
                                        </FormControl>
                                        <FormLabel className="!mb-[3px] font-thin">
                                            Notify Via Email
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`notifyBy.whatsapp`}
                                render={({ field }) => (
                                    <FormItem className="flex items-end gap-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className={`size-5 rounded-sm border-2 shadow-none ${
                                                    field.value
                                                        ? 'border-none bg-primary-500 text-white' // Blue background and red tick when checked
                                                        : '' // Default styles when unchecked
                                                }`}
                                            />
                                        </FormControl>
                                        <FormLabel className="!mb-[3px] font-thin">
                                            Notify Via WhatsApp
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="font-bold">Notify Participants</div>

                        <div className="flex flex-col gap-4">
                            <FormField
                                control={control}
                                name={`notifySettings.onCreate`}
                                render={({ field }) => (
                                    <FormItem className="flex items-end gap-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className={`size-5 rounded-sm border-2 shadow-none ${
                                                    field.value
                                                        ? 'border-none bg-primary-500 text-white' // Blue background and red tick when checked
                                                        : '' // Default styles when unchecked
                                                }`}
                                            />
                                        </FormControl>
                                        <FormLabel className="!mb-[3px] font-thin">
                                            When Live Class is created
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />

                            <div>
                                <div className="text-sm font-medium">Notify Before</div>

                                {beforeLiveFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center">
                                        <SelectField
                                            label=""
                                            name={`notifySettings.beforeLiveTime.${index}.time`}
                                            labelStyle="font-thin"
                                            options={TimeOptions.map((option, index) => ({
                                                value: option.value,
                                                label: option.label,
                                                _id: index,
                                            }))}
                                            control={form.control}
                                            className="mt-[8px] w-56 font-thin"
                                        />
                                        <MyButton
                                            type="button"
                                            buttonType="text"
                                            onClick={() => beforeLiveRemove(index)}
                                            className="text-red-500"
                                        >
                                            Remove
                                        </MyButton>
                                    </div>
                                ))}

                                <MyButton
                                    type="button"
                                    buttonType="text"
                                    onClick={() => beforeLiveAppend({ time: '' })}
                                    className="m-0 flex justify-start gap-2 p-0 text-primary-500"
                                >
                                    <Plus size={16} /> Add
                                </MyButton>
                            </div>

                            <FormField
                                control={control}
                                name={`notifySettings.onLive`}
                                render={({ field }) => (
                                    <FormItem className="flex items-end gap-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className={`size-5 rounded-sm border-2 shadow-none ${
                                                    field.value
                                                        ? 'border-none bg-primary-500 text-white' // Blue background and red tick when checked
                                                        : '' // Default styles when unchecked
                                                }`}
                                            />
                                        </FormControl>
                                        <FormLabel className="!mb-[3px] font-thin">
                                            When class goes live
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </form>
                <MyDialog
                    heading="Preview Registration Form"
                    onOpenChange={setPreviewDialog}
                    open={previewDialog}
                >
                    {fields?.map((testInputFields, idx) => {
                        return (
                            <div className="flex flex-col items-start gap-4" key={idx}>
                                {testInputFields.type === 'dropdown' ? (
                                    <SelectField
                                        label={testInputFields.label}
                                        labelStyle="font-normal"
                                        name={testInputFields.label}
                                        options={
                                            testInputFields?.options?.map((option, index) => ({
                                                value: option.name,
                                                label: option.label,
                                                _id: index,
                                            })) || []
                                        }
                                        control={form.control}
                                        className="w-full font-thin"
                                        required={testInputFields.required ? true : false}
                                    />
                                ) : (
                                    <div className="flex w-full flex-col gap-[0.4rem]">
                                        <h1 className="text-sm">
                                            {testInputFields.label}
                                            {testInputFields.required && (
                                                <span className="text-subtitle text-danger-600">
                                                    *
                                                </span>
                                            )}
                                        </h1>
                                        <MyInput
                                            inputType="text"
                                            inputPlaceholder={testInputFields.label}
                                            input=""
                                            onChangeFunction={() => {}}
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
                            disable
                        >
                            Register Now
                        </MyButton>
                    </div>
                </MyDialog>
            </FormProvider>
            <MyDialog
                open={addCustomFieldDialog}
                onOpenChange={setAddCustomFieldDialog}
                heading="Custom Field Fields"
            >
                <FormProvider {...addCustomFieldform}>
                    <form onSubmit={handleCustomSubmit(onCustomSubmit, onError)}>
                        <div className="p-2">
                            <div className="flex flex-col gap-4">
                                <div>Select the type of custom field you want to add:</div>
                                <FormField
                                    control={customControl}
                                    name="fieldType"
                                    render={({ field }) => (
                                        <MyRadioButton
                                            name="meetingType"
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={[
                                                {
                                                    label: 'Text Field',
                                                    value: 'text',
                                                },
                                                {
                                                    label: 'DropDown',
                                                    value: 'dropdown',
                                                },
                                            ]}
                                            className="flex flex-row gap-4"
                                        />
                                    )}
                                />
                            </div>
                            <div className="mt-4 flex flex-col gap-4">
                                <div>
                                    {filedType === 'text' ? 'Text Field Name' : 'Dropdown Name'}
                                </div>
                                <FormField
                                    control={customControl}
                                    name="fieldName"
                                    render={({ field: { ...field } }) => (
                                        <FormItem>
                                            <FormControl>
                                                <MyInput
                                                    inputType="text"
                                                    inputPlaceholder="Enter Name"
                                                    input={field.value}
                                                    onChangeFunction={field.onChange}
                                                    error={
                                                        addCustomFieldform.formState.errors
                                                            .fieldName?.message
                                                    }
                                                    size="large"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {filedType === 'dropdown' && (
                                <div>
                                    <Sortable
                                        value={customOptionsFields}
                                        onMove={({ activeIndex, overIndex }) =>
                                            customMove(activeIndex, overIndex)
                                        }
                                    >
                                        {customOptionsFields.map((field, index) => (
                                            <SortableItem key={field.id} value={field.id} asChild>
                                                <div className="flex items-center gap-6 rounded  p-3">
                                                    <div className="flex w-3/4 items-center justify-between rounded-md border bg-neutral-50 p-2 shadow">
                                                        <input
                                                            className="w-full border-none bg-transparent outline-none"
                                                            {...register(
                                                                `options.${index}.optionField`
                                                            )} // <-- use register here
                                                        />
                                                        <SortableDragHandle className="cursor-grab border-none shadow-none">
                                                            <DotsSixVertical />
                                                        </SortableDragHandle>
                                                    </div>
                                                </div>
                                            </SortableItem>
                                        ))}
                                    </Sortable>
                                    <div>
                                        <MyButton
                                            buttonType="text"
                                            className="m-0 p-0 text-primary-500"
                                            onClick={() => customAppend({ optionField: '' })}
                                        >
                                            <Plus></Plus> Add
                                        </MyButton>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mt-2 flex w-full items-center justify-center">
                            <MyButton buttonType="primary" className="m-auto">
                                Done
                            </MyButton>
                        </div>
                    </form>
                </FormProvider>
            </MyDialog>
        </>
    );
}
