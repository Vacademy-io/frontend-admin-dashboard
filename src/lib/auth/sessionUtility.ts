import axios, { type AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { REFRESH_TOKEN_URL } from '@/constants/urls';
import { UnauthorizedResponse } from '@/constants/auth/unauthorizeresponse';
import { IAccessToken, TokenKey, Tokens } from '@/constants/auth/tokens';
import { isNullOrEmptyOrUndefined } from '../utils';

// Get token from cookie
const getTokenFromCookie = (tokenKey: string): string | null => {
    return Cookies.get(tokenKey) ?? null;
};

// Set token in cookie
const setAuthorizationCookie = (key: string, token: string): void => {
    Cookies.set(key, token);
};

// Alias to support `setTokenInStorage` as a wrapper for consistency
const setTokenInStorage = async (key: string, token: string): Promise<void> => {
    Cookies.set(key, token);
};

// Check if token is expired
const isTokenExpired = (token: string | null): boolean => {
    if (isNullOrEmptyOrUndefined(token)) return true;

    const tokenData = jwtDecode(token);
    if (!isNullOrEmptyOrUndefined(tokenData.exp)) {
        const expirationTime = new Date(tokenData.exp * 1000);
        return expirationTime <= new Date();
    }
    return true;
};

// Decode token
const getTokenDecodedData = (token: string | null): IAccessToken | undefined => {
    if (isNullOrEmptyOrUndefined(token)) return;
    return jwtDecode(token);
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

// Clear cookies on logout
const removeCookiesAndLogout = (): void => {
    Cookies.remove(TokenKey.accessToken);
    Cookies.remove(TokenKey.refreshToken);
};

export {
    refreshTokens,
    removeCookiesAndLogout,
    setAuthorizationCookie,
    getTokenFromCookie,
    isTokenExpired,
    getTokenDecodedData,
    setTokenInStorage,
};
