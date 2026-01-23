import SelectChips from '@/components/design-system/SelectChips';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { FilterType } from '../../-types/filter-type';
import { useDoubtFilters } from '../../-stores/filter-store';
import { useInfiniteBatches, useAllBatchIds } from '@/services/paginated-batches';
import { Button } from '@/components/ui/button';
import { CircleNotch } from '@phosphor-icons/react';

const AllBatchOption = {
    label: 'All',
    value: '',
};

export const BatchFilter = () => {
    const { updateFilters } = useDoubtFilters();

    // Use infinite batches hook for proper pagination with load more
    const { batches, isLoading, isLoadingMore, hasNextPage, loadMore, totalElements } =
        useInfiniteBatches({ size: 20 });

    // Use the optimized hook to get all batch IDs for "All" selection
    const { data: allBatchIds } = useAllBatchIds();

    // Build the batch list for the dropdown
    const batchList: FilterType[] = useMemo(() => {
        const list: FilterType[] = [AllBatchOption];

        if (batches && batches.length > 0) {
            const batchOptions = batches.map((batch) => ({
                label:
                    (batch.level?.level_name || '') +
                    ' ' +
                    batch.package_dto.package_name +
                    ', ' +
                    (batch.session?.session_name || ''),
                value: batch.id,
            }));
            list.push(...batchOptions);
        }

        return list;
    }, [batches]);

    const [selectedBatch, setSelectedBatch] = useState<FilterType[]>([AllBatchOption]);

    const handleBatchChange = (batch: FilterType[]) => {
        if (batch.length > 0) setSelectedBatch(batch);
    };

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isLoadingMore) {
            loadMore();
        }
    }, [hasNextPage, isLoadingMore, loadMore]);

    useEffect(() => {
        if (selectedBatch.includes(AllBatchOption)) {
            // Use the pre-fetched all batch IDs
            updateFilters({
                batch_ids: allBatchIds || [],
            });
        } else {
            updateFilters({
                batch_ids: selectedBatch.map((batch) => batch.value),
            });
        }
    }, [selectedBatch, allBatchIds, updateFilters]);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <p>Batch</p>
                <div className="h-8 min-w-40 animate-pulse rounded bg-neutral-200" />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <p>Batch</p>
            <div className="flex flex-col gap-1">
                <SelectChips
                    options={batchList}
                    selected={selectedBatch}
                    onChange={handleBatchChange}
                    multiSelect={true}
                    hasClearFilter={false}
                    className="min-w-40"
                />
                {hasNextPage && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="h-6 text-xs text-primary-500 hover:text-primary-600"
                    >
                        {isLoadingMore ? (
                            <>
                                <CircleNotch className="mr-1 size-3 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            `Load More (${batches.length}/${totalElements})`
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};
