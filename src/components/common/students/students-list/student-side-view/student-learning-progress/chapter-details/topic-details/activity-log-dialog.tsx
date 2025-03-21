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
import { StudentTable } from "@/schemas/student/student-list/table-schema";
import { SlideWithStatusType } from "@/types/students/student-slides-progress-type";

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
        const userId = selectedUser && slideData ? selectedUser.user_id : selectedUserId || "";
        const slideId = selectedUser && slideData ? slideData.slide_id : activeItem?.slide_id || "";

        return activeItem?.video_url != null
            ? getUserVideoSlideActivityLogs({
                  userId,
                  slideId,
                  pageNo: page,
                  pageSize: pageSize,
              })
            : getUserVideoDocActivityLogs({
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
            activityDate: formatDateTime(item.start_time_in_millis).split(",")[0],
            startTime: formatDateTime(item.start_time_in_millis).split(",")[1],
            endTime: formatDateTime(item.end_time_in_millis).split(",")[1],
            duration: `${(
                (item.end_time_in_millis - item.start_time_in_millis) /
                1000 /
                60
            ).toFixed(2)} mins`,
            lastPageRead: item.percentage_watched,
            videos: item.videos,
            documents: item.documents,
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
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="w-[700px] max-w-[800px]">
                <DialogHeader className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-h3 font-semibold text-primary-500">
                            Activity Log
                        </DialogTitle>
                    </div>
                </DialogHeader>

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
            </DialogContent>
        </Dialog>
    );
};
