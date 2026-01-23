/**
 * React Query hooks for Paginated Batches API
 *
 * These hooks provide caching, refetching, and loading state management
 * for the paginated batches API endpoints.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchPaginatedBatches,
    fetchBatchesByIds,
    fetchBatchesSummary,
    findPackageSessionIdsWithRetry,
    type PaginatedBatchesParams,
    type PaginatedBatch,
} from './paginated-batches-service';

// ============================================================================
// Query Keys
// ============================================================================

export const paginatedBatchesKeys = {
    all: ['paginated-batches'] as const,
    lists: () => [...paginatedBatchesKeys.all, 'list'] as const,
    list: (params: PaginatedBatchesParams, instituteId?: string) =>
        [...paginatedBatchesKeys.lists(), params, instituteId] as const,
    byIds: (ids: string[], instituteId?: string) =>
        [...paginatedBatchesKeys.all, 'byIds', ids, instituteId] as const,
    summary: (instituteId?: string, statuses?: string[]) =>
        [...paginatedBatchesKeys.all, 'summary', instituteId, statuses] as const,
    byPackageId: (packageId: string, instituteId?: string) =>
        [...paginatedBatchesKeys.all, 'byPackageId', packageId, instituteId] as const,
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch paginated batches
 *
 * @param params - Query parameters for filtering, sorting, and pagination
 * @param instituteId - Optional institute ID
 * @param options - Additional React Query options
 *
 * @example
 * // Basic usage
 * const { data, isLoading } = usePaginatedBatches({ page: 0, size: 20 });
 *
 * @example
 * // With search
 * const { data } = usePaginatedBatches({ search: debouncedSearch, size: 10 });
 *
 * @example
 * // Filter by package
 * const { data } = usePaginatedBatches({ packageId: courseId });
 */
export function usePaginatedBatches(
    params: PaginatedBatchesParams = {},
    instituteId?: string,
    options?: {
        enabled?: boolean;
        staleTime?: number;
        refetchOnWindowFocus?: boolean;
    }
) {
    return useQuery({
        queryKey: paginatedBatchesKeys.list(params, instituteId),
        queryFn: () => fetchPaginatedBatches(params, instituteId),
        enabled: options?.enabled ?? true,
        staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
        refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    });
}

/**
 * Hook to fetch batches by their IDs
 *
 * Use for ID resolution - getting full batch details from IDs.
 *
 * @param ids - Array of batch IDs
 * @param instituteId - Optional institute ID
 * @param options - Additional options
 *
 * @example
 * const selectedIds = ['ps-1', 'ps-2'];
 * const { data } = useBatchesByIds(selectedIds);
 *
 * // Show batch names
 * data?.content.forEach(batch => console.log(batch.package_dto.package_name));
 */
export function useBatchesByIds(
    ids: string[],
    instituteId?: string,
    options?: {
        enabled?: boolean;
        staleTime?: number;
    }
) {
    return useQuery({
        queryKey: paginatedBatchesKeys.byIds(ids, instituteId),
        queryFn: () => fetchBatchesByIds(ids, instituteId),
        enabled: (options?.enabled ?? true) && ids.length > 0,
        staleTime: options?.staleTime ?? 10 * 60 * 1000, // 10 minutes - batch details don't change often
    });
}

/**
 * Hook to fetch batches summary
 *
 * Use for building filter dropdowns and checking metadata like has_org_associated.
 * This is typically fetched once and cached for a longer time.
 *
 * @param instituteId - Optional institute ID
 * @param statuses - Optional status filter
 * @param options - Additional options
 *
 * @example
 * const { data: summary, isLoading } = useBatchesSummary();
 *
 * // Build dropdown options
 * const packageOptions = summary?.packages.map(pkg => ({
 *     value: pkg.id,
 *     label: pkg.name
 * }));
 *
 * // Check for org batches
 * const hasOrgBatches = summary?.has_org_associated ?? false;
 */
export function useBatchesSummary(
    instituteId?: string,
    statuses?: string[],
    options?: {
        enabled?: boolean;
        staleTime?: number;
    }
) {
    return useQuery({
        queryKey: paginatedBatchesKeys.summary(instituteId, statuses),
        queryFn: () => fetchBatchesSummary(instituteId, statuses),
        enabled: options?.enabled ?? true,
        staleTime: options?.staleTime ?? 30 * 60 * 1000, // 30 minutes - summary is stable
    });
}

