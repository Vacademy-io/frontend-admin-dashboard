import { TokenKey } from '@/constants/auth/tokens';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';

export default function createInviteLink(inviteCode: string) {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];
    const learnerDashboardUrl =
        import.meta.env.VITE_LEARNER_DASHBOARD_URL || 'https://learner.vacademy.io';
    const url = `${learnerDashboardUrl}/learner-invitation-response?instituteId=${INSTITUTE_ID}&inviteCode=${inviteCode}`;
    return url;
}
