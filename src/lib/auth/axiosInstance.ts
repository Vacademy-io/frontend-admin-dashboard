import { TokenKey } from '@/constants/auth/tokens';
import axios from 'axios';
import {
    getTokenFromCookie,
    isTokenExpired,
    refreshTokens,
    removeCookiesAndLogout,
} from './sessionUtility';

const authenticatedAxiosInstance = axios.create();

authenticatedAxiosInstance.interceptors.request.use(
    async (request) => {
        let accessToken = getTokenFromCookie(TokenKey.accessToken);

        if (!accessToken) {
            // No token found: logout
            removeCookiesAndLogout();
            return Promise.reject(new Error('No access token found'));
        }

        if (isTokenExpired(accessToken)) {
            const refreshToken = getTokenFromCookie(TokenKey.refreshToken);

            if (!refreshToken) {
                removeCookiesAndLogout();
                return Promise.reject(new Error('Refresh token missing or expired'));
            }

            try {
                await refreshTokens(refreshToken); // This should also update the cookies
                accessToken = getTokenFromCookie(TokenKey.accessToken); // Get the new token
            } catch (error) {
                console.error('Token refresh failed. Logging out ...');
                removeCookiesAndLogout();
                return Promise.reject(new Error('Token refresh failed'));
            }
        }

        // Now that token is valid, attach it to headers
        request.headers.Authorization = `Bearer ${accessToken}`;
        return request;
    },

    async (error) => {
        return Promise.reject(error);
    }
);

export default authenticatedAxiosInstance;
