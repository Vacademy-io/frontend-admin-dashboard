import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import { MagnifyingGlass, Bell, Sliders, CaretDown, CaretUp } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { DummyProfile } from "@/assets/svgs";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { FiSidebar } from "react-icons/fi";

const IconContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "flex size-9 cursor-pointer items-center justify-center rounded-full border border-neutral-300",
                className,
            )}
        >
            {children}
        </div>
    );
};

export function Navbar() {
    const notifications = true;
    const [dropdown, setDropdown] = useState<boolean>(true);
    const { navHeading } = useNavHeadingStore();

    return (
        <div className="flex h-[72px] items-center justify-between bg-neutral-50 px-8 py-4">
            <div className="flex items-center gap-4">
                <SidebarTrigger>
                    <FiSidebar className="text-neutral-600" />
                </SidebarTrigger>
                <div className="border-l border-neutral-500 px-4 text-h2 font-semibold text-neutral-600">
                    {navHeading}
                </div>
            </div>
            <div className="flex gap-6 text-neutral-600">
                <IconContainer>
                    <MagnifyingGlass className="size-5" />
                </IconContainer>
                <IconContainer className="relative">
                    <Bell className="size-5" />
                    {notifications && (
                        <div className="absolute right-2 top-2 size-2 rounded-full bg-primary-500"></div>
                    )}
                </IconContainer>
                <IconContainer>
                    <Sliders className="size-5" />
                </IconContainer>
                <div className="flex items-center gap-1">
                    <IconContainer className="size-10 cursor-auto border-none p-0">
                        <div className="rounded-full object-cover">
                            <DummyProfile />
                        </div>
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
