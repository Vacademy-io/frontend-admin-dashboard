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
    'flex-1 rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600 data-[state=active]:shadow-sm';

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
        (data as any)?.pages?.flatMap((page: { content: DoubtType[] }) => page.content) || []
    );

    useEffect(() => {
        setAllDoubts(
            (data as any)?.pages?.flatMap((page: { content: DoubtType[] }) => page.content) || []
        );
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
            className={`fixed right-0 top-0 z-[9999] h-full ${
                open ? 'w-[35vw] min-w-[450px]' : 'w-0'
            } flex flex-col overflow-y-hidden border-l border-neutral-200 bg-white shadow-lg transition-all duration-300 ease-in-out`}
        >
            <SidebarHeader className="flex w-full items-center justify-between border-b border-neutral-200 p-4">
                <div className="flex w-full items-center justify-between">
                    <h1 className="text-lg font-semibold text-neutral-800">Doubt Resolution</h1>
                    <X
                        size={20}
                        className="cursor-pointer text-neutral-500 hover:text-neutral-700"
                        onClick={() => setOpen(false)}
                    />
                </div>
            </SidebarHeader>
            <SidebarContent className="no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 gap-2 rounded-lg bg-neutral-100 p-1">
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
                        className="mt-4 flex flex-col data-[state=inactive]:hidden"
                    >
                        <DoubtList
                            allDoubts={allDoubts}
                            isLoading={
                                isLoading &&
                                (!(data as any)?.pages || (data as any).pages.length === 0)
                            }
                            lastDoubtElementRef={lastDoubtElementRef}
                            refetch={refetch}
                            isFetchingNextPage={isFetchingNextPage}
                            status={activeTab}
                        />
                    </TabsContent>
                    <TabsContent
                        value="RESOLVED"
                        className="mt-4 flex flex-col data-[state=inactive]:hidden"
                    >
                        <DoubtList
                            allDoubts={allDoubts}
                            isLoading={
                                isLoading &&
                                (!(data as any)?.pages || (data as any).pages.length === 0)
                            }
                            lastDoubtElementRef={lastDoubtElementRef}
                            refetch={refetch}
                            isFetchingNextPage={isFetchingNextPage}
                            status={activeTab}
                        />
                    </TabsContent>
                    <TabsContent
                        value="UNRESOLVED"
                        className="mt-4 flex flex-col data-[state=inactive]:hidden"
                    >
                        <DoubtList
                            allDoubts={allDoubts}
                            isLoading={
                                isLoading &&
                                (!(data as any)?.pages || (data as any).pages.length === 0)
                            }
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
