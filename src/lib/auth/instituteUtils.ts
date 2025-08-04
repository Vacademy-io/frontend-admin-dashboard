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
        console.log('[getInstitutesFromToken] No access token found');
        return [];
    }

    console.log('[getInstitutesFromToken] Access token:', accessToken);

    const tokenData = getTokenDecodedData(accessToken);

    if (!tokenData || !tokenData.authorities) {
        console.log('[getInstitutesFromToken] No token data or authorities found');
        return [];
    }

    console.log('[getInstitutesFromToken] Token data:', tokenData);
    console.log('[getInstitutesFromToken] Authorities:', tokenData.authorities);

    // Log user information
    console.log('[getInstitutesFromToken] User info:', {
        fullname: tokenData.fullname,
        email: tokenData.email,
        username: tokenData.username,
        sub: tokenData.sub,
        is_root_user: tokenData.is_root_user
    });

    const institutes = Object.entries(tokenData.authorities).map(([instituteId, authority]) => ({
        id: instituteId,
        name: `Institute ${instituteId.slice(0, 8)}...`, // Will be updated with real names
        roles: authority.roles || [],
        permissions: authority.permissions || [],
    }));

    console.log('[getInstitutesFromToken] Parsed institutes:', institutes);

    // Log user type summary
    const allRoles = institutes.flatMap(inst => inst.roles);
    const uniqueRoles = [...new Set(allRoles)];
    const hasAdmin = uniqueRoles.includes('ADMIN');
    const hasTeacher = uniqueRoles.includes('TEACHER');
    const hasStudent = uniqueRoles.includes('STUDENT');

    console.log('[getInstitutesFromToken] User type summary:', {
        totalInstitutes: institutes.length,
        allRoles: uniqueRoles,
        isAdmin: hasAdmin,
        isTeacher: hasTeacher,
        isStudent: hasStudent,
        userType: hasAdmin ? 'ADMIN' : hasTeacher ? 'TEACHER' : hasStudent ? 'STUDENT' : 'UNKNOWN'
    });

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

        // If user has ADMIN role, include the institute
        if (roles.includes('ADMIN')) return true;

        // If user has TEACHER role, include the institute
        if (roles.includes('TEACHER')) return true;

        // If user only has STUDENT role, exclude the institute
        if (roles.length === 1 && roles[0] === 'STUDENT') return false;

        // If user has STUDENT + other roles, include the institute
        return roles.length > 1;
    });
};

/**
 * Determine the primary role for an institute
 * Priority: ADMIN > TEACHER > STUDENT
 */
export const getPrimaryRole = (roles: string[]): string => {
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('TEACHER')) return 'TEACHER';
    if (roles.includes('STUDENT')) return 'STUDENT';
    return roles[0] || 'UNKNOWN';
};

/**
 * Check if user should be blocked from logging in
 * Returns true if user only has STUDENT role across all institutes
 */
export const shouldBlockStudentLogin = (): boolean => {
    const institutes = getInstitutesFromToken();
    const validInstitutes = getValidInstitutes(institutes);

    console.log('[shouldBlockStudentLogin] All institutes:', institutes);
    console.log('[shouldBlockStudentLogin] Valid institutes:', validInstitutes);

    // If no valid institutes, user should be blocked (only has STUDENT role)
    if (validInstitutes.length === 0) {
        console.log('[shouldBlockStudentLogin] No valid institutes, blocking login - USER TYPE: STUDENT ONLY');
        return true;
    }

    // Check if user only has STUDENT role in all institutes
    const hasNonStudentRole = validInstitutes.some((institute) => {
        const roles = institute.roles;
        const hasAdminOrTeacher = roles.includes('ADMIN') || roles.includes('TEACHER');
        console.log(`[shouldBlockStudentLogin] Institute ${institute.id} roles: ${roles.join(', ')}, hasAdminOrTeacher: ${hasAdminOrTeacher}`);
        return hasAdminOrTeacher;
    });

    console.log('[shouldBlockStudentLogin] Has non-student role:', hasNonStudentRole);
    console.log('[shouldBlockStudentLogin] Should block:', !hasNonStudentRole);

    if (!hasNonStudentRole) {
        console.log('[shouldBlockStudentLogin] BLOCKING LOGIN - USER TYPE: STUDENT ONLY');
    } else {
        console.log('[shouldBlockStudentLogin] ALLOWING LOGIN - USER TYPE: ADMIN/TEACHER');
    }

    return !hasNonStudentRole;
};

/**
 * Get institute selection result
 * Determines if user needs to select an institute or can proceed directly
 */
export const getInstituteSelectionResult = (): InstituteSelectionResult => {
    const institutes = getInstitutesFromToken();
    const validInstitutes = getValidInstitutes(institutes);

    console.log('[getInstituteSelectionResult] All institutes:', institutes);
    console.log('[getInstituteSelectionResult] Valid institutes:', validInstitutes);

    if (validInstitutes.length === 0) {
        console.log('[getInstituteSelectionResult] No valid institutes, should not show selection - USER TYPE: STUDENT ONLY');
        return {
            shouldShowSelection: false,
            institutes: [],
        };
    }

    if (validInstitutes.length === 1) {
        const institute = validInstitutes[0];
        const primaryRole = getPrimaryRole(institute.roles);

        console.log('[getInstituteSelectionResult] Single institute found:', institute);
        console.log('[getInstituteSelectionResult] Primary role:', primaryRole);
        console.log('[getInstituteSelectionResult] Should not show selection - USER TYPE: ' + primaryRole + ' (SINGLE INSTITUTE)');

        return {
            shouldShowSelection: false,
            institutes: validInstitutes,
            selectedInstitute: institute,
            primaryRole,
        };
    }

    console.log('[getInstituteSelectionResult] Multiple institutes found, should show selection - USER TYPE: MULTI-INSTITUTE USER');
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
