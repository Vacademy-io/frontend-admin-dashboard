import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { DummyProfile } from "@/assets/svgs";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { FiSidebar } from "react-icons/fi";
import { useSidebarStore } from "@/routes/assessment/create-assessment/$assessmentId/$examtype/-utils/global-states";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeCookiesAndLogout } from "@/lib/auth/sessionUtility";
import { useNavigate } from "@tanstack/react-router";

export function Navbar() {
    // const notifications = true;
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const { navHeading } = useNavHeadingStore();
    const { sidebarOpen, setSidebarOpen } = useSidebarStore();

    const handleLogout = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault(); // Prevents dropdown from closing immediately
        removeCookiesAndLogout(); // Ensure logout completes
        navigate({
            to: "/login",
        });
    };

    return (
        <div className="flex h-[72px] items-center justify-between border-b bg-neutral-50 px-8 py-4">
            <div className="flex items-center gap-4">
                <SidebarTrigger onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <FiSidebar className="text-neutral-600" />
                </SidebarTrigger>
                <div className="border-l border-neutral-500 px-4 text-h2 font-semibold text-neutral-600">
                    {navHeading}
                </div>
            </div>
            <div className="flex gap-6 text-neutral-600">
                {/* <IconContainer>
                    <MagnifyingGlass className="size-5" />
                </IconContainer> */}
                {/* <IconContainer className="relative">
                    <Bell className="size-5" />
                    {notifications && (
                        <div className="absolute right-2 top-2 size-2 rounded-full bg-primary-500"></div>
                    )}
                </IconContainer> */}
                {/* <IconContainer>
                    <Sliders className="size-5" />
                </IconContainer> */}
                <div className="flex items-center gap-1">
                    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                        <DropdownMenuTrigger className="flex items-center gap-2">
                            <DummyProfile />
                            {isOpen ? <CaretDown /> : <CaretUp />}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>View Profile Details</DropdownMenuItem>
                            <DropdownMenuItem>View Institute Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
