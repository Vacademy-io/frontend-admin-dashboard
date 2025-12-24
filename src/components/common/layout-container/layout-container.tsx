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
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile';
import { useCompactMode } from '@/hooks/use-compact-mode';

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
    const { open, setOpen, isMobile: sidebarIsMobile } = useSidebar();
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const { isCompact } = useCompactMode();
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const roles = getUserRoles(accessToken);
    const isAdmin = roles.includes('ADMIN');
    const roleKey = isAdmin ? ADMIN_DISPLAY_SETTINGS_KEY : TEACHER_DISPLAY_SETTINGS_KEY;
    const roleDisplay = getDisplaySettingsFromCache(roleKey);
    const showMainSidebar = roleDisplay?.ui?.showSidebar !== false;

    useEffect(() => {
        // Skip automatic sidebar control if customSidebarControl is enabled
        if (customSidebarControl) return;

        // On mobile, sidebar is handled via Sheet (drawer), so we don't need to collapse
        if (isMobile) return;

        // On tablet, always collapse the sidebar
        if (isTablet) {
            setOpen(false);
            return;
        }

        // On desktop, expand if no internal sidebar, collapse if there is
        const isCollapse = !(internalSideBar || hasInternalSidebarComponent);
        setOpen(isCollapse);
    }, [internalSideBar, hasInternalSidebarComponent, customSidebarControl, isMobile, isTablet, setOpen]);

    // Calculate content max-width based on screen size and sidebar states
    const getContentMaxWidth = () => {
        // Mobile: full width with padding
        if (isMobile) {
            return 'max-w-full';
        }

        // Tablet: simplified layout
        if (isTablet) {
            if (internalSideBar || hasInternalSidebarComponent) {
                return 'max-w-[calc(100vw-80px-240px)]'; // collapsed sidebar + internal sidebar
            }
            return 'max-w-[calc(100vw-80px)]'; // just collapsed sidebar
        }

        // Desktop: full calculations
        if (!showMainSidebar) {
            // main sidebar hidden entirely — don't reserve space for it
            if (intrnalMargin) {
                if (internalSideBar || hasInternalSidebarComponent) {
                    return 'max-w-[calc(100vw-56px-290px)]';
                }
                return 'max-w-[calc(100vw-56px)]';
            }
            if (internalSideBar || hasInternalSidebarComponent) {
                return 'max-w-[calc(100vw-290px)]';
            }
            return 'max-w-[calc(100vw)]';
        }

        if (open) {
            // Sidebar expanded
            const sidebarWidth = isCompact ? 220 : 307;
            const gap = isCompact ? 15 : 15; // gap between sidebar and content
            const totalSidebarSpace = sidebarWidth + gap;

            if (intrnalMargin) {
                if (internalSideBar || hasInternalSidebarComponent) {
                    return `max-w-[calc(100vw-${totalSidebarSpace}px-56px-290px)]`;
                }
                return `max-w-[calc(100vw-${totalSidebarSpace}px-56px)]`;
            }
            if (internalSideBar || hasInternalSidebarComponent) {
                return `max-w-[calc(100vw-${sidebarWidth}px)]`;
            }
            return `max-w-[calc(100vw-${sidebarWidth}px)]`;
        }

        // Sidebar collapsed
        const collapsedWidth = isCompact ? 56 : 112;
        if (internalSideBar || hasInternalSidebarComponent) {
            return `max-w-[calc(100vw-${collapsedWidth}px-56px-290px)]`;
        }
        return `max-w-[calc(100vw-${collapsedWidth}px-56px)]`;
    };

    return (
        <div className="flex w-full min-h-screen">
            {/* Main Sidebar - Hidden on mobile (handled by Sheet), shown on tablet/desktop */}
            {showMainSidebar && (
                <div className={cn(
                    'hidden md:block',
                    open
                        ? (isCompact ? 'md:w-[220px]' : 'md:w-[307px]')
                        : (isCompact ? 'md:w-[56px]' : 'md:w-[112px]'),
                    'flex-shrink-0 transition-all duration-200'
                )}>
                    <MySidebar sidebarComponent={sidebarComponent} />
                </div>
            )}

            {/* Mobile Sidebar - Rendered as Sheet/Drawer via MySidebar component */}
            {showMainSidebar && isMobile && (
                <MySidebar sidebarComponent={sidebarComponent} />
            )}

            {/* Internal Sidebar - Hidden on mobile, collapsible on tablet */}
            {(hasInternalSidebarComponent || internalSideBar) && (
                <div className={cn(
                    'sticky top-0 h-screen flex-shrink-0',
                    'hidden lg:block', // Hide on mobile and tablet by default
                    isTablet && 'lg:hidden xl:block' // Show on tablet only for xl+
                )}>
                    {hasInternalSidebarComponent && internalSidebarComponent ? (
                        <InternalSidebarComponent sidebarComponent={internalSidebarComponent} />
                    ) : (
                        internalSideBar && (
                            <InternalSideBar sideBarList={sideBarList} sideBarData={sideBarData} />
                        )
                    )}
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex w-full flex-1 flex-col text-neutral-600 min-w-0">
                <Navbar />
                <StudentSidebarProvider>
                    <div
                        className={cn(
                            // Responsive padding - reduced in compact mode
                            intrnalMargin
                                ? (isCompact
                                    ? 'p-2 md:p-3 lg:m-4 flex flex-1 flex-col'
                                    : 'p-4 md:p-6 lg:m-7 flex flex-1 flex-col')
                                : 'm-0',
                            // Responsive max-width
                            isMobile ? 'max-w-full' : getContentMaxWidth(),
                            // Ensure content doesn't overflow
                            'overflow-x-hidden',
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
