import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import { useSidebarStore } from "@/stores/useSidebar";
import { MagnifyingGlass, Bell, Sliders, CaretDown, CaretUp } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const IconContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("cursor-pointer rounded-full bg-white p-2", className)}>{children}</div>
    );
};

export function Navbar() {
    const notifications = true;
    const [dropdown, setDropdown] = useState<boolean>(true);
    const { selectedItem } = useSidebarStore();

    return (
        <div className="flex h-24 items-center justify-between bg-neutral-50 px-8">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="" />
                <div className="border-l border-neutral-500 px-4 text-h2 font-semibold text-neutral-600">
                    {selectedItem}
                </div>
            </div>
            <div className="flex gap-6 text-neutral-600">
                <IconContainer>
                    <MagnifyingGlass className="size-6" />
                </IconContainer>
                <IconContainer className="relative">
                    <Bell className="size-6" />
                    {notifications && (
                        <div className="absolute right-2 top-2 size-2 rounded-full bg-primary-500"></div>
                    )}
                </IconContainer>
                <IconContainer>
                    <Sliders className="size-6" />
                </IconContainer>
                <div className="flex items-center gap-1">
                    <IconContainer className="size-10 cursor-auto p-0">
                        <img
                            src="/images/dummy/profile.jpg"
                            className="size-full rounded-full object-cover"
                        />
                    </IconContainer>
                    <div className="cursor-pointer">
                        {dropdown ? (
                            <CaretDown onClick={() => setDropdown(!dropdown)} />
                        ) : (
                            <CaretUp onClick={() => setDropdown(!dropdown)} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}