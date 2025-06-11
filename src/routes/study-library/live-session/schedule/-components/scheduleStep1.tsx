import { MyButton } from '@/components/design-system/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@radix-ui/react-separator';
import { Controller, FieldErrors, FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { z } from 'zod';
import { MyInput } from '@/components/design-system/input';
import SelectField from '@/components/design-system/select-field';
import { MainViewQuillEditor } from '@/components/quill/MainViewQuillEditor';
import { useFilterDataForAssesment } from '@/routes/assessment/assessment-list/-utils.ts/useFiltersData';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import { MyRadioButton } from '@/components/design-system/radio';
import { useState, useRef } from 'react';
import {
    RecurringType,
    SessionPlatform,
    SessionType,
    StreamingPlatform,
} from '../../-constants/enums';
import { WEEK_DAYS } from '../../-constants/type';
import { sessionFormSchema } from '../-schema/schema';
import { Trash, UploadSimple, X } from 'phosphor-react';
// import { MyDialog } from '@/components/design-system/dialog';
// import { MeetLogo, YoutubeLogo, ZoomLogo } from '@/svgs';
import { transformFormToDTOStep1, timeOptions } from '../../-constants/helper';
import { createLiveSessionStep1 } from '../-services/utils';
import { useNavigate } from '@tanstack/react-router';
import { useLiveSessionStore } from '../-store/sessionIdstore';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { UploadFileInS3 } from '@/services/upload_file';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Constants
const WAITING_ROOM_OPTIONS = [
    { value: '15', label: '15 minutes', _id: 1 },
    { value: '30', label: '30 minutes', _id: 2 },
    { value: '45', label: '45 minutes', _id: 3 },
];

const STREAMING_OPTIONS = [
    { value: StreamingPlatform.YOUTUBE, label: 'Youtube', _id: 1 },
    { value: StreamingPlatform.MEET, label: 'Meet', _id: 2 },
    { value: StreamingPlatform.ZOOM, label: 'Zoom', _id: 3 },
];

export default function ScheduleStep1() {
    // Hooks and State
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedMusicFile, setSelectedMusicFile] = useState<File | null>(null);
    const musicFileInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [scheduleType, setScheduleType] = useState<'everyday' | 'weekday' | null>(null);

    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { SubjectFilterData } = useFilterDataForAssesment(instituteDetails);

    // Form Setup
    const form = useForm<z.infer<typeof sessionFormSchema>>({
        resolver: zodResolver(sessionFormSchema),
        defaultValues: {
            title: '',
            meetingType: RecurringType.ONCE,
            recurringSchedule: WEEK_DAYS.map((day) => ({
                day: day.label,
                isSelect: false,
                sessions: [
                    {
                        startTime: '00:00',
                        durationHours: '',
                        durationMinutes: '',
                        link: '',
                    },
                ],
            })),
            subject: 'none',
            timeZone: '(GMT 5:30) India Standard Time (Asia/Kolkata)',
            events: '1',
            openWaitingRoomBefore: '15',
            sessionType: SessionType.LIVE,
            streamingType: SessionPlatform.EMBED_IN_APP,
            allowRewind: false,
            enableWaitingRoom: false,
            sessionPlatform: StreamingPlatform.YOUTUBE,
            durationMinutes: '00',
        },
        mode: 'onChange',
    });

    const { control, watch } = form;
    const meetingType = useWatch({ control, name: 'meetingType' });
    const recurringSchedule = watch('recurringSchedule');

    // Auth and Institute Data
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = (tokenData && Object.keys(tokenData.authorities)[0]) || '';

    // Event Handlers
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === 'image/png') {
                setSelectedFile(file);
            } else {
                alert('Please upload a PNG file');
            }
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    const handleRemoveMusicFile = () => {
        setSelectedMusicFile(null);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleMusicFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedMusicFile(file);
        }
    };

    const handleMusicUploadClick = () => {
        musicFileInputRef.current?.click();
    };

    const onSubmit = async (data: z.infer<typeof sessionFormSchema>) => {
        let musicFileId: string | undefined;
        let thumbnailFileId: string | undefined;

        if (selectedMusicFile) {
            musicFileId = await UploadFileInS3(selectedMusicFile, () => {}, 'your-user-id');
        }
        if (selectedFile) {
            thumbnailFileId = await UploadFileInS3(selectedFile, () => {}, 'your-user-id');
        }
        const body = transformFormToDTOStep1(data, INSTITUTE_ID, [], musicFileId, thumbnailFileId);
        try {
            const response = await createLiveSessionStep1(body);
            useLiveSessionStore.getState().setSessionId(response.id);
            navigate({ to: '/study-library/live-session/schedule/step2' });
        } catch (error) {
            console.error(error);
        }
    };

    const onError = (errors: FieldErrors<typeof sessionFormSchema>) => {
        console.log('Validation errors:', errors);
    };

    // Recurring Schedule Handlers
    const addSessionToDay = (dayIndex: number) => {
        const currentSchedule = form.getValues('recurringSchedule');
        const daySchedule = currentSchedule?.[dayIndex];
        if (!daySchedule) return;

        const updatedSessions = [
            ...daySchedule.sessions,
            {
                startTime: '',
                durationHours: '',
                durationMinutes: '',
                link: '',
            },
        ];

        form.setValue(`recurringSchedule.${dayIndex}.sessions`, updatedSessions, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const removeSessionFromDay = (dayIndex: number, sessionIndex: number) => {
        const sessions = form.getValues(`recurringSchedule.${dayIndex}.sessions`);
        const updatedSessions = [...sessions];
        updatedSessions.splice(sessionIndex, 1);

        form.setValue(`recurringSchedule.${dayIndex}.sessions`, updatedSessions);

        if (updatedSessions.length === 0) {
            form.setValue(`recurringSchedule.${dayIndex}.isSelect`, false);
        }
    };

    const toggleEveryDay = () => {
        const currentSchedule = form.getValues('recurringSchedule');
        if (!currentSchedule) return;

        const allSelected = currentSchedule.every((day) => day.isSelect);
        currentSchedule.forEach((day, index) => {
            const isSelecting = !allSelected;
            form.setValue(`recurringSchedule.${index}.isSelect`, isSelecting);

            if (isSelecting && (!day.sessions || day.sessions.length === 0)) {
                form.setValue(`recurringSchedule.${index}.sessions`, [
                    {
                        startTime: '',
                        durationHours: '',
                        durationMinutes: '',
                        link: '',
                    },
                ]);
            }
        });
    };

    const toggleMonToFri = () => {
        const currentSchedule = form.getValues('recurringSchedule');
        if (!currentSchedule) return;

        currentSchedule.forEach((day, index) => {
            const weekDay = WEEK_DAYS.find((d) => d.label === day.day);
            const isWeekday = weekDay?.value
                ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekDay.value)
                : false;
            form.setValue(`recurringSchedule.${index}.isSelect`, isWeekday);

            if (isWeekday && (!day.sessions || day.sessions.length === 0)) {
                form.setValue(`recurringSchedule.${index}.sessions`, [
                    {
                        startTime: '',
                        durationHours: '',
                        durationMinutes: '',
                        link: '',
                    },
                ]);
            }
        });
    };

    // Render Functions
    const renderBasicInformation = () => (
        <div className="flex flex-col gap-6">
            <div className="flex w-full items-start justify-start gap-4">
                <FormField
                    control={control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    inputType="text"
                                    inputPlaceholder="Add Title"
                                    input={field.value}
                                    labelStyle="font-thin"
                                    onChangeFunction={field.onChange}
                                    error={form.formState.errors.title?.message}
                                    required
                                    size="large"
                                    label="Title"
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
                    options={[
                        { value: 'none', label: 'Select Subject', _id: -1 },
                        ...SubjectFilterData.map((option, index) => ({
                            value: option.name,
                            label: option.name,
                            _id: index,
                        })),
                    ]}
                    control={form.control}
                    className="mt-[8px] w-56 font-thin"
                />
            </div>

            <div className="flex h-[280px] flex-col gap-6">
                <h1 className="-mb-5 font-thin">Description</h1>
                <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MainViewQuillEditor
                                    onChange={field.onChange}
                                    value={field.value}
                                    CustomclasssName="h-[200px]"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );

    const renderMeetingTypeSelection = () => (
        <FormField
            control={control}
            name="meetingType"
            render={({ field }) => (
                <MyRadioButton
                    name="meetingType"
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                        { label: 'One Time Class', value: RecurringType.ONCE },
                        { label: 'Recurring Class', value: RecurringType.WEEKLY },
                    ]}
                    className="flex flex-row gap-4"
                />
            )}
        />
    );

    const renderSessionTiming = () => (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center gap-8">
                <FormField
                    control={control}
                    name="startTime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Start Date & Time</FormLabel>
                            <FormControl>
                                <MyInput
                                    inputType="datetime-local"
                                    input={field.value}
                                    onChangeFunction={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <div>
                    <div>duration</div>
                    <div className="mt-2 flex flex-row items-center gap-2">
                        <FormField
                            control={control}
                            name="durationHours"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyInput
                                            inputType="text"
                                            inputPlaceholder="00"
                                            input={field.value}
                                            onKeyPress={(e) => {
                                                if (!/[0-9]/.test(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onChangeFunction={(e) => {
                                                let inputValue = e.target.value.replace(
                                                    /[^0-9]/g,
                                                    ''
                                                );
                                                const numValue = parseInt(inputValue);
                                                if (numValue > 24) {
                                                    inputValue = '24';
                                                }
                                                field.onChange(inputValue);
                                            }}
                                            className="w-11 p-2"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div>hrs :</div>
                        <FormField
                            control={control}
                            name="durationMinutes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyInput
                                            inputType="text"
                                            inputPlaceholder="00"
                                            input={field.value}
                                            onKeyPress={(e) => {
                                                if (!/[0-9]/.test(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onChangeFunction={(e) => {
                                                let inputValue = e.target.value.replace(
                                                    /[^0-9]/g,
                                                    ''
                                                );
                                                const numValue = parseInt(inputValue);
                                                if (numValue > 59) {
                                                    inputValue = '59';
                                                }
                                                field.onChange(inputValue);
                                            }}
                                            className="w-11 p-2"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div>mins</div>
                    </div>
                </div>
            </div>
            {meetingType === RecurringType.WEEKLY && (
                <div className="flex flex-row gap-6">
                    <FormField
                        control={control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                    <MyInput
                                        inputType="date"
                                        input={field.value}
                                        onChangeFunction={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            )}
        </div>
    );

    const renderLiveClassLink = () => (
        <div className="flex flex-row items-end gap-8">
            <FormField
                control={control}
                name="defaultLink"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Live Class Link</FormLabel>
                        <FormControl>
                            <MyInput
                                inputType="text"
                                inputPlaceholder="Add Link"
                                input={field.value}
                                labelStyle="font-thin"
                                onChangeFunction={field.onChange}
                                error={form.formState.errors.defaultLink?.message}
                                required
                                size="large"
                                {...field}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <SelectField
                label="Live Stream Platform"
                name="sessionPlatform"
                labelStyle="font-thin"
                options={STREAMING_OPTIONS}
                control={form.control}
                className="mt-[8px] w-56 font-thin"
            />
            <div className="flex h-full flex-col items-start justify-around gap-2">
                <div className="text-sm">Type of Live Class</div>
                <FormField
                    control={control}
                    name="sessionType"
                    render={({ field }) => (
                        <MyRadioButton
                            name="meetingType"
                            value={field.value}
                            onChange={field.onChange}
                            options={[
                                { label: 'Live', value: SessionType.LIVE },
                                { label: 'Pre Recorded', value: SessionType.PRE_RECORDED },
                            ]}
                            className="flex flex-row gap-4"
                        />
                    )}
                />
            </div>
        </div>
    );

    const renderStreamingChoices = () => (
        <div className="flex flex-col items-start gap-8">
            <div className="flex flex-row items-end gap-8">
                <div className="flex h-full flex-col items-start justify-around gap-2">
                    <div className="text-sm">Live Class Streaming</div>
                    <FormField
                        control={control}
                        name="streamingType"
                        render={({ field }) => (
                            <MyRadioButton
                                name="meetingType"
                                value={field.value}
                                onChange={field.onChange}
                                options={[
                                    { label: 'Embed in-app', value: SessionPlatform.EMBED_IN_APP },
                                    {
                                        label: 'Redirect to other platform',
                                        value: SessionPlatform.REDIRECT_TO_OTHER_PLATFORM,
                                    },
                                ]}
                                className="flex flex-row gap-4"
                            />
                        )}
                    />
                </div>
                <div className="flex h-full flex-row items-start gap-4">
                    <Controller
                        control={control}
                        name={`allowRewind`}
                        render={({ field }) => (
                            <label className="flex items-center gap-2">
                                <span className="text-sm">Allow rewind</span>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </label>
                        )}
                    />
                </div>
            </div>
            <div>
                <div className="flex h-full flex-row items-start gap-4">
                    <Controller
                        control={control}
                        name={`enableWaitingRoom`}
                        render={({ field }) => (
                            <label className="flex items-center gap-2">
                                <span className="text-sm">Enable Waiting Room</span>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </label>
                        )}
                    />
                </div>
            </div>
        </div>
    );

    const renderWaitingRoomAndUpload = () => {
        if (form.watch('enableWaitingRoom')) {
            return (
                <div className="flex flex-row items-start gap-4">
                    <SelectField
                        label="Open Waiting Room Before"
                        name="openWaitingRoomBefore"
                        labelStyle="font-thin"
                        options={WAITING_ROOM_OPTIONS}
                        control={form.control}
                        className="mt-[8px] w-56 font-thin"
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".png, .jpg, .jpeg"
                        className="hidden"
                    />
                    <input
                        type="file"
                        ref={musicFileInputRef}
                        onChange={handleMusicFileSelect}
                        accept=".mp3, .wav, .ogg, .m4a, .aac, .flac, .wma, .aiff, .au, .mid, .midi, .mp2, .mp3, .m4a, .aac, .flac, .wma, .aiff, .au, .mid, .midi"
                        className="hidden"
                    />
                    <div className="flex flex-col items-start gap-2">
                        <div className="flex flex-col gap-2">
                            <div>Thumbnail</div>
                            <MyButton
                                type="button"
                                buttonType="secondary"
                                onClick={handleUploadClick}
                                className="flex items-center gap-2"
                            >
                                <UploadSimple size={20} />
                                Upload
                            </MyButton>
                        </div>
                        {selectedFile && (
                            <div className="mt-2 flex flex-row items-center gap-2 rounded-md border border-primary-500 p-1 text-sm">
                                {selectedFile.name}{' '}
                                <X className="cursor-pointer" onClick={handleRemoveFile} />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-start gap-2">
                        <div className="flex flex-col gap-2">
                            <div>Background Score</div>
                            <MyButton
                                type="button"
                                buttonType="secondary"
                                onClick={handleMusicUploadClick}
                                className="flex items-center gap-2"
                            >
                                <UploadSimple size={20} />
                                Upload
                            </MyButton>
                        </div>
                        {selectedMusicFile && (
                            <div className="mt-2 flex flex-row items-center gap-2 rounded-md border border-primary-500 p-1 text-sm">
                                {selectedMusicFile.name}
                                <X className="cursor-pointer" onClick={handleRemoveMusicFile} />
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return <></>;
    };

    const renderRecurringSchedule = () =>
        meetingType === RecurringType.WEEKLY && (
            <>
                <div className="flex w-fit flex-col items-start justify-start gap-4">
                    <div className="flex flex-row items-center gap-2">
                        <Select
                            value={scheduleType || ''}
                            onValueChange={(value: 'everyday' | 'weekday') => {
                                setScheduleType(value);
                                if (value === 'everyday') {
                                    toggleEveryDay();
                                } else if (value === 'weekday') {
                                    toggleMonToFri();
                                }
                            }}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Select days" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="everyday">Every day</SelectItem>
                                <SelectItem value="weekday">Mon-Fri</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="w-[100px]">Start Time</div>
                        <div className="w-[200px]">Duration</div>
                        <div>Live Class link</div>
                    </div>
                </div>

                {recurringSchedule?.map((dayField, dayIndex) => {
                    const isSelect = watch(`recurringSchedule.${dayIndex}.isSelect`);
                    return (
                        <div key={dayField.day} className="flex flex-col">
                            <div className="flex flex-row gap-4">
                                <button
                                    type="button"
                                    className={`flex h-9 w-24 cursor-pointer items-center justify-center rounded-lg border px-2 py-1 text-center ${
                                        isSelect
                                            ? 'border-primary-500 bg-primary-100'
                                            : 'border-gray-300'
                                    }`}
                                    onClick={() =>
                                        form.setValue(
                                            `recurringSchedule.${dayIndex}.isSelect`,
                                            !isSelect
                                        )
                                    }
                                >
                                    {WEEK_DAYS.find((d) => d.label === dayField.day)?.value ??
                                        dayField.day}
                                </button>
                                <div className="flex flex-col gap-4 ">
                                    {isSelect &&
                                        dayField.sessions.map((session, sessionIndex) => (
                                            <div
                                                key={`${dayField.day}-${sessionIndex}`}
                                                className="flex flex-row items-center gap-2"
                                            >
                                                <SelectField
                                                    label=""
                                                    name={`recurringSchedule.${dayIndex}.sessions.${sessionIndex}.startTime`}
                                                    labelStyle="font-thin"
                                                    options={timeOptions?.map((option, index) => ({
                                                        value: option,
                                                        label: option,
                                                        _id: index,
                                                    }))}
                                                    control={form.control}
                                                    className="w-[100px] -translate-y-1 font-thin"
                                                />
                                                <div className="flex flex-row items-center gap-2">
                                                    <FormField
                                                        control={control}
                                                        name={`recurringSchedule.${dayIndex}.sessions.${sessionIndex}.durationHours`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <MyInput
                                                                        inputType="text"
                                                                        inputPlaceholder="00"
                                                                        input={field.value}
                                                                        onKeyPress={(e) => {
                                                                            if (
                                                                                !/[0-9]/.test(e.key)
                                                                            ) {
                                                                                e.preventDefault();
                                                                            }
                                                                        }}
                                                                        onChangeFunction={(e) => {
                                                                            let inputValue =
                                                                                e.target.value.replace(
                                                                                    /[^0-9]/g,
                                                                                    ''
                                                                                );
                                                                            const numValue =
                                                                                parseInt(
                                                                                    inputValue
                                                                                );
                                                                            if (numValue > 24) {
                                                                                inputValue = '24';
                                                                            }
                                                                            field.onChange(
                                                                                inputValue
                                                                            );
                                                                        }}
                                                                        className="w-11 p-2"
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <div>hrs :</div>
                                                    <FormField
                                                        control={control}
                                                        name={`recurringSchedule.${dayIndex}.sessions.${sessionIndex}.durationMinutes`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <MyInput
                                                                        inputType="text"
                                                                        inputPlaceholder="00"
                                                                        input={field.value}
                                                                        onKeyPress={(e) => {
                                                                            if (
                                                                                !/[0-9]/.test(e.key)
                                                                            ) {
                                                                                e.preventDefault();
                                                                            }
                                                                        }}
                                                                        onChangeFunction={(e) => {
                                                                            let inputValue =
                                                                                e.target.value.replace(
                                                                                    /[^0-9]/g,
                                                                                    ''
                                                                                );
                                                                            const numValue =
                                                                                parseInt(
                                                                                    inputValue
                                                                                );
                                                                            if (numValue > 59) {
                                                                                inputValue = '59';
                                                                            }
                                                                            field.onChange(
                                                                                inputValue
                                                                            );
                                                                        }}
                                                                        className="w-11 p-2"
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <div>mins</div>
                                                </div>
                                                <FormField
                                                    control={control}
                                                    name={`recurringSchedule.${dayIndex}.sessions.${sessionIndex}.link`}
                                                    render={({ field }) => (
                                                        <MyInput
                                                            inputType="text"
                                                            input={field.value}
                                                            placeholder="Live Link"
                                                            onChangeFunction={field.onChange}
                                                        />
                                                    )}
                                                />
                                                <Trash
                                                    className="m-0 size-6 cursor-pointer p-0 text-red-500"
                                                    onClick={() =>
                                                        removeSessionFromDay(dayIndex, sessionIndex)
                                                    }
                                                />
                                            </div>
                                        ))}
                                </div>
                            </div>
                            {isSelect && (
                                <MyButton
                                    type="button"
                                    buttonType="text"
                                    onClick={() => addSessionToDay(dayIndex)}
                                    className="m-0 p-0 text-start text-sm text-primary-500"
                                >
                                    + Add session
                                </MyButton>
                            )}
                        </div>
                    );
                })}
            </>
        );

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col gap-8">
                <div className="m-0 flex items-center justify-between p-0">
                    <h1>Live Session Information</h1>
                    <MyButton type="submit" scale="large" buttonType="primary">
                        Next
                    </MyButton>
                </div>

                <div className="flex flex-col gap-8">
                    {renderBasicInformation()}
                    {renderMeetingTypeSelection()}
                    {renderSessionTiming()}
                    {renderLiveClassLink()}
                    {renderStreamingChoices()}
                    {renderWaitingRoomAndUpload()}
                    {renderRecurringSchedule()}
                    <Separator />
                </div>
            </form>
        </FormProvider>
    );
}
