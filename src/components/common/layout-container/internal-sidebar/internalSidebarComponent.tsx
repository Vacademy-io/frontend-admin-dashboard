import { useSuspenseQuery } from '@tanstack/react-query';
import { SidebarItem } from '@/routes/evaluator-ai/-components/layout-container/sidebar/sidebar-item';
import { SidebarItemsData } from '@/routes/evaluator-ai/-components/layout-container/sidebar/utils';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import React, { useState } from 'react';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { filterMenuItems, filterMenuListByModules } from '../sidebar/helper';
import { useTabSettings } from '@/hooks/use-tab-settings';
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { List } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export const InternalSidebarComponent = ({
    sidebarComponent,
}: {
    sidebarComponent: React.ReactNode;
}) => {
    const { data, isLoading } = useSuspenseQuery(useInstituteQuery());
    const { isTabVisible, isSubItemVisible } = useTabSettings();
    const sideBarData = filterMenuListByModules(data?.sub_modules, SidebarItemsData);
    const sideBarItems = filterMenuItems(sideBarData, data?.id, isTabVisible, isSubItemVisible);
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const [isOpen, setIsOpen] = useState(false);

    if (isLoading) {
        return <DashboardLoader />;
    }

    // Sidebar content - shared between mobile drawer and desktop sidebar
    const sidebarContent = (
        <div>
            {sidebarComponent
                ? sidebarComponent
                : sideBarItems.map((obj, key) => (
                      <div key={key} id={obj.id} className="pb-5">
                          <SidebarItem
                              icon={obj.icon}
                              subItems={obj.subItems}
                              title={obj.title}
                              to={obj.to}
                          />
                      </div>
                  ))}
        </div>
    );

    // Mobile/Tablet: Render as Sheet/Drawer with a trigger button
    if (isMobile || isTablet) {
        return (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="fixed bottom-4 right-4 z-50 shadow-lg md:bottom-6 md:right-6"
                    >
                        <List className="mr-2 size-4" />
                        Menu
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] overflow-y-auto bg-primary-50 p-0">
                    <SheetHeader className="sr-only px-3 pt-6">
                        <SheetTitle>Navigation</SheetTitle>
                    </SheetHeader>
                    <div
                        className="flex h-full flex-col gap-6 pb-5 pt-10"
                        onClick={(e) => {
                            // Close sidebar when clicking on a link
                            const target = e.target as HTMLElement;
                            if (target.closest('a') || target.closest('[role="button"]')) {
                                setIsOpen(false);
                            }
                        }}
                    >
                        {sidebarContent}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    // Desktop: Render as regular sidebar
    return (
        <div className="relative flex h-screen w-[307px] flex-col gap-6 overflow-y-scroll bg-primary-50 pb-5 pt-10">
            {sidebarContent}
        </div>
    );
};
