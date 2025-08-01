import { z } from 'zod';
import {
    sessionFormSchema,
    weeklyClassSchema,
    addParticipantsSchema,
} from '../schedule/-schema/schema';
import { RecurringType } from '../-constants/enums';

export const timeOptions = Array.from({ length: 96 }, (_, i) => {
    const hours = Math.floor(i / 4)
        .toString()
        .padStart(2, '0');
    const minutes = ((i % 4) * 15).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
});

type SessionFormInput = z.infer<typeof sessionFormSchema>;
type WeeklyClass = z.infer<typeof weeklyClassSchema>;

export interface LiveSessionStep1RequestDTO {
    session_id?: string;
    title: string;
    subject: string | null;
    description_html: string | null;
    default_meet_link?: string;
    start_time: string;
    last_entry_time: string;
    session_end_date: string | null;
    recurrence_type: string;
    added_schedules: ScheduleDTO[];
    updated_schedules: ScheduleDTO[];
    deleted_schedule_ids: string[];
    institute_id: string;
    background_score_file_id?: string;
    thumbnail_file_id?: string;
    waiting_room_time?: number;
    link_type?: string;
    allow_rewind?: boolean;
    allow_play_pause?: boolean;
    is_live?: boolean;
    session_streaming_service_type?: string;
    cover_file_id?: string | null;
}

interface ScheduleDTO {
    id?: string;
    day: string;
    start_time: string;
    duration: string;
    link?: string;
}

//step 2 interface
export interface LiveSessionStep2RequestDTO {
    session_id: string;
    access_type: string;

    package_session_ids: string[];
    deleted_package_session_ids: string[];

    join_link: string;

    added_notification_actions: NotificationActionDTO[];
    updated_notification_actions: NotificationActionDTO[];
    deleted_notification_action_ids: string[];

    added_fields: CustomFieldDTO[];
    updated_fields: CustomFieldDTO[];
    deleted_field_ids: string[];
}

export interface NotificationActionDTO {
    id: string | null;
    type: 'ON_CREATE' | 'ON_LIVE' | 'BEFORE_LIVE';
    notify_by: NotifyBy;
    time: string | null;
    notify: boolean;
}

export interface NotifyBy {
    mail: boolean;
    whatsapp: boolean;
}

export interface CustomFieldDTO {
    id: string | null;
    label: string;
    required: boolean;
    is_default: boolean;
    type: string;
    options?: FieldOptionDTO[];
}

export interface FieldOptionDTO {
    label: string;
    name: string;
}

/**
 * Transforms session form data into LiveSessionStep1RequestDTO.
 *
 * @param form - The submitted form data.
 * @param originalSchedules - (Optional) Previously saved schedules for update detection.
 */

