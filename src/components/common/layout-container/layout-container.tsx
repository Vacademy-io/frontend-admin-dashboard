import { MySidebar } from "./sidebar/mySidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { Navbar } from "./top-navbar.tsx/navbar";
import { cn } from "@/lib/utils";
import React from "react";

export const LayoutContainer = ({
    children,
    className,
    sidebarComponent,
    intrnalMargin = true,
}: {
    children?: React.ReactNode;
    className?: string;
    sidebarComponent?: React.ReactNode;
    intrnalMargin?:boolean;
}) => {
    const { open } = useSidebar();
    return (
        <div className={`flex w-full ${open ? "gap-12" : "gap-16"}`}>
            <div>
                <MySidebar sidebarComponent={sidebarComponent} />
            </div>
            <div className="w-full flex-1">
                <Navbar />
                <div
                    className={cn(
                        intrnalMargin ? `m-7` : `m-0`,
                        open
                            ? intrnalMargin
                                ? `max-w-[calc(100vw-322px-56px)]`
                                : `max-w-[calc(100vw-322px)]`
                            : intrnalMargin
                              ? `max-w-[calc(100vw-132px-56px)]`
                              : `max-w-[calc(100vw-132px)]`,
                        className,
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};
