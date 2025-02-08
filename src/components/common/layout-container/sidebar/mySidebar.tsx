import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { SidebarStateType } from "../../../../types/layout-container/layout-container-types";
import { SidebarItem } from "./sidebar-item";
import { SidebarItemsData } from "./utils";
import "./scrollbarStyle.css";
import React, { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { filterMenuList, getModuleFlags } from "./helper";
import { useFileUpload } from "@/hooks/use-file-upload";

export const MySidebar = ({ sidebarComponent }: { sidebarComponent?: React.ReactNode }) => {
    const { state }: SidebarStateType = useSidebar();
    const { data, isLoading } = useSuspenseQuery(useInstituteQuery());
    const subModules = getModuleFlags(data?.sub_modules);
    const sideBarItems = filterMenuList(subModules, SidebarItemsData);
    const { getPublicUrl } = useFileUpload();
    const [instituteLogo, setInstituteLogo] = useState("");

    useEffect(() => {
        const fetchPublicUrl = async () => {
            if (data?.institute_logo_file_id) {
                // Ensure it's not null or undefined
                const publicUrl = await getPublicUrl(data.institute_logo_file_id);
                console.log(publicUrl);
                setInstituteLogo(publicUrl);
            }
        };

        fetchPublicUrl();
    }, [data?.institute_logo_file_id, getPublicUrl]);

    if (isLoading) return <DashboardLoader />;
    return (
        <Sidebar collapsible="icon">
            <SidebarContent
                className={`sidebar-content flex flex-col gap-14 border-r border-r-neutral-300 bg-primary-50 py-10 ${
                    state == "expanded" ? "w-[307px]" : "w-28"
                }`}
            >
                <SidebarHeader className="">
                    <div
                        className={`flex items-center justify-center gap-2 ${
                            state == "expanded" ? "pl-4" : "pl-0"
                        }`}
                    >
                        <img src={instituteLogo} alt="logo" className="size-12" />
                        <SidebarGroup
                            className={`text-[18px] font-semibold text-primary-500 group-data-[collapsible=icon]:hidden`}
                        >
                            {data?.institute_name}
                        </SidebarGroup>
                    </div>
                </SidebarHeader>
                <SidebarMenu
                    className={`flex shrink-0 flex-col justify-center gap-6 py-4 ${
                        state == "expanded" ? "items-stretch" : "items-center"
                    }`}
                >
                    {sidebarComponent
                        ? sidebarComponent
                        : sideBarItems.map((obj, key) => (
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
