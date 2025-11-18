import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MyTable, TableData } from '@/components/design-system/table';
import { MyPagination } from '@/components/design-system/pagination';
import type { PaymentLogEntry, PaymentLogsResponse } from '@/types/payment-logs';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { DashboardLoader } from '@/components/core/dashboard-loader';

interface PaymentLogsTableProps {
    data: PaymentLogsResponse | undefined;
    isLoading: boolean;
    error: unknown;
    currentPage: number;
    onPageChange: (page: number) => void;
    packageSessions?: Record<string, string>;
}

const getStatusBadgeVariant = (
    status: string
): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'PAID':
            return 'default';
        case 'FAILED':
            return 'destructive';
        case 'PAYMENT_PENDING':
            return 'secondary';
        case 'NOT_INITIATED':
            return 'outline';
        default:
            return 'secondary';
    }
};

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
    }).format(amount);
};

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatRelativeTime = (dateString: string) => {
    if (!dateString) return '-';
    try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
        return '-';
    }
};

export function PaymentLogsTable({
    data,
    isLoading,
    error,
    currentPage,
    onPageChange,
}: PaymentLogsTableProps) {
    // Transform API response to TableData format
    const tableData: TableData<PaymentLogEntry> | undefined = useMemo(() => {
        if (!data) return undefined;
        return {
            content: data.content,
            total_pages: data.total_pages,
            page_no: data.number,
            page_size: data.size,
            total_elements: data.total_elements,
            last: data.last,
        };
    }, [data]);

    const columns = useMemo<ColumnDef<PaymentLogEntry>[]>(
        () => [
            {
                id: 'payment_date',
                header: 'Date & Time',
                accessorFn: (row) => row.payment_log.date,
                cell: ({ row }) => {
                    const date = row.original.payment_log.date;
                    return (
                        <div className="space-y-1">
                            <div className="font-medium text-gray-900">{formatDate(date)}</div>
                            <div className="text-xs text-gray-500">{formatRelativeTime(date)}</div>
                        </div>
                    );
                },
                size: 180,
            },
            {
                id: 'user_id',
                header: 'User ID',
                accessorFn: (row) => row.payment_log.user_id,
                cell: ({ row }) => (
                    <div className="font-mono text-sm text-gray-700">
                        {row.original.payment_log.user_id?.slice(0, 8)}...
                    </div>
                ),
                size: 120,
            },
            {
                id: 'amount',
                header: 'Amount',
                accessorFn: (row) => row.payment_log.payment_amount,
                cell: ({ row }) => {
                    const amount = row.original.payment_log.payment_amount;
                    const currency = row.original.payment_log.currency;
                    return (
                        <div className="font-semibold text-gray-900">
                            {formatCurrency(amount, currency)}
                        </div>
                    );
                },
                size: 130,
            },
            {
                id: 'current_payment_status',
                header: 'Payment Status',
                accessorFn: (row) => row.current_payment_status,
                cell: ({ row }) => {
                    const status = row.original.current_payment_status;
                    return (
                        <Badge variant={getStatusBadgeVariant(status)} className="font-medium">
                            {status?.replace(/_/g, ' ')}
                        </Badge>
                    );
                },
                size: 140,
            },
            {
                id: 'vendor',
                header: 'Payment Method',
                accessorFn: (row) => row.payment_log.vendor,
                cell: ({ row }) => {
                    const vendor = row.original.payment_log.vendor;
                    return (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">{vendor || '-'}</span>
                        </div>
                    );
                },
                size: 140,
            },
            {
                id: 'user_plan_status',
                header: 'Plan Status',
                accessorFn: (row) => row.user_plan.status,
                cell: ({ row }) => {
                    const status = row.original.user_plan.status;
                    return (
                        <Badge variant="outline" className="font-normal">
                            {status?.replace(/_/g, ' ')}
                        </Badge>
                    );
                },
                size: 130,
            },
            {
                id: 'package_session',
                header: 'Session',
                accessorFn: (row) => row.user_plan.enroll_invite_id,
                cell: ({ row }) => {
                    const enrollInviteId = row.original.user_plan.enroll_invite_id;
                    // We'll get package session from the enroll invite
                    return (
                        <div className="text-sm text-gray-600">
                            {enrollInviteId ? enrollInviteId.slice(0, 12) + '...' : '-'}
                        </div>
                    );
                },
                size: 150,
            },
            {
                id: 'transaction_id',
                header: 'Transaction ID',
                accessorFn: (row) => row.payment_log.vendor_id,
                cell: ({ row }) => {
                    const vendorId = row.original.payment_log.vendor_id;
                    return <div className="font-mono text-xs text-gray-500">{vendorId || '-'}</div>;
                },
                size: 180,
            },
        ],
        []
    );

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <DashboardLoader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
                <p className="text-red-800">Error loading payment logs</p>
                <p className="mt-2 text-sm text-red-600">
                    {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
            </div>
        );
    }

    if (!tableData || tableData.content.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
                <p className="text-lg font-medium text-gray-600">No payment records found</p>
                <p className="mt-2 text-sm text-gray-500">
                    Try adjusting your filters to see more results
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <MyTable
                    data={tableData}
                    columns={columns}
                    isLoading={isLoading}
                    error={error}
                    currentPage={currentPage}
                    scrollable={true}
                    enableColumnResizing={true}
                />
            </div>

            {tableData.total_pages > 1 && (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                    <div className="text-sm text-gray-600">
                        Showing {tableData.page_no * tableData.page_size + 1} -{' '}
                        {Math.min(
                            (tableData.page_no + 1) * tableData.page_size,
                            tableData.total_elements
                        )}{' '}
                        of {tableData.total_elements} payments
                    </div>
                    <MyPagination
                        currentPage={currentPage}
                        totalPages={tableData.total_pages}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
}
