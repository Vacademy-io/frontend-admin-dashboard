import axios, { type AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import CryptoJS from 'crypto-js';
import { REFRESH_TOKEN_URL } from '@/constants/urls';
import { UnauthorizedResponse } from '@/constants/auth/unauthorizeresponse';
import { IAccessToken, TokenKey, Tokens } from '@/constants/auth/tokens';
import { isNullOrEmptyOrUndefined } from '../utils';

// SSO Configuration
const SSO_CONFIG = {
    ADMIN_DOMAIN: 'dash.vacademy.io',
    LEARNER_DOMAIN: 'learner.vacademy.io',
    SHARED_DOMAIN: '.vacademy.io', // Shared cookie domain
    REQUIRED_ROLES: {
        ADMIN: ['ADMIN', 'TEACHER'],
        LEARNER: ['STUDENT'],
    },
};

const fallbackKey = 'asjiuhrkjnasd';

// Get token from cookie
const getTokenFromCookie = (tokenKey: string): string | null => {
    return Cookies.get(tokenKey) ?? null;
};

// Set token in cookie with domain support
const setAuthorizationCookie = (
    key: string,
    token: string,
    options?: Cookies.CookieAttributes
): void => {
    const isProduction = window.location.hostname.includes('vacademy.io');

    const defaultOptions: Cookies.CookieAttributes = {
        // Only set domain for production environments
        ...(isProduction && { domain: SSO_CONFIG.SHARED_DOMAIN }),
        // Only require secure for production HTTPS
        secure: isProduction,
        sameSite: 'lax',
        expires: 7, // 7 days
    };

    console.log('Setting cookie:', key, 'with options:', defaultOptions);
    Cookies.set(key, token, { ...defaultOptions, ...options });

    // Verify cookie was set
    const verifySet = Cookies.get(key);
    console.log('Cookie verification:', key, verifySet ? 'SUCCESS' : 'FAILED');
};

// Alias to support `setTokenInStorage` as a wrapper for consistency
const setTokenInStorage = async (key: string, token: string): Promise<void> => {
    setAuthorizationCookie(key, token);
};

// Check if token is expired
const isTokenExpired = (token: string | null): boolean => {
    if (isNullOrEmptyOrUndefined(token)) return true;

    try {
        const tokenData = jwtDecode(token);
        if (!isNullOrEmptyOrUndefined(tokenData.exp)) {
            const expirationTime = new Date(tokenData.exp * 1000);
            return expirationTime <= new Date();
        }
    } catch (error) {
        console.error('Error decoding token:', error);
        return true;
    }
    return true;
};

// Decode token
const getTokenDecodedData = (token: string | null): IAccessToken | undefined => {
    if (isNullOrEmptyOrUndefined(token)) return;
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error('Error decoding token:', error);
        return undefined;
    }
};

// Check if user has specific roles
const hasRole = (tokenData: IAccessToken, roles: string[]): boolean => {
    if (!tokenData.authorities) return false;

    // Check all authorities for the required roles
    for (const authority of Object.values(tokenData.authorities)) {
        if (authority.roles && authority.roles.some((role) => roles.includes(role))) {
            return true;
        }
    }
    return false;
};

// Check if user can access admin dashboard
const canAccessAdminDashboard = (token: string | null): boolean => {
    if (!token || isTokenExpired(token)) return false;

    const tokenData = getTokenDecodedData(token);
    if (!tokenData) return false;

    return hasRole(tokenData, SSO_CONFIG.REQUIRED_ROLES.ADMIN);
};

// Check if user can access learner platform
const canAccessLearnerPlatform = (token: string | null): boolean => {
    if (!token || isTokenExpired(token)) return false;

    const tokenData = getTokenDecodedData(token);
    if (!tokenData) return false;

    return hasRole(tokenData, SSO_CONFIG.REQUIRED_ROLES.LEARNER);
};

// Get user roles from token
const getUserRoles = (token: string | null): string[] => {
    if (!token || isTokenExpired(token)) return [];

    const tokenData = getTokenDecodedData(token);
    if (!tokenData || !tokenData.authorities) return [];

    const roles: string[] = [];
    for (const authority of Object.values(tokenData.authorities)) {
        if (authority.roles) {
            roles.push(...authority.roles);
        }
    }

    return [...new Set(roles)]; // Remove duplicates
};

