import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from '@/components/ui/sidebar';
import { X } from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContentStore } from '../../-stores/chapter-sidebar-store';
import { DoubtFilter } from '../../-types/get-doubts-type';
import { useGetDoubts } from '../../-services/GetDoubts';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { Doubt as DoubtType } from '../../-types/get-doubts-type';
import { DoubtList } from './doubtList';
import { get30DaysAgo, getTomorrow } from '@/utils/dateUtils';

const TabsTriggerClass =
    'w-full data-[state=active]:shadow-none rounded-none rounded-tl-md rounded-tr-md border-white border-l-[1px] border-r-[1px] border-t-[1px] data-[state=active]:border-primary-200 data-[state=active]:text-primary-500 pt-2';

const DoubtResolutionSidebar = () => {
    const { open, setOpen } = useSidebar();
    const { activeItem } = useContentStore();
    const observer = useRef<IntersectionObserver | null>(null);
    const [activeTab, setActiveTab] = useState('ALL');
    const sidebarRef = useRef<HTMLDivElement>(null);

    const [filter, setFilter] = useState<DoubtFilter>({
        name: '',
        start_date: get30DaysAgo(),
        end_date: getTomorrow(),
        user_ids: [],
        content_positions: [],
        content_types: [
            activeItem?.source_type == 'DOCUMENT'
                ? activeItem?.document_slide?.type || ''
                : activeItem?.source_type || '',
        ],
        sources: ['SLIDE'],
        source_ids: [activeItem?.id || ''],
        status: ['ACTIVE', 'RESOLVED'],
        sort_columns: {
            created_at: 'DESC',
        },
    });

    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useGetDoubts(filter);

    const [allDoubts, setAllDoubts] = useState<DoubtType[]>(
        data?.pages.flatMap((page) => page.content) || []
    );

    useEffect(() => {
        setAllDoubts(data?.pages.flatMap((page) => page.content) || []);
    }, [data]);

    useEffect(() => {
        setFilter((prev) => ({
            ...prev,
            source_ids: [activeItem?.id || ''],
            content_types: [
                activeItem?.source_type == 'DOCUMENT'
                    ? activeItem?.document_slide?.type || ''
                    : activeItem?.source_type || '',
            ],
        }));
    }, [activeItem]);

    useEffect(() => {
        refetch();
    }, [filter]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Only handle click outside if sidebar is open
            if (!open) return;

            const target = event.target as Element;

            // Check if click is outside the sidebar
            if (sidebarRef.current && !sidebarRef.current.contains(target)) {
                // Check if the click is on a DeleteDoubt component or its children
                const isDeleteDoubtClick = target.closest('[data-delete-doubt]');

                // Check if the click is on a dialog or its children
                const isDialogClick =
                    target.closest('[role="dialog"]') ||
                    target.closest('[data-radix-popper-content-wrapper]') ||
                    target.closest('.radix-dialog-content') ||
                    target.closest('[data-state="open"]') ||
                    target.closest('[data-radix-dialog-content]');

                // If it's not a delete doubt click or dialog click, close the sidebar
                if (!isDeleteDoubtClick && !isDialogClick) {
                    setOpen(false);
                }
            }
        };

        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, setOpen]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (value === 'RESOLVED') {
            setFilter((prev) => ({ ...prev, status: ['RESOLVED'] }));
        } else if (value === 'UNRESOLVED') {
            setFilter((prev) => ({ ...prev, status: ['ACTIVE'] }));
        } else {
            setFilter((prev) => ({ ...prev, status: ['ACTIVE', 'RESOLVED'] }));
        }
    };

    const lastDoubtElementRef = useCallback(
        (node: HTMLDivElement) => {
            if (isLoading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            });
            if (node) observer.current.observe(node);
        },
        [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]
    );

    if (isLoading && !data) return <DashboardLoader />;
    if (isError) return <p>Error fetching doubts</p>;

    return (
        <Sidebar
            ref={sidebarRef}
            side="right"
            className={`${open ? 'w-[35vw]' : 'w-0'} flex flex-col gap-6 overflow-y-hidden bg-white p-4`}
        >
            <SidebarHeader className="flex w-full items-center justify-between overflow-y-hidden bg-white">
                <div className="flex w-full items-center justify-between bg-white">
                    <h1 className="text-lg font-semibold text-primary-500 sm:text-2xl">
                        Doubt Resolution
                    </h1>
                    <X className="hover:cursor-pointer" onClick={() => setOpen(false)} />
                </div>
            </SidebarHeader>
            <SidebarContent className="no-scrollbar flex flex-col gap-4 overflow-y-scroll bg-white pt-6">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="flex w-full rounded-none border-b border-neutral-300 bg-white p-0">
                        <TabsTrigger value="ALL" className={TabsTriggerClass}>
                            All
                        </TabsTrigger>
                        <TabsTrigger value="RESOLVED" className={TabsTriggerClass}>
                            Resolved
                        </TabsTrigger>
                        <TabsTrigger value="UNRESOLVED" className={TabsTriggerClass}>
                            Unresolved
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent
                        value="ALL"
                        className="flex flex-col gap-4 data-[state=inactive]:hidden"
                    >
                        <DoubtList
                            allDoubts={allDoubts}
                            isLoading={isLoading}
                            lastDoubtElementRef={lastDoubtElementRef}
                            refetch={refetch}
                            isFetchingNextPage={isFetchingNextPage}
                            status={activeTab}
                        />
                    </TabsContent>
                    <TabsContent
                        value="RESOLVED"
                        className="flex flex-col gap-4 data-[state=inactive]:hidden"
                    >
                        <DoubtList
                            allDoubts={allDoubts}
                            isLoading={isLoading}
                            lastDoubtElementRef={lastDoubtElementRef}
                            refetch={refetch}
                            isFetchingNextPage={isFetchingNextPage}
                            status={activeTab}
                        />
                    </TabsContent>
                    <TabsContent
                        value="UNRESOLVED"
                        className="flex flex-col gap-4 data-[state=inactive]:hidden"
                    >
                        <DoubtList
                            allDoubts={allDoubts}
                            isLoading={isLoading}
                            lastDoubtElementRef={lastDoubtElementRef}
                            refetch={refetch}
                            isFetchingNextPage={isFetchingNextPage}
                            status={activeTab}
                        />
                    </TabsContent>
                </Tabs>
            </SidebarContent>
        </Sidebar>
    );
};

export default DoubtResolutionSidebar;
