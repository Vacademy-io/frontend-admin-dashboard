import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from '@/components/ui/sidebar';
import { X } from '@phosphor-icons/react';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContentStore } from '../../-stores/chapter-sidebar-store';
import { DoubtFilter } from '../../-types/get-doubts-type';
import { useGetDoubts } from '../../-services/GetDoubts';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { Doubt } from './doubt';
import { Doubt as DoubtType } from '../../-types/get-doubts-type';

const TabsTriggerClass =
    'w-full data-[state=active]:shadow-none rounded-none rounded-tl-md rounded-tr-md border-white border-l-[1px] border-r-[1px] border-t-[1px] data-[state=active]:border-primary-200 data-[state=active]:text-primary-500 pt-2';

export const DoubtResolutionSidebar = ({
    setDoubtProgressMarkerPdf,
    setDoubtProgressMarkerVideo,
}: {
    setDoubtProgressMarkerPdf: Dispatch<SetStateAction<number | null>>;
    setDoubtProgressMarkerVideo: Dispatch<SetStateAction<number | null>>;
}) => {
    const { open, setOpen } = useSidebar();
    const { activeItem } = useContentStore();
    const observer = useRef<IntersectionObserver | null>(null);

    const [filter, setFilter] = useState<DoubtFilter>({
        name: '',
        start_date:
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
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

    const handleTabChange = (value: string) => {
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

    if (isLoading) return <DashboardLoader />;
    if (isError) return <p>Error fetching doubts</p>;

    return (
        // <SidebarProvider >
        <Sidebar
            side="right"
            className={`${open ? 'w-[50vw]' : 'w-0'} flex flex-col gap-6 overflow-y-hidden bg-white p-4`}
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
                <Tabs
                    defaultValue="ALL"
                    onValueChange={(value) => {
                        handleTabChange(value);
                    }}
                >
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
                    <TabsContent value="ALL" className="flex flex-col gap-4">
                        {allDoubts.map((doubt, index) => (
                            <div
                                key={doubt.id || index}
                                ref={
                                    index === allDoubts.length - 1 ? lastDoubtElementRef : undefined
                                }
                            >
                                <Doubt
                                    doubt={doubt}
                                    setDoubtProgressMarkerPdf={setDoubtProgressMarkerPdf}
                                    setDoubtProgressMarkerVideo={setDoubtProgressMarkerVideo}
                                    refetch={refetch}
                                />
                            </div>
                        ))}
                        {isFetchingNextPage && <DashboardLoader />}
                    </TabsContent>
                </Tabs>
            </SidebarContent>
        </Sidebar>
        // </SidebarProvider>
    );
};
