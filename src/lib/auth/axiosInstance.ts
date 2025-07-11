import { TokenKey } from '@/constants/auth/tokens';
import axios from 'axios';
import {
    getTokenFromCookie,
    isTokenExpired,
    refreshTokens,
    removeCookiesAndLogout,
    debugTokenStatus,
} from './sessionUtility';

const authenticatedAxiosInstance = axios.create();

// Debug function that can be called from browser console
const debugAuthStatus = () => {
    console.log('=== AUTH DEBUG INFO ===');
    debugTokenStatus();
    console.log('=== END AUTH DEBUG ===');
};

// Attach debug function to window for console access
if (typeof window !== 'undefined') {
    (window as any).debugAuth = debugAuthStatus;
}

authenticatedAxiosInstance.interceptors.request.use(
    async (request) => {
        let accessToken = getTokenFromCookie(TokenKey.accessToken);

        console.log('[Axios Request] Starting request interceptor:', {
            url: request.url,
            method: request.method,
            hasToken: !!accessToken,
            tokenLength: accessToken?.length || 0,
        });

        if (!accessToken) {
            console.error('[Axios Request] No access token found');
            removeCookiesAndLogout();
            return Promise.reject(new Error('No access token found'));
        }

        if (isTokenExpired(accessToken)) {
            console.log('[Axios Request] Token expired, attempting refresh');
            const refreshToken = getTokenFromCookie(TokenKey.refreshToken);

            if (!refreshToken) {
                console.error('[Axios Request] No refresh token found');
                removeCookiesAndLogout();
                return Promise.reject(new Error('Refresh token missing or expired'));
            }

            try {
                console.log('[Axios Request] Refreshing token...');
                await refreshTokens(refreshToken); // This should also update the cookies
                accessToken = getTokenFromCookie(TokenKey.accessToken); // Get the new token
                console.log('[Axios Request] Token refreshed successfully');
            } catch (error) {
                console.error('[Axios Request] Token refresh failed:', error);
                removeCookiesAndLogout();
                return Promise.reject(new Error('Token refresh failed'));
            }
        }

        // Now that token is valid, attach it to headers
        request.headers.Authorization = `Bearer ${accessToken}`;
        console.log('[Axios Request] Request authorized successfully');
        return request;
    },

    async (error) => {
        console.error('[Axios Request] Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor to handle authentication errors
authenticatedAxiosInstance.interceptors.response.use(
    (response) => {
        console.log('[Axios Response] Request successful:', {
            url: response.config.url,
            status: response.status,
        });
        return response;
    },
    async (error) => {
        const { response } = error;

        console.error('[Axios Response] Request failed:', {
            url: error.config?.url,
            status: response?.status,
            statusText: response?.statusText,
            data: response?.data,
        });

        // Handle 511 Network Authentication Required
        if (response?.status === 511) {
            console.error('[Axios Response] 511 Network Authentication Required - Token may be invalid or expired');
            console.error('[Axios Response] Response data:', response.data);
            console.error('[Axios Response] Running auth debug...');
            debugAuthStatus();
            removeCookiesAndLogout();
            return Promise.reject(new Error('Network authentication required. Please log in again.'));
        }

        // Handle 401 Unauthorized
        if (response?.status === 401) {
            console.error('[Axios Response] 401 Unauthorized - Token is invalid');
            console.error('[Axios Response] Response data:', response.data);
            removeCookiesAndLogout();
            return Promise.reject(new Error('Authentication failed. Please log in again.'));
        }

        // Handle 403 Forbidden
        if (response?.status === 403) {
            console.error('[Axios Response] 403 Forbidden - Insufficient permissions');
            console.error('[Axios Response] Response data:', response.data);
            return Promise.reject(new Error('You do not have permission to perform this action.'));
        }

        // Handle other authentication-related errors
        if (response?.status >= 500 && response?.status < 600) {
            console.error(`[Axios Response] Server error ${response.status}:`, response.data);
            return Promise.reject(new Error('Server error. Please try again later.'));
        }

        return Promise.reject(error);
    }
);

export default authenticatedAxiosInstance;
