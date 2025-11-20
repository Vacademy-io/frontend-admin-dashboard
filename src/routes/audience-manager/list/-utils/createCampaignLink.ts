import { TokenKey } from '@/constants/auth/tokens';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';

const DEFAULT_LEARNER_PORTAL_URL =
    import.meta.env.VITE_LEARNER_DASHBOARD_URL || 'https://learner.vacademy.io';

/**
 * Build a shareable campaign link that learners can open.
 * Assumes learner portal handles `audience-campaign-response` route.
 */
export const createCampaignLink = (
    campaignId: string,
    learnerPortalBaseUrl?: string
): string => {
    if (!campaignId) return '';

    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const instituteId = tokenData && Object.keys(tokenData.authorities)[0];

    const portalBase =   DEFAULT_LEARNER_PORTAL_URL || 'https://learner.vacademy.io';
    const encodedInstitute = encodeURIComponent(instituteId || '');
    const encodedCampaign = encodeURIComponent(campaignId);

    return `${portalBase}/audience-response?instituteId=${encodedInstitute}&audienceId=${encodedCampaign}`;
};

export default createCampaignLink;

