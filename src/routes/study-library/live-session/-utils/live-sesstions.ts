import { BASE_URL_LEARNER_DASHBOARD } from '@/constants/urls';
import { LiveSession } from '../-services/utils';

export const getSessionJoinLink = (session: LiveSession) => {
    if (session.access_level === 'private') {
        return `${BASE_URL_LEARNER_DASHBOARD}/study-library/live-class/embed?sessionId=${session.schedule_id}`;
    } else
        return `${BASE_URL_LEARNER_DASHBOARD}/register/live-class?sessionId=${session.session_id}`;
};
