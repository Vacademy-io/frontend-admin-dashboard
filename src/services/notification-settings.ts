import axios from 'axios';
import {
    NOTIFICATION_SETTINGS_BASE,
    GET_NOTIFICATION_SETTINGS_BY_INSTITUTE,
    GET_NOTIFICATION_DEFAULT_TEMPLATE,
} from '@/constants/urls';
import { getInstituteId } from '@/constants/helper';

export type NotificationSettingsResponse = {
    id: string | null;
    instituteId: string | null;
    settings: NotificationSettings;
    createdAt: string | null;
    updatedAt: string | null;
};

export type NotificationSettings = {
    community: {
        students_can_send: boolean;
        teachers_can_send?: boolean;
        admins_can_send?: boolean;
        allow_replies?: boolean;
        moderation_enabled?: boolean;
        allowed_tags: string[] | null;
    };
    dashboardPins: {
        students_can_create: boolean;
        teachers_can_create?: boolean;
        admins_can_create?: boolean;
        max_duration_hours: number;
        max_pins_per_user: number;
        require_approval: boolean;
    };
    systemAlerts: {
        students_can_send: boolean;
        teachers_can_send?: boolean;
        admins_can_send?: boolean;
        high_priority_roles: string[] | null;
        auto_dismiss_hours: number;
    };
    directMessages: {
        students_can_send: boolean;
        teachers_can_send: boolean;
        admins_can_send: boolean;
        allow_student_to_student: boolean;
        allow_replies: boolean;
        moderation_enabled: boolean;
    };
    streams: {
        students_can_send: boolean;
        teachers_can_send: boolean;
        admins_can_send: boolean;
        allow_during_class: boolean;
        auto_archive_hours: number;
    };
    resources: {
        students_can_upload: boolean;
        teachers_can_upload: boolean;
        admins_can_upload: boolean;
        allowed_folders: string[] | null;
        allowed_categories: string[] | null;
        max_file_size_mb: number;
    };
    general: {
        announcement_approval_required: boolean;
        max_announcements_per_day: number;
        allowed_mediums: string[] | null;
        default_timezone: string;
        retention_days: number;
        disabled_modes?: string[] | null;
    };
};

export type NotificationSettingsUpsertRequest = {
    instituteId: string;
    settings: NotificationSettings;
};

export async function getNotificationSettings(): Promise<NotificationSettingsResponse> {
    const instituteId = getInstituteId();
    const url = `${GET_NOTIFICATION_SETTINGS_BY_INSTITUTE}/${instituteId}`;
    const { data } = await axios.get(url);
    return data;
}

export async function getNotificationDefaultTemplate(): Promise<NotificationSettingsResponse> {
    const { data } = await axios.get(GET_NOTIFICATION_DEFAULT_TEMPLATE);
    return data;
}

export async function upsertNotificationSettings(
    request: NotificationSettingsUpsertRequest
): Promise<NotificationSettingsResponse> {
    const { data } = await axios.post(NOTIFICATION_SETTINGS_BASE, request, {
        headers: { 'Content-Type': 'application/json' },
    });
    return data;
}

export function createUpsertRequest(
    settings: NotificationSettings
): NotificationSettingsUpsertRequest {
    return {
        instituteId: getInstituteId() ?? '',
        settings,
    };
}
