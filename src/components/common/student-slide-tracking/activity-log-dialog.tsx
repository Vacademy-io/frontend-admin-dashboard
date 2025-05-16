// activity-log-dialog.tsx
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MyTable } from '@/components/design-system/table';
import { MyPagination } from '@/components/design-system/pagination';
import { ACTIVITY_LOG_COLUMN_WIDTHS } from '@/components/design-system/utils/constants/table-layout';
import { usePaginationState } from '@/hooks/pagination';
import { useMemo } from 'react';
import { activityLogColumns } from '@/components/design-system/utils/constants/table-column-data';
import { useActivityStatsStore } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/activity-stats-store';
import { useContentStore } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
import { useQuery } from '@tanstack/react-query';
import {
    getUserVideoSlideActivityLogs,
    getUserDocActivityLogs,
} from '@/services/study-library/slide-operations/user-slide-activity-logs';
import { ActivityContent } from '@/types/study-library/user-slide-activity-response-type';
import { StudentTable } from '@/types/student-table-types';
import { SlideWithStatusType } from '@/routes/manage-students/students-list/-types/student-slides-progress-type';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ActivityLogDialog = ({
    selectedUser,
    slideData,
}: {
    selectedUser?: StudentTable | null;
    slideData?: SlideWithStatusType;
}) => {
    const { isOpen, closeDialog, selectedUserId } = useActivityStatsStore();
    const { activeItem } = useContentStore();

    const { page, pageSize, handlePageChange } = usePaginationState({
        initialPage: 0,
        initialPageSize: 5,
    });

    const queryConfig = useMemo(() => {
        const userId = selectedUser && slideData ? selectedUser.user_id : selectedUserId || '';
        const slideId = selectedUser && slideData ? slideData.slide_id : activeItem?.id || '';

        return activeItem?.video_slide?.url != null
            ? getUserVideoSlideActivityLogs({
                  userId,
                  slideId,
                  pageNo: page,
                  pageSize: pageSize,
              })
            : getUserDocActivityLogs({
                  userId,
                  slideId,
                  pageNo: page,
                  pageSize: pageSize,
              });
    }, [selectedUser, slideData, selectedUserId, activeItem, page, pageSize]);

    const { data: activityLogs, isLoading, error } = useQuery(queryConfig);

    const formatDateTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const tableData = useMemo(() => {
        if (!activityLogs) {
            return {
                content: [],
                total_pages: 0,
                page_no: 0,
                page_size: pageSize,
                total_elements: 0,
                last: true,
            };
        }

        const transformedContent = activityLogs.content.map((item: ActivityContent) => ({
            activityDate: formatDateTime(item.start_time_in_millis).split(',')[0],
            startTime: formatDateTime(item.start_time_in_millis).split(',')[1],
            endTime: formatDateTime(item.end_time_in_millis).split(',')[1],
            duration: `${(
                (item.end_time_in_millis - item.start_time_in_millis) /
                1000 /
                60
            ).toFixed(2)} mins`,
            lastPageRead: item.percentage_watched,
            videos: item.videos,
            documents: item.documents,
            concentrationScore: item.concentration_score?.concentration_score || 0,
        }));

        return {
            content: transformedContent,
            total_pages: activityLogs.totalPages,
            page_no: page,
            page_size: pageSize,
            total_elements: activityLogs.totalElements,
            last: activityLogs.last,
        };
    }, [activityLogs, page, pageSize, selectedUser, slideData, activeItem]);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={closeDialog}>
                <DialogContent className="w-fit p-0">
                    <h1 className="rounded-t-lg bg-primary-50 p-4 font-semibold text-primary-500">
                        Activity Log
                    </h1>
                    {tableData.content.length == 0 ? (
                        <p className="text-primary-500">No activity found</p>
                    ) : (
                        <>
                            <Tabs defaultValue="insights" className="p-4">
                                <TabsList>
                                    <TabsTrigger value="insights">View Insights</TabsTrigger>
                                    <TabsTrigger value="responses">Responses</TabsTrigger>
                                </TabsList>
                                <TabsContent value="insights">
                                    <div className="no-scrollbar mt-6 overflow-x-scroll">
                                        <MyTable
                                            data={tableData}
                                            columns={activityLogColumns}
                                            isLoading={isLoading}
                                            error={error}
                                            columnWidths={ACTIVITY_LOG_COLUMN_WIDTHS}
                                            currentPage={page}
                                        />

                                        <div className="mt-6">
                                            <MyPagination
                                                currentPage={page}
                                                totalPages={tableData.total_pages}
                                                onPageChange={handlePageChange}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="responses">
                                    <div className="no-scrollbar mt-6 overflow-x-scroll">
                                        <MyTable
                                            data={tableData}
                                            columns={activityLogColumns}
                                            isLoading={isLoading}
                                            error={error}
                                            columnWidths={ACTIVITY_LOG_COLUMN_WIDTHS}
                                            currentPage={page}
                                        />
                                        <div className="mt-6">
                                            <MyPagination
                                                currentPage={page}
                                                totalPages={tableData.total_pages}
                                                onPageChange={handlePageChange}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
