import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { X } from "phosphor-react";

export const ActivityStatsSidebar = () => {
    const { toggleSidebar } = useSidebar();

    return (
        <Sidebar side="right">
            <SidebarContent
                className={`sidebar-content flex flex-col gap-10 border-r-2 border-r-neutral-300 bg-primary-50 p-6 text-neutral-600`}
            >
                <SidebarHeader>
                    <div className={`} flex flex-col items-center justify-center gap-10`}>
                        <div className={`flex w-full items-center justify-between`}>
                            <div className="text-h3 font-semibold text-primary-500">
                                Activity Stats
                            </div>
                            <X
                                className="size-6 cursor-pointer text-neutral-500"
                                onClick={() => {
                                    toggleSidebar();
                                }}
                            />
                        </div>
                        <div className="flex w-full"></div>
                    </div>
                </SidebarHeader>

                <SidebarMenu className="no-scrollbar flex w-full flex-col gap-10 overflow-y-scroll">
                    <SidebarMenuItem className="flex w-full flex-col gap-6"></SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
};
