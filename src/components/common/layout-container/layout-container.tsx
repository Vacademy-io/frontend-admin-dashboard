import { MySidebar } from "./sidebar/mySidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { Navbar } from "./top-navbar.tsx/navbar";
import { cn } from "@/lib/utils";
import React from "react";

export const LayoutContainer = ({
    children,
    className,
    sidebarComponent,
}: {
    children?: React.ReactNode;
    className?: string;
    sidebarComponent?: React.ReactNode;
}) => {
    const { open } = useSidebar();
    return (
        <div className={`flex w-full ${open ? "gap-12" : "gap-16"}`}>
            <div>
                <MySidebar sidebarComponent={sidebarComponent} />
            </div>

            <div className="w-full flex-1 overflow-hidden">
                <Navbar />
                <div className={cn("m-7 max-w-full", className)}>{children}</div>
            </div>
        </div>
    );
};
