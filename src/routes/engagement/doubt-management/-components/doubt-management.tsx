import { useEffect, useState } from 'react';
import { useDoubtFilters } from '../-stores/filter-store';
import { Filters } from './filters/filters';
import { useGetDoubtList } from '../-services/get-doubt-list';
import { MyTable } from '@/components/design-system/table';
import { MyPagination } from '@/components/design-system/pagination';
import { ColumnDef } from '@tanstack/react-table';
import { Doubt } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-types/get-doubts-type';
import { TeacherSelection } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-components/doubt-resolution/TeacherSelection';
import { MarkAsResolved } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-components/doubt-resolution/MarkAsResolved';
import { DeleteDoubt } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-components/doubt-resolution/DeleteDoubt';
import { isUserAdmin } from '@/utils/userDetails';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';

export const DoubtManagement = () => {
    const { filters } = useDoubtFilters();
    const isAdmin = isUserAdmin();

    const [currentPage, setCurrentPage] = useState(0);
    const {
        data: doubts,
        isLoading,
        refetch,
        error,
    } = useGetDoubtList({ filter: filters, pageNo: currentPage, pageSize: 10 });

    useEffect(() => {
        console.log('filters: ', filters);
        console.log('doubts: ', doubts?.content);
    }, [filters, doubts]);

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
            cell: ({ row }) => row.original.raised_time,
        },
        {
            accessorKey: 'resolved',
            header: 'Resolved',
            cell: ({ row }) => row.original.resolved_time,
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const { setNavHeading } = useNavHeadingStore();
    useEffect(() => {
        setNavHeading('Doubt Management');
    }, []);

    return (
        <div className="flex flex-col gap-8">
            <Filters />
            <MyTable<Doubt>
                currentPage={currentPage}
                data={doubts}
                columns={columns}
                isLoading={isLoading}
                error={error}
                scrollable
            />
            {doubts && doubts.total_pages > 1 && (
                <MyPagination
                    currentPage={currentPage}
                    totalPages={doubts.total_pages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};
