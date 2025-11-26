import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from 'react';
import { useListPlanningLogs } from '../-services/listPlanningLogs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import PlanningLogsTable from './-components/PlanningLogsTable';
import PlanningFilters from './-components/PlanningFilters';
import type { ListPlanningLogsRequest } from '../-types/types';
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { MyButton } from "@/components/design-system/button";

export const Route = createFileRoute("/planning/list/")({
  component: ViewPlanningTab,
})





function ViewPlanningTab() {
    const [pageNo, setPageNo] = useState(0);
    const [pageSize] = useState(10);
    const [filters, setFilters] = useState<ListPlanningLogsRequest>({});
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
 const { setNavHeading } = useNavHeadingStore();
 
    useEffect(() => {
        setNavHeading(`Plannings`);
    }, [setNavHeading]);
    const { data, isLoading, error } = useListPlanningLogs({
        pageNo,
        pageSize,
        filters,
    });

    const handleFilterChange = (newFilters: ListPlanningLogsRequest) => {
        setFilters(newFilters);
        setPageNo(0); // Reset to first page when filters change
    };

    const handlePageChange = (newPage: number) => {
        setPageNo(newPage);
    };

    return (
        <LayoutContainer>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Planning Logs</h2>
                <div className="flex items-center gap-2">
                    {/* Implement search from backend */}
                    {/* <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div> */}
                    <MyButton
                        buttonType="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                    </MyButton>
                </div>
            </div>

            {showFilters && (
                <PlanningFilters
                    filters={filters}
                    onChange={handleFilterChange}
                    onClose={() => setShowFilters(false)}
                />
            )}

            {isLoading ? (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading planning logs...</p>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-destructive">Failed to load planning logs</p>
                </div>
            ) : (
                <PlanningLogsTable
                    data={data?.content || []}
                    totalPages={data?.totalPages || 0}
                    currentPage={pageNo}
                    onPageChange={handlePageChange}
                    searchQuery={searchQuery}
                />
            )}
        </div>
         </LayoutContainer>
    );
}
