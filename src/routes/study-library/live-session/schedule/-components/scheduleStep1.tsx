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
import { Trash, UploadSimple, X, Plus } from 'phosphor-react';
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
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toZonedTime, format as formatTZ } from 'date-fns-tz';
import { TIMEZONE_OPTIONS, STREAMING_OPTIONS, WAITING_ROOM_OPTIONS } from '../-constants/options';

export default function ScheduleStep1() {
    // Hooks and State
    const navigate = useNavigate();
    const { setSessionId, step1Data, setStep1Data, sessionId } = useLiveSessionStore();
    const { sessionDetails } = useSessionDetailsStore();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedMusicFile, setSelectedMusicFile] = useState<File | null>(null);
    const musicFileInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // State for session thumbnails - Map<"dayIndex-sessionIndex", File>
    const [sessionThumbnails, setSessionThumbnails] = useState<Map<string, File>>(new Map());
    const [scheduleType, setScheduleType] = useState<
        'everyday' | 'weekday' | 'exceptSunday' | 'custom' | null
    >(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { SubjectFilterData } = useFilterDataForAssesment(instituteDetails);
    const { showForInstitutes } = useInstituteDetailsStore();

    // Helper function to get browser's timezone
    const getBrowserTimezone = (): string => {
        try {
            const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const timezoneMapping: Record<string, string> = {
                'Asia/Calcutta': 'Asia/Kolkata', // Old name for Kolkata
            };
            const mappedTimezone = timezoneMapping[browserTimezone] || browserTimezone;

            // Check if the detected/mapped timezone is in our available options
            const isValidTimezone = TIMEZONE_OPTIONS.some(
                (option) => option.value === mappedTimezone
            );
            if (isValidTimezone) {
                return mappedTimezone;
            } else {
                return 'Asia/Kolkata';
            }
        } catch (error) {
            console.error('Error detecting browser timezone:', error);
            return 'Asia/Kolkata';
        }
    };

    // Helper function to get current time in selected timezone
    const getCurrentTimeInTimezone = (timezone: string): string => {
        try {
            const now = new Date();
            const zonedTime = toZonedTime(now, timezone);
            return format(zonedTime, "yyyy-MM-dd'T'HH:mm");
        } catch (error) {
            console.error('Error getting current time in timezone:', error);
            return format(new Date(), "yyyy-MM-dd'T'HH:mm");
        }
    };

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
                        thumbnailFileId: '',
                    },
                ],
            })),
            subject: 'none',
            timeZone: getBrowserTimezone(),
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
                    form.setValue(`recurringSchedule.${idx}.sessions.0.thumbnailFileId`, '');
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

    // Effect to update start time when timezone changes
    useEffect(() => {
        const selectedTimezone = form.watch('timeZone');
        const defaultTime = getCurrentTimeInTimezone(selectedTimezone);
        form.setValue('startTime', defaultTime);
    }, [form.watch('timeZone')]);

    useEffect(() => {
        if (sessionDetails) {
            form.setValue('id', sessionDetails.schedule.session_id);
            form.setValue('title', sessionDetails.schedule.title);
            form.setValue('subject', sessionDetails.schedule.subject ?? 'none');
            form.setValue('description', sessionDetails.schedule.description_html ?? '');

            // Set timezone and current time for editing mode
            const savedTimezone = (sessionDetails.schedule as any).time_zone || 'Asia/Kolkata';
            form.setValue('timeZone', savedTimezone);

            // Set current time in the saved timezone
            const currentTime = getCurrentTimeInTimezone(savedTimezone);
            form.setValue('startTime', currentTime);

            form.setValue('defaultLink', sessionDetails.schedule.default_meet_link ?? '');
            form.setValue(
                'sessionPlatform',
                sessionDetails.schedule.link_type ?? StreamingPlatform.YOUTUBE
            );
            form.setValue(
                'streamingType',
                sessionDetails.schedule.session_streaming_service_type ?? 'embed'
            );

            // Set timezone if available, otherwise keep default
            if ((sessionDetails.schedule as any).time_zone) {
                form.setValue('timeZone', (sessionDetails.schedule as any).time_zone);
            }

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
                                      thumbnailFileId: matchingSchedule.thumbnailFileId || '',
                                  },
                              ]
                            : [
                                  {
                                      startTime: '00:00',
                                      durationHours: '',
                                      durationMinutes: '',
                                      link: '',
                                      thumbnailFileId: '',
                                  },
                              ],
                    };
                });
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

    // Set the form's id field when sessionId exists (coming back from step 2)
    useEffect(() => {
        if (sessionId && !sessionDetails) {
            form.setValue('id', sessionId);
        }
    }, [sessionId, sessionDetails]);

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

    // Session thumbnail handlers
    const handleSessionThumbnailSelect = (
        dayIndex: number,
        sessionIndex: number,
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            const key = `${dayIndex}-${sessionIndex}`;
            setSessionThumbnails((prev) => {
                const newMap = new Map(prev);
                newMap.set(key, file);
                return newMap;
            });
        }
    };

    const handleSessionThumbnailRemove = (dayIndex: number, sessionIndex: number) => {
        const key = `${dayIndex}-${sessionIndex}`;
        setSessionThumbnails((prev) => {
            const newMap = new Map(prev);
            newMap.delete(key);
            return newMap;
        });
        // Also clear the form field
        form.setValue(`recurringSchedule.${dayIndex}.sessions.${sessionIndex}.thumbnailFileId`, '');
    };

    const getSessionThumbnail = (dayIndex: number, sessionIndex: number): File | null => {
        const key = `${dayIndex}-${sessionIndex}`;
        return sessionThumbnails.get(key) || null;
    };

    const onSubmit = async (data: z.infer<typeof sessionFormSchema>) => {
        if (isSubmitting) return; // Prevent multiple submissions

        setIsSubmitting(true);

        let musicFileId: string | undefined;
        let thumbnailFileId: string | undefined;

        try {
            if (selectedMusicFile) {
                musicFileId = await UploadFileInS3(selectedMusicFile, () => {}, 'your-user-id');
            }
            if (selectedFile) {
                thumbnailFileId = await UploadFileInS3(selectedFile, () => {}, 'your-user-id');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            setIsSubmitting(false);
            return;
        }

        // Upload session thumbnails and update form data
        const updatedData = { ...data };
        if (updatedData.recurringSchedule) {
            for (let dayIndex = 0; dayIndex < updatedData.recurringSchedule.length; dayIndex++) {
                const day = updatedData.recurringSchedule[dayIndex];
                if (day?.sessions) {
                    for (let sessionIndex = 0; sessionIndex < day.sessions.length; sessionIndex++) {
                        const sessionThumbnail = getSessionThumbnail(dayIndex, sessionIndex);
                        if (sessionThumbnail) {
                            const sessionThumbnailId = await UploadFileInS3(
                                sessionThumbnail,
                                () => {},
                                'your-user-id'
                            );
                            if (
                                updatedData.recurringSchedule?.[dayIndex]?.sessions?.[sessionIndex]
                            ) {
                                updatedData.recurringSchedule[dayIndex]!.sessions![
                                    sessionIndex
                                ]!.thumbnailFileId = sessionThumbnailId;
                            }
                        }
                    }
                }
            }
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
                        thumbnailFileId: schedule.thumbnailFileId || '',
                        countAttendanceDaily: schedule.countAttendanceDaily ?? false,
                    },
                ],
            })) || [];
        const body = transformFormToDTOStep1(
            updatedData,
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
            navigate({ to: '/study-library/live-session/schedule/step2' });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
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

        // Get the countAttendanceDaily value from the first session of this day
        const firstSessionAttendance = daySchedule.sessions[0]?.countAttendanceDaily || false;

        // Determine session to copy:
        const defaultSession = {
            startTime: '',
            durationHours: '',
            durationMinutes: '',
            link: '',
            countAttendanceDaily: firstSessionAttendance, // Use the first session's attendance setting
            thumbnailFileId: '',
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
            countAttendanceDaily: firstSessionAttendance, // Ensure new session uses same attendance setting
            thumbnailFileId: rawSession.thumbnailFileId || '',
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

            if (isSelecting && (!day.sessions || day.sessions.length === 0)) {
                form.setValue(`recurringSchedule.${index}.sessions`, [
                    {
                        startTime: '',
                        durationHours: dh,
                        durationMinutes: dm,
                        link: l,
                        countAttendanceDaily: false,
                        thumbnailFileId: '',
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
                        countAttendanceDaily: false,
                        thumbnailFileId: '',
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
                        countAttendanceDaily: false,
                        thumbnailFileId: '',
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
                        countAttendanceDaily: false,
                        thumbnailFileId: '',
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

            <div className="flex h-full flex-col gap-6">
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

    const renderTimezoneSelection = () => {
        const selectedTimezone = form.watch('timeZone') || 'Asia/Kolkata';

        // Get current time in selected timezone
        const getCurrentTime = (timezone: string) => {
            try {
                const now = new Date();
                const zonedTime = toZonedTime(now, timezone);
                return formatTZ(zonedTime, 'PPp', { timeZone: timezone });
            } catch {
                return '';
            }
        };

        const currentTime = getCurrentTime(selectedTimezone);

        return (
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <SelectField
                        label="Timezone"
                        name="timeZone"
                        labelStyle="text-sm font-medium"
                        options={TIMEZONE_OPTIONS}
                        control={form.control}
                        className="mt-[8px] w-80 font-thin"
                        required
                    />
                    {currentTime && (
                        <span className="ml-1 text-xs font-medium">
                            Current time: {currentTime}
                        </span>
                    )}
                </div>
            </div>
        );
    };

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
                {/* Modern Recurring schedule layout */}
                <div className="space-y-4">
                    {recurringSchedule?.map((dayField, dayIndex) => {
                        const isSelect = watch(`recurringSchedule.${dayIndex}.isSelect`);
                        const dayName =
                            WEEK_DAYS.find((d) => d.label === dayField.day)?.value ?? dayField.day;

                        return (
                            <div key={dayField.day} className="group">
                                {/* Day Header Card */}
                                <div
                                    className={`rounded-xl border-2 transition-all duration-200 ${
                                        isSelect
                                            ? 'border-primary-200 bg-primary-50/50 shadow-sm'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    {/* Day Toggle Header */}
                                    <div className="flex items-center justify-between p-6">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                form.setValue(
                                                    `recurringSchedule.${dayIndex}.isSelect`,
                                                    !isSelect
                                                )
                                            }
                                            className="flex items-center gap-3 text-left transition-colors duration-200"
                                        >
                                            <div
                                                className={`flex size-5 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                                                    isSelect
                                                        ? 'border-primary-500 bg-primary-500'
                                                        : 'border-gray-300 bg-white group-hover:border-gray-400'
                                                }`}
                                            >
                                                {isSelect && (
                                                    <div className="size-2 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <div>
                                                <h3
                                                    className={`text-lg font-semibold transition-colors duration-200 ${
                                                        isSelect
                                                            ? 'text-primary-900'
                                                            : 'text-gray-900'
                                                    }`}
                                                >
                                                    {dayName}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {isSelect
                                                        ? `${dayField.sessions.length} session${dayField.sessions.length !== 1 ? 's' : ''} scheduled`
                                                        : 'Click to schedule sessions'}
                                                </p>
                                            </div>
                                        </button>

                                        {isSelect && (
                                            <MyButton
                                                type="button"
                                                buttonType="secondary"
                                                onClick={() => addSessionToDay(dayIndex)}
                                                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                                            >
                                                <Plus size={16} />
                                                Add Session
                                            </MyButton>
                                        )}
                                    </div>

                                    {/* Daily Attendance Setting */}
                                    {isSelect && (
                                        <div className="bg-primary-25 border-t border-primary-100 px-6 py-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-900">
                                                        Count attendance daily
                                                    </Label>
                                                </div>
                                                <Controller
                                                    control={control}
                                                    name={`recurringSchedule.${dayIndex}.sessions.0.countAttendanceDaily`}
                                                    render={({ field }) => (
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={(checked) => {
                                                                // Update all sessions for this day
                                                                const currentDay = form.getValues(
                                                                    `recurringSchedule.${dayIndex}`
                                                                );
                                                                if (currentDay?.sessions) {
                                                                    currentDay.sessions.forEach(
                                                                        (_, sessionIdx) => {
                                                                            form.setValue(
                                                                                `recurringSchedule.${dayIndex}.sessions.${sessionIdx}.countAttendanceDaily`,
                                                                                checked
                                                                            );
                                                                        }
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Sessions List */}
                                    {isSelect && (
                                        <div className="border-t border-primary-100 bg-white/50">
                                            <div className="space-y-4 p-2">
                                                {dayField.sessions.map((session, sessionIndex) => (
                                                    <div
                                                        key={sessionIndex}
                                                        className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow duration-200 hover:shadow-md"
                                                    >
                                                        <div className="mb-4 flex items-center justify-between">
                                                            <h4 className="text-sm font-semibold text-gray-900">
                                                                Session {sessionIndex + 1}
                                                            </h4>
                                                            {sessionIndex > 0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeSessionFromDay(
                                                                            dayIndex,
                                                                            sessionIndex
                                                                        )
                                                                    }
                                                                    className="flex size-8 items-center justify-center rounded-full bg-red-50 text-red-500 transition-colors duration-200 hover:bg-red-100"
                                                                >
                                                                    <Trash size={16} />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Session Details Grid */}
                                                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                                                            {/* Start Time */}
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium text-gray-700">
                                                                    Start Time
                                                                </Label>
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
                                                                    className="min-w-fit"
                                                                    onSelect={(value) =>
                                                                        propagateToOtherDays(
                                                                            'startTime',
                                                                            value,
                                                                            dayIndex,
                                                                            sessionIndex
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            {/* Duration */}
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium text-gray-700">
                                                                    Duration
                                                                </Label>
                                                                <div className="flex items-center gap-2">
                                                                    <FormField
                                                                        control={control}
                                                                        name={`recurringSchedule.${dayIndex}.sessions.${sessionIndex}.durationHours`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormControl>
                                                                                    <MyInput
                                                                                        inputType="text"
                                                                                        inputPlaceholder="00"
                                                                                        input={
                                                                                            field.value
                                                                                        }
                                                                                        onKeyPress={(
                                                                                            e
                                                                                        ) => {
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
                                                                                                parseInt(
                                                                                                    val
                                                                                                );
                                                                                            if (
                                                                                                num >
                                                                                                24
                                                                                            )
                                                                                                val =
                                                                                                    '24';
                                                                                            field.onChange(
                                                                                                val
                                                                                            );
                                                                                        }}
                                                                                        className="w-16 text-center"
                                                                                    />
                                                                                </FormControl>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <span className="text-sm text-gray-500">
                                                                        hrs
                                                                    </span>
                                                                    <FormField
                                                                        control={control}
                                                                        name={`recurringSchedule.${dayIndex}.sessions.${sessionIndex}.durationMinutes`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormControl>
                                                                                    <MyInput
                                                                                        inputType="text"
                                                                                        inputPlaceholder="00"
                                                                                        input={
                                                                                            field.value
                                                                                        }
                                                                                        onKeyPress={(
                                                                                            e
                                                                                        ) => {
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
                                                                                                parseInt(
                                                                                                    val
                                                                                                );
                                                                                            if (
                                                                                                num >
                                                                                                59
                                                                                            )
                                                                                                val =
                                                                                                    '59';
                                                                                            field.onChange(
                                                                                                val
                                                                                            );
                                                                                        }}
                                                                                        className="w-16 text-center"
                                                                                    />
                                                                                </FormControl>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <span className="text-sm text-gray-500">
                                                                        mins
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Live Class Link */}
                                                            <div className="space-y-2 ">
                                                                <Label className="text-sm font-medium text-gray-700">
                                                                    Live Class Link
                                                                </Label>
                                                                <FormField
                                                                    control={control}
                                                                    name={`recurringSchedule.${dayIndex}.sessions.${sessionIndex}.link`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <MyInput
                                                                                    inputType="text"
                                                                                    inputPlaceholder="Enter live class URL"
                                                                                    input={
                                                                                        field.value
                                                                                    }
                                                                                    onChangeFunction={(
                                                                                        e
                                                                                    ) => {
                                                                                        field.onChange(
                                                                                            e
                                                                                        );
                                                                                        propagateToOtherDays(
                                                                                            'link',
                                                                                            e.target
                                                                                                .value,
                                                                                            dayIndex,
                                                                                            sessionIndex
                                                                                        );
                                                                                    }}
                                                                                    {...field}
                                                                                    onBlur={(e) => {
                                                                                        const url =
                                                                                            e.target
                                                                                                .value;
                                                                                        field.onBlur();
                                                                                        try {
                                                                                            if (url)
                                                                                                new URL(
                                                                                                    url
                                                                                                );
                                                                                        } catch {
                                                                                            if (
                                                                                                url
                                                                                            ) {
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
                                                                                    className="min-w-fit"
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage className="text-sm text-red-500" />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Session Options */}
                                                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
                                                            {/* Thumbnail Upload */}
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    Thumbnail:
                                                                </span>
                                                                <input
                                                                    type="file"
                                                                    accept=".png, .jpg, .jpeg"
                                                                    onChange={(e) =>
                                                                        handleSessionThumbnailSelect(
                                                                            dayIndex,
                                                                            sessionIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                    className="hidden"
                                                                    id={`session-thumbnail-${dayIndex}-${sessionIndex}`}
                                                                />
                                                                {getSessionThumbnail(
                                                                    dayIndex,
                                                                    sessionIndex
                                                                ) ? (
                                                                    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
                                                                        <span className="max-w-32 truncate text-nowrap text-sm text-green-700">
                                                                            {
                                                                                getSessionThumbnail(
                                                                                    dayIndex,
                                                                                    sessionIndex
                                                                                )?.name
                                                                            }
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleSessionThumbnailRemove(
                                                                                    dayIndex,
                                                                                    sessionIndex
                                                                                )
                                                                            }
                                                                            className="text-green-600 hover:text-green-800"
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <MyButton
                                                                        type="button"
                                                                        buttonType="secondary"
                                                                        scale="small"
                                                                        onClick={() => {
                                                                            document
                                                                                .getElementById(
                                                                                    `session-thumbnail-${dayIndex}-${sessionIndex}`
                                                                                )
                                                                                ?.click();
                                                                        }}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <UploadSimple size={16} />
                                                                        Upload
                                                                    </MyButton>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        );

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col gap-8">
                <div className="sticky top-[72px] z-[9] m-0 flex items-center justify-between border-b border-neutral-200 bg-white p-0 py-2">
                    <h1>Live Session Information</h1>
                    <MyButton
                        type="submit"
                        scale="large"
                        buttonType="primary"
                        disable={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin text-white" /> : 'Next'}
                    </MyButton>
                </div>

                <div className="flex flex-col gap-8">
                    {renderBasicInformation()}
                    {renderMeetingTypeSelection()}
                    {renderTimezoneSelection()}
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
