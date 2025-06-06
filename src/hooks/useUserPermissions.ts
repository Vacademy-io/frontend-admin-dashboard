import { TokenKey } from '@/constants/auth/tokens';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';

export const useUserPermissions = () => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    if (!tokenData || !tokenData.permissions) {
        return [];
    }
    return tokenData.permissions;
};

export const getUserPermissions = (): string[] => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    if (!tokenData || !tokenData.permissions) {
        return [];
    }
    return tokenData.permissions;
};
