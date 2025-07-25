import { SidebarTrigger } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useSidebarStore } from '@/routes/assessment/create-assessment/$assessmentId/$examtype/-utils/global-states';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    getTokenFromCookie,
    getUserRoles,
    removeCookiesAndLogout,
} from '@/lib/auth/sessionUtility';
import { useNavigate } from '@tanstack/react-router';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import useInstituteLogoStore from '../sidebar/institutelogo-global-zustand';
import { useStudyLibraryStore } from '@/stores/study-library/use-study-library-store';
import { useModulesWithChaptersStore } from '@/stores/study-library/use-modules-with-chapters-store';
import { usePDFStore } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-stores/temp-pdf-store';
import { useSelectedSessionStore } from '@/stores/study-library/selected-session-store';
import { useContentStore } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
import { SidebarSimple } from '@phosphor-icons/react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import { Separator } from '@/components/ui/separator';
import EditDashboardProfileComponent from '@/routes/dashboard/-components/EditDashboardProfileComponent';
import AdminProfile from '@/routes/dashboard/-components/AdminProfile';
import { Badge } from '@/components/ui/badge';
import { handleGetAdminDetails } from '@/services/student-list-section/getAdminDetails';
import useAdminLogoStore from '../sidebar/admin-logo-zustand';
import { useFileUpload } from '@/hooks/use-file-upload';
import { SSOSwitcher } from '../../auth/SSOSwitcher';
import { TokenKey } from '@/constants/auth/tokens';

export function Navbar() {
    const roleColors: Record<string, string> = {
        ADMIN: '#F4F9FF',
        'COURSE CREATOR': '#F4FFF9',
        'ASSESSMENT CREATOR': '#FFF4F5',
        TEACHER: '#FFF4F5',
        EVALUATOR: '#F5F0FF',
    };
    const queryClient = useQueryClient();
    const { data: instituteDetails } = useSuspenseQuery(useInstituteQuery());
    const { data: adminDetails } = useSuspenseQuery(handleGetAdminDetails());
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
    const { getPublicUrl } = useFileUpload();
    const { adminLogo, setAdminLogo, resetAdminLogo } = useAdminLogoStore();
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const roles = getUserRoles(accessToken);
    const isAdmin = roles.includes('ADMIN');

    const handleLogout = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault(); // Prevents dropdown from closing immediately

        // Clear all React Query cache to prevent data persistence between users
        queryClient.clear();

        // Reset all Zustand stores
        resetStore();
        resetStudyLibraryStore();
        resetModulesWithChaptersStore();
        resetInstituteLogo();
        resetAdminLogo();
        resetPdfStore();
        resetSelectedSessionStore();
        resetChapterSidebarStore();

        removeCookiesAndLogout(); // Ensure logout completes
        navigate({
            to: '/login',
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const fetchPublicUrl = async () => {
                if (adminDetails?.profile_pic_file_id) {
                    const publicUrl = await getPublicUrl(adminDetails?.profile_pic_file_id);
                    setAdminLogo(publicUrl || '');
                }
            };

            fetchPublicUrl();
        }, 300); // Adjust the debounce time as needed

        return () => clearTimeout(timer); // Cleanup the timeout on component unmount
    }, [adminDetails?.profile_pic_file_id]);

    return (
        <div className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b bg-neutral-50 px-8 py-4">
            <div className="flex items-center gap-4">
                <SidebarTrigger onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <SidebarSimple className="text-neutral-600" />
                </SidebarTrigger>
                <div className="border-l border-neutral-500 px-4 text-h3 font-semibold text-neutral-600">
                    {navHeading}
                </div>
            </div>
            <div className="flex gap-6 text-neutral-600">
                {roles.includes('STUDENT') && <SSOSwitcher variant="button" className="" />}
                <div className="flex items-center gap-1">
                    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                        <DropdownMenuTrigger className="flex items-center gap-2">
                            {adminLogo !== '' && (
                                <img src={adminLogo} alt="logo" className="size-10 rounded-full" />
                            )}
                            {isOpen ? <CaretDown /> : <CaretUp />}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="mr-8 min-w-60 p-3">
                            <AdminProfile />
                            <Separator className="my-2" />
                            <DropdownMenuItem className="w-full p-2 text-sm hover:rounded-sm hover:bg-accent hover:text-accent-foreground">
                                Switch to Learner
                                <Badge
                                    variant="outline"
                                    className="ml-2 border-green-200 bg-green-50 text-xs text-green-700"
                                >
                                    New
                                </Badge>
                            </DropdownMenuItem>
                            {isAdmin && (
                                <Sheet>
                                    <SheetTrigger className="w-full p-2 text-sm hover:rounded-sm hover:bg-accent hover:text-accent-foreground">
                                        View Institute Details
                                    </SheetTrigger>
                                    <SheetContent className="max-h-screen !min-w-[565px] overflow-y-auto !border-l border-gray-200 bg-primary-50 p-8 shadow-none [&>button>svg]:size-6 [&>button>svg]:font-thin [&>button>svg]:text-neutral-600 [&>button]:mt-[19px]">
                                        <SheetTitle className="text-primary-500">
                                            Institute Details
                                        </SheetTitle>
                                        <div className="flex flex-col gap-8">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                {instituteLogo !== '' && (
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
                                                <EditDashboardProfileComponent isEdit={true} />
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            )}
                            <DropdownMenuItem
                                className="w-full p-2 text-sm hover:rounded-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={handleLogout}
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
