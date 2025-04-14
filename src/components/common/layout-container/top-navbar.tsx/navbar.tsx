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
import { usePDFStore } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/temp-pdf-store";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";
import { useContentStore } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/chapter-sidebar-store";
import { SidebarSimple } from "@phosphor-icons/react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import EditDashboardProfileComponent from "@/routes/dashboard/-components/EditDashboardProfileComponent";

export function Navbar() {
    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
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
    const { instituteLogo } = useInstituteLogoStore();

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
        <div className="sticky top-0 z-[10] flex h-[72px] items-center justify-between border-b bg-neutral-50 px-8 py-4">
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
                            </DropdownMenuItem> */}
                            <Sheet>
                                <SheetTrigger className="px-2 py-2 text-sm hover:rounded-sm hover:bg-gray-100">
                                    View Institute Details
                                </SheetTrigger>
                                <SheetContent className="max-h-screen overflow-y-auto bg-primary-50 p-3">
                                    <SheetHeader>
                                        <SheetTitle className="text-primary-500">
                                            Institute Details
                                        </SheetTitle>
                                        <div className="flex flex-col gap-8">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                {instituteLogo !== "" && (
                                                    <img
                                                        src={instituteLogo}
                                                        alt="logo"
                                                        className="size-48 rounded-full"
                                                    />
                                                )}
                                                <h1>{instituteDetails?.institute_name}</h1>
                                                <div className="flex items-center gap-2">
                                                    <h1>Institute Type</h1>
                                                    <p className="rounded-lg border px-2 py-1 text-sm text-neutral-600">
                                                        {instituteDetails?.type}
                                                    </p>
                                                </div>
                                                <EditDashboardProfileComponent isEdit={true}/>
                                            </div>
                                            <Separator />
                                            <div className="flex flex-col gap-2">
                                                <h1>Contact Information</h1>
                                                <p className="text-sm text-neutral-600">
                                                    <span>Institute Email:&nbsp;</span>
                                                    <span>{instituteDetails?.email}</span>
                                                </p>
                                                <p className="text-sm text-neutral-600">
                                                    <span>Institute Mobile:&nbsp;</span>
                                                    <span>{instituteDetails?.phone}</span>
                                                </p>
                                                <p className="text-sm text-neutral-600">
                                                    <span>Institute Website:&nbsp;</span>
                                                    <span>{instituteDetails?.website_url}</span>
                                                </p>
                                            </div>
                                            <Separator />
                                            <div className="flex flex-col gap-2">
                                                <h1>Location Details</h1>
                                                <p className="text-sm text-neutral-600">
                                                    <span>Address:&nbsp;</span>
                                                    <span>{instituteDetails?.address}</span>
                                                </p>
                                                <p className="text-sm text-neutral-600">
                                                    <span>City/Village:&nbsp;</span>
                                                    <span>{instituteDetails?.city}</span>
                                                </p>
                                                <p className="text-sm text-neutral-600">
                                                    <span>State:&nbsp;</span>
                                                    <span>{instituteDetails?.state}</span>
                                                </p>
                                                <p className="text-sm text-neutral-600">
                                                    <span>Country:&nbsp;</span>
                                                    <span>{instituteDetails?.country}</span>
                                                </p>
                                                <p className="text-sm text-neutral-600">
                                                    <span>Pincode:&nbsp;</span>
                                                    <span>{instituteDetails?.pin_code}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </SheetHeader>
                                </SheetContent>
                            </Sheet>
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
