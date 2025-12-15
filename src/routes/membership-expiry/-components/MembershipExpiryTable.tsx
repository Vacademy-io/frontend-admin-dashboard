import { MyTable } from '@/components/design-system/table';
import { Badge } from '@/components/ui/badge';
import type { MembershipDetail, MembershipStatus, MembershipDetailsResponse } from '@/types/membership-expiry';
import { format } from 'date-fns';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { MyPagination } from '@/components/design-system/pagination';

interface Props {
    data: MembershipDetailsResponse | undefined;
    isLoading: boolean;
    error: Error | null;
    currentPage: number;
    onPageChange: (page: number) => void;
}

const columnHelper = createColumnHelper<MembershipDetail>();

export function MembershipExpiryTable({ data, isLoading, error, currentPage, onPageChange }: Props) {
    const columns = useMemo<any>(() => [
        columnHelper.accessor('user_details.full_name', {
            header: 'User',
            cell: (info) => (
                <div>
                    <div className="font-medium text-gray-900">{info.getValue()}</div>
                    <div className="text-xs text-gray-500">{info.row.original.user_details.email}</div>
                    <div className="text-xs text-gray-500">{info.row.original.user_details.mobile_number}</div>
                </div>
            ),
        }),
        columnHelper.accessor('user_plan.payment_plan_dto.name', {
            header: 'Plan',
            cell: (info) => (
                <div>
                    <div className="font-medium">{info.getValue()}</div>
                    {info.row.original.package_sessions?.map((ps, idx) => (
                        <div key={idx} className="text-xs text-gray-500">
                            {ps.package_name} - {ps.session_name} ({ps.level_name})
                        </div>
                    ))}
                </div>
            ),
        }),
        columnHelper.accessor('membership_status', {
            header: 'Status',
            cell: (info) => {
                const status = info.getValue() as MembershipStatus;
                let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
                if (status === 'ENDED') variant = 'destructive';
                if (status === 'ABOUT_TO_END') variant = 'secondary';
                if (status === 'LIFETIME') variant = 'outline';

                return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>;
            },
        }),
        columnHelper.accessor((row) => row.user_plan.end_date, {
            id: 'end_date',
            header: 'Expiration Date',
            cell: (info) => {
                const date = info.getValue();
                return date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A';
            },
        }),
    ], []);

    const tableData = useMemo(() => {
        if (!data) return undefined;
        return {
            content: data.content,
            total_elements: data.totalElements,
            total_pages: data.totalPages,
            page_no: data.number,
            page_size: data.size,
            last: data.last
        };
    }, [data]);

    if (error) {
        return <div className="p-4 text-center text-red-500">Error loading data</div>;
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <MyTable
                    data={tableData}
                    columns={columns}
                    isLoading={isLoading}
                    error={error}
                    currentPage={currentPage}
                />
            </div>
            {data && (
                <MyPagination
                    currentPage={currentPage}
                    totalPages={data.totalPages}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
}
