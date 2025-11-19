import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { PaymentFilters } from './-components/PaymentFilters';
import { PaymentLogsTable } from './-components/PaymentLogsTable';
import { fetchPaymentLogs, getPaymentLogsQueryKey } from '@/services/payment-logs';
import { fetchInstituteDetails } from '@/services/student-list-section/getInstituteDetails';
import type { SelectOption } from '@/components/design-system/SelectChips';
import type {
    PaymentLogsRequest,
    PaymentLogEntry,
    PackageSessionFilter,
    BatchForSession,
} from '@/types/payment-logs';
import { Card } from '@/components/ui/card';
import { CreditCard, CheckCircle, XCircle, TrendUp } from '@phosphor-icons/react';

export const Route = createFileRoute('/manage-payments/')({
    component: () => (
        <LayoutContainer>
            <ManagePaymentsLayoutPage />
        </LayoutContainer>
    ),
});

function ManagePaymentsLayoutPage() {
    const { setNavHeading } = useNavHeadingStore();

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState<SelectOption[]>([]);
    const [selectedUserPlanStatuses, setSelectedUserPlanStatuses] = useState<SelectOption[]>([]);
    const [packageSessionFilter, setPackageSessionFilter] = useState<PackageSessionFilter>({});

    useEffect(() => {
        setNavHeading(<h1 className="text-lg">Manage Payments</h1>);
    }, [setNavHeading]);

    // Build request filters
    const requestFilters: Omit<PaymentLogsRequest, 'institute_id'> = useMemo(() => {
        const filters: Omit<PaymentLogsRequest, 'institute_id'> = {
            sort_columns: {
                created_at: 'DESC',
            },
        };

        if (startDate) {
            filters.start_date_in_utc = startDate;
        }

        if (endDate) {
            filters.end_date_in_utc = endDate;
        }

        if (selectedPaymentStatuses.length > 0) {
            filters.payment_statuses = selectedPaymentStatuses.map((s) => s.value);
        }

        if (selectedUserPlanStatuses.length > 0) {
            filters.user_plan_statuses = selectedUserPlanStatuses.map((s) => s.value);
        }

        if (packageSessionFilter.packageSessionId) {
            filters.package_session_ids = [packageSessionFilter.packageSessionId];
        }

        return filters;
    }, [
        startDate,
        endDate,
        selectedPaymentStatuses,
        selectedUserPlanStatuses,
        packageSessionFilter,
    ]);

    // Fetch payment logs
    const {
        data: paymentLogsData,
        isLoading: isLoadingPayments,
        error: paymentsError,
    } = useQuery({
        queryKey: getPaymentLogsQueryKey(currentPage, pageSize, requestFilters),
        queryFn: () => fetchPaymentLogs(currentPage, pageSize, requestFilters),
        staleTime: 30000,
    });

    // Fetch institute details for package sessions
    const { data: instituteData } = useQuery({
        queryKey: ['institute-details'],
        queryFn: fetchInstituteDetails,
        staleTime: 3600000, // 1 hour
    });

    // Extract batches for sessions from institute data
    const batchesForSessions: BatchForSession[] = useMemo(() => {
        const batches = (
            instituteData as unknown as {
                batches_for_sessions?: BatchForSession[];
            }
        )?.batches_for_sessions;
        return batches && Array.isArray(batches) ? batches : [];
    }, [instituteData]);

    // Build package sessions map
    const packageSessionsMap = useMemo(() => {
        const map: Record<string, string> = {};
        batchesForSessions.forEach((batch) => {
            const packageName = batch.package_dto.package_name;
            const sessionName = batch.session.session_name;
            const levelName = batch.level.level_name;
            map[batch.id] = `${packageName} - ${sessionName} - ${levelName}`;
        });
        return map;
    }, [batchesForSessions]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle quick filter selection
    const handleQuickFilterSelect = (range: { start: string; end: string }) => {
        setStartDate(range.start);
        setEndDate(range.end);
        setCurrentPage(0);
    };

    // Handle clear all filters
    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedPaymentStatuses([]);
        setSelectedUserPlanStatuses([]);
        setPackageSessionFilter({});
        setCurrentPage(0);
    };

    // Calculate statistics
    const stats = useMemo(() => {
        if (!paymentLogsData || !paymentLogsData.content) {
            return {
                totalAmount: 0,
                paidCount: 0,
                failedCount: 0,
                pendingCount: 0,
            };
        }

        let totalAmount = 0;
        let paidCount = 0;
        let failedCount = 0;
        let pendingCount = 0;

        paymentLogsData.content.forEach((entry: PaymentLogEntry) => {
            const status = entry.current_payment_status;
            const amount = entry.payment_log.payment_amount;

            if (status === 'PAID') {
                paidCount++;
                totalAmount += amount;
            } else if (status === 'FAILED') {
                failedCount++;
            } else if (status === 'PAYMENT_PENDING') {
                pendingCount++;
            }
        });

        return { totalAmount, paidCount, failedCount, pendingCount };
    }, [paymentLogsData]);

    return (
        <>
            <Helmet>
                <title>Manage Payments</title>
                <meta name="description" content="Manage payments and billing for your institute" />
            </Helmet>

            <div className="space-y-6 p-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                                <p className="mt-2 text-2xl font-bold text-gray-900">
                                    {paymentLogsData?.total_elements || 0}
                                </p>
                            </div>
                            <div className="rounded-lg bg-primary-100 p-3">
                                <CreditCard
                                    size={24}
                                    className="text-primary-600"
                                    weight="duotone"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Successful</p>
                                <p className="mt-2 text-2xl font-bold text-green-600">
                                    {stats.paidCount}
                                </p>
                            </div>
                            <div className="rounded-lg bg-green-100 p-3">
                                <CheckCircle
                                    size={24}
                                    className="text-green-600"
                                    weight="duotone"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Failed</p>
                                <p className="mt-2 text-2xl font-bold text-red-600">
                                    {stats.failedCount}
                                </p>
                            </div>
                            <div className="rounded-lg bg-red-100 p-3">
                                <XCircle size={24} className="text-red-600" weight="duotone" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="mt-2 text-2xl font-bold text-gray-900">
                                    ${stats.totalAmount.toLocaleString()}
                                </p>
                            </div>
                            <div className="rounded-lg bg-blue-100 p-3">
                                <TrendUp size={24} className="text-blue-600" weight="duotone" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <PaymentFilters
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={(date) => {
                        setStartDate(date);
                        setCurrentPage(0);
                    }}
                    onEndDateChange={(date) => {
                        setEndDate(date);
                        setCurrentPage(0);
                    }}
                    selectedPaymentStatuses={selectedPaymentStatuses}
                    onPaymentStatusesChange={(statuses) => {
                        setSelectedPaymentStatuses(statuses);
                        setCurrentPage(0);
                    }}
                    selectedUserPlanStatuses={selectedUserPlanStatuses}
                    onUserPlanStatusesChange={(statuses) => {
                        setSelectedUserPlanStatuses(statuses);
                        setCurrentPage(0);
                    }}
                    packageSessionFilter={packageSessionFilter}
                    onPackageSessionFilterChange={(filter) => {
                        setPackageSessionFilter(filter);
                        setCurrentPage(0);
                    }}
                    batchesForSessions={batchesForSessions}
                    onQuickFilterSelect={handleQuickFilterSelect}
                    onClearFilters={handleClearFilters}
                />

                {/* Payment Logs Table */}
                <PaymentLogsTable
                    data={paymentLogsData}
                    isLoading={isLoadingPayments}
                    error={paymentsError as Error}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    packageSessions={packageSessionsMap}
                />
            </div>
        </>
    );
}
