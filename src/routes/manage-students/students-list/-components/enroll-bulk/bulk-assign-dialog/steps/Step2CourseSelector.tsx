import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MagnifyingGlass, BookOpen, FunnelSimple, X, CaretDown } from '@phosphor-icons/react';
import { SelectedPackageSession } from '../../../../-types/bulk-assign-types';
import { cn } from '@/lib/utils';
import {
    fetchBatchesSummary,
    fetchPaginatedBatches,
} from '@/routes/admin-package-management/-services/package-service';
import { PackageSessionDTO } from '@/routes/admin-package-management/-types/package-types';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';

interface Props {
    selectedPackageSessions: SelectedPackageSession[];
    onSelectedPackageSessionsChange: (sessions: SelectedPackageSession[]) => void;
}

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export const Step2CourseSelector = ({
    selectedPackageSessions,
    onSelectedPackageSessionsChange,
}: Props) => {
    // --- Client-specific terminology ---
    const levelLabel = getTerminology(ContentTerms.Level, SystemTerms.Level);
    const sessionLabel = getTerminology(ContentTerms.Session, SystemTerms.Session);

    // --- Filter state ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevelIds, setSelectedLevelIds] = useState<string[]>([]);
    const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
    const debouncedSearch = useDebounce(searchQuery, 400);

    // --- 1. Fetch dropdown options (one-time, lightweight) ---
    const { data: summary, isLoading: isSummaryLoading } = useQuery({
        queryKey: ['BATCHES_SUMMARY'],
        queryFn: () => fetchBatchesSummary(['ACTIVE']),
        staleTime: 1000 * 60 * 10, // 10 min cache - this data changes rarely
    });

    // --- 2. Fetch paginated + filtered package sessions ---
    const { data: batchesResponse, isLoading: isBatchesLoading } = useQuery({
        queryKey: ['PAGINATED_BATCHES_SELECTOR', debouncedSearch, selectedLevelIds, selectedSessionIds],
        queryFn: () =>
            fetchPaginatedBatches({
                page: 0,
                size: 100,
                search: debouncedSearch || undefined,
                levelId: selectedLevelIds.length === 1 ? selectedLevelIds[0] : undefined,
                sessionId: selectedSessionIds.length === 1 ? selectedSessionIds[0] : undefined,
                statuses: ['ACTIVE'],
            }),
        staleTime: 1000 * 30,
    });

    // Group flat batch list by package for display
    const packageGroups = useCallback(() => {
        const batches: PackageSessionDTO[] = batchesResponse?.content ?? [];

        // Apply multi-select level/session filter client-side (when >1 selected)
        const filtered = batches.filter((b) => {
            if (selectedLevelIds.length > 1 && !selectedLevelIds.includes(b.level.id)) return false;
            if (selectedSessionIds.length > 1 && !selectedSessionIds.includes(b.session.id)) return false;
            return true;
        });

        const groups: Record<
            string,
            {
                package_dto: PackageSessionDTO['package_dto'];
                sessions: PackageSessionDTO[];
            }
        > = {};

        filtered.forEach((b) => {
            if (!groups[b.package_dto.id]) {
                groups[b.package_dto.id] = { package_dto: b.package_dto, sessions: [] };
            }
            groups[b.package_dto.id]!.sessions.push(b);
        });

        return Object.values(groups);
    }, [batchesResponse, selectedLevelIds, selectedSessionIds]);

    const groups = packageGroups();

    // --- Selection helpers ---
    const isSelected = (packageSessionId: string) =>
        selectedPackageSessions.some((s) => s.packageSessionId === packageSessionId);

    const toggle = (batch: PackageSessionDTO) => {
        const psId = batch.id;
        if (isSelected(psId)) {
            onSelectedPackageSessionsChange(
                selectedPackageSessions.filter((s) => s.packageSessionId !== psId)
            );
        } else {
            onSelectedPackageSessionsChange([
                ...selectedPackageSessions,
                {
                    packageSessionId: psId,
                    courseName: batch.package_dto.package_name,
                    sessionName: batch.session.session_name,
                    levelName: batch.level.level_name,
                    enrollInviteId: null,
                    accessDays: null,
                },
            ]);
        }
    };

    // --- Filter chip removal ---
    const removeLevelFilter = (id: string) =>
        setSelectedLevelIds((prev) => prev.filter((x) => x !== id));
    const removeSessionFilter = (id: string) =>
        setSelectedSessionIds((prev) => prev.filter((x) => x !== id));

    const activeFilterCount = selectedLevelIds.length + selectedSessionIds.length;

    const isLoading = isBatchesLoading || isSummaryLoading;

    return (
        <div className="flex flex-col gap-4 px-6 py-5">
            {/* Selection summary banner */}
            {selectedPackageSessions.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm text-primary-700">
                    <span className="font-semibold">{selectedPackageSessions.length}</span>{' '}
                    batch
                    {selectedPackageSessions.length !== 1 ? 'es' : ''} selected — students will be
                    enrolled in all selected.
                </div>
            )}

            {/* Search + Filter row */}
            <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative flex-1">
                    <MagnifyingGlass
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search courses, ${levelLabel.toLowerCase()}s…`}
                        className="h-9 pl-9 text-sm"
                    />
                </div>

                {/* Level filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                'h-9 gap-1.5 text-xs font-medium',
                                selectedLevelIds.length > 0 &&
                                    'border-primary-300 bg-primary-50 text-primary-700'
                            )}
                        >
                            <FunnelSimple size={13} />
                            {levelLabel}
                            {selectedLevelIds.length > 0 && (
                                <Badge className="ml-0.5 h-4 min-w-4 rounded-full px-1 py-0 text-[10px] leading-none">
                                    {selectedLevelIds.length}
                                </Badge>
                            )}
                            <CaretDown size={11} className="text-neutral-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="max-h-60 w-48 overflow-y-auto">
                        <DropdownMenuLabel className="text-xs text-neutral-500">
                            Filter by {levelLabel}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {isSummaryLoading ? (
                            <div className="space-y-1 p-2">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-3/4" />
                            </div>
                        ) : (summary?.levels ?? []).length === 0 ? (
                            <p className="px-2 py-1 text-xs text-neutral-400">No {levelLabel.toLowerCase()}s found</p>
                        ) : (
                            summary?.levels.map((lvl) => (
                                <DropdownMenuCheckboxItem
                                    key={lvl.id}
                                    checked={selectedLevelIds.includes(lvl.id)}
                                    onCheckedChange={(checked) =>
                                        setSelectedLevelIds((prev) =>
                                            checked ? [...prev, lvl.id] : prev.filter((id) => id !== lvl.id)
                                        )
                                    }
                                    className="text-xs"
                                >
                                    {lvl.name}
                                </DropdownMenuCheckboxItem>
                            ))
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Session filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                'h-9 gap-1.5 text-xs font-medium',
                                selectedSessionIds.length > 0 &&
                                    'border-primary-300 bg-primary-50 text-primary-700'
                            )}
                        >
                            <FunnelSimple size={13} />
                            {sessionLabel}
                            {selectedSessionIds.length > 0 && (
                                <Badge className="ml-0.5 h-4 min-w-4 rounded-full px-1 py-0 text-[10px] leading-none">
                                    {selectedSessionIds.length}
                                </Badge>
                            )}
                            <CaretDown size={11} className="text-neutral-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="max-h-60 w-48 overflow-y-auto">
                        <DropdownMenuLabel className="text-xs text-neutral-500">
                            Filter by {sessionLabel}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {isSummaryLoading ? (
                            <div className="space-y-1 p-2">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-3/4" />
                            </div>
                        ) : (summary?.sessions ?? []).length === 0 ? (
                            <p className="px-2 py-1 text-xs text-neutral-400">No {sessionLabel.toLowerCase()}s found</p>
                        ) : (
                            summary?.sessions.map((ses) => (
                                <DropdownMenuCheckboxItem
                                    key={ses.id}
                                    checked={selectedSessionIds.includes(ses.id)}
                                    onCheckedChange={(checked) =>
                                        setSelectedSessionIds((prev) =>
                                            checked ? [...prev, ses.id] : prev.filter((id) => id !== ses.id)
                                        )
                                    }
                                    className="text-xs"
                                >
                                    {ses.name}
                                </DropdownMenuCheckboxItem>
                            ))
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selectedLevelIds.map((id) => {
                        const lvl = summary?.levels.find((l) => l.id === id);
                        return (
                            <span
                                key={id}
                                className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700"
                            >
                                {levelLabel}: {lvl?.name ?? id}
                                <button
                                    onClick={() => removeLevelFilter(id)}
                                    className="ml-0.5 rounded-full hover:text-primary-900"
                                >
                                    <X size={11} />
                                </button>
                            </span>
                        );
                    })}
                    {selectedSessionIds.map((id) => {
                        const ses = summary?.sessions.find((s) => s.id === id);
                        return (
                            <span
                                key={id}
                                className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700"
                            >
                                {sessionLabel}: {ses?.name ?? id}
                                <button
                                    onClick={() => removeSessionFilter(id)}
                                    className="ml-0.5 rounded-full hover:text-violet-900"
                                >
                                    <X size={11} />
                                </button>
                            </span>
                        );
                    })}
                    <button
                        onClick={() => {
                            setSelectedLevelIds([]);
                            setSelectedSessionIds([]);
                        }}
                        className="text-xs text-neutral-400 underline-offset-2 hover:text-neutral-600 hover:underline"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* Course list */}
            <div className="flex flex-col gap-3">
                {isLoading ? (
                    // Skeleton loader
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-lg border border-neutral-200 bg-white">
                            <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
                                <Skeleton className="size-4 rounded" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <div className="px-4 py-3 space-y-2">
                                <Skeleton className="h-9 w-full" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                        </div>
                    ))
                ) : groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <BookOpen
                            size={36}
                            className="mb-3 text-neutral-300"
                            weight="duotone"
                        />
                        <p className="text-sm font-medium text-neutral-500">No courses found</p>
                        <p className="mt-1 text-xs text-neutral-400">
                            Try adjusting your search or filters.
                        </p>
                    </div>
                ) : (
                    groups.map((group) => (
                        <div
                            key={group.package_dto.id}
                            className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm"
                        >
                            {/* Course header */}
                            <div className="flex items-center gap-2.5 border-b border-neutral-100 bg-neutral-50 px-4 py-2.5">
                                <BookOpen size={15} className="shrink-0 text-primary-500" weight="duotone" />
                                <span className="text-sm font-semibold text-neutral-800 leading-tight">
                                    {group.package_dto.package_name}
                                </span>
                                <span className="ml-auto text-xs text-neutral-400">
                                    {group.sessions.length} batch{group.sessions.length !== 1 ? 'es' : ''}
                                </span>
                            </div>

                            {/* Batch rows */}
                            <div className="divide-y divide-neutral-50">
                                {group.sessions.map((batch) => {
                                    const selected = isSelected(batch.id);
                                    return (
                                        <button
                                            key={batch.id}
                                            onClick={() => toggle(batch)}
                                            className={cn(
                                                'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-50/60',
                                                selected && 'bg-primary-50'
                                            )}
                                        >
                                            <Checkbox
                                                checked={selected}
                                                onCheckedChange={() => toggle(batch)}
                                                className="pointer-events-none shrink-0"
                                            />
                                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                                <span className="truncate text-xs font-medium text-neutral-700">
                                                    {batch.level.level_name}
                                                </span>
                                                <span className="text-neutral-300">·</span>
                                                <span className="truncate text-xs text-neutral-500">
                                                    {batch.session.session_name}
                                                </span>
                                            </div>
                                            <span
                                                className={cn(
                                                    'shrink-0 text-xs font-medium',
                                                    selected ? 'text-primary-600' : 'text-neutral-300'
                                                )}
                                            >
                                                {selected ? '✓' : '+'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
