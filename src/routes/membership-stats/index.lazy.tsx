import { createLazyFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { MembershipStatsFilters } from './-components/MembershipStatsFilters';
import { MembershipStatsTable } from './-components/MembershipStatsTable';
import { fetchMembershipStats, getMembershipStatsQueryKey } from '@/services/membership-stats';
import {
    usePaginatedBatches,
    useBatchesByIds,
    getBatchDisplayName,
} from '@/services/paginated-batches';
import type { SelectOption } from '@/components/design-system/SelectChips';
import type { StudentStatsFilter } from '@/types/membership-stats';
import type { BatchForSession, PackageSessionFilter } from '@/types/payment-logs';
import { MembershipAnalytics } from './-components/MembershipAnalytics';
import { FilterStatsCard } from './-components/FilterStatsCard';
import { ActiveFiltersDisplay } from '@/components/common/filters/ActiveFiltersDisplay';

export const Route = createLazyFileRoute('/membership-stats/')({
    component: () => (
        <LayoutContainer>
            <MembershipStatsLayoutPage />
        </LayoutContainer>
    ),
});

function MembershipStatsLayoutPage() {
    const { setNavHeading } = useNavHeadingStore();

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedUserTypes, setSelectedUserTypes] = useState<SelectOption[]>([]);
    const [packageSessionFilter, setPackageSessionFilter] = useState<PackageSessionFilter>({});

    useEffect(() => {
        setNavHeading(<h1 className="text-lg">Membership Stats</h1>);
    }, [setNavHeading]);

    // 1. Fetch batches matching the current filter criteria ONLY (for resolving IDs)
    const { data: filteredBatchesData } = usePaginatedBatches(
        {
            packageId: packageSessionFilter.packageId || undefined,
            levelId: packageSessionFilter.levelId || undefined,
            sessionId: packageSessionFilter.sessionId || undefined,
            size: 100, // Should cover all batches for a specific package+level+session combo
        },
        undefined,
        {
            enabled: !!packageSessionFilter.packageId, // Only fetch if package is selected
        }
    );

    // 2. Fetch specific batches if explicitly selected (for Filter Display names)
    const selectedBatchIds = useMemo(() => {
        if (packageSessionFilter.packageSessionIds?.length)
            return packageSessionFilter.packageSessionIds;
        if (packageSessionFilter.packageSessionId) return [packageSessionFilter.packageSessionId];
        return [];
    }, [packageSessionFilter]);

    const { data: selectedBatchesData } = useBatchesByIds(selectedBatchIds, undefined, {
        enabled: selectedBatchIds.length > 0,
    });

    // Create a combined list of batches for display/logic (mimics old batchesForSessions but optimized)
    const batchesForSessions: BatchForSession[] = useMemo(() => {
        const batches = [
            ...(filteredBatchesData?.content || []),
            ...(selectedBatchesData?.content || []),
        ];

        // Dedup by ID
        const uniqueBatches = Array.from(new Map(batches.map((item) => [item.id, item])).values());

        return uniqueBatches.map((batch) => ({
            id: batch.id,
            package_dto: batch.package_dto,
            session: batch.session,
            level: batch.level,
            status: batch.status,
            start_time: batch.start_time,
            is_org_associated: batch.is_org_associated,
        })) as BatchForSession[];
    }, [filteredBatchesData, selectedBatchesData]);

    // Build request filters
    const requestFilters: Omit<StudentStatsFilter, 'institute_id'> = useMemo(() => {
        const filters: Omit<StudentStatsFilter, 'institute_id'> = {
            start_date_in_utc: startDate || '',
            end_date_in_utc: endDate || '',
            sort_columns: {
                created_at: 'DESC',
            },
        };

        if (selectedUserTypes.length > 0) {
            filters.user_types = selectedUserTypes.map((s) => s.value) as (
                | 'NEW_USER'
                | 'RETAINER'
            )[];
        }

        if (
            packageSessionFilter.packageSessionIds &&
            packageSessionFilter.packageSessionIds.length > 0
        ) {
            filters.package_session_ids = packageSessionFilter.packageSessionIds;
        } else if (packageSessionFilter.packageSessionId) {
            filters.package_session_ids = [packageSessionFilter.packageSessionId];
        } else if (packageSessionFilter.packageId) {
            // Use IDs from the filtered query
            // If filteredBatchesData is loading, this might momentarily be empty, which is fine
            const resolvedIds = filteredBatchesData?.content.map((b) => b.id) || [];
            filters.package_session_ids = resolvedIds;
        } else {
            filters.package_session_ids = [];
        }

        return filters;
    }, [
        startDate,
        endDate,
        selectedUserTypes,
        packageSessionFilter,
        filteredBatchesData, // Update dependency
    ]);

    useEffect(() => {
        if (!startDate || !endDate) {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 30);
            setStartDate(start.toISOString());
            setEndDate(end.toISOString());
        }
    }, []);

    const enableQuery = !!startDate && !!endDate;

    const {
        data: membershipStatsData,
        isLoading: isLoadingStats,
        error: statsError,
    } = useQuery({
        queryKey: getMembershipStatsQueryKey(currentPage, pageSize, requestFilters),
        queryFn: () => fetchMembershipStats(currentPage, pageSize, requestFilters),
        enabled: enableQuery,
        staleTime: 30000,
    });

    // 4. Fetch details for batches displayed in the table
    const tableBatchIds = useMemo(() => {
        if (!membershipStatsData?.content) return [];
        const ids = new Set<string>();
        membershipStatsData.content.forEach((item) => {
            if (item.package_session_ids && Array.isArray(item.package_session_ids)) {
                item.package_session_ids.forEach((id) => ids.add(id));
            }
        });
        return Array.from(ids);
    }, [membershipStatsData]);

    const { data: tableBatchesData } = useBatchesByIds(tableBatchIds, undefined, {
        enabled: tableBatchIds.length > 0,
    });

    // Build package sessions map for display
    const packageSessionsMap = useMemo(() => {
        const map: Record<string, string> = {};

        // Add from table batches
        tableBatchesData?.content.forEach((batch) => {
            map[batch.id] = getBatchDisplayName(batch, 'full');
        });

        return map;
    }, [tableBatchesData]);

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
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);

        setStartDate(start.toISOString());
        setEndDate(end.toISOString());
        setSelectedUserTypes([]);
        setPackageSessionFilter({});
        setCurrentPage(0);
    };

    // Handle clearing individual filters
    const handleClearFilter = (filterType: string, value?: string) => {
        switch (filterType) {
            case 'all':
                handleClearFilters();
                break;
            case 'startDate':
                setStartDate('');
                setCurrentPage(0);
                break;
            case 'endDate':
                setEndDate('');
                setCurrentPage(0);
                break;
            case 'userType':
                setSelectedUserTypes((prev) => prev.filter((type) => type.value !== value));
                setCurrentPage(0);
                break;
            case 'packageSession':
                if (value) {
                    setPackageSessionFilter((prev) => ({
                        ...prev,
                        packageSessionIds: prev.packageSessionIds?.filter((id) => id !== value),
                    }));
                } else {
                    setPackageSessionFilter({});
                }
                setCurrentPage(0);
                break;
        }
    };

    // State for view mode
    const [viewMembers, setViewMembers] = useState(false);

    // Reset viewMembers when filters change
    useEffect(() => {
        setViewMembers(false);
    }, [startDate, endDate, packageSessionFilter, selectedUserTypes]);

    // Handle analytics card click
    const handleAnalyticsCardClick = (range: { start: Date; end: Date }) => {
        setStartDate(range.start.toISOString());
        setEndDate(range.end.toISOString());
        setViewMembers(true);
    };

    return (
        <>
            <Helmet>
                <title>Enrollment Stats</title>
                <meta name="description" content="View membership statistics and classification" />
            </Helmet>

            <div className="space-y-4 p-4 text-sm">
                {/* Filters */}
                <div className="mb-4 flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm md:flex-row md:items-end md:justify-between">
                    <MembershipStatsFilters
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
                        packageSessionFilter={packageSessionFilter}
                        onPackageSessionFilterChange={(filter) => {
                            setPackageSessionFilter(filter);
                            setCurrentPage(0);
                        }}
                        selectedUserTypes={selectedUserTypes}
                        onUserTypesChange={(types) => {
                            setSelectedUserTypes(types);
                            setCurrentPage(0);
                        }}
                        batchesForSessions={batchesForSessions}
                        onClearFilters={handleClearFilters}
                        onQuickFilterSelect={handleQuickFilterSelect}
                    />
                </div>

                <ActiveFiltersDisplay
                    startDate={startDate}
                    endDate={endDate}
                    packageSessionFilter={packageSessionFilter}
                    batchesForSessions={batchesForSessions}
                    onClearFilter={handleClearFilter}
                    selectedUserTypes={selectedUserTypes}
                />

                {/* Analytics Section */}
                <div className="mb-4">
                    <MembershipAnalytics
                        packageSessionIds={requestFilters.package_session_ids}
                        onCardClick={handleAnalyticsCardClick}
                    />
                </div>

                {/* Filter Results / Stats Card */}
                {!viewMembers ? (
                    <div className="mb-4">
                        <FilterStatsCard
                            requestFilters={requestFilters}
                            onViewMembers={() => setViewMembers(true)}
                        />
                    </div>
                ) : (
                    /* Table */
                    <MembershipStatsTable
                        data={membershipStatsData}
                        isLoading={isLoadingStats}
                        error={statsError as Error}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        packageSessions={packageSessionsMap}
                    />
                )}
            </div>
        </>
    );
}
