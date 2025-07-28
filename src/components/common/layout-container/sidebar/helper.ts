import {
    CODE_CIRCLE_INSTITUTE_ID,
    SSDC_INSTITUTE_ID,
    HOLISTIC_INSTITUTE_ID,
    SHUBHAM_INSTITUTE_ID,
} from '@/constants/urls';
import { SidebarItemsType } from '@/types/layout-container/layout-container-types';
import { getTokenFromCookie, getUserRoles } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

export function getModuleFlags(
    sub_modules:
        | { module: string; sub_module: string; sub_module_description: string }[]
        | undefined
) {
    return {
        assess: sub_modules?.some((item) => item.module === 'ASSESS'),
        lms: sub_modules?.some((item) => item.module === 'ENGAGE'),
    };
}

/**
 * Filters sidebar items based on user role
 * Removes admin-only items for non-admin users
 */
export function filterSidebarByRole(menuList: SidebarItemsType[]): SidebarItemsType[] {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const userRoles = getUserRoles(accessToken);
    const isAdmin = userRoles.includes('ADMIN');

    // If user is admin, return all items
    if (isAdmin) {
        return menuList;
    }

    // For non-admin users, filter out admin-only items
    const adminOnlyIds = [
        'learner-insights',      // Learner Live Activities
        'manage-institute',      // Institute settings
        'settings'               // Settings
    ];

    return menuList.filter(item => !adminOnlyIds.includes(item.id));
}

export function filterMenuList(
    subModules: { assess: boolean | undefined; lms: boolean | undefined },
    menuList: SidebarItemsType[]
) {
    return menuList.filter((item) => {
        if (item.to === '/assessment' && !subModules.assess) return false;
        return true;
    });
}

/**
 * Filters menu items based on institute-specific rules
 */
export function filterMenuItems(menuList: SidebarItemsType[], instituteId: string | undefined) {
    if (instituteId === CODE_CIRCLE_INSTITUTE_ID || instituteId === SSDC_INSTITUTE_ID) {
        return menuList.filter(
            (item) =>
                item.id !== 'Homework Creation' &&
                item.id !== 'assessment-centre' &&
                item.id !== 'evaluation-centre' &&
                item.id !== 'Community Centre' &&
                item.id !== 'AI Center'
        );
    }
    if (instituteId === SHUBHAM_INSTITUTE_ID) {
        return menuList.filter(
            (item) =>
                item.id !== 'evaluation-centre' &&
                item.id !== 'Community Centre' &&
                item.id !== 'Homework Creation' &&
                item.id !== 'AI Center'
        );
    }
    if (instituteId === HOLISTIC_INSTITUTE_ID) {
        return menuList.filter(
            (item) =>
                item.id === 'dashboard' ||
                item.id === 'student-mangement' ||
                item.id === 'live-classes' ||
                item.id === 'settings' ||
                item.id === 'attendance-tracker'
        );
    }

    return menuList;
}
