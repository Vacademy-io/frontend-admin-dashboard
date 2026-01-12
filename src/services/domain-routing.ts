import axios from 'axios';
import { DOMAIN_ROUTING_RESOLVE, GET_PUBLIC_URL_PUBLIC } from '@/constants/urls';
import { getMainDomain, getSubdomain } from '@/utils/subdomain';

export type DomainResolveResponse = {
    instituteId: string;
    instituteName: string;
    instituteLogoFileId?: string;
    instituteThemeCode?: string;
    role?: string;
    redirect?: string;
    privacyPolicyUrl?: string;
    afterLoginRoute?: string;
    termsAndConditionUrl?: string;
    theme?: string;
    tabText?: string;
    allowSignup?: boolean;
    tabIconFileId?: string;
    fontFamily?: string;
    allowGoogleAuth?: boolean;
    allowGithubAuth?: boolean;
    allowEmailOtpAuth?: boolean;
    allowUsernamePasswordAuth?: boolean;
};

export async function resolveInstituteForCurrentHost(): Promise<DomainResolveResponse | null> {
    try {
        const hostname = window.location.hostname;

        const isLocal =
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '::1' ||
            hostname.endsWith('.localhost');

        let domain: string = hostname;
        let subdomain: string = '*';

        if (isLocal) {
            // admin.localhost -> domain=localhost, subdomain=admin
            if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
                domain = 'localhost';
                subdomain = '*';
            } else {
                const parts = hostname.split('.');
                subdomain = parts[0] || '*';
                domain = 'localhost';
            }
        } else {
            // Regular domains: derive main domain and subdomain
            domain = getMainDomain() || hostname;
            subdomain = getSubdomain() || '*';
        }

        // Add timeout to prevent indefinite hanging on slow/failing requests
        const { data } = await axios.get<DomainResolveResponse>(DOMAIN_ROUTING_RESOLVE, {
            params: { domain, subdomain },
            timeout: 5000, // 5 second timeout
        });
        return data;
    } catch (_error) {
        // Return null on any error (404, timeout, network failure, etc.)
        // The app will use default branding in this case
        return null;
    }
}

export async function getPublicUrl(fileId?: string | null): Promise<string | null> {
    if (!fileId) return null;
    try {
        const response = await axios.get<string>(GET_PUBLIC_URL_PUBLIC, {
            params: { fileId, expiryDays: 1 },
            timeout: 5000, // 5 second timeout
        });
        return response.data || null;
    } catch (_error) {
        return null;
    }
}

export function cacheInstituteBranding(
    instituteId: string,
    payload: DomainResolveResponse & { instituteLogoUrl?: string; tabIconUrl?: string }
): void {
    try {
        // Store with key as institute id per requirement
        localStorage.setItem(instituteId, JSON.stringify(payload));
        localStorage.setItem('selectedInstituteId', instituteId);
    } catch (_err) {
        // ignore storage failures
    }
}

export function getCachedInstituteBranding():
    | (DomainResolveResponse & { instituteLogoUrl?: string; tabIconUrl?: string })
    | null {
    try {
        const instituteId = localStorage.getItem('selectedInstituteId');
        if (!instituteId) return null;
        const raw = localStorage.getItem(instituteId);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}
