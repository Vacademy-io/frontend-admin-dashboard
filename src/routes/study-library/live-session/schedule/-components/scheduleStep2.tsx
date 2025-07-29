import { useForm, Controller, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Separator } from '@radix-ui/react-separator';
import { MyButton } from '@/components/design-system/button';
import { MyRadioButton } from '@/components/design-system/radio';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { AccessType, InputType } from '../../-constants/enums';
import { useStudyLibraryStore } from '@/stores/study-library/use-study-library-store';
import { useEffect, useState, useRef, useMemo } from 'react';
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
import { transformFormToDTOStep2 } from '../../-constants/helper';
import { createLiveSessionStep2 } from '../-services/utils';
import { useLiveSessionStore } from '../-store/sessionIdstore';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { useSessionDetailsStore } from '../../-store/useSessionDetailsStore';

const TimeOptions = [
    { label: '5 minutes before', value: '5m' },
    { label: '10 minutes before', value: '10m' },
    { label: '30 minutes before', value: '30m' },
    { label: '1 hour before', value: '1h' },
];

export default function ScheduleStep2() {
    const { studyLibraryData } = useStudyLibraryStore();
    const [addCustomFieldDialog, setAddCustomFieldDialog] = useState<boolean>(false);
    const queryClient = useQueryClient();
    const [previewDialog, setPreviewDialog] = useState<boolean>(false);
    const { sessionId } = useLiveSessionStore();
    const isEditState = useLiveSessionStore((state) => state.isEdit);
    const { sessionDetails } = useSessionDetailsStore();

    const navigate = useNavigate();

    // Get the institute details at component level
    const { instituteDetails } = useInstituteDetailsStore();

    /**
     * This ref helps us ensure that the heavy edit-mode form pre-population
     * logic executes only ONCE. Without this, `form.setValue` & `setCurrentSession`
     * could run on every re-render if any object reference in `sessionDetails` or
     * `instituteDetails` changes (even when the actual data is identical), leading
     * to an infinite render-refresh cycle in dev (observed as the app “refreshing
     * again and again”).
     */
    const hasInitialisedEditState = useRef(false);

    useEffect(() => {
        if (!sessionId) {
            console.log('here ', sessionId);
            navigate({ to: '/study-library/live-session' });
        }
    }, [sessionId, navigate]);

    useEffect(() => {
        if (sessionDetails && !hasInitialisedEditState.current) {
            form.setValue(
                'accessType',
                sessionDetails?.schedule?.access_type === 'public'
                    ? AccessType.PUBLIC
                    : AccessType.PRIVATE
            );
            const defaultNotifySettings = {
                onCreate: false,
                beforeLive: false,
                beforeLiveTime: [] as { time: string }[],
                onLive: false,
            };

            let mail = false;
            let whatsapp = false;

            sessionDetails?.notifications?.addedNotificationActions.forEach((action) => {
                const { type, notify, notifyBy, time } = action;

                if (type === 'ON_CREATE') {
                    defaultNotifySettings.onCreate = notify;
                } else if (type === 'ON_LIVE') {
                    defaultNotifySettings.onLive = notify;
                } else if (type === 'BEFORE_LIVE') {
                    defaultNotifySettings.beforeLive = notify;
                    if (time) {
                        defaultNotifySettings.beforeLiveTime = [{ time }];
                    }
                }

                // Merge mail & whatsapp flags
                mail = mail || notifyBy.mail;
                whatsapp = whatsapp || notifyBy.whatsapp;
            });

            form.setValue('notifySettings', defaultNotifySettings);

            // ------------------------------------------------------------------
            // NEW: Pre-populate selected levels (batches) when editing a PRIVATE class
            // ------------------------------------------------------------------
            if (
                sessionDetails.schedule.access_type === 'private' &&
                instituteDetails &&
                sessionDetails.schedule.package_session_ids?.length > 0
            ) {
                const selectedLevelsFromPackages = sessionDetails.schedule.package_session_ids
                    .map((pkgId) => {
                        const batch = instituteDetails.batches_for_sessions.find(
                            (b) => b.id === pkgId
                        );
                        if (!batch) return null;
                        return {
                            courseId: batch.package_dto.id,
                            sessionId: batch.session.id,
                            levelId: batch.level.id,
                        };
                    })
                    .filter(Boolean) as {
                    courseId: string;
                    sessionId: string;
                    levelId: string;
                }[];

                if (selectedLevelsFromPackages.length) {
                    form.setValue('selectedLevels', selectedLevelsFromPackages);

                    // Also set the currentSession dropdown so that UI immediately shows relevant levels
                    const firstSessionId = selectedLevelsFromPackages[0]!.sessionId;
                    const matchingSession = sessionList.find((s) => s.id === firstSessionId);
                    if (matchingSession) {
                        setCurrentSession(matchingSession);
                    }
                }
            }

            // Mark initialisation done so this block never runs again
            hasInitialisedEditState.current = true;
        }
    }, [sessionDetails, instituteDetails]);

    // Prepare session data first
    const sessionList: DropdownItemType[] = useMemo(
        () =>
            Array.from(
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
            ),
        [studyLibraryData]
    );

    const courses = useMemo(
        () =>
            studyLibraryData?.flatMap((item) =>
                item.sessions.map((session) => ({
                    courseName: item.course.package_name,
                    courseId: item.course.id,
                    sessionId: session.session_dto.id,
                    levels: session.level_with_details.map((level) => ({
                        name: level.name,
                        id: level.id,
                    })),
                }))
            ),
        [studyLibraryData]
    );

    // Initialize form with default values
    const form = useForm<z.infer<typeof addParticipantsSchema>>({
        resolver: zodResolver(addParticipantsSchema),
        defaultValues: {
            accessType:
                sessionDetails?.schedule?.access_type === 'private'
                    ? AccessType.PRIVATE
                    : AccessType.PUBLIC,
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
            fields: [],
        },
    });

    // Set up current session
    const [currentSession, setCurrentSession] = useState<DropdownItemType | undefined>(() =>
        sessionList.length > 0 ? sessionList[0] : undefined
    );

    // Update form when session details are available
    useEffect(() => {
        if (!sessionDetails || !instituteDetails) return;

        // Set access type
        form.setValue(
            'accessType',
            sessionDetails.schedule.access_type === 'public'
                ? AccessType.PUBLIC
                : AccessType.PRIVATE
        );

        // Set notification settings
        const defaultNotifySettings = {
            onCreate: false,
            beforeLive: false,
            beforeLiveTime: [] as { time: string }[],
            onLive: false,
        };

        let mail = false;
        let whatsapp = false;

        sessionDetails.notifications?.addedNotificationActions.forEach((action) => {
            const { type, notify, notifyBy, time } = action;

            if (type === 'ON_CREATE') {
                defaultNotifySettings.onCreate = notify;
            } else if (type === 'ON_LIVE') {
                defaultNotifySettings.onLive = notify;
            } else if (type === 'BEFORE_LIVE') {
                defaultNotifySettings.beforeLive = notify;
                if (time) {
                    defaultNotifySettings.beforeLiveTime = [{ time }];
                }
            }

            // Merge mail & whatsapp flags
            mail = mail || notifyBy.mail;
            whatsapp = whatsapp || notifyBy.whatsapp;
        });

        form.setValue('notifySettings', defaultNotifySettings);
        form.setValue('notifyBy', { mail, whatsapp });

        // Load previously selected levels for PRIVATE sessions
        if (
            sessionDetails.schedule.access_type === 'private' &&
            sessionDetails.schedule.package_session_ids &&
            sessionDetails.schedule.package_session_ids.length > 0
        ) {
            // Initialize array for selected levels
            const selectedLevels: { courseId: string; sessionId: string; levelId: string }[] = [];

            // Process each package_session_id
            sessionDetails.schedule.package_session_ids.forEach((packageSessionId) => {
                // Find the matching batch in institute details
                const matchingBatch = instituteDetails.batches_for_sessions.find(
                    (batch) => batch.id === packageSessionId
                );

                if (matchingBatch) {
                    selectedLevels.push({
                        courseId: matchingBatch.package_dto.id,
                        sessionId: matchingBatch.session.id,
                        levelId: matchingBatch.level.id,
                    });
                }
            });

            // Set the selected levels in the form
            if (selectedLevels.length > 0) {
                form.setValue('selectedLevels', selectedLevels);

                // If we have any selections, set the current session to match the first selected level
                const firstSelectedLevel = selectedLevels[0];
                const matchingSession = sessionList.find(
                    (session) => session.id === firstSelectedLevel?.sessionId
                );
                if (matchingSession) {
                    setCurrentSession(matchingSession);
                }
            }
        }
    }, [sessionDetails, instituteDetails, sessionList, form]);

    const addCustomFieldform = useForm<z.infer<typeof addCustomFiledSchema>>({
        resolver: zodResolver(addCustomFiledSchema),
        defaultValues: {
            fieldType: 'text',
            options: [],
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
    console.log(accessType);
    useEffect(() => {
        if (isEditState) {
            if (accessType === AccessType.PUBLIC) {
                const fields =
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    sessionDetails?.notifications?.addedFields.map((field: any) => ({
                        id: field.id,
                        label: field.label,
                        required: field.required,
                        isDefault: field.label === 'Full Name' || field.label === 'Email',
                        type: field.type,
                    })) ?? [];

                form.setValue('fields', fields);
                form.setValue(
                    'joinLink',
                    `${import.meta.env.VITE_LEARNER_DASHBOARD_URL || 'https://learner.vacademy.io'}/register/live-class?sessionId=${sessionId}`
                );
            } else {
                form.setValue('fields', []);
                form.setValue(
                    'joinLink',
                    `${import.meta.env.VITE_LEARNER_DASHBOARD_URL || 'https://learner.vacademy.io'}/study-library/live-class`
                );
            }
            return;
        }
        if (accessType === AccessType.PUBLIC) {
            form.setValue('fields', [
                { label: 'Full Name', required: true, isDefault: true, type: InputType.TEXT },
                { label: 'Email', required: true, isDefault: true, type: InputType.TEXT },
                { label: 'Mobile Number', required: false, isDefault: false, type: InputType.TEXT },
                { label: 'State', required: true, isDefault: false, type: InputType.TEXT },
                { label: 'City/Village', required: true, isDefault: false, type: InputType.TEXT },
            ]);
            form.setValue(
                'joinLink',
                `${import.meta.env.VITE_LEARNER_DASHBOARD_URL || 'https://learner.vacademy.io'}/register/live-class?sessionId=${sessionId}`
            );
        } else {
            form.setValue('fields', []);
            form.setValue(
                'joinLink',
                `${import.meta.env.VITE_LEARNER_DASHBOARD_URL || 'https://learner.vacademy.io'}/study-library/live-class`
            );
        }
    }, [accessType]);
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

    const onSubmitClick = async (data: z.infer<typeof addParticipantsSchema>) => {
        console.log('Submitted:', data);
        const packageSessionIds = data.selectedLevels.map((level) => {
            if (!instituteDetails) return '';

            console.log('level ', level);

            const matchingBatch = instituteDetails.batches_for_sessions.find(
                (batch) =>
                    batch.package_dto.id === level.courseId &&
                    batch.session.id === level.sessionId &&
                    batch.level.id === level.levelId
            );
            console.log('matchingBatch ', matchingBatch);

            return matchingBatch?.id || '';
        });

        const body = transformFormToDTOStep2(data, sessionId, packageSessionIds);
        console.log('body ', body);

        try {
            const response = await createLiveSessionStep2(body);
            console.log('API Response:', response);
            await queryClient.invalidateQueries({ queryKey: ['liveSessions'] });
            await queryClient.invalidateQueries({ queryKey: ['upcomingSessions'] });
            await queryClient.invalidateQueries({ queryKey: ['pastSessions'] });
            await queryClient.invalidateQueries({ queryKey: ['draftSessions'] });

            // Clear the session ID after successful creation
            clearSessionId();

            navigate({ to: '/study-library/live-session' });
        } catch (error) {
            console.error('Error submitting form:', error);
            // Handle error appropriately
        }
    };

    const onCustomSubmit = (data: z.infer<typeof addCustomFiledSchema>) => {
        console.log('data ', data);
        append({
            label: data.fieldName,
            isDefault: false,
            required: true,
            type: data.options.length > 0 ? InputType.DROPDOWN : InputType.TEXT,
            options:
                data.fieldType === 'dropdown'
                    ? data.options.map((option) => ({
                          name: option.optionField,
                          label: option.optionField,
                      }))
                    : [],
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
                        {isEditState && (
                            <div className="flex flex-row">
                                <div className="font-bold">{accessType} : </div>
                                {accessType === AccessType.PRIVATE ? (
                                    <div>
                                        Restrict the class to specific participants by assigning it
                                        to institute batches or selecting individual learners.
                                    </div>
                                ) : (
                                    <div>Allow anyone to join this class via a shared link.</div>
                                )}
                            </div>
                        )}
                        {!isEditState && (
                            <FormField
                                control={control}
                                name="accessType"
                                render={({ field }) => (
                                    <MyRadioButton
                                        name="meetingType"
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={isEditState}
                                        options={[
                                            {
                                                label: (
                                                    <div className="flex flex-row gap-1">
                                                        <div className="font-bold">
                                                            Private Class:
                                                        </div>
                                                        Restrict the class to specific participants
                                                        by assigning it to institute batches or
                                                        selecting individual learners.
                                                    </div>
                                                ),
                                                value: AccessType.PRIVATE,
                                            },
                                            {
                                                label: (
                                                    <div className="flex flex-row gap-1">
                                                        <div className="font-bold">
                                                            Public Class:
                                                        </div>
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
                        )}
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
                                        <div className="flex items-center gap-6 rounded p-3">
                                            <div className="flex w-3/4 items-center justify-between rounded-md border bg-neutral-50 p-2 shadow">
                                                {field.isDefault ? (
                                                    <div className="w-full text-neutral-600">
                                                        {field.label}
                                                    </div>
                                                ) : (
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
                                                )}
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
                                    type="button"
                                    onClick={() => {
                                        setAddCustomFieldDialog(!addCustomFieldDialog);
                                    }}
                                >
                                    <Plus></Plus> Add Custom Field
                                </MyButton>
                                <MyButton
                                    buttonType="secondary"
                                    type="button"
                                    onClick={() => {
                                        setPreviewDialog(true);
                                    }}
                                >
                                    Preview Registration Form
                                </MyButton>
                            </div>
                        </>
                    )}

                    {accessType === AccessType.PRIVATE && (
                        <>
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
                                                                                            (
                                                                                                item
                                                                                            ) =>
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
                                                                item.courseId ===
                                                                    levelData.courseId &&
                                                                item.sessionId ===
                                                                    levelData.sessionId &&
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
                                                                                    const updated =
                                                                                        [
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
                                                                                                (
                                                                                                    item
                                                                                                ) =>
                                                                                                    item.courseId ===
                                                                                                        levelData.courseId &&
                                                                                                    item.sessionId ===
                                                                                                        levelData.sessionId &&
                                                                                                    item.levelId ===
                                                                                                        levelData.levelId
                                                                                            );
                                                                                        if (
                                                                                            index >
                                                                                            -1
                                                                                        )
                                                                                            updated.splice(
                                                                                                index,
                                                                                                1
                                                                                            );
                                                                                    }

                                                                                    field.onChange(
                                                                                        updated
                                                                                    );
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
                        </>
                    )}

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
                                                        readOnly
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
                {/* Preview Registration Form */}
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
            {/* Add Custom Field Dialog */}
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
                                            type="button"
                                            onClick={() => customAppend({ optionField: '' })}
                                        >
                                            <Plus></Plus> Add
                                        </MyButton>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mt-2 flex w-full items-center justify-center">
                            <MyButton buttonType="primary" className="m-auto" type="submit">
                                Done
                            </MyButton>
                        </div>
                    </form>
                </FormProvider>
            </MyDialog>
        </>
    );
}
function clearSessionId() {
    throw new Error('Function not implemented.');
}
