import { getTokenDecodedData, getTokenFromCookie } from './sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { IAccessToken } from '@/constants/auth/tokens';
import { InstituteDetailsType } from '@/schemas/student/student-list/institute-schema';

export interface Institute {
    id: string;
    name: string;
    roles: string[];
    permissions: string[];
    details?: InstituteDetailsType | null;
}

export interface InstituteSelectionResult {
    shouldShowSelection: boolean;
    institutes: Institute[];
    selectedInstitute?: Institute;
    primaryRole?: string;
}

/**
 * Get all institutes from the user's token
 */
export const getInstitutesFromToken = (): Institute[] => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);

    if (!accessToken) {
        return [];
    }

    const tokenData = getTokenDecodedData(accessToken);

    if (!tokenData || !tokenData.authorities) {
        return [];
    }

    const institutes = Object.entries(tokenData.authorities).map(([instituteId, authority]) => ({
        id: instituteId,
        name: `Institute ${instituteId.slice(0, 8)}...`, // Will be updated with real names
        roles: authority.roles || [],
        permissions: authority.permissions || [],
    }));

    return institutes;
};

/**
 * Filter institutes based on role requirements
 * - Exclude institutes where user is only a STUDENT
 * - Include institutes where user has ADMIN, TEACHER, or multiple roles
 */
export const getValidInstitutes = (institutes: Institute[]): Institute[] => {
    return institutes.filter((institute) => {
        const roles = institute.roles;

        // If user only has STUDENT role, exclude the institute
        if (roles.length === 1 && roles[0] === 'STUDENT') return false;

        // Include institute if user has any role other than just STUDENT
        return true;
    });
};

/**
 * Determine the primary role for an institute
 * Priority: ADMIN > first non-STUDENT role in array
 */
export const getPrimaryRole = (roles: string[]): string => {
    // If ADMIN role is present, always return ADMIN
    if (roles.includes('ADMIN')) return 'ADMIN';

    // Find the first non-STUDENT role in the array
    const nonStudentRole = roles.find(role => role !== 'STUDENT');

    // Return the first non-STUDENT role, or UNKNOWN if only STUDENT roles exist
    return nonStudentRole || 'UNKNOWN';
};

/**
 * Check if user should be blocked from logging in
 * Returns true if user only has STUDENT role across all institutes
 */
export const shouldBlockStudentLogin = (): boolean => {
    const institutes = getInstitutesFromToken();
    const validInstitutes = getValidInstitutes(institutes);

    // If no valid institutes, user should be blocked (only has STUDENT role)
    if (validInstitutes.length === 0) {
        return true;
    }

    // User has at least one valid institute (not just STUDENT role)
    return false;
};

/**
 * Get institute selection result
 * Determines if user needs to select an institute or can proceed directly
 */
export const getInstituteSelectionResult = (): InstituteSelectionResult => {
    const institutes = getInstitutesFromToken();
    const validInstitutes = getValidInstitutes(institutes);

    if (validInstitutes.length === 0) {
        return {
            shouldShowSelection: false,
            institutes: [],
        };
    }

    if (validInstitutes.length === 1) {
        const institute = validInstitutes[0];
        const primaryRole = getPrimaryRole(institute.roles);

        return {
            shouldShowSelection: false,
            institutes: validInstitutes,
            selectedInstitute: institute,
            primaryRole,
        };
    }

    return {
        shouldShowSelection: true,
        institutes: validInstitutes,
    };
};

/**
 * Set the selected institute in localStorage for future reference
 */
export const setSelectedInstitute = (instituteId: string): void => {
    localStorage.setItem('selectedInstituteId', instituteId);
};

/**
 * Get the selected institute from localStorage
 */
export const getSelectedInstitute = (): string | null => {
    return localStorage.getItem('selectedInstituteId');
};

/**
 * Get the current institute ID (selected or fallback to first)
 */
export const getCurrentInstituteId = (): string | null => {
    // First try to get the selected institute from localStorage
    const selectedInstituteId = getSelectedInstitute();

    if (selectedInstituteId) {
        return selectedInstituteId;
    }

    // Fallback to first institute from token (for backward compatibility)
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const firstInstituteId = data && Object.keys(data.authorities)[0];
    return firstInstituteId || null;
};

/**
 * Clear the selected institute from localStorage
 */
export const clearSelectedInstitute = (): void => {
    localStorage.removeItem('selectedInstituteId');
};

/**
 * Get user's primary role for a specific institute
 */
export const getUserRoleForInstitute = (instituteId: string): string | null => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    if (!accessToken) return null;

    const tokenData = getTokenDecodedData(accessToken);
    if (!tokenData || !tokenData.authorities || !tokenData.authorities[instituteId]) {
        return null;
    }

    const roles = tokenData.authorities[instituteId].roles || [];
    return getPrimaryRole(roles);
};

/**
 * Check if user has specific role in a specific institute
 */
export const hasRoleInInstitute = (instituteId: string, role: string): boolean => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    if (!accessToken) return false;

    const tokenData = getTokenDecodedData(accessToken);
    if (!tokenData || !tokenData.authorities || !tokenData.authorities[instituteId]) {
        return false;
    }

    const roles = tokenData.authorities[instituteId].roles || [];
    return roles.includes(role);
};

/**
 * Get all institutes where user has a specific role
 */
export const getInstitutesWithRole = (role: string): Institute[] => {
    const institutes = getInstitutesFromToken();
    return institutes.filter((institute) => institute.roles.includes(role));
};
