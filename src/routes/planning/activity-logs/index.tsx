import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListPlanningLogs } from '../-services/listPlanningLogs';
import { Filter } from 'lucide-react';
import PlanningLogsTable from '../-components/PlanningLogsTable';
import PlanningFilters from '../-components/PlanningFilters';
import type { ListPlanningLogsRequest } from '../-types/types';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { MyButton } from '@/components/design-system/button';

export const Route = createFileRoute('/planning/activity-logs/')({
    component: ActivityLogsList,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            packageSessionId: search.packageSessionId as string | undefined,
        };
    },
});

function ActivityLogsList() {
    const { packageSessionId } = Route.useSearch();
    const navigate = useNavigate();
    const [pageNo, setPageNo] = useState(0);
    const [pageSize] = useState(10);
    const [filters, setFilters] = useState<ListPlanningLogsRequest>({
        log_types: ['diary_log'], // Auto-filter by diary_log type
        ...(packageSessionId ? { entity_ids: [packageSessionId] } : {}),
    });
    const [searchQuery, setSearchQuery] = useState('');
    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading(`Activity Logs`);
    }, [setNavHeading]);

    const { data, isLoading, error } = useListPlanningLogs({
        pageNo,
        pageSize,
        filters,
    });

    const handleFilterChange = (newFilters: ListPlanningLogsRequest) => {
        // Always maintain the diary_log type filter
        setFilters({ ...newFilters, log_types: ['diary_log'] });
        setPageNo(0); // Reset to first page when filters change
    };

    const handlePageChange = (newPage: number) => {
        setPageNo(newPage);
    };

    const handleCreateClick = () => {
        navigate({ to: '/planning/activity-logs/create' });
    };

    return (
        <LayoutContainer>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Activity Logs</h2>
                    <div className="flex items-center gap-2">
                        <MyButton onClick={handleCreateClick} className="flex items-center gap-2">
                            Create Activity Log
                        </MyButton>
                    </div>
                </div>

                <PlanningFilters
                    filters={filters}
                    onChange={handleFilterChange}
                    hideLogTypeFilter={true}
                />

                {isLoading ? (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">Loading activity logs...</p>
                    </div>
                ) : error ? (
                    <div className="py-8 text-center">
                        <p className="text-destructive">Failed to load activity logs</p>
                    </div>
                ) : (
                    <PlanningLogsTable
                        data={data?.content || []}
                        totalPages={data?.totalPages || 0}
                        currentPage={pageNo}
                        onPageChange={handlePageChange}
                        searchQuery={searchQuery}
                        logType="diary"
                    />
                )}
            </div>
        </LayoutContainer>
    );
}
