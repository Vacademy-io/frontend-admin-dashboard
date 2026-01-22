/**
 * Paginated Batches API
 *
 * This module provides a scalable way to fetch package sessions (batches)
 * for institutes with many courses. Instead of loading all batches at once,
 * it uses pagination, search, and filters.
 *
 * @example
 * // Service layer (for non-React usage)
 * import { fetchPaginatedBatches, fetchBatchesSummary } from '@/services/paginated-batches';
 *
 * // React Query hooks
 * import { usePaginatedBatches, useBatchesSummary } from '@/services/paginated-batches';
 *
 * // Types
 * import type { PaginatedBatch, PaginatedBatchesResponse } from '@/services/paginated-batches';
 */

// Service layer exports
export {
    fetchPaginatedBatches,
    fetchBatchesByIds,
    fetchBatchesSummary,
    findPackageSessionIdsByPackageId,
    findPackageSessionIdsWithRetry,
    getBatchDetailsByPackageSessionId,
    getBatchDisplayName,
    type PaginatedBatch,
    type PaginatedBatchesResponse,
    type BatchesSummaryResponse,
    type BatchesByIdsResponse,
    type PaginatedBatchesParams,
    type BatchLevel,
    type BatchSession,
    type BatchPackageDto,
    type BatchGroup,
} from './paginated-batches-service';

// React Query hooks exports
export {
    usePaginatedBatches,
    useBatchesByIds,
    useBatchesSummary,
    useBatchesByPackageId,
    useFindPackageSessionIdsWithRetry,
    useSearchBatches,
    useInfiniteBatches,
    useInvalidateBatchesQueries,
    paginatedBatchesKeys,
} from './usePaginatedBatches';
