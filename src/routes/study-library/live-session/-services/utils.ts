import { GET_LIVE_SESSIONS, GET_PAST_SESSIONS, GET_UPCOMING_SESSIONS } from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';

export interface LiveSession {
    session_id: string;
    meeting_date: string;
    start_time: string;
    last_entry_time: string;
    recurrence_type: string;
    access_level: string;
    title: string;
    subject: string;
    meeting_link: string;
}

export interface SessionsByDate {
    date: string;
    sessions: Array<{
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
    }>;
}

export type UpcomingSessionDay = SessionsByDate;
export type PastSessionDay = SessionsByDate;

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

export const getUpcomingSessions = async (instituteId: string) => {
    const response = await authenticatedAxiosInstance.get(GET_UPCOMING_SESSIONS, {
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
        },
        params: {
            instituteId,
        },
    });
    return response.data as UpcomingSessionDay[];
};

export const getPastSessions = async (instituteId: string) => {
    const response = await authenticatedAxiosInstance.get(GET_PAST_SESSIONS, {
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
        },
        params: {
            instituteId,
        },
    });
    return response.data as PastSessionDay[];
};
