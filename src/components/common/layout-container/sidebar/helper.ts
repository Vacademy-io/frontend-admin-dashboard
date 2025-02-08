import { SidebarItemsType } from "@/types/layout-container/layout-container-types";

export function getModuleFlags(
    sub_modules:
        | { module: string; sub_module: string; sub_module_description: string }[]
        | undefined,
) {
    return {
        assess: sub_modules?.some((item) => item.module === "ASSESS"),
        lms: sub_modules?.some((item) => item.module === "ENGAGE"),
    };
}

export function filterMenuList(
    subModules: { assess: boolean | undefined; lms: boolean | undefined },
    menuList: SidebarItemsType[],
) {
    return menuList.filter((item) => {
        if (item.to === "/assessment" && !subModules.assess) return false;
        if (item.to === "/study-library" && !subModules.lms) return false;
        return true;
    });
}
