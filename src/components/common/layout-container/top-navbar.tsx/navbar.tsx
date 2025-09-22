import { SidebarTrigger } from '@/components/ui/sidebar';
import { useEffect, useMemo, useState } from 'react';
import { BellSimple, CaretDown, CaretUp } from '@phosphor-icons/react';
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
import { getDisplaySettingsFromCache } from '@/services/display-settings';
import { ADMIN_DISPLAY_SETTINGS_KEY, TEACHER_DISPLAY_SETTINGS_KEY } from '@/types/display-settings';
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
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserId, getUserName } from '@/utils/userDetails';
import {
    getSystemAlertsQuery,
    stripHtml,
    fetchSystemAlerts,
} from '@/services/notifications/system-alerts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import type { PagedResponse, SystemAlertItem } from '@/services/notifications/system-alerts';
import { DEFAULT_ADMIN_DISPLAY_SETTINGS } from '@/constants/display-settings/admin-defaults';
import { DEFAULT_TEACHER_DISPLAY_SETTINGS } from '@/constants/display-settings/teacher-defaults';
import { MyButton } from '@/components/design-system/button';
import AccountDetailsEdit from '@/routes/dashboard/-components/AccountDetailsEdit';

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
    const userId = getUserId();
    const [showEditAccountDetails, setShowEditAccountDetails] = useState(false);
    // Effective display settings (cached or defaults) for permission gating
    const isAdminRoleForDS = roles.includes('ADMIN');
    const roleKeyForDS = isAdminRoleForDS
        ? ADMIN_DISPLAY_SETTINGS_KEY
        : TEACHER_DISPLAY_SETTINGS_KEY;
    const cachedDS = getDisplaySettingsFromCache(roleKeyForDS);
    const defaultDS = isAdminRoleForDS
        ? DEFAULT_ADMIN_DISPLAY_SETTINGS
        : DEFAULT_TEACHER_DISPLAY_SETTINGS;
    const effectiveDS = cachedDS || defaultDS;
    const canViewProfile = effectiveDS.permissions.canViewProfileDetails;
    const canEditProfile = effectiveDS.permissions.canEditProfileDetails;
    const canViewInstitute = effectiveDS.permissions.canViewInstituteDetails;
    const canEditInstitute = effectiveDS.permissions.canEditInstituteDetails;

    // Alerts: last 5
    const { data: alertsList, isLoading: isAlertsLoading } = useSuspenseQuery<
        PagedResponse<SystemAlertItem>
    >(getSystemAlertsQuery(userId, 5));

    // Alerts: full list (infinite)
    const infiniteAlerts = useInfiniteQuery<PagedResponse<SystemAlertItem>>({
        queryKey: ['SYSTEM_ALERTS_INFINITE', userId, 20] as const,
        queryFn: ({ pageParam = 0 }) =>
            fetchSystemAlerts({ userId, page: Number(pageParam) || 0, size: 20 }),
        getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
        initialPageParam: 0,
        staleTime: 30_000,
    });

    const [showAllDialog, setShowAllDialog] = useState(false);
    const unreadCount = useMemo(() => {
        return alertsList?.content?.reduce((acc, item) => acc + (item.isRead ? 0 : 1), 0) || 0;
    }, [alertsList]);

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
    }, [adminDetails?.profile_pic_file_id, getPublicUrl, setAdminLogo]);

    return (
        <div className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b bg-neutral-50 px-8 py-4">
            <div className="flex items-center gap-4">
                {(() => {
                    const rolesForDS = getUserRoles(accessToken);
                    const isAdminRole = rolesForDS.includes('ADMIN');
                    const roleKey = isAdminRole
                        ? ADMIN_DISPLAY_SETTINGS_KEY
                        : TEACHER_DISPLAY_SETTINGS_KEY;
                    const ds = getDisplaySettingsFromCache(roleKey);
                    const showSidebar = ds?.ui?.showSidebar !== false;
                    if (showSidebar) return null;
                    return (
                        <div className="flex items-center gap-2">
                            {instituteLogo ? (
                                <img
                                    src={instituteLogo}
                                    alt="logo"
                                    className="size-20 object-contain"
                                />
                            ) : null}
                        </div>
                    );
                })()}
                {(() => {
                    const rolesForDS = getUserRoles(accessToken);
                    const isAdminRole = rolesForDS.includes('ADMIN');
                    const roleKey = isAdminRole
                        ? ADMIN_DISPLAY_SETTINGS_KEY
                        : TEACHER_DISPLAY_SETTINGS_KEY;
                    const ds = getDisplaySettingsFromCache(roleKey);
                    const showSidebar = ds?.ui?.showSidebar !== false;
                    if (!showSidebar) return null;
                    return (
                        <SidebarTrigger onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <SidebarSimple className="text-neutral-600" />
                        </SidebarTrigger>
                    );
                })()}
                <div className="border-l border-neutral-500 px-4 text-h3 font-semibold text-neutral-600">
                    {navHeading}
                </div>
            </div>
            <div className="flex gap-6 text-neutral-600">
                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="relative flex items-center justify-center">
                        <div className="relative rounded-full p-2 hover:bg-neutral-200">
                            <BellSimple className="size-5 text-neutral-700" />
                            {!!unreadCount && (
                                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 p-0">
                        <div className="flex items-center justify-between px-3 py-2">
                            <span className="text-sm font-medium">System Alerts</span>
                            <button
                                className="text-xs text-primary-500 hover:underline"
                                onClick={() => setShowAllDialog(true)}
                            >
                                See all
                            </button>
                        </div>
                        <Separator />
                        <div className="max-h-80 overflow-y-auto p-2">
                            {isAlertsLoading ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="space-y-1">
                                            <Skeleton className="h-3 w-3/4" />
                                            <Skeleton className="h-3 w-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : alertsList?.content?.length ? (
                                alertsList.content.map((item: SystemAlertItem) => {
                                    const sentAt = item.deliveredAt || item.createdAt;
                                    const status = (item.status || '').toUpperCase();
                                    const isDelivered = status === 'DELIVERED';
                                    const isFailed = status === 'FAILED';
                                    return (
                                        <div
                                            key={item.messageId}
                                            className="rounded-md p-2 hover:bg-neutral-100"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="text-[13px] font-medium text-neutral-800">
                                                    {item.title}
                                                </div>
                                                {!!status && (
                                                    <span
                                                        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                                            isDelivered
                                                                ? 'bg-green-100 text-green-700'
                                                                : isFailed
                                                                  ? 'bg-red-100 text-red-700'
                                                                  : 'bg-neutral-100 text-neutral-700'
                                                        }`}
                                                    >
                                                        {status}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="line-clamp-2 text-[12px] text-neutral-600">
                                                {item.content?.type === 'html'
                                                    ? stripHtml(item.content?.content)
                                                    : item.content?.content}
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-neutral-500">
                                                <span>
                                                    Sent by {item.createdByName || 'System'}
                                                </span>
                                                <span>•</span>
                                                <span>{new Date(sentAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-3 text-center text-xs text-neutral-500">
                                    No alerts
                                </div>
                            )}
                        </div>
                        <Separator />
                        <div className="flex justify-center p-2">
                            <button
                                className="text-xs font-medium text-primary-500 hover:underline"
                                onClick={() => setShowAllDialog(true)}
                            >
                                See all notifications
                            </button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* See all dialog */}
                <Dialog open={showAllDialog} onOpenChange={setShowAllDialog}>
                    <DialogContent className="max-w-2xl p-0">
                        <DialogTitle className="px-5 py-4 text-base">System Alerts</DialogTitle>
                        <Separator />
                        <ScrollArea className="max-h-[70vh]">
                            <div className="p-4">
                                {infiniteAlerts.data?.pages?.flatMap((p) => p.content).length ? (
                                    <div className="space-y-3">
                                        {infiniteAlerts.data?.pages?.map((page) =>
                                            page.content.map((item: SystemAlertItem) => {
                                                const sentAt = item.deliveredAt || item.createdAt;
                                                const status = (item.status || '').toUpperCase();
                                                const isDelivered = status === 'DELIVERED';
                                                const isFailed = status === 'FAILED';
                                                return (
                                                    <div
                                                        key={item.messageId}
                                                        className="rounded-md border border-neutral-200 bg-white p-4"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className="truncate text-sm font-semibold text-neutral-900">
                                                                    {item.title}
                                                                </div>
                                                                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-neutral-500">
                                                                    <span>
                                                                        Sent by{' '}
                                                                        {item.createdByName ||
                                                                            'System'}
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span>
                                                                        {new Date(
                                                                            sentAt
                                                                        ).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {!!status && (
                                                                <span
                                                                    className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-medium ${
                                                                        isDelivered
                                                                            ? 'bg-green-100 text-green-700'
                                                                            : isFailed
                                                                              ? 'bg-red-100 text-red-700'
                                                                              : 'bg-neutral-100 text-neutral-700'
                                                                    }`}
                                                                >
                                                                    {status}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-3 text-[13px] leading-relaxed text-neutral-800">
                                                            {item.content?.type === 'html' ? (
                                                                <div
                                                                    className="prose prose-sm max-w-none"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: item.content
                                                                            ?.content,
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span>{item.content?.content}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        {/* Load more */}
                                        {infiniteAlerts.hasNextPage && (
                                            <div className="flex justify-center pt-2">
                                                <button
                                                    disabled={infiniteAlerts.isFetchingNextPage}
                                                    className="rounded border border-neutral-300 px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                    onClick={() => infiniteAlerts.fetchNextPage()}
                                                >
                                                    {infiniteAlerts.isFetchingNextPage
                                                        ? 'Loading...'
                                                        : 'Load more'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : infiniteAlerts.isLoading ? (
                                    <div className="space-y-2">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="space-y-1">
                                                <Skeleton className="h-3 w-1/2" />
                                                <Skeleton className="h-3 w-5/6" />
                                                <Skeleton className="h-3 w-2/3" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-xs text-neutral-500">
                                        No alerts found
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
                {roles.includes('STUDENT') && <SSOSwitcher variant="button" className="" />}
                <div className="flex items-center gap-1">
                    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                        <DropdownMenuTrigger className="flex items-center gap-2">
                            {adminLogo !== '' && (
                                <img
                                    src={adminLogo}
                                    alt="logo"
                                    className="size-10 object-contain"
                                />
                            )}
                            {isOpen ? <CaretDown /> : <CaretUp />}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="flex flex-col items-start">
                            {canViewProfile && (
                                <Sheet>
                                    <SheetTrigger className="w-full p-2 text-left text-sm hover:rounded-sm hover:bg-accent hover:text-accent-foreground">
                                        View Profile Details
                                    </SheetTrigger>
                                    <SheetContent className="max-h-screen !min-w-[565px] overflow-y-auto !border-l border-gray-200 bg-primary-50 p-8 shadow-none [&>button>svg]:size-6 [&>button>svg]:font-thin [&>button>svg]:text-neutral-600 [&>button]:mt-[19px]">
                                        <SheetTitle className="text-primary-500">
                                            Profile Details
                                        </SheetTitle>
                                        <div className="flex flex-col gap-8">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                {adminLogo !== '' && (
                                                    <img
                                                        src={adminLogo}
                                                        alt="logo"
                                                        className="size-48 object-contain"
                                                    />
                                                )}
                                                <h1>{adminDetails?.full_name}</h1>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h1 className="whitespace-nowrap">Role Type</h1>
                                                    {adminDetails.roles?.map((role, idx) => {
                                                        const bgColor =
                                                            roleColors[
                                                                role.role_name.toUpperCase()
                                                            ] || '#EDEDED';
                                                        return (
                                                            <Badge
                                                                key={idx}
                                                                className={`whitespace-nowrap rounded-lg border border-neutral-300 py-1.5 font-thin shadow-none`}
                                                                style={{ backgroundColor: bgColor }}
                                                            >
                                                                {role.role_name}
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                                {canEditProfile ? (
                                                    <AdminProfile adminDetails={adminDetails} />
                                                ) : null}
                                            </div>
                                            <Separator />
                                            <div className="flex flex-col gap-2">
                                                <div className=" flex items-center justify-between">
                                                    <h1>Account Information</h1>
                                                    <MyButton
                                                        buttonType="secondary"
                                                        scale="small"
                                                        onClick={() => {
                                                            setShowEditAccountDetails(true);
                                                        }}
                                                    >
                                                        Edit Details
                                                    </MyButton>
                                                </div>
                                                <p className="text-sm text-neutral-600">
                                                    <span>Username:&nbsp;</span>
                                                    <span>{getUserName()}</span>
                                                </p>
                                            </div>
                                            <Separator />
                                            <div className="flex flex-col gap-2">
                                                <h1>Contact Information</h1>
                                                <p className="text-sm text-neutral-600">
                                                    <span>Email:&nbsp;</span>
                                                    <span>{adminDetails?.email}</span>
                                                </p>
                                                <p className="text-sm text-neutral-600">
                                                    <span>Mobile:&nbsp;</span>
                                                    <span>+{adminDetails?.mobile_number}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            )}
                            {canViewInstitute && (
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
                                                        className="size-48 object-contain"
                                                    />
                                                )}
                                                <h1>{instituteDetails?.institute_name}</h1>
                                                <div className="flex items-center gap-2">
                                                    <h1>Institute Type</h1>
                                                    <p className="rounded-lg border px-2 py-1 text-sm text-neutral-600">
                                                        {instituteDetails?.type}
                                                    </p>
                                                </div>
                                                {canEditInstitute ? (
                                                    <EditDashboardProfileComponent isEdit={true} />
                                                ) : null}
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
                                                    <span>+{instituteDetails?.phone}</span>
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
                                    </SheetContent>
                                </Sheet>
                            )}
                            {roles.includes('STUDENT') && (
                                <DropdownMenuItem className="w-full cursor-pointer">
                                    <SSOSwitcher variant="dropdown" />
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="w-full cursor-pointer"
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            {showEditAccountDetails && (
                <AccountDetailsEdit
                    open={showEditAccountDetails}
                    setOpen={setShowEditAccountDetails}
                />
            )}
        </div>
    );
}
