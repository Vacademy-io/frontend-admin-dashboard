import {
    CODE_CIRCLE_INSTITUTE_ID,
    SHUBHAM_INSTITUTE_ID,
    SSDC_INSTITUTE_ID,
} from '@/constants/urls';
import { SidebarItemsType } from '@/types/layout-container/layout-container-types';

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

export function filterMenuList(
    subModules: { assess: boolean | undefined; lms: boolean | undefined },
    menuList: SidebarItemsType[]
) {
    return menuList.filter((item) => {
        if (item.to === '/assessment' && !subModules.assess) return false;
        return true;
    });
}

export function filterMenuItems(menuList: SidebarItemsType[], instituteId: string | undefined) {
    const ssdc_id = SSDC_INSTITUTE_ID;
    const shubham_id = SHUBHAM_INSTITUTE_ID;
    const code_circle_id = CODE_CIRCLE_INSTITUTE_ID;
    if (instituteId === ssdc_id || instituteId === shubham_id || instituteId === code_circle_id) {
        return menuList.filter(
            (item) =>
                item.id !== 'Homework Creation' &&
                item.id !== 'assessment-centre' &&
                item.id !== 'evaluation-centre' &&
                item.id !== 'Community Centre' &&
                item.id !== 'AI Center'
        );
    }
    return menuList;
}