/**
 * Hook to get batches for a specific package (course)
 *
 * Useful after course creation to find package session IDs.
 *
 * @param packageId - The package/course ID
 * @param instituteId - Optional institute ID
 * @param options - Additional options
 *
 * @example
 * const { data, refetch } = useBatchesByPackageId(courseId, undefined, {
 *     enabled: !!courseId
 * });
 *
 * const packageSessionIds = data?.content.map(b => b.id) ?? [];
 */
export function useBatchesByPackageId(
    packageId: string,
    instituteId?: string,
    options?: {
        enabled?: boolean;
        staleTime?: number;
    }
) {
    return useQuery({
        queryKey: paginatedBatchesKeys.byPackageId(packageId, instituteId),
        queryFn: () => fetchPaginatedBatches({ packageId, size: 100 }, instituteId),
        enabled: (options?.enabled ?? true) && !!packageId,
        staleTime: options?.staleTime ?? 1 * 60 * 1000, // 1 minute - fresh data for course creation
    });
}

/**
 * Hook to get all batch IDs
 *
 * Use for "All" selection in filters where we need every batch ID.
 * This fetches up to 1000 batches and extracts just the IDs.
 *
 * @param instituteId - Optional institute ID
 * @param options - Additional options
 *
 * @example
 * const { data: allBatchIds } = useAllBatchIds();
 *
 * // Use for "All" filter
 * if (selectedBatch === 'all') {
 *     updateFilters({ batch_ids: allBatchIds || [] });
 * }
 */
export function useAllBatchIds(
    instituteId?: string,
    options?: {
        enabled?: boolean;
        staleTime?: number;
    }
) {
    const batchesQuery = useQuery({
        queryKey: [...paginatedBatchesKeys.all, 'allIds', instituteId],
        queryFn: async () => {
            // Fetch a large page to get all batches
            const response = await fetchPaginatedBatches({ size: 1000 }, instituteId);
            return response.content.map(batch => batch.id);
        },
        enabled: options?.enabled ?? true,
        staleTime: options?.staleTime ?? 10 * 60 * 1000, // 10 minutes - batch IDs don't change often
    });

    return batchesQuery;
}

/**
 * Hook for finding package session IDs with retry (mutation)
 *
 * This is useful for the course creation flow where we need to wait
 * for the backend to fully create the batch before we can find it.
 *
 * @example
 * const findPackageSessionIds = useFindPackageSessionIdsWithRetry();
 *
 * // After course creation
 * findPackageSessionIds.mutate({
 *     packageId: courseId,
 *     onRetry: (attempt) => setProgress(`Waiting for course... (attempt ${attempt})`)
 * }, {
 *     onSuccess: (ids) => {
 *         const commaSeparated = ids.join(',');
 *         // Create subject, module, chapter...
 *     },
 *     onError: (error) => {
 *         toast.error(error.message);
 *     }
 * });
 */
export function useFindPackageSessionIdsWithRetry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            packageId: string;
            instituteId?: string;
            maxRetries?: number;
            retryDelayMs?: number;
            onRetry?: (attempt: number) => void;
        }) => {
            const { packageId, instituteId, maxRetries, retryDelayMs, onRetry } = params;
            return findPackageSessionIdsWithRetry(packageId, {
                maxRetries,
                retryDelayMs,
                instituteId,
                onRetry,
            });
        },
        onSuccess: (data, variables) => {
            // Invalidate related queries to reflect new batch
            queryClient.invalidateQueries({
                queryKey: paginatedBatchesKeys.summary(variables.instituteId),
            });
            queryClient.invalidateQueries({
                queryKey: paginatedBatchesKeys.byPackageId(
                    variables.packageId,
                    variables.instituteId
                ),
            });
        },
    });
}

/**
 * Hook for searching batches with debounced input
 *
 * This hook is optimized for autocomplete/typeahead scenarios.
 *
 * @param searchQuery - The search query (should be debounced by caller)
 * @param instituteId - Optional institute ID
 * @param options - Additional options
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * const { data, isLoading } = useSearchBatches(debouncedSearch);
 *
 * // Show autocomplete suggestions
 * const suggestions = data?.content ?? [];
 */
