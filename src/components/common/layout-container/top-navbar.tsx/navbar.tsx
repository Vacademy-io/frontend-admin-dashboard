import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { DummyProfile } from "@/assets/svgs";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useSidebarStore } from "@/routes/assessment/create-assessment/$assessmentId/$examtype/-utils/global-states";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeCookiesAndLogout } from "@/lib/auth/sessionUtility";
import { useNavigate } from "@tanstack/react-router";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import useInstituteLogoStore from "../sidebar/institutelogo-global-zustand";
import { useStudyLibraryStore } from "@/stores/study-library/use-study-library-store";
import { useModulesWithChaptersStore } from "@/stores/study-library/use-modules-with-chapters-store";
import { usePDFStore } from "@/stores/study-library/temp-pdf-store";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { SidebarSimple } from "@phosphor-icons/react";

export function Navbar() {
    // const notifications = true;
    const { resetStore } = useInstituteDetailsStore();
    const { resetStudyLibraryStore } = useStudyLibraryStore();
    const { resetInstituteLogo } = useInstituteLogoStore();
    const { resetModulesWithChaptersStore } = useModulesWithChaptersStore();
    const { resetPdfStore } = usePDFStore();
    const { resetSelectedSessionStore } = useSelectedSessionStore();
    const { resetChapterSidebarStore } = useContentStore();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const { navHeading } = useNavHeadingStore();
    const { sidebarOpen, setSidebarOpen } = useSidebarStore();

    const handleLogout = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault(); // Prevents dropdown from closing immediately
        resetStore();
        resetStudyLibraryStore();
        resetModulesWithChaptersStore();
        resetInstituteLogo();
        resetPdfStore();
        resetSelectedSessionStore();
        resetChapterSidebarStore();

        removeCookiesAndLogout(); // Ensure logout completes
        navigate({
            to: "/login",
        });
    };

    return (
        <div className="flex h-[72px] items-center justify-between border-b bg-neutral-50 px-8 py-4">
            <div className="flex items-center gap-4">
                <SidebarTrigger onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <SidebarSimple className="text-neutral-600" />
                </SidebarTrigger>
                <div className="border-l border-neutral-500 px-4 text-h3 font-semibold text-neutral-600">
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
                            {/* <DropdownMenuItem className="cursor-pointer">
                                View Profile Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                View Institute Details
                            </DropdownMenuItem> */}
                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
