import { getCurrentInstituteId } from '@/lib/auth/instituteUtils';

export default function createInviteLink(
    inviteCode: string,
    learnerDashboardUrl = import.meta.env.VITE_LEARNER_DASHBOARD_URL ||
        'https://learner.vacademy.io'
) {
    const INSTITUTE_ID = getCurrentInstituteId();
    const url = `${learnerDashboardUrl}/learner-invitation-response?instituteId=${INSTITUTE_ID}&inviteCode=${inviteCode}`;
    return url;
}
