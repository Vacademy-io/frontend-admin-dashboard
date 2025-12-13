import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import type { BatchForSession, PackageSessionFilter } from '@/types/payment-logs';
import { MembershipExpiryFilters } from './-components/MembershipExpiryFilters';
import { MembershipExpiryAnalytics } from './-components/MembershipExpiryAnalytics';
import { MembershipExpiryTable } from './-components/MembershipExpiryTable';
import { ExpiryFilterStatsCard } from './-components/ExpiryFilterStatsCard';
import { fetchMembershipExpiry, getMembershipExpiryQueryKey } from '@/services/membership-expiry';
import type { MembershipFilterDTO, MembershipStatus } from '@/types/membership-expiry';

export const Route = createFileRoute('/membership-expiry/')({
    component: () => (
        <LayoutContainer>
            <MembershipExpiryPage />
        </LayoutContainer>
    ),
});

function MembershipExpiryPage() {
    const { setNavHeading } = useNavHeadingStore();

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [packageSessionFilter, setPackageSessionFilter] = useState<PackageSessionFilter>({});

    // Additional state for status filter if we want to allow user to select it in main filters?
    // The requirement says "Recently expired" (ENDED) and "About to expire" (ABOUT_TO_END).
    // The filters component I built doesn't show status selector, but maybe it should?
    // User said "show both stats... and also show similar stats cards".
    // Usually clicking "Expired" card sets filter to "ENDED".
    // Clicking "Expiring" sets filter to "ABOUT_TO_END".
    // So we need a status state.
    const [selectedStatuses, setSelectedStatuses] = useState<MembershipStatus[]>([]);

    // View Mode
    const [viewMembers, setViewMembers] = useState(false);

    useEffect(() => {
        setNavHeading(<h1 className="text-lg">Membership Expiry</h1>);
    }, [setNavHeading]);

    // Reset viewMembers when filters change
    useEffect(() => {
        setViewMembers(false);
    }, [startDate, endDate, packageSessionFilter, selectedStatuses]);

    // Institute Data
    const instituteDetails = useInstituteDetailsStore((state) => state.instituteDetails);

    const batchesForSessions: BatchForSession[] = useMemo(() => {
        const batches = instituteDetails?.batches_for_sessions;
        return batches && Array.isArray(batches) ? (batches as unknown as BatchForSession[]) : [];
    }, [instituteDetails]);

    // Build Request Filters
    const requestFilters: Omit<MembershipFilterDTO, 'institute_id'> = useMemo(() => {
        const filters: Omit<MembershipFilterDTO, 'institute_id'> = {
            start_date_in_utc: startDate || undefined,
            end_date_in_utc: endDate || undefined,
            membership_statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
            sort_order: { end_date: 'asc' }, // Default sort
        };

        if (packageSessionFilter.packageSessionId) {
            filters.package_session_ids = [packageSessionFilter.packageSessionId];
        }

        return filters;
    }, [startDate, endDate, selectedStatuses, packageSessionFilter]);

    // Data Query
    const enableQuery = viewMembers || !!requestFilters.membership_statuses || (!!startDate && !!endDate);

    const { data, isLoading, error } = useQuery({
        queryKey: getMembershipExpiryQueryKey(currentPage, pageSize, requestFilters),
        queryFn: () => fetchMembershipExpiry(currentPage, pageSize, requestFilters),
        // Actually, if viewMembers is false, we don't strictly need the list data unless we preload.
        // But the FilterStatsCard fetches its own count.
        // So the main table query can wait until viewMembers is true.
        enabled: viewMembers,
        staleTime: 30000,
    });

    const handleQuickFilterSelect = (range: { start: string; end: string }) => {
        setStartDate(range.start);
        setEndDate(range.end);
        setCurrentPage(0);
        // Quick filters usually imply a specific context. 
        // "Exp Last 30d" -> Ends in last 30d -> Status: ENDED?
        // "Exp Next 30d" -> Ends in next 30d -> Status: ABOUT_TO_END?
        // I'll leave status manual or handle it if passed. But range is generic.
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setPackageSessionFilter({});
        setSelectedStatuses([]);
        setCurrentPage(0);
        setViewMembers(false);
    };

    const handleCardClick = (range: { start: Date; end: Date; status: MembershipStatus }) => {
        setStartDate(range.start.toISOString());
        setEndDate(range.end.toISOString());
        setSelectedStatuses([range.status]);
        setViewMembers(true);
    };

    return (
        <>
            <Helmet>
                <title>Membership Expiry</title>
                <meta name="description" content="View membership expiration stats" />
            </Helmet>

            <div className="space-y-4 p-4 text-sm">
                {/* Filters */}
                <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <MembershipExpiryFilters
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        packageSessionFilter={packageSessionFilter}
                        onPackageSessionFilterChange={setPackageSessionFilter}
                        batchesForSessions={batchesForSessions}
                        onQuickFilterSelect={handleQuickFilterSelect}
                        onClearFilters={handleClearFilters}
                    />
                </div>

                {/* Analytics Cards */}
                <div className="mb-4">
                    <MembershipExpiryAnalytics
                        packageSessionIds={requestFilters.package_session_ids}
                        onCardClick={handleCardClick}
                    />
                </div>

                {/* Results Section */}
                {!viewMembers ? (
                    <div className="mb-4">
                        <ExpiryFilterStatsCard
                            requestFilters={requestFilters}
                            onViewMembers={() => setViewMembers(true)}
                        />
                    </div>
                ) : (
                    <MembershipExpiryTable
                        data={data}
                        isLoading={isLoading}
                        error={error as Error}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </>
    );
}
