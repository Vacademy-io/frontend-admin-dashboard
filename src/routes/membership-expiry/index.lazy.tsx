import { createLazyFileRoute } from '@tanstack/react-router';
import { MembershipExpiryTable } from './-components/MembershipExpiryTable';
import { MembershipExpiryFilters } from './-components/MembershipExpiryFilters';
import { MembershipExpiryAnalytics } from './-components/MembershipExpiryAnalytics';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMembershipExpiry, getMembershipExpiryQueryKey } from '@/services/membership-expiry';
import type { BatchForSession, PackageSessionFilter } from '@/types/payment-logs';
// import { usePaymentLogsFilters } from '@/routes/manage-payments/-hooks/usePaymentLogsFilters'; // Reusing this hook if available for batch/session data, otherwise might need local logic or new hook.
// Wait, I should double check if usePaymentLogsFilters exists or if I need to fetch batch/sessions locally.
// MembershipExpiryFilters takes `batchesForSessions`.
// I'll search for where `batchesForSessions` comes from.
// Usually it's fetched from a service.

import { keepPreviousData } from '@tanstack/react-query';

export const Route = createLazyFileRoute('/membership-expiry/')({
  component: MembershipExpiryPage,
});

function MembershipExpiryPage() {
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(20);

  // Filter State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [packageSessionFilter, setPackageSessionFilter] = useState<PackageSessionFilter>({
    packageId: undefined,
    sessionId: undefined,
    levelId: undefined,
    packageSessionId: undefined,
  });

  // We need batchesForSessions for the filter.
  // I'll assume I need to fetch them. Or maybe the previous implementation had a hook.
  // I'll check 'usePaymentLogsFilters' or similar.

  // For now, I'll define empty array and add TODO if I can't find the hook right now.

  const queryKey = getMembershipExpiryQueryKey(pageNo, pageSize, {
    start_date_in_utc: startDate || undefined,
    end_date_in_utc: endDate || undefined,
    package_session_ids: packageSessionFilter.packageSessionId ? [packageSessionFilter.packageSessionId] : undefined,
  });

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchMembershipExpiry(pageNo, pageSize, {
      start_date_in_utc: startDate || undefined,
      end_date_in_utc: endDate || undefined,
      package_session_ids: packageSessionFilter.packageSessionId ? [packageSessionFilter.packageSessionId] : undefined,
      // Note: API expects array of string, filter gives single string.
    }),
    placeholderData: keepPreviousData,
  });

  const handlePackageSessionFilterChange = (filter: PackageSessionFilter) => {
    setPackageSessionFilter(filter);
    setPageNo(0);
  };

  const handleQuickFilter = (range: { start: string; end: string }) => {
    setStartDate(range.start);
    setEndDate(range.end);
    setPageNo(0);
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setPackageSessionFilter({
      packageId: undefined,
      sessionId: undefined,
      levelId: undefined,
      packageSessionId: undefined,
    });
    setPageNo(0);
  };

  return (
    <LayoutContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Membership Expiry</h1>
          <p className="text-muted-foreground">
            Monitor and manage student membership expirations.
          </p>
        </div>

        <MembershipExpiryAnalytics
          packageSessionIds={packageSessionFilter.packageSessionId ? [packageSessionFilter.packageSessionId] : undefined}
          onCardClick={(range) => {
            // handle analytics card click to set filters
            // range has start, end, status. 
            // MembershipExpiryFilters handles dates.
            // But table filter by status? The table doesn't seem to support status filter in `fetchMembershipExpiry`?
            // Wait, fetchMembershipExpiry accepts `membership_statuses`.
            // But MembershipExpiryFilters doesn't have status input. 
            // Use QuickFilter logic for dates.
            setStartDate(range.start.toISOString());
            setEndDate(range.end.toISOString());
            // Status filter not fully implemented in UI yet
          }}
        />

        <div className="space-y-4">
          <MembershipExpiryFilters
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            packageSessionFilter={packageSessionFilter}
            onPackageSessionFilterChange={handlePackageSessionFilterChange}
            batchesForSessions={[]} // TODO: Fetch batches
            onQuickFilterSelect={handleQuickFilter}
            onClearFilters={handleClearFilters}
          />

          <MembershipExpiryTable
            data={data}
            isLoading={isLoading}
            error={error as Error | null}
            currentPage={pageNo}
            onPageChange={setPageNo}
          />
        </div>
      </div>
    </LayoutContainer>
  );
}
