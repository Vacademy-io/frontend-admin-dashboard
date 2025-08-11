/* eslint-disable tailwindcss/no-custom-classname */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { MyButton } from '@/components/design-system/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@radix-ui/react-separator';
import { Controller, FieldErrors, FormProvider, useForm, useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { MyInput } from '@/components/design-system/input';
import SelectField from '@/components/design-system/select-field';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { useFilterDataForAssesment } from '@/routes/assessment/assessment-list/-utils.ts/useFiltersData';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import { MyRadioButton } from '@/components/design-system/radio';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
import { toast } from 'sonner';
import { XCircle } from 'phosphor-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useSessionDetailsStore } from '../../-store/useSessionDetailsStore';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { HOLISTIC_INSTITUTE_ID } from '@/constants/urls';
// Constants
const WAITING_ROOM_OPTIONS = [
    { value: '5', label: '5 minutes', _id: 1 },
    { value: '10', label: '10 minutes', _id: 2 },
    { value: '15', label: '15 minutes', _id: 3 },
    { value: '30', label: '30 minutes', _id: 4 },
    { value: '45', label: '45 minutes', _id: 5 },
];

const STREAMING_OPTIONS = [
    { value: StreamingPlatform.YOUTUBE, label: 'Youtube', _id: 1 },
    { value: StreamingPlatform.MEET, label: 'Google Meet', _id: 2 },
    { value: StreamingPlatform.ZOOM, label: 'Zoom', _id: 3 },
    { value: StreamingPlatform.OTHER, label: 'Other', _id: 4 },
];

export default function ScheduleStep1() {
    // Hooks and State
    const navigate = useNavigate();
    const { setSessionId, step1Data, setStep1Data } = useLiveSessionStore();
    const { sessionDetails } = useSessionDetailsStore();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedMusicFile, setSelectedMusicFile] = useState<File | null>(null);
    const musicFileInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [scheduleType, setScheduleType] = useState<
        'everyday' | 'weekday' | 'exceptSunday' | 'custom' | null
    >(null);

    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { SubjectFilterData } = useFilterDataForAssesment(instituteDetails);
    const { showForInstitutes } = useInstituteDetailsStore();

    // Form Setup
    const form = useForm<z.infer<typeof sessionFormSchema>>({
        resolver: zodResolver(sessionFormSchema),
        defaultValues: step1Data || {
            title: '',
            meetingType:
                sessionDetails?.schedule?.recurrence_type === 'weekly'
                    ? RecurringType.WEEKLY
                    : RecurringType.ONCE,
            recurringSchedule: WEEK_DAYS.map((day) => ({
                day: day.label,
                isSelect: false,
                sessions: [
                    {
                        startTime: '00:00',
                        durationHours: '',
                        durationMinutes: '',
                        link: '',
                        countAttendanceDaily: false,
                    },
                ],
            })),
            subject: 'none',
            timeZone: '(GMT 5:30) India Standard Time (Asia/Kolkata)',
            events: '1',
            openWaitingRoomBefore: '15',
            sessionType: SessionType.LIVE,
            streamingType: sessionDetails?.schedule?.session_streaming_service_type
                ? sessionDetails?.schedule?.session_streaming_service_type
                : '',
            allowRewind: false,
            allowPause: false,
            enableWaitingRoom: false,
            sessionPlatform: StreamingPlatform.OTHER,
            durationMinutes: '00',
            durationHours: '00',
        },
        mode: 'onChange',
    });
    // Auto-update "Select days" dropdown when days are toggled manually
    const recurringSchedule = useWatch({
        control: form.control,
        name: 'recurringSchedule',
    });
    useEffect(() => {
        if (!recurringSchedule) return;
        const selectedDays = recurringSchedule.filter((day) => day.isSelect).map((day) => day.day);
        const allDays = WEEK_DAYS.map((d) => d.label);
        const weekdays = allDays.slice(0, 5);
        const monToSat = allDays.slice(0, 6);
        let newType: 'everyday' | 'weekday' | 'exceptSunday' | 'custom';
        if (selectedDays.length === allDays.length) {
            newType = 'everyday';
        } else if (monToSat.every((day) => selectedDays.includes(day))) {
            newType = 'exceptSunday';
        } else if (weekdays.every((day) => selectedDays.includes(day))) {
            newType = 'weekday';
        } else {
            newType = 'custom';
        }
        if (scheduleType !== newType) {
            setScheduleType(newType);
        }
    }, [recurringSchedule]);
    // Auto-fill link, duration, and start time for newly selected days
    const prevSelectedDaysRef = useRef<string[]>([]);
    useEffect(() => {
        if (!recurringSchedule) return;
        const selectedDays = recurringSchedule.filter((d) => d.isSelect).map((d) => d.day);
        const newDays = selectedDays.filter((d) => !prevSelectedDaysRef.current.includes(d));
        if (newDays.length) {
            const defaultStartDateTime = form.getValues('startTime') || '';
            const startTimeVal = defaultStartDateTime.split('T')[1] || '';
            const dh = form.getValues('durationHours');
            const dm = form.getValues('durationMinutes');
            const lnk = form.getValues('defaultLink');
            newDays.forEach((dayLabel) => {
                const idx = recurringSchedule.findIndex((d) => d.day === dayLabel);
                if (idx !== -1) {
                    form.setValue(`recurringSchedule.${idx}.sessions.0.startTime`, startTimeVal);
                    form.setValue(`recurringSchedule.${idx}.sessions.0.durationHours`, dh);
                    form.setValue(`recurringSchedule.${idx}.sessions.0.durationMinutes`, dm);
                    form.setValue(`recurringSchedule.${idx}.sessions.0.link`, lnk);
                }
            });
        }
        prevSelectedDaysRef.current = selectedDays;
    }, [recurringSchedule]);

    useEffect(() => {
        const durationHours = form.watch('durationHours');
        const durationMinutes = form.watch('durationMinutes');
        const link = form.watch('defaultLink');
        const defaultStartDateTime = form.watch('startTime') || '';
        const startTimeValue = defaultStartDateTime.split('T')[1] || '';
        const updatedSchedule = form.getValues('recurringSchedule')?.map((day) => {
            if (!day.isSelect) return day;
            return {
                ...day,
                sessions: day.sessions.map((session, idx) =>
                    idx === 0
                        ? {
                              ...session,
                              startTime: startTimeValue,
                              durationHours,
                              durationMinutes,
                              link,
                          }
                        : session
                ),
            };
        });
        form.setValue('recurringSchedule', updatedSchedule);
    }, [
        form.watch('durationHours'),
        form.watch('durationMinutes'),
        form.watch('defaultLink'),
        form.watch('startTime'),
    ]);

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'defaultLink' && value.defaultLink) {
                const link = value.defaultLink.toLowerCase();

                if (link.includes('youtube.com') || link.includes('youtu.be')) {
                    form.setValue('sessionPlatform', StreamingPlatform.YOUTUBE);
                } else if (link.includes('meet.google.com')) {
                    form.setValue('sessionPlatform', StreamingPlatform.MEET);
                } else if (link.includes('zoom.us')) {
                    form.setValue('sessionPlatform', StreamingPlatform.ZOOM);
                } else {
                    form.setValue('sessionPlatform', StreamingPlatform.OTHER);
                    form.setValue('streamingType', SessionPlatform.REDIRECT_TO_OTHER_PLATFORM);
                }
            }
        });
    }, [form.watch('defaultLink')]);

    useEffect(() => {
        if (sessionDetails) {
            form.setValue('id', sessionDetails.schedule.session_id);
            form.setValue('title', sessionDetails.schedule.title);
            form.setValue('subject', sessionDetails.schedule.subject ?? 'none');
            form.setValue('description', sessionDetails.schedule.description_html ?? '');
            form.setValue('startTime', sessionDetails.schedule.start_time);
            form.setValue('defaultLink', sessionDetails.schedule.default_meet_link ?? '');
            form.setValue(
                'sessionPlatform',
                sessionDetails.schedule.link_type ?? StreamingPlatform.YOUTUBE
            );
            form.setValue(
                'streamingType',
                sessionDetails.schedule.session_streaming_service_type ?? 'embed'
            );

            if (sessionDetails.schedule.start_time && sessionDetails.schedule.last_entry_time) {
                const start = new Date(sessionDetails.schedule.start_time);
                const end = new Date(sessionDetails.schedule.last_entry_time);
                if (end > start) {
                    const durationMs = end.getTime() - start.getTime();
                    const hours = Math.floor(durationMs / 3600000);
                    const minutes = Math.floor((durationMs % 3600000) / 60000);
                    form.setValue('durationHours', String(hours));
                    form.setValue('durationMinutes', String(minutes));
                }
            }
            if (sessionDetails?.schedule?.recurrence_type === 'weekly') {
                form.setValue('meetingType', RecurringType.WEEKLY);
                form.setValue('endDate', sessionDetails.schedule.session_end_date);
                const transformedSchedules = WEEK_DAYS.map((day) => {
                    const matchingSchedule = sessionDetails.schedule.added_schedules.find(
                        (schedule) => schedule.day.toLowerCase() === day.label.toLowerCase()
                    );
                    return {
                        day: day.label,
                        isSelect: !!matchingSchedule,
                        sessions: matchingSchedule
                            ? [
                                  {
                                      id: matchingSchedule.id,
                                      startTime: matchingSchedule.startTime,
                                      durationHours: String(
                                          Math.floor(parseInt(matchingSchedule.duration) / 60)
                                      ),
                                      durationMinutes: String(
                                          parseInt(matchingSchedule.duration) % 60
                                      ),
                                      link: matchingSchedule.link || '',
                                  },
                              ]
                            : [
                                  {
                                      startTime: '00:00',
                                      durationHours: '',
                                      durationMinutes: '',
                                      link: '',
                                  },
                              ],
                    };
                });
                console.log('transformedSchedules ', transformedSchedules);
                form.setValue('recurringSchedule', transformedSchedules);
            }
            if (sessionDetails.schedule.waiting_room_time) {
                form.setValue('enableWaitingRoom', true);
                form.setValue(
                    'openWaitingRoomBefore',
                    String(sessionDetails.schedule.waiting_room_time)
                );
            }
            // Populate playback settings toggles
            form.setValue('allowRewind', sessionDetails.schedule.allow_rewind ?? false);
            form.setValue('allowPause', sessionDetails.schedule.allow_play_pause ?? false);
        }
    }, [sessionDetails]);

    useEffect(() => {
        if (step1Data) {
            form.reset(step1Data);
        }
    }, [step1Data]);

    const { control, watch } = form;
    // Watch the selected streaming platform to conditionally render/disable options
    const sessionPlatformWatch = useWatch({ control, name: 'sessionPlatform' });
    const defaultLinkWatch = useWatch({ control, name: 'defaultLink' });

    const detectedPlatform = useMemo(() => {
        const link = (defaultLinkWatch || '').trim();
        const youtubeRegex = /^(https?:\/\/(www\.)?youtube\.com\/(watch\?v=|@.+\/live))/i;
        const meetRegex = /^(https?:\/\/meet\.google\.com\/(new|[a-zA-Z0-9-]+))/i;
        const zoomRegex = /^(https?:\/\/([\w.-]+\.)?zoom\.us\/)/i;
        if (youtubeRegex.test(link)) return 'youtube';
        if (meetRegex.test(link)) return 'meet';
        if (zoomRegex.test(link)) return 'zoom';
        return 'other';
    }, [defaultLinkWatch]);

    // Effect: set form values based on detected platform
    useEffect(() => {
        switch (detectedPlatform) {
            case 'youtube': {
                form.setValue('sessionPlatform', StreamingPlatform.YOUTUBE);
                form.setValue('streamingType', SessionPlatform.EMBED_IN_APP);
                break;
            }
            case 'meet': {
                form.setValue('sessionPlatform', StreamingPlatform.MEET);
                form.setValue('sessionType', SessionType.LIVE);
                form.setValue('streamingType', SessionPlatform.REDIRECT_TO_OTHER_PLATFORM);
                break;
            }
            case 'zoom': {
                form.setValue('sessionPlatform', StreamingPlatform.ZOOM);
                form.setValue('streamingType', SessionPlatform.REDIRECT_TO_OTHER_PLATFORM);
                break;
            }
            case 'other': {
                form.setValue('sessionPlatform', StreamingPlatform.OTHER);
                break;
            }
        }
    }, [detectedPlatform]);

    const isMeetPlatform = sessionPlatformWatch === StreamingPlatform.MEET;
    const isZoomPlatform = sessionPlatformWatch === StreamingPlatform.ZOOM;

    // Disabled options logic based on current platform selection
    const disabledLiveClassOptions = useMemo(() => {
        if (isMeetPlatform) return [SessionType.PRE_RECORDED];
        return [];
    }, [isMeetPlatform]);

    const sessionTypeWatch = useWatch({ control, name: 'sessionType' });

    const disabledStreamingOptions = useMemo(() => {
        if (isMeetPlatform) {
            return [SessionPlatform.EMBED_IN_APP];
        }
        if (isZoomPlatform && sessionTypeWatch !== SessionType.PRE_RECORDED) {
            return [SessionPlatform.EMBED_IN_APP];
        }
        return [];
    }, [isMeetPlatform, isZoomPlatform, sessionTypeWatch]);

    // Map detectedPlatform string to enum value for comparison
    const detectedEnumPlatform = useMemo(() => {
        switch (detectedPlatform) {
            case 'youtube':
                return StreamingPlatform.YOUTUBE;
            case 'meet':
                return StreamingPlatform.MEET;
            case 'zoom':
                return StreamingPlatform.ZOOM;
            default:
                return StreamingPlatform.OTHER;
        }
    }, [detectedPlatform]);

    const handleSessionPlatformChange = useCallback(
        (value: string) => {
            // If user picks a platform that doesn't match the one inferred from link, clear the link to prevent mismatch
            if (defaultLinkWatch && value !== detectedEnumPlatform) {
                form.setValue('defaultLink', '');
                // Clear dependent selections to avoid inconsistencies
                form.setValue('sessionType', '');
                form.setValue('streamingType', '');
            }
        },
        [defaultLinkWatch, detectedEnumPlatform]
    );

    // When Google Meet is selected, enforce Live session type and Redirect streaming type
    useEffect(() => {
        if (isMeetPlatform) {
            // Enforce only if not already selected to avoid unnecessary re-renders
            if (form.getValues('sessionType') !== SessionType.LIVE) {
                form.setValue('sessionType', SessionType.LIVE);
            }
            if (form.getValues('streamingType') !== SessionPlatform.REDIRECT_TO_OTHER_PLATFORM) {
                form.setValue('streamingType', SessionPlatform.REDIRECT_TO_OTHER_PLATFORM);
            }
        }
    }, [isMeetPlatform]);
    const meetingType = useWatch({ control, name: 'meetingType' });

    // Auth and Institute Data
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = (tokenData && Object.keys(tokenData.authorities)[0]) || '';

    // Event Handlers
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        } else {
            console.log('hgere ', file);
            alert('Please upload a PNG file');
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

        const transformedSchedules =
            sessionDetails?.schedule?.added_schedules?.map((schedule) => ({
                id: schedule.id,
                day: schedule.day.toLowerCase() as
                    | 'monday'
                    | 'tuesday'
                    | 'wednesday'
                    | 'thursday'
                    | 'friday'
                    | 'saturday'
                    | 'sunday',
                isSelect: true,
                sessions: [
                    {
                        id: schedule.id,
                        startTime: schedule.startTime,
                        durationHours: String(Math.floor(parseInt(schedule.duration) / 60)),
                        durationMinutes: String(parseInt(schedule.duration) % 60),
                        link: schedule.link || '',
                    },
                ],
            })) || [];
        const body = transformFormToDTOStep1(
            data,
            INSTITUTE_ID,
            transformedSchedules,
            musicFileId,
            thumbnailFileId,
            instituteDetails?.institute_logo_file_id
        );
        try {
            const response = await createLiveSessionStep1(body);
            setSessionId(response.id);
            setStep1Data(data);
            console.log(response.id);
            navigate({ to: '/study-library/live-session/schedule/step2' });
        } catch (error) {
            console.error(error);
        }
    };

    const onError = (errors: FieldErrors<typeof sessionFormSchema>) => {
        console.log('Validation errors:', errors);
        // Show toast for each field with a red error icon
        Object.values(errors).forEach((error) => {
            if (error?.message) {
                toast.error(error.message, {
                    icon: <XCircle size={20} className="text-red-500" />,
                });
            }
        });
    };

    // Recurring Schedule Handlers
    const addSessionToDay = (dayIndex: number) => {
        const schedule = form.getValues('recurringSchedule');
        const daySchedule = schedule?.[dayIndex];
        if (!daySchedule) return;
        // Determine session to copy:
        const defaultSession = {
            startTime: '',
            durationHours: '',
            durationMinutes: '',
            link: '',
            countAttendanceDaily: false,
        };
        // Pick source session (with optional props)
        const rawSession =
            (dayIndex === 0
                ? daySchedule.sessions[0]
                : (schedule[0]?.sessions || [])[daySchedule.sessions.length]) ||
            (dayIndex === 0 ? defaultSession : schedule[0]?.sessions[0]) ||
            defaultSession;
        // Normalize fields to strings
        const sessionToCopy = {
            startTime: rawSession.startTime || '',
            durationHours: rawSession.durationHours || '',
            durationMinutes: rawSession.durationMinutes || '',
            link: rawSession.link || '',
            countAttendanceDaily: rawSession.countAttendanceDaily || false,
        };
        const updatedSessions = [...daySchedule.sessions, sessionToCopy];
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

            const dh = form.getValues('durationHours');
            const dm = form.getValues('durationMinutes');
            const l = form.getValues('defaultLink');

            console.log(dh, dm, l);

            if (isSelecting && (!day.sessions || day.sessions.length === 0)) {
                form.setValue(`recurringSchedule.${index}.sessions`, [
                    {
                        startTime: '',
                        durationHours: dh,
                        durationMinutes: dm,
                        link: l,
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

            const dh = form.getValues('durationHours');
            const dm = form.getValues('durationMinutes');
            const l = form.getValues('defaultLink');

            if (isWeekday && (!day.sessions || day.sessions.length === 0)) {
                form.setValue(`recurringSchedule.${index}.sessions`, [
                    {
                        startTime: '',
                        durationHours: dh,
                        durationMinutes: dm,
                        link: l,
                    },
                ]);
            }
        });
    };
    const toggleMonToSat = () => {
        const currentSchedule = form.getValues('recurringSchedule');
        if (!currentSchedule) return;

        currentSchedule.forEach((day, index) => {
            const weekDay = WEEK_DAYS.find((d) => d.label === day.day);
            const isWeekday = weekDay?.value
                ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(weekDay.value)
                : false;
            form.setValue(`recurringSchedule.${index}.isSelect`, isWeekday);

            const dh = form.getValues('durationHours');
            const dm = form.getValues('durationMinutes');
            const l = form.getValues('defaultLink');

            if (isWeekday && (!day.sessions || day.sessions.length === 0)) {
                form.setValue(`recurringSchedule.${index}.sessions`, [
                    {
                        startTime: '',
                        durationHours: dh,
                        durationMinutes: dm,
                        link: l,
                    },
                ]);
            }
        });
    };
    const toggleCustom = () => {
        const currentSchedule = form.getValues('recurringSchedule');
        if (!currentSchedule) return;

        currentSchedule.forEach((day, index) => {
            const weekDay = WEEK_DAYS.find((d) => d.label === day.day);
            const isWeekday = weekDay?.value ? [''].includes(weekDay.value) : false;
            form.setValue(`recurringSchedule.${index}.isSelect`, isWeekday);

            const dh = form.getValues('durationHours');
            const dm = form.getValues('durationMinutes');
            const l = form.getValues('defaultLink');

            if (isWeekday && (!day.sessions || day.sessions.length === 0)) {
                form.setValue(`recurringSchedule.${index}.sessions`, [
                    {
                        startTime: '',
                        durationHours: dh,
                        durationMinutes: dm,
                        link: l,
                    },
                ]);
            }
        });
    };

    // *** NEW: helper to propagate a field's value across all selected recurring days ***
    const propagateToOtherDays = (
        fieldKey: 'startTime' | 'link',
        value: string,
        sourceDayIndex: number,
        sessionIndex: number
    ) => {
        // Only auto‐propagate for the first session (index 0)
        if (sessionIndex !== 0) return;
        const schedule = form.getValues('recurringSchedule');
        if (!schedule) return;

        schedule.forEach((day, idx) => {
            if (idx !== sourceDayIndex && day.isSelect) {
                // Ensure the target session exists
                if (day.sessions[sessionIndex]) {
                    form.setValue(
                        `recurringSchedule.${idx}.sessions.${sessionIndex}.${fieldKey}` as any,
                        value,
                        {
                            shouldDirty: true,
                        }
                    );
                }
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
                {!showForInstitutes([HOLISTIC_INSTITUTE_ID]) && (
                    <SelectField
                        label="Subject"
                        name="subject"
                        labelStyle="text-sm font-medium"
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
                )}
            </div>

            <div className="flex h-[280px] flex-col gap-6">
                <div className="-mb-5 flex flex-col gap-1">
                    <h1 className="text-sm font-medium">Description</h1>
                    <p className="text-xs font-normal text-neutral-500">
                        (Provide a brief overview of your live class. You can include text, emojis,
                        images, or posters to give participants a quick idea of what the session is
                        about)
                    </p>
                </div>
                <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <RichTextEditor
                                    onChange={field.onChange}
                                    value={field.value || ''}
                                    onBlur={field.onBlur}
                                    minHeight={200}
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
                            <FormLabel className="text-sm font-medium">
                                Start Date & Time
                                <span className="text-danger-600">*</span>
                            </FormLabel>
                            <FormControl>
                                <MyInput
                                    required
                                    inputType="datetime-local"
                                    input={field.value}
                                    onChangeFunction={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        field.onChange(e);
                                        const dateTime = e.target.value;
                                        const timeValue = dateTime.split('T')[1] || '';
                                        const schedule = form.getValues('recurringSchedule') || [];
                                        schedule.forEach((day, idx) => {
                                            if (day.isSelect) {
                                                form.setValue(
                                                    `recurringSchedule.${idx}.sessions.0.startTime`,
                                                    timeValue
                                                );
                                            }
                                        });
                                    }}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <div>
                    <FormLabel className="text-sm font-medium">
                        Duration<span className="text-danger-600">*</span>
                    </FormLabel>
                    <div className="mt-2 flex flex-row items-center gap-2">
                        <FormField
                            control={control}
                            name="durationHours"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyInput
                                            required
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
                                            required
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
                                <FormLabel className="text-sm font-medium">End Date</FormLabel>
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
                        <FormLabel className="text-sm font-medium">
                            Live Class Link
                            <span className="text-danger-600">*</span>
                        </FormLabel>
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
                labelStyle="text-sm font-medium"
                options={STREAMING_OPTIONS}
                control={form.control}
                className="mt-[8px] w-56 font-thin"
                onSelect={handleSessionPlatformChange}
            />
            <div className="flex h-full flex-col items-start justify-around gap-2">
                <div className="text-sm font-medium">Type of Live Class</div>
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
                            disabledOptions={disabledLiveClassOptions}
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
                    <div className="text-sm font-medium">
                        Live Streaming Platform
                        <span className="ml-1 text-xs font-normal text-neutral-500">
                            (Do you want the students to view the class in the learner app, or do
                            you want to redirect them to the app that is hosting the live session?)
                        </span>
                    </div>
                    <FormField
                        control={control}
                        name="streamingType"
                        render={({ field }) => (
                            <MyRadioButton
                                name="streamingType"
                                value={field.value}
                                onChange={field.onChange}
                                options={[
                                    {
                                        label: 'Embed in-app',
                                        value: SessionPlatform.EMBED_IN_APP,
                                    },
                                    {
                                        label:
                                            sessionPlatformWatch === StreamingPlatform.YOUTUBE
                                                ? 'Redirect to YouTube'
                                                : sessionPlatformWatch === StreamingPlatform.MEET
                                                  ? 'Redirect to Google Meet'
                                                  : sessionPlatformWatch === StreamingPlatform.ZOOM
                                                    ? 'Redirect to Zoom'
                                                    : 'Redirect to other platform',
                                        value: SessionPlatform.REDIRECT_TO_OTHER_PLATFORM,
                                    },
                                ]}
                                disabledOptions={disabledStreamingOptions}
                                className="flex flex-row gap-4"
                            />
                        )}
                    />
                </div>
            </div>
            {/* Lock video playback settings */}
            <div className="flex flex-col items-start gap-4">
                <h4 className="text-sm font-semibold">Lock video playback settings</h4>
                <div className="flex flex-row items-center gap-4">
                    <Controller
                        control={control}
                        name="allowRewind"
                        render={({ field }) => (
                            <label className="flex items-center gap-2">
                                <span className="text-sm">Allow rewind</span>
                                <Switch
                                    disabled={
                                        watch('streamingType') !== SessionPlatform.EMBED_IN_APP
                                    }
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </label>
                        )}
                    />
                    <Controller
                        control={control}
                        name="allowPause"
                        render={({ field }) => (
                            <label className="flex items-center gap-2">
                                <span className="text-sm">Allow play pause</span>
                                <Switch
                                    disabled={
                                        watch('streamingType') !== SessionPlatform.EMBED_IN_APP
                                    }
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
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
                        labelStyle="text-sm font-medium"
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
                            <div className="mt-2 flex h-fit max-w-[140px] flex-row items-center justify-between gap-2 rounded-md border border-primary-500 p-1 text-sm">
                                <span className="max-w-[120px] truncate">{selectedFile.name}</span>
                                <X className="shrink-0 cursor-pointer" onClick={handleRemoveFile} />
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
                            <div className="mt-2 flex h-fit max-w-[140px] flex-row items-center justify-between gap-2 rounded-md border border-primary-500 p-1 text-sm">
                                <span className="max-w-[120px] truncate">
                                    {selectedMusicFile.name}
                                </span>

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
                {/* Recurring Schedule header with days selector */}
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Recurring Schedule</h2>
                    <Select
                        value={scheduleType || ''}
                        onValueChange={(
                            value: 'everyday' | 'weekday' | 'exceptSunday' | 'custom'
                        ) => {
                            setScheduleType(value);
                            if (value === 'everyday') toggleEveryDay();
                            else if (value === 'weekday') toggleMonToFri();
                            else if (value === 'exceptSunday') toggleMonToSat();
                            else if (value === 'custom') toggleCustom();
                        }}
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="everyday">Every day</SelectItem>
                            <SelectItem value="weekday">Mon-Fri</SelectItem>
                            <SelectItem value="exceptSunday">Mon-Sat</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Recurring schedule table */}
                <div className="overflow-auto">
                    <table className="min-w-full table-auto border-separate border-spacing-y-2">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-2 py-1 text-left">Day</th>
                                <th className="border px-2 py-1 text-left">Start Time</th>
                                <th className="border px-2 py-1 text-left">Duration</th>
                                <th className="border px-2 py-1 text-left">Live Class Link</th>
                                <th className="border px-2 py-1 text-center">
                                    Count attendance daily
                                </th>
                                <th className="border px-2 py-1 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recurringSchedule?.map((dayField, dayIndex) => {
                                const isSelect = watch(`recurringSchedule.${dayIndex}.isSelect`);
                                // for each day, render a header row, its sessions, then a separator
                                return [
                                    <tr key={`${dayField.day}-header`} className="bg-primary-50">
                                        <td colSpan={6} className="px-2 py-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-primary-800 font-semibold uppercase">
                                                    {WEEK_DAYS.find((d) => d.label === dayField.day)
                                                        ?.value ?? dayField.day}
                                                </span>
                                                {isSelect && (
                                                    <MyButton
                                                        type="button"
                                                        buttonType="text"
                                                        onClick={() => addSessionToDay(dayIndex)}
                                                        className="text-sm text-primary-500"
                                                    >
                                                        + Add session
                                                    </MyButton>
                                                )}
                                            </div>
                                        </td>
                                    </tr>,
                                    ...dayField.sessions.map((session, sessionIndex) => (
                                        <tr key={`${dayField.day}-${sessionIndex}`}>
                                            <td className="border px-2 py-1 align-top">
                                                <button
                                                    type="button"
                                                    className={`rounded px-2 py-1 ${
                                                        isSelect
                                                            ? 'text-primary-700 bg-primary-100'
                                                            : 'bg-transparent text-gray-700'
                                                    }`}
                                                    onClick={() =>
                                                        form.setValue(
                                                            `recurringSchedule.${dayIndex}.isSelect`,
                                                            !isSelect
                                                        )
                                                    }
                                                >
                                                    {WEEK_DAYS.find((d) => d.label === dayField.day)
                                                        ?.value ?? dayField.day}
                                                </button>
                                            </td>

                                            <td className="border px-2 py-1 align-top">
                                                {isSelect ? (
                                                    <SelectField
                                                        label=""
                                                        name={`recurringSchedule.${dayIndex}.sessions.${sessionIndex}.startTime`}
                                                        labelStyle="font-thin"
                                                        options={timeOptions?.map(
                                                            (option, idx) => ({
                                                                value: option,
                                                                label: option,
                                                                _id: idx,
                                                            })
                                                        )}
                                                        control={form.control}
                                                        className="w-[100px] -translate-y-1 font-thin"
                                                        onSelect={(value) =>
                                                            propagateToOtherDays(
                                                                'startTime',
                                                                value,
                                                                dayIndex,
                                                                sessionIndex
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>

                                            <td className="border px-2 py-1 align-top">
                                                {isSelect ? (
                                                    <div className="flex items-center gap-1">
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
                                                                                    !/[0-9]/.test(
                                                                                        e.key
                                                                                    )
                                                                                )
                                                                                    e.preventDefault();
                                                                            }}
                                                                            onChangeFunction={(
                                                                                e
                                                                            ) => {
                                                                                let val =
                                                                                    e.target.value.replace(
                                                                                        /[^0-9]/g,
                                                                                        ''
                                                                                    );
                                                                                const num =
                                                                                    parseInt(val);
                                                                                if (num > 24)
                                                                                    val = '24';
                                                                                field.onChange(val);
                                                                            }}
                                                                            className="w-11 p-2"
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <span>hrs</span>
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
                                                                                    !/[0-9]/.test(
                                                                                        e.key
                                                                                    )
                                                                                )
                                                                                    e.preventDefault();
                                                                            }}
                                                                            onChangeFunction={(
                                                                                e
                                                                            ) => {
                                                                                let val =
                                                                                    e.target.value.replace(
                                                                                        /[^0-9]/g,
                                                                                        ''
                                                                                    );
                                                                                const num =
                                                                                    parseInt(val);
                                                                                if (num > 59)
                                                                                    val = '59';
                                                                                field.onChange(val);
                                                                            }}
                                                                            className="w-11 p-2"
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <span>mins</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>

                                            <td className="border px-2 py-1 align-top">
                                                {isSelect ? (
                                                    <FormField
                                                        control={control}
                                                        name={`recurringSchedule.${dayIndex}.sessions.${sessionIndex}.link`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <MyInput
                                                                        inputType="text"
                                                                        inputPlaceholder="Live Link"
                                                                        input={field.value}
                                                                        onChangeFunction={(e) => {
                                                                            field.onChange(e);
                                                                            propagateToOtherDays(
                                                                                'link',
                                                                                e.target.value,
                                                                                dayIndex,
                                                                                sessionIndex
                                                                            );
                                                                        }}
                                                                        size="small"
                                                                        {...field}
                                                                        onBlur={(e) => {
                                                                            const url =
                                                                                e.target.value;
                                                                            field.onBlur();
                                                                            try {
                                                                                new URL(url);
                                                                            } catch {
                                                                                if (url) {
                                                                                    toast.error(
                                                                                        'Invalid URL',
                                                                                        {
                                                                                            icon: (
                                                                                                <XCircle
                                                                                                    size={
                                                                                                        20
                                                                                                    }
                                                                                                    className="text-red-500"
                                                                                                />
                                                                                            ),
                                                                                        }
                                                                                    );
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-danger-600">
                                                                    {
                                                                        form.formState.errors
                                                                            .recurringSchedule?.[
                                                                            dayIndex
                                                                        ]?.sessions?.[sessionIndex]
                                                                            ?.link?.message
                                                                    }
                                                                </FormMessage>
                                                            </FormItem>
                                                        )}
                                                    />
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="border px-2 py-1 text-center align-top">
                                                {isSelect && sessionIndex === 0 ? (
                                                    <Controller
                                                        control={control}
                                                        name={`recurringSchedule.${dayIndex}.sessions.${sessionIndex}.countAttendanceDaily`}
                                                        render={({ field }) => (
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        )}
                                                    />
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="border px-2 py-1 text-center align-top">
                                                {isSelect && sessionIndex > 0 ? (
                                                    <Trash
                                                        className="cursor-pointer text-red-500"
                                                        onClick={() =>
                                                            removeSessionFromDay(
                                                                dayIndex,
                                                                sessionIndex
                                                            )
                                                        }
                                                    />
                                                ) : null}
                                            </td>
                                        </tr>
                                    )),
                                    <tr key={`${dayField.day}-separator`}>
                                        <td colSpan={6} className="p-0">
                                            <hr className="border-t border-gray-300" />
                                        </td>
                                    </tr>,
                                ];
                            })}
                        </tbody>
                    </table>
                </div>
            </>
        );

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col gap-8">
                <div className="sticky top-[72px] z-[9] m-0 flex items-center justify-between border-b border-neutral-200 bg-white p-0 py-2">
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
