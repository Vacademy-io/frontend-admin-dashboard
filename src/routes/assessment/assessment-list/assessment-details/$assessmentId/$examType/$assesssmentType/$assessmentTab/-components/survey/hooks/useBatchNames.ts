import { useMemo, useCallback } from 'react';
import { usePaginatedBatches, getBatchDisplayName } from '@/services/paginated-batches';

/**
 * Hook to get batch names from batch IDs (source_id)
 * Provides memoized batch name resolution for better performance
 */
export const useBatchNames = () => {
  // Fetch batches using the paginated API
  const { data: paginatedBatchesData } = usePaginatedBatches({
    page: 0,
    size: 1000,
  });

  // Memoize batch lookup map for better performance
  const batchLookupMap = useMemo(() => {
    const batches = paginatedBatchesData?.content;
    if (!batches || batches.length === 0) {
      return new Map<string, string>();
    }

    const map = new Map<string, string>();
    batches.forEach((batch) => {
      const batchName = getBatchDisplayName(batch, 'full');
      map.set(batch.id, batchName);
    });

    return map;
  }, [paginatedBatchesData?.content]);

  /**
   * Get batch name from batch ID
   */
  const getBatchName = useCallback((batchId: string): string => {
    if (!batchId || !batchLookupMap.size) {
      return 'N/A';
    }

    return batchLookupMap.get(batchId) || 'N/A';
  }, [batchLookupMap]);

  /**
   * Get batch names for multiple batch IDs
   */
  const getBatchNames = useCallback((batchIds: string[]): Map<string, string> => {
    const batchNamesMap = new Map<string, string>();

    batchIds.forEach(batchId => {
      batchNamesMap.set(batchId, getBatchName(batchId));
    });

    return batchNamesMap;
  }, [getBatchName]);

  /**
   * Get all unique batch IDs from responses
   */
  const getUniqueBatchIds = useCallback((responses: Array<{ source_id?: string }>): string[] => {
    const uniqueIds = new Set<string>();

    responses.forEach(response => {
      if (response.source_id) {
        uniqueIds.add(response.source_id);
      }
    });

    return Array.from(uniqueIds);
  }, []);

  return {
    getBatchName,
    getBatchNames,
    getUniqueBatchIds,
  };
};
