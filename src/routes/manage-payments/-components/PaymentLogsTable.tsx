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
    hasOrgAssociatedBatches: boolean; // New prop
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
    hasOrgAssociatedBatches, // New prop
}: PaymentLogsTableProps) {
    // Transform API response to TableData format
    const tableData: TableData<PaymentLogEntry> | undefined = useMemo(() => {
        if (!data) return undefined;
        return {
            content: data.content,
            total_pages: data.totalPages,
            page_no: data.number,
            page_size: data.size,
            total_elements: data.totalElements,
            last: data.last,
        };
    }, [data]);

    const columns = useMemo<ColumnDef<PaymentLogEntry>[]>(
        () => [
            {
                id: 'payment_date',
                header: 'Date & Time',
                accessorFn: (row) => row?.payment_log?.date || '',
                cell: ({ row }) => {
                    const date = row.original?.payment_log?.date;
                    return (
                        <div className="space-y-1">
                            <div className="font-medium text-gray-900">{formatDate(date)}</div>
                            <div className="text-xs text-gray-500">{formatRelativeTime(date)}</div>
                        </div>
                    );
                },
                size: 180,
            },            {
                id: 'user_info',
                header: 'User',
                accessorFn: (row) => row?.user?.full_name || row?.user?.email || '',
                cell: ({ row }) => {
                    const user = row.original?.user;
                    return (
                        <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                                {user?.full_name || '-'}
                            </div>
                            <div className="text-xs text-gray-500">{user?.email || '-'}</div>
                        </div>
                    );
                },
                size: 200,
            },            // Conditionally add Organization Name column if institute has org-associated batches
            ...(hasOrgAssociatedBatches
                ? [
                      {
                          id: 'org_name',
                          header: 'Organization Name',
                          accessorFn: (row: PaymentLogEntry) =>
                              row?.user_plan?.sub_org_details?.name || '',                          cell: ({ row }: { row: { original: PaymentLogEntry } }) => {
                              const userPlan = row.original?.user_plan;
                              const source = userPlan?.source;
                              const orgDetails = userPlan?.sub_org_details;

                              if (source === 'SUB_ORG') {
                                  if (orgDetails?.name) {
                                      return (
                                          <div className="space-y-1">
                                              <div className="font-medium text-gray-900">
                                                  {orgDetails.name}
                                              </div>
                                              {orgDetails.address && (
                                                  <div className="text-xs text-gray-500">
                                                      {orgDetails.address}
                                                  </div>
                                              )}
                                          </div>
                                      );
                                  }
                              }
                              // For USER source or SUB_ORG without details, show N/A
                              return (
                                  <div className="text-xs text-gray-500 italic">N/A</div>
                              );
                          },
                          size: 200,
                      } as ColumnDef<PaymentLogEntry>,
                  ]
                : []),
            {
                id: 'amount',
                header: 'Amount',
                accessorFn: (row) => row?.payment_log?.payment_amount || 0,
                cell: ({ row }) => {
                    const amount = row.original?.payment_log?.payment_amount || 0;
                    const currency = row.original?.payment_log?.currency || 'USD';
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
                accessorFn: (row) => row?.current_payment_status || '',
                cell: ({ row }) => {
                    const status = row.original?.current_payment_status;
                    return (
                        <Badge variant={getStatusBadgeVariant(status)} className="font-medium">
                            {status?.replace(/_/g, ' ') || '-'}
                        </Badge>
                    );
                },
                size: 140,
            },
            {
                id: 'vendor',
                header: 'Payment Method',
                accessorFn: (row) => row?.payment_log?.vendor || '',
                cell: ({ row }) => {
                    const vendor = row.original?.payment_log?.vendor;
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
                accessorFn: (row) => row?.user_plan?.status || '',
                cell: ({ row }) => {
                    const status = row.original?.user_plan?.status;
                    return (
                        <Badge variant="outline" className="font-normal">
                            {status?.replace(/_/g, ' ') || '-'}
                        </Badge>
                    );
                },
                size: 130,
            },
            {
                id: 'enroll_invite',
                header: 'Course/Membership',
                accessorFn: (row) => row?.user_plan?.enroll_invite?.name || '',
                cell: ({ row }) => {
                    const enrollInvite = row.original?.user_plan?.enroll_invite;
                    return (
                        <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                                {enrollInvite?.name || '-'}
                            </div>
                            <div className="text-xs text-gray-500">
                                Code: {enrollInvite?.invite_code || '-'}
                            </div>
                        </div>
                    );
                },
                size: 200,
            },
            {
                id: 'transaction_id',
                header: 'Transaction ID',
                accessorFn: (row) => row?.payment_log?.transaction_id || '',
                cell: ({ row }) => {
                    const transactionId = row.original?.payment_log?.transaction_id;
                    return (
                        <div className="font-mono text-xs text-gray-500">
                            {transactionId || '-'}
                        </div>
                    );
                },
                size: 140,
            },
            {
                id: 'payment_plan',
                header: 'Payment Plan',
                accessorFn: (row) => row?.user_plan?.payment_plan_dto?.name || '',
                cell: ({ row }) => {
                    const paymentPlan = row.original?.user_plan?.payment_plan_dto;
                    return (
                        <div className="space-y-1">
                            <div className="text-sm text-gray-900">{paymentPlan?.name || '-'}</div>
                            <div className="text-xs text-gray-500">
                                {paymentPlan?.validity_in_days
                                    ? `${paymentPlan.validity_in_days} days`
                                    : ''}
                            </div>
                        </div>
                    );
                },                size: 180,
            },
        ],
        [hasOrgAssociatedBatches] // Add dependency
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

    if (!tableData) {
        return null;
    }

    if (tableData.content.length === 0) {
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
                    isLoading={false}
                    error={null}
                    currentPage={currentPage}
                    scrollable={true}
                    enableColumnResizing={true}
                    enableColumnPinning={false}
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
