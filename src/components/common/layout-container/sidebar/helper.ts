import {
    CODE_CIRCLE_INSTITUTE_ID,
    SSDC_INSTITUTE_ID,
    HOLISTIC_INSTITUTE_ID,
    SHUBHAM_INSTITUTE_ID,
} from '@/constants/urls';
import { SidebarItemsType } from '@/types/layout-container/layout-container-types';
import { SubModuleType } from '@/schemas/student/student-list/institute-schema';
import { SUB_MODULE_SIDEBAR_MAPPING } from './constant';

export function getModuleFlags(
    sub_modules:
        | { module: string; sub_module: string; sub_module_description: string }[]
        | undefined
) {
    return {
        assess: sub_modules?.some((item) => item.module === 'ASSESS'),
        lms: sub_modules?.some((item) => item.module === 'ENGAGE'),
        volt: sub_modules?.some((item) => item.module === 'VOLT'),
        vsmart_ai_tools: sub_modules?.some((item) => item.module === 'VSMART_AI_TOOLS'),
    };
}

// Get allowed sidebar items based on sub-modules
export function getAllowedSidebarItems(subModules: SubModuleType[] | undefined): Set<string> {
    const allowedItems = new Set<string>();

    if (!subModules) return allowedItems;

    subModules.forEach((subModule) => {
        const mapping = SUB_MODULE_SIDEBAR_MAPPING[subModule.sub_module];
        if (mapping) {
            if (mapping.itemId) {
                allowedItems.add(mapping.itemId);
            } else if (mapping.itemIds) {
                mapping.itemIds.forEach((id) => allowedItems.add(id));
            }
        }
    });

    return allowedItems;
}

// Get allowed sub-items for a specific sidebar item
export function getAllowedSubItems(
    subModules: SubModuleType[] | undefined,
    itemId: string
): Set<string> {
    const allowedSubItems = new Set<string>();

    if (!subModules) return allowedSubItems;

    subModules.forEach((subModule) => {
        const mapping = SUB_MODULE_SIDEBAR_MAPPING[subModule.sub_module];
        if (mapping) {
            if (mapping.itemId && mapping.itemId === itemId) {
                if (Array.isArray(mapping.subItemIds)) {
                    mapping.subItemIds.forEach((subItem) => allowedSubItems.add(subItem));
                }
            } else if (mapping.itemIds && mapping.itemIds.includes(itemId)) {
                if (Array.isArray(mapping.subItemIds)) {
                    mapping.subItemIds.forEach((subItem) => allowedSubItems.add(subItem));
                }
            }
        }
    });

    return allowedSubItems;
}

export function filterMenuListByModules(
    subModules: SubModuleType[] | undefined,
    menuList: SidebarItemsType[]
): SidebarItemsType[] {
    const allowedItems = getAllowedSidebarItems(subModules);

    return menuList
        .filter((item) => {
            // Always allow dashboard and settings
            if (item.id === 'dashboard' || item.id === 'settings') {
                return true;
            }

            // Check if the item is allowed based on sub-modules
            return allowedItems.has(item.id);
        })
        .map((item) => {
            // If item has sub-items, filter them based on allowed sub-items
            if (item.subItems) {
                const allowedSubItems = getAllowedSubItems(subModules, item.id);
                const filteredSubItems = item.subItems.filter((subItem) =>
                    allowedSubItems.has(subItem.subItemId || '')
                );

                // Return the item with filtered sub-items
                return { ...item, subItems: filteredSubItems };
            }
            return item;
        });
}

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