export function transformFormToDTOStep1(
    form: SessionFormInput,
    instituteId: string,
    originalSchedules: WeeklyClass[] = [],
    musicFileId: string | undefined,
    thumbnailFileId: string | undefined,
    coverFileId: string | undefined | null
): LiveSessionStep1RequestDTO {
    const {
        id: sessionId,
        title,
        startTime,
        endDate,
        subject,
        description,
        durationHours,
        durationMinutes,
        defaultLink,
        meetingType,
        recurringSchedule = [],
        enableWaitingRoom,
        openWaitingRoomBefore,
        streamingType,
        sessionPlatform,
        allowRewind,
        allowPause,
    } = form;

    // Convert hours and minutes to total duration in hours
    const totalDuration = Number(durationHours) + Number(durationMinutes) / 60;

    // Fix timezone handling by creating an ISO string that preserves the local time
    const [datePart, timePart] = startTime.split('T');
    const startTimeDate = new Date(`${datePart}T${timePart}`);
    const startTimeISO = new Date(
        startTimeDate.getTime() - startTimeDate.getTimezoneOffset() * 60000
    ).toISOString();
    const lastEntryTime = new Date(startTimeDate.getTime() + totalDuration * 60 * 60 * 1000);
    const lastEntryTimeISO = new Date(
        lastEntryTime.getTime() - lastEntryTime.getTimezoneOffset() * 60000
    ).toISOString();

    const added_schedules: ScheduleDTO[] = [];
    const updated_schedules: ScheduleDTO[] = [];
    const deleted_schedule_ids: string[] = [];

    // Map old schedule IDs for deletion tracking
    const originalScheduleMap = new Map<string, WeeklyClass>();
    originalSchedules.forEach((s) => {
        if (s.id) originalScheduleMap.set(s.id, s);
    });

    if (meetingType === RecurringType.WEEKLY) {
        recurringSchedule.forEach((dayBlock: WeeklyClass) => {
            if (!dayBlock.isSelect) return;

            dayBlock.sessions.forEach(
                (session: {
                    id?: string;
                    startTime?: string;
                    durationHours?: string;
                    durationMinutes?: string;
                    link?: string;
                }) => {
                    const duration =
                        Number(session.durationHours) * 60 + Number(session.durationMinutes);
                    const baseSchedule: ScheduleDTO = {
                        id: session.id,
                        day: dayBlock.day,
                        start_time: session.startTime ? `${session.startTime}:00` : '',
                        duration: String(duration),
                        link: session.link || '',
                    };

                    if (dayBlock.id && originalScheduleMap.has(dayBlock.id)) {
                        updated_schedules.push(baseSchedule);
                        originalScheduleMap.delete(dayBlock.id); // processed
                    } else {
                        added_schedules.push(baseSchedule);
                    }
                }
            );
        });

        // Anything left in originalScheduleMap is considered deleted
        for (const id of originalScheduleMap.keys()) {
            deleted_schedule_ids.push(id);
        }
    } else {
        for (const id of originalScheduleMap.keys()) {
            deleted_schedule_ids.push(id);
        }
    }

    return {
        session_id: sessionId,
        title,
        subject: subject === undefined || subject === '' ? null : subject,
        description_html: description || null,
        default_meet_link: defaultLink || '',
        start_time: startTimeISO,
        last_entry_time: lastEntryTimeISO,
        session_end_date: endDate || null,
        recurrence_type: meetingType,
        added_schedules,
        updated_schedules,
        deleted_schedule_ids,
        institute_id: instituteId,
        background_score_file_id: musicFileId,
        thumbnail_file_id: thumbnailFileId,
        waiting_room_time: enableWaitingRoom ? Number(openWaitingRoomBefore) : 0,
        link_type: sessionPlatform,
        allow_rewind: allowRewind,
        allow_play_pause: allowPause,
        session_streaming_service_type: streamingType,
        cover_file_id: coverFileId,
    };
}

type FormData = z.infer<typeof addParticipantsSchema>;

export function transformFormToDTOStep2(
    formData: FormData,
    sessionId: string,
    packageSessionIds: string[]
): LiveSessionStep2RequestDTO {
    const { accessType, joinLink, notifyBy, notifySettings, fields } = formData;

    const addedNotificationActions: NotificationActionDTO[] = [];

    if (notifySettings.onCreate) {
        addedNotificationActions.push({
            id: null,
            type: 'ON_CREATE',
            notify_by: {
                mail: notifyBy.mail,
                whatsapp: notifyBy.whatsapp,
            },
            notify: true,
            time: null,
        });
    }

    if (notifySettings.onLive) {
        addedNotificationActions.push({
            id: null,
            type: 'ON_LIVE',
            notify_by: {
                mail: notifyBy.mail,
                whatsapp: notifyBy.whatsapp,
            },
            notify: true,
            time: null,
        });
    }

    if (notifySettings.beforeLive && notifySettings.beforeLiveTime) {
        notifySettings.beforeLiveTime.forEach(({ time }) => {
            addedNotificationActions.push({
                id: null,
                type: 'BEFORE_LIVE',
                notify_by: {
                    mail: notifyBy.mail,
                    whatsapp: notifyBy.whatsapp,
                },
                notify: true,
                time,
            });
        });
    }
    const { added_fields, update_fields } = fields.reduce(
        (acc, field) => {
            const fieldData: CustomFieldDTO = {
                id: field.id ?? null,
                label: field.label,
                required: field.required,
                is_default: field.isDefault,
                type: field.type,
                options: field.options,
            };

            if (field.id) {
                acc.update_fields.push(fieldData);
            } else {
                acc.added_fields.push(fieldData);
            }

            return acc;
        },
        {
            added_fields: [] as CustomFieldDTO[],
            update_fields: [] as CustomFieldDTO[],
        }
    );

    return {
        session_id: sessionId,
        access_type: accessType,
        package_session_ids: packageSessionIds,
        deleted_package_session_ids: [],
        join_link: joinLink,
        added_notification_actions: addedNotificationActions,
        updated_notification_actions: [],
        deleted_notification_action_ids: [],
        added_fields: added_fields,
        updated_fields: update_fields,
        deleted_field_ids: [],
    };
}