// Generate SSO URL with tokens for cross-domain authentication
const generateSSOUrl = (targetDomain: string, redirectPath?: string): string | null => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const refreshToken = getTokenFromCookie(TokenKey.refreshToken);

    if (!accessToken || !refreshToken || isTokenExpired(accessToken)) {
        return null;
    }

    // Encrypt tokens before adding to URL
    // Use a more secure encryption method with a secret key
    const secretKey = import.meta.env.VITE_SSO_SECRET_KEY ?? fallbackKey;
    const encryptedAccessToken = CryptoJS.AES.encrypt(accessToken, secretKey).toString();
    const encryptedRefreshToken = CryptoJS.AES.encrypt(refreshToken, secretKey).toString();

    const baseUrl = `https://${targetDomain}`;
    const params = new URLSearchParams({
        sso: 'true',
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        ...(redirectPath && { redirect: redirectPath }),
    });

    // Copy URL to clipboard for easy sharing
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
        const fullUrl = `${baseUrl}?${params.toString()}`;
        navigator.clipboard.writeText(fullUrl).catch((err) => {
            console.warn('Failed to copy URL to clipboard:', err);
        });
    }
    return `${baseUrl}?${params.toString()}`;
};

// Handle SSO login from URL parameters
const handleSSOLogin = (): boolean => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSSOLogin = urlParams.get('sso') === 'true';

    if (!isSSOLogin) return false;

    const encryptedAccessToken = urlParams.get('accessToken');
    const encryptedRefreshToken = urlParams.get('refreshToken');
    const redirectPath = urlParams.get('redirect');

    if (encryptedAccessToken && encryptedRefreshToken) {
        try {
            // Decrypt tokens
            const secretKey = import.meta.env.VITE_SSO_SECRET_KEY || fallbackKey;
            const accessToken = CryptoJS.AES.decrypt(encryptedAccessToken, secretKey).toString(
                CryptoJS.enc.Utf8
            );
            const refreshToken = CryptoJS.AES.decrypt(encryptedRefreshToken, secretKey).toString(
                CryptoJS.enc.Utf8
            );

            if (accessToken && refreshToken && !isTokenExpired(accessToken)) {
                // Set tokens in cookies
                setAuthorizationCookie(TokenKey.accessToken, accessToken);
                setAuthorizationCookie(TokenKey.refreshToken, refreshToken);

                // Clean up URL
                const cleanUrl =
                    window.location.pathname + (redirectPath ? `?redirect=${redirectPath}` : '');
                window.history.replaceState({}, document.title, cleanUrl);

                console.log('SSO login successful');
                return true;
            }
        } catch (error) {
            console.error('Error decrypting SSO tokens:', error);
            return false;
        }
    }

    return false;
};

// Refresh tokens and update cookies
async function refreshTokens(refreshToken: string): Promise<UnauthorizedResponse | Tokens> {
    const response: AxiosResponse<Tokens> = await axios({
        method: 'GET',
        url: REFRESH_TOKEN_URL,
        params: { token: refreshToken },
    });

    await setTokenInStorage(TokenKey.accessToken, response.data?.accessToken);
    await setTokenInStorage(TokenKey.refreshToken, response.data?.refreshToken);

    return response.data;
}

// Clear cookies on logout with proper domain cleanup
const removeCookiesAndLogout = (): void => {
    // Remove from current domain
    Cookies.remove(TokenKey.accessToken);
    Cookies.remove(TokenKey.refreshToken);

    // Remove from shared domain
    Cookies.remove(TokenKey.accessToken, { domain: SSO_CONFIG.SHARED_DOMAIN });
    Cookies.remove(TokenKey.refreshToken, { domain: SSO_CONFIG.SHARED_DOMAIN });
};

export {
    refreshTokens,
    removeCookiesAndLogout,
    setAuthorizationCookie,
    getTokenFromCookie,
    isTokenExpired,
    getTokenDecodedData,
    setTokenInStorage,
    hasRole,
    canAccessAdminDashboard,
    canAccessLearnerPlatform,
    getUserRoles,
    generateSSOUrl,
    handleSSOLogin,
    SSO_CONFIG,
};