export function useSearchBatches(
    searchQuery: string,
    instituteId?: string,
    options?: {
        enabled?: boolean;
        size?: number;
        packageId?: string;
        sessionId?: string;
        levelId?: string;
    }
) {
    const params: PaginatedBatchesParams = {
        search: searchQuery,
        size: options?.size ?? 10,
        packageId: options?.packageId,
        sessionId: options?.sessionId,
        levelId: options?.levelId,
    };

    return useQuery({
        queryKey: paginatedBatchesKeys.list(params, instituteId),
        queryFn: () => fetchPaginatedBatches(params, instituteId),
        enabled: (options?.enabled ?? true) && searchQuery.length > 0,
        staleTime: 30 * 1000, // 30 seconds - search results can change
    });
}

/**
 * Hook for infinite scroll / load more pattern
 *
 * @param params - Base query parameters (without page)
 * @param instituteId - Optional institute ID
 *
 * @example
 * const {
 *     batches,
 *     isLoading,
 *     hasNextPage,
 *     loadMore,
 *     isLoadingMore
 * } = useInfiniteBatches({ size: 20 });
 *
 * // In scroll handler
 * if (hasNextPage && !isLoadingMore) {
 *     loadMore();
 * }
 */
export function useInfiniteBatches(
    params: Omit<PaginatedBatchesParams, 'page'> = {},
    instituteId?: string
) {
    const queryClient = useQueryClient();

    // Track current page
    const currentPageQuery = useQuery<number>({
        queryKey: [...paginatedBatchesKeys.list(params, instituteId), 'currentPage'],
        queryFn: () => 0,
        staleTime: Infinity,
    });

    const currentPage = currentPageQuery.data ?? 0;

    // Fetch current page data
    const { data, isLoading, error } = usePaginatedBatches(
        { ...params, page: currentPage },
        instituteId
    );

    // Accumulated batches from all pages
    const accumulatedQuery = useQuery<PaginatedBatch[]>({
        queryKey: [...paginatedBatchesKeys.list(params, instituteId), 'accumulated'],
        queryFn: () => [],
        staleTime: Infinity,
    });

    const accumulatedBatches = accumulatedQuery.data ?? [];

    const loadMore = async () => {
        if (!data?.has_next) return;

        const nextPage = currentPage + 1;

        // Fetch next page
        const nextData = await queryClient.fetchQuery({
            queryKey: paginatedBatchesKeys.list({ ...params, page: nextPage }, instituteId),
            queryFn: () => fetchPaginatedBatches({ ...params, page: nextPage }, instituteId),
        });

        // Update accumulated batches
        queryClient.setQueryData(
            [...paginatedBatchesKeys.list(params, instituteId), 'accumulated'],
            [...accumulatedBatches, ...data.content, ...nextData.content]
        );

        // Update current page
        queryClient.setQueryData(
            [...paginatedBatchesKeys.list(params, instituteId), 'currentPage'],
            nextPage
        );
    };

    // Combine accumulated + current page batches
    const allBatches =
        currentPage === 0 ? data?.content ?? [] : [...accumulatedBatches, ...(data?.content ?? [])];

    return {
        batches: allBatches,
        isLoading: isLoading && currentPage === 0,
        isLoadingMore: isLoading && currentPage > 0,
        error,
        hasNextPage: data?.has_next ?? false,
        loadMore,
        totalElements: data?.total_elements ?? 0,
        totalPages: data?.total_pages ?? 0,
        currentPage,
    };
}

// ============================================================================
// Cache Invalidation Utilities
// ============================================================================

/**
 * Invalidate all paginated batches queries
 *
 * Call this after operations that modify batches (course creation, update, delete)
 */
export function useInvalidateBatchesQueries() {
    const queryClient = useQueryClient();

    return {
        invalidateAll: () => {
            queryClient.invalidateQueries({ queryKey: paginatedBatchesKeys.all });
        },
        invalidateSummary: (instituteId?: string) => {
            queryClient.invalidateQueries({
                queryKey: paginatedBatchesKeys.summary(instituteId),
            });
        },
        invalidateByPackageId: (packageId: string, instituteId?: string) => {
            queryClient.invalidateQueries({
                queryKey: paginatedBatchesKeys.byPackageId(packageId, instituteId),
            });
        },
    };
}
