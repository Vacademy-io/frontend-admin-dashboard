import { MySidebar } from './sidebar/mySidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { Navbar } from './top-navbar.tsx/navbar';
import { cn } from '@/lib/utils';
import React, { useEffect } from 'react';
import { InternalSideBar } from './internal-sidebar/internalSideBar';
import { StudentSidebarProvider } from '@/routes/manage-students/students-list/-providers/student-sidebar-provider';
import { InternalSidebarComponent } from './internal-sidebar/internalSidebarComponent';
import { getDisplaySettingsFromCache } from '@/services/display-settings';
import { ADMIN_DISPLAY_SETTINGS_KEY, TEACHER_DISPLAY_SETTINGS_KEY } from '@/types/display-settings';
import { getTokenFromCookie, getUserRoles } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

export const LayoutContainer = ({
    children,
    className,
    sidebarComponent,
    intrnalMargin = true,
    internalSideBar = false,
    sideBarList,
    sideBarData,
    internalSidebarComponent,
    hasInternalSidebarComponent = false,
    customSidebarControl = false,
}: {
    children?: React.ReactNode;
    className?: string;
    sidebarComponent?: React.ReactNode;
    intrnalMargin?: boolean;
    internalSideBar?: boolean;
    sideBarList?: { value: string; id: string }[];
    sideBarData?: { title: string; listIconText: string; searchParam: string };
    hasInternalSidebarComponent?: boolean;
    internalSidebarComponent?: React.ReactNode;
    customSidebarControl?: boolean;
}) => {
    const { open, setOpen } = useSidebar();
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const roles = getUserRoles(accessToken);
    const isAdmin = roles.includes('ADMIN');
    const roleKey = isAdmin ? ADMIN_DISPLAY_SETTINGS_KEY : TEACHER_DISPLAY_SETTINGS_KEY;
    const roleDisplay = getDisplaySettingsFromCache(roleKey);
    const showMainSidebar = roleDisplay?.ui?.showSidebar !== false;
    useEffect(() => {
        // Skip automatic sidebar control if customSidebarControl is enabled
        if (customSidebarControl) return;

        const isCollapse = !(internalSideBar || hasInternalSidebarComponent);
        setOpen(isCollapse);
    }, [internalSideBar, hasInternalSidebarComponent, customSidebarControl]);
    return (
        <div className={`flex w-full`}>
            <div className={`flex ${showMainSidebar ? (open ? 'gap-12' : 'gap-16') : 'gap-0'}`}>
                {showMainSidebar && (
                    <div>
                        <MySidebar sidebarComponent={sidebarComponent} />
                    </div>
                )}
                <div className="sticky top-0 h-screen">
                    {hasInternalSidebarComponent && internalSidebarComponent ? (
                        <InternalSidebarComponent sidebarComponent={internalSidebarComponent} />
                    ) : (
                        internalSideBar && (
                            <InternalSideBar sideBarList={sideBarList} sideBarData={sideBarData} />
                        )
                    )}
                </div>
            </div>
            <div className="flex w-full flex-1 flex-col text-neutral-600">
                <Navbar />
                <StudentSidebarProvider>
                    <div
                        className={cn(
                            intrnalMargin ? `m-7 flex flex-1 flex-col` : `m-0`,
                            showMainSidebar && open
                                ? intrnalMargin
                                    ? internalSideBar || hasInternalSidebarComponent
                                        ? `max-w-[calc(100vw-322px-56px-290px)]`
                                        : `max-w-[calc(100vw-322px-56px)]`
                                    : internalSideBar || hasInternalSidebarComponent
                                      ? `max-w-[calc(100vw-320px)]`
                                      : `max-w-[calc(100vw-320px)]`
                                : showMainSidebar && !open
                                  ? internalSideBar || hasInternalSidebarComponent
                                      ? `max-w-[calc(100vw-132px-56px-290px)]`
                                      : `max-w-[calc(100vw-132px-56px)]`
                                  : // main sidebar hidden entirely — don't reserve space for it
                                    intrnalMargin
                                    ? internalSideBar || hasInternalSidebarComponent
                                        ? `max-w-[calc(100vw-56px-290px)]`
                                        : `max-w-[calc(100vw-56px)]`
                                    : internalSideBar || hasInternalSidebarComponent
                                      ? `max-w-[calc(100vw-290px)]`
                                      : `max-w-[calc(100vw)]`,
                            className
                        )}
                    >
                        {children}
                    </div>
                </StudentSidebarProvider>
            </div>
        </div>
    );
};

{
    /* <div
className={cn(
    intrnalMargin ? `m-7 flex flex-1 flex-col` : `m-0`,
    open
        ? intrnalMargin
            ? `max-w-[calc(100vw-322px-56px-290px)]`
            : `max-w-[calc(100vw-320px)]`
        : intrnalMargin
          ? `max-w-[calc(100vw-132px-56px-290px)]`
          : `max-w-[calc(100vw-132px)]`,
    className
)}
> */
}
