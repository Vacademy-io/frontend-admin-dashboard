// components/activity-log-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MyTable } from "@/components/design-system/table";
import { MyPagination } from "@/components/design-system/pagination";
import { ACTIVITY_LOG_COLUMN_WIDTHS } from "@/components/design-system/utils/constants/table-layout";
import { usePaginationState } from "@/hooks/pagination";
import { useMemo } from "react";
import { activityLogColumns } from "@/components/design-system/utils/constants/table-column-data";
import { useActivityStatsStore } from "@/stores/study-library/activity-stats-store";

export const ActivityLogDialog = () => {
    const { isOpen, closeDialog, selectedTopicName, selectedStudyType, activityData } =
        useActivityStatsStore();

    const { page, pageSize, handlePageChange } = usePaginationState({
        initialPage: 0,
        initialPageSize: 10,
    });

    const tableData = useMemo(() => {
        if (!activityData)
            return {
                content: [],
                total_pages: 0,
                page_no: 0,
                page_size: pageSize,
                total_elements: 0,
                last: true,
            };

        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedItems = activityData.slice(startIndex, endIndex);
        const totalPages = Math.ceil(activityData.length / pageSize);

        return {
            content: paginatedItems,
            total_pages: totalPages,
            page_no: page,
            page_size: pageSize,
            total_elements: activityData.length,
            last: page === totalPages - 1,
        };
    }, [activityData, page, pageSize]);

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="max-w-[800px]">
                <DialogHeader className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-h3 font-semibold text-primary-500">
                            Activity Log ({selectedStudyType})
                        </DialogTitle>
                    </div>
                    <div className="text-subtitle">{selectedTopicName}</div>
                </DialogHeader>

                <div className="mt-6">
                    <MyTable
                        data={tableData}
                        columns={activityLogColumns}
                        isLoading={false}
                        error={null}
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
