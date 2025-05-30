import { ColumnDef } from "@tanstack/react-table";
import { Doubt } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-types/get-doubts-type";
import { MarkAsResolved } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-components/doubt-resolution/MarkAsResolved";
import { DeleteDoubt } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-components/doubt-resolution/DeleteDoubt";
import { TeacherSelection } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-components/doubt-resolution/TeacherSelection";
import { isUserAdmin } from "@/utils/userDetails";
import { useDoubtFilters } from "@/routes/engagement/doubt-management/-stores/filter-store";
import { useGetDoubtList } from "@/routes/engagement/doubt-management/-services/get-doubt-list";
import { useState } from "react";
import { formatISODateTimeReadable } from "@/helpers/formatISOTime";

export const useDoubtTable = () => {

    const { filters } = useDoubtFilters();

    const [currentPage, setCurrentPage] = useState(0);

    const {
        data: doubts,
        isLoading,
        refetch,
        error,
    } = useGetDoubtList({ filter: filters, pageNo: currentPage, pageSize: 3 });

    return { currentPage, setCurrentPage, doubts, isLoading, error, refetch}
}

export const useDoubtTableColumns = () => {

    const { filters } = useDoubtFilters();
    const isAdmin = isUserAdmin();
    const { refetch } = useDoubtTable();

    const columns: ColumnDef<Doubt>[] = [
        {
            accessorKey: 'doubt',
            header: 'Doubt',
            cell: ({ row }) => {
                const doubt = row.original;
                return (
                    <div>
                        <div dangerouslySetInnerHTML={{ __html: doubt.html_text }} />
                        {/* <div>Slide ID: {doubt.source_id}</div> */}
                        <div>Content Position: {doubt.content_position}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const doubt = row.original;
                return <MarkAsResolved doubt={doubt} refetch={refetch} />;
            },
        },
        {
            accessorKey: 'learner',
            header: 'Learner',
            cell: ({ row }) => row.original.name,
        },
        {
            accessorKey: 'batch',
            header: 'Batch',
            cell: () => '', // Empty for now
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => row.original.content_type,
        },
        {
            accessorKey: 'assignedTo',
            header: 'Assigned To',
            cell: ({ row }) => {
                const doubt = row.original;
                return (
                    <TeacherSelection
                        doubt={doubt}
                        filters={filters}
                        canChange={isAdmin || false}
                    />
                );
            },
        },
        {
            accessorKey: 'raised',
            header: 'Raised',
            cell: ({ row }) => <div>{formatISODateTimeReadable(row.original.raised_time)}</div>,
        },
        {
            accessorKey: 'resolved',
            header: 'Resolved',
            cell: ({ row }) => <div>{formatISODateTimeReadable(row.original.resolved_time || "")}</div>,
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const doubt = row.original;
                return isAdmin && <DeleteDoubt doubt={doubt} refetch={refetch} />;
            },
        },
    ];

    return {columns};
};
