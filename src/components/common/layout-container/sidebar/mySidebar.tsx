import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { SidebarStateType } from "../../../../types/layout-container-types";
import { SidebarItem } from "./sidebar-item";
import { SidebarItemsData } from "./utils";
import "./scrollbarStyle.css";

export const MySidebar = () => {
    const { state }: SidebarStateType = useSidebar();

    return (
        <Sidebar collapsible="icon">
            <SidebarContent
                className={`sidebar-content flex flex-col gap-14 bg-primary-50 py-10 ${
                    state == "expanded" ? "w-[307px]" : "w-28"
                }`}
            >
                <SidebarHeader className="">
                    <div
                        className={`flex items-center justify-center gap-2 ${
                            state == "expanded" ? "pl-4" : "pl-0"
                        }`}
                    >
                        <img src="/images/svgs/ssdc_logo.svg" width={48} height={48}></img>
                        <SidebarGroup
                            className={`text-[18px] font-semibold text-primary-500 group-data-[collapsible=icon]:hidden`}
                        >
                            Shri Saidas Classes
                        </SidebarGroup>
                    </div>
                </SidebarHeader>
                <SidebarMenu
                    className={`flex flex-shrink-0 flex-col justify-center gap-6 py-4 ${
                        state == "expanded" ? "items-stretch" : "items-center"
                    }`}
                >
                    {SidebarItemsData.map((obj, key) => (
                        <SidebarMenuItem key={key}>
                            <SidebarItem
                                icon={obj.icon}
                                subItems={obj.subItems}
                                title={obj.title}
                                to={obj.to}
                            />
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
};