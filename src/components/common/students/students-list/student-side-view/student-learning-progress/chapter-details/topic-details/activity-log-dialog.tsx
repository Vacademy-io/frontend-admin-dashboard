import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MyTable } from "@/components/design-system/table";
import { MyPagination } from "@/components/design-system/pagination";
import { ActivityLogType } from "../../../student-view-dummy-data/learning-progress";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ACTIVITY_LOG_COLUMN_WIDTHS } from "@/components/design-system/utils/constants/table-layout";

interface ActivityLogDialogProps {
    isOpen: boolean;
    onClose: () => void;
    activityData: ActivityLogType[];
    topicName: string;
    studyType: string;
}

const activityLogColumns: ColumnDef<ActivityLogType>[] = [
    {
        accessorKey: "activityDate",
        header: "Activity Date",
    },
    {
        accessorKey: "startTime",
        header: "Start Time",
    },
    {
        accessorKey: "endTime",
        header: "End Time",
    },
    {
        accessorKey: "duration",
        header: "Duration",
    },
    {
        accessorKey: "lastPageRead",
        header: "Last Page Read",
    },
];

export const ActivityLogDialog = ({
    isOpen,
    onClose,
    activityData,
    topicName,
    studyType,
}: ActivityLogDialogProps) => {
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = activityData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(activityData.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const tableData = {
        content: currentItems,
        total_pages: totalPages,
        page_no: currentPage,
        page_size: itemsPerPage,
        total_elements: activityData.length,
        last: currentPage === totalPages - 1,
    };

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
                    />

                    <div className="mt-6">
                        <MyPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
