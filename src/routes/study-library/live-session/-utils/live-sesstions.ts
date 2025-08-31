import { LiveSession } from '../-services/utils';

export const getSessionJoinLink = (session: LiveSession, baseUrl: string) => {
    if (session.access_level === 'private') {
        return `${baseUrl}/study-library/live-class/embed?sessionId=${session.schedule_id}`;
    } else return `${baseUrl}/register/live-class?sessionId=${session.session_id}`;
};
