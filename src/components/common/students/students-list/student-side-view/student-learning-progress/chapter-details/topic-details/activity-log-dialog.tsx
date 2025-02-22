// activity-log-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MyTable } from "@/components/design-system/table";
import { MyPagination } from "@/components/design-system/pagination";
import { ACTIVITY_LOG_COLUMN_WIDTHS } from "@/components/design-system/utils/constants/table-layout";
import { usePaginationState } from "@/hooks/pagination";
import { useMemo } from "react";
import { activityLogColumns } from "@/components/design-system/utils/constants/table-column-data";
import { useActivityStatsStore } from "@/stores/study-library/activity-stats-store";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { useQuery } from "@tanstack/react-query";
import {
    getUserVideoSlideActivityLogs,
    getUserVideoDocActivityLogs,
} from "@/services/study-library/slide-operations/user-slide-activity-logs";
import { ActivityContent } from "@/types/study-library/user-slide-activity-response-type";

export const ActivityLogDialog = () => {
    const { isOpen, closeDialog, selectedUserId } = useActivityStatsStore();
    const { activeItem } = useContentStore();

    const { page, pageSize, handlePageChange } = usePaginationState({
        initialPage: 0,
        initialPageSize: 5,
    });

    const queryConfig =
        activeItem?.video_url != null
            ? getUserVideoSlideActivityLogs({
                  userId: selectedUserId || "",
                  slideId: activeItem?.slide_id || "",
                  pageNo: page,
                  pageSize: pageSize,
              })
            : getUserVideoDocActivityLogs({
                  userId: selectedUserId || "",
                  slideId: activeItem?.slide_id || "",
                  pageNo: page,
                  pageSize: pageSize,
              });

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
            activityDate: formatDateTime(item.start_time_in_millis).split(",")[0],
            startTime: formatDateTime(item.start_time_in_millis).split(",")[1],
            endTime: formatDateTime(item.end_time_in_millis).split(",")[1],
            duration: `${Math.round(
                (item.end_time_in_millis - item.start_time_in_millis) / 1000 / 60,
            )} mins`,
            lastPageRead: item.percentage_watched,
        }));

        return {
            content: transformedContent,
            total_pages: activityLogs.totalPages,
            page_no: page,
            page_size: pageSize,
            total_elements: activityLogs.totalElements,
            last: activityLogs.last,
        };
    }, [activityLogs, page, pageSize, activeItem]);

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="max-w-[800px]">
                <DialogHeader className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-h3 font-semibold text-primary-500">
                            Activity Log
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="mt-6">
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
            </DialogContent>
        </Dialog>
    );
};
