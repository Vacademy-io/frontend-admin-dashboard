import {
    CREATE_LIVE_SESSION_STEP_1,
    CREATE_LIVE_SESSION_STEP_2,
    GET_LIVE_SESSIONS,
    DELETE_LIVE_SESSION,
    // GET_LIVE_SESSIONS,
} from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { LiveSessionStep1RequestDTO, LiveSessionStep2RequestDTO } from '../../-constants/helper';

export interface GetLiveSessionsRequest {
    instituteId?: string;
    session_id?: string;
    access_type?: string;
    package_session_ids?: string[];
    join_link?: string;
    notify_settings?: {
        notify_by: {
            mail: boolean;
            whatsapp: boolean;
        };
        on_create: boolean;
        on_live: boolean;
        before_live: boolean;
        before_live_time: Array<{
            time: string;
        }>;
    };
}

export interface LiveSession {
    session_id: string;
    schedule_id: string;
    meeting_date: string;
    start_time: string;
    last_entry_time: string;
    recurrence_type: string;
    access_level: string;
    title: string;
    subject: string;
    meeting_link: string;
    registration_form_link_for_public_sessions: string;
}

export const createLiveSessionStep1 = async (data: LiveSessionStep1RequestDTO) => {
    const response = await authenticatedAxiosInstance.post(CREATE_LIVE_SESSION_STEP_1, data, {
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const createLiveSessionStep2 = async (data: LiveSessionStep2RequestDTO) => {
    const response = await authenticatedAxiosInstance.post(CREATE_LIVE_SESSION_STEP_2, data, {
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const getLiveSessions = async (instituteId: string) => {
    const response = await authenticatedAxiosInstance.get(GET_LIVE_SESSIONS, {
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
        },
        params: {
            instituteId,
        },
    });
    return response.data;
};

export const deleteLiveSession = async (sessionId: string, type: string) => {
    try {
        const response = await authenticatedAxiosInstance.get(DELETE_LIVE_SESSION, {
            params: {
                sessionId,
                type,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting live session:', error);
        throw error;
    }
};
