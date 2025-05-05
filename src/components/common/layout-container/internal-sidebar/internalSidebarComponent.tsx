import { useSidebar } from "@/components/ui/sidebar";
import { useFileUpload } from "@/hooks/use-file-upload";
import { filterMenuItems, filterMenuList, getModuleFlags } from "@/routes/evaluator-ai/-components/layout-container/sidebar/helper";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SidebarItem } from "@/routes/evaluator-ai/-components/layout-container/sidebar/sidebar-item"
import { SidebarItemsData } from "@/routes/evaluator-ai/-components/layout-container/sidebar/utils";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { useRouter } from "@tanstack/react-router";
import React from "react";
import { DashboardLoader } from "@/components/core/dashboard-loader";

export const InternalSidebarComponent = ({sidebarComponent}:{sidebarComponent: React.ReactNode}) => {
    const { data, isLoading } = useSuspenseQuery(useInstituteQuery());
    const router = useRouter();
    const subModules = getModuleFlags(data?.sub_modules);
    const sideBarData = filterMenuList(subModules, SidebarItemsData);
    const sideBarItems = filterMenuItems(sideBarData, data?.id);
    const { getPublicUrl } = useFileUpload();

    if(isLoading){
        return <DashboardLoader />;
    }
    return(
        <div className="flex w-[307px] flex-col gap-6 bg-primary-50 p-10">
            {sidebarComponent
                ? sidebarComponent : sideBarItems.map((obj, key) => (
                    <div key={key} id={obj.id}>
                        <SidebarItem
                            icon={obj.icon}
                            subItems={obj.subItems}
                            title={obj.title}
                            to={obj.to}
                        />
                    </div>
                ))}
                {/* <div
                    className={cn(
                        "mt-auto flex items-center justify-center",
                    )}
                >
                    {!currentRoute.includes("slides") && <SupportOptions />}
                </div> */}
        </div>
    )
}
