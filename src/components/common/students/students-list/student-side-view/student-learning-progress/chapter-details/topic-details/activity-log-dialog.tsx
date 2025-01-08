import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MyTable } from "@/components/design-system/table";
import { MyPagination } from "@/components/design-system/pagination";
import { ActivityLogType } from "../../../student-view-dummy-data/learning-progress";
import { ACTIVITY_LOG_COLUMN_WIDTHS } from "@/components/design-system/utils/constants/table-layout";
import { usePaginationState } from "@/hooks/pagination";
import { useMemo } from "react";
import {
    activityLogColumns,
    ActivityLogDialogProps,
} from "@/components/design-system/utils/constants/table-column-data";

export const ActivityLogDialog = ({
    isOpen,
    onClose,
    activityData,
    topicName,
    studyType,
}: ActivityLogDialogProps) => {
    const { page, pageSize, handlePageChange } = usePaginationState({
        initialPage: 0,
        initialPageSize: 10,
    });

    // Calculate paginated data and total pages from static data
    const tableData = useMemo(() => {
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[800px]">
                <DialogHeader className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-h3 font-semibold text-primary-500">
                            Activity Log ({studyType})
                        </DialogTitle>
                    </div>
                    <div className="text-subtitle">{topicName}</div>
                </DialogHeader>

                <div className="mt-6">
                    <MyTable<ActivityLogType>
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
