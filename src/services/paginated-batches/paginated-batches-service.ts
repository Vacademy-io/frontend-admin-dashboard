/**
 * Paginated Batches API Service
 *
 * This service provides methods to interact with the paginated batches API.
 * Use this instead of loading all batches_for_sessions from institute details.
 *
 * @see API Documentation in docs/paginated-batches-api.md
 */

import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { getCurrentInstituteId } from '@/lib/auth/instituteUtils';

// Base URL for paginated batches API
const PAGINATED_BATCHES_BASE = '/admin-core-service/institute/v1';

// ============================================================================
// Types
// ============================================================================

export interface BatchLevel {
    id: string;
    level_name: string;
    duration_in_days?: number;
    thumbnail_id?: string | null;
}

export interface BatchSession {
    id: string;
    session_name: string;
    status?: string;
    start_date?: string;
}

export interface BatchPackageDto {
    id: string;
    package_name: string;
    thumbnail_file_id?: string;
    thumbnail_id?: string | null;
    is_course_published_to_catalaouge?: boolean;
    course_preview_image_media_id?: string;
    course_banner_media_id?: string;
    course_media_id?: string;
    why_learn_html?: string;
    who_should_learn_html?: string;
    about_the_course_html?: string;
    tags?: string[];
    course_depth?: number;
    course_html_description_html?: string;
}

export interface BatchGroup {
    id: string;
    group_name: string;
    parent_group?: string | null;
    is_root?: boolean | null;
    group_value?: string;
}

export interface PaginatedBatch {
    id: string; // This is the package_session_id
    level: BatchLevel;
    session: BatchSession;
    start_time: string | null;
    status: string;
    package_dto: BatchPackageDto;
    group: BatchGroup | null;
    read_time_in_minutes?: number;
    is_org_associated?: boolean;
}

export interface PaginatedBatchesResponse {
    content: PaginatedBatch[];
    page_number: number;
    page_size: number;
    total_elements: number;
    total_pages: number;
    first: boolean;
    last: boolean;
    has_next: boolean;
    has_previous: boolean;
}

export interface BatchesSummaryResponse {
    total_batches: number;
    has_org_associated: boolean;
    packages: Array<{ id: string; name: string }>;
    levels: Array<{ id: string; name: string }>;
    sessions: Array<{ id: string; name: string }>;
}

export interface BatchesByIdsResponse {
    content: PaginatedBatch[];
}

// Query parameters for paginated batches
export interface PaginatedBatchesParams {
    page?: number;
    size?: number;
    sessionId?: string;
    levelId?: string;
    packageId?: string;
    search?: string;
    packageSessionIds?: string[];
    sortBy?: 'package_name' | 'level_name' | 'session_name' | 'created_at';
    sortDirection?: 'ASC' | 'DESC';
    statuses?: string[];
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch paginated batches for an institute
 *
 * @param params - Query parameters for filtering, sorting, and pagination
 * @param instituteId - Optional institute ID (defaults to current institute)
 * @returns Paginated response containing batches
 *
 * @example
 * // Basic usage - first page
 * const response = await fetchPaginatedBatches({ page: 0, size: 20 });
 *
 * @example
 * // Search with autocomplete
 * const response = await fetchPaginatedBatches({ search: 'Physics', size: 10 });
 *
 * @example
 * // Filter by package (course)
 * const response = await fetchPaginatedBatches({ packageId: 'course-uuid' });
 */
export async function fetchPaginatedBatches(
    params: PaginatedBatchesParams = {},
    instituteId?: string
): Promise<PaginatedBatchesResponse> {
    const instId = instituteId || getCurrentInstituteId();

    if (!instId) {
        throw new Error('Institute ID is required');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) {
        queryParams.append('page', params.page.toString());
    }
    if (params.size !== undefined) {
        queryParams.append('size', params.size.toString());
    }
    if (params.sessionId) {
        queryParams.append('sessionId', params.sessionId);
    }
    if (params.levelId) {
        queryParams.append('levelId', params.levelId);
    }
    if (params.packageId) {
        queryParams.append('packageId', params.packageId);
    }
    if (params.search) {
        queryParams.append('search', params.search);
    }
    if (params.packageSessionIds && params.packageSessionIds.length > 0) {
        params.packageSessionIds.forEach((id) => {
            queryParams.append('packageSessionIds', id);
        });
    }
    if (params.sortBy) {
        queryParams.append('sortBy', params.sortBy);
    }
    if (params.sortDirection) {
        queryParams.append('sortDirection', params.sortDirection);
    }
    if (params.statuses && params.statuses.length > 0) {
        params.statuses.forEach((status) => {
            queryParams.append('statuses', status);
        });
    }

    const queryString = queryParams.toString();
    const url = `${PAGINATED_BATCHES_BASE}/paginated-batches/${instId}${queryString ? `?${queryString}` : ''}`;

    const response = await authenticatedAxiosInstance.get<PaginatedBatchesResponse>(url);
    return response.data;
}

/**
 * Fetch batches by their IDs
 *
 * Use this for ID resolution - converting batch IDs to full batch details
 * for display purposes (e.g., showing batch names in filter badges)
 *
 * @param ids - Array of batch (package_session) IDs
 * @param instituteId - Optional institute ID (defaults to current institute)
 * @returns Array of batch details
 *
 * @example
 * const batchDetails = await fetchBatchesByIds(['ps-1', 'ps-2', 'ps-3']);
 * batchDetails.content.forEach(batch => {
 *     console.log(batch.package_dto.package_name);
 * });
 */
export async function fetchBatchesByIds(
    ids: string[],
    instituteId?: string
): Promise<BatchesByIdsResponse> {
    const instId = instituteId || getCurrentInstituteId();

    if (!instId) {
        throw new Error('Institute ID is required');
    }

    if (!ids || ids.length === 0) {
        return { content: [] };
    }

    const url = `${PAGINATED_BATCHES_BASE}/batches-by-ids/${instId}`;
    const response = await authenticatedAxiosInstance.post<BatchesByIdsResponse>(url, { ids });
    return response.data;
}

/**
 * Fetch batches summary/aggregates for an institute
 *
 * Use this to build filter dropdowns efficiently without fetching all batches.
 * Returns unique packages, levels, sessions, and metadata like has_org_associated.
 *
 * @param instituteId - Optional institute ID (defaults to current institute)
 * @param statuses - Optional status filter (default: ['ACTIVE'])
 * @returns Summary containing aggregates and metadata
 *
 * @example
 * const summary = await fetchBatchesSummary();
 *
 * // Build package dropdown
 * const packageOptions = summary.packages.map(pkg => ({
 *     value: pkg.id,
 *     label: pkg.name
 * }));
 *
 * // Check for org-associated batches
 * if (summary.has_org_associated) {
 *     showOrgFilter();
 * }
 */
export async function fetchBatchesSummary(
    instituteId?: string,
    statuses?: string[]
): Promise<BatchesSummaryResponse> {
    const instId = instituteId || getCurrentInstituteId();

    if (!instId) {
        throw new Error('Institute ID is required');
    }

    const queryParams = new URLSearchParams();
    if (statuses && statuses.length > 0) {
        statuses.forEach((status) => {
            queryParams.append('statuses', status);
        });
    }

    const queryString = queryParams.toString();
    const url = `${PAGINATED_BATCHES_BASE}/batches-summary/${instId}${queryString ? `?${queryString}` : ''}`;

    const response = await authenticatedAxiosInstance.get<BatchesSummaryResponse>(url);
    return response.data;
}

// ============================================================================
// Helper Functions for Common Use Cases
// ============================================================================

/**
 * Find package session IDs by package (course) ID
 *
 * This is a common pattern after course creation - we need to find the
 * package_session_id(s) for a newly created course to create subjects/modules/chapters.
 *
 * @param packageId - The package/course ID
 * @param instituteId - Optional institute ID (defaults to current institute)
 * @returns Array of package session IDs, or empty array if none found
 *
 * @example
 * // After course creation:
 * const courseId = response.data; // From ADD_COURSE API
 * const packageSessionIds = await findPackageSessionIdsByPackageId(courseId);
 * if (packageSessionIds.length > 0) {
 *     const commaSeparated = packageSessionIds.join(',');
 *     // Use for subject/module/chapter creation
 * }
 */
export async function findPackageSessionIdsByPackageId(
    packageId: string,
    instituteId?: string
): Promise<string[]> {
    if (!packageId) {
        return [];
    }

    try {
        const response = await fetchPaginatedBatches(
            { packageId, size: 100 }, // Get all batches for this package
            instituteId
        );

        return response.content.map((batch) => batch.id);
    } catch (error) {
        console.error('[findPackageSessionIdsByPackageId] Error:', error);
        return [];
    }
}

/**
 * Find package session IDs with retry logic
 *
 * After creating a new course, there might be a short delay before the batch
 * appears in the database. This function retries up to maxRetries times.
 *
 * @param packageId - The package/course ID
 * @param options - Retry options
 * @returns Array of package session IDs
 * @throws Error if not found after all retries
 *
 * @example
 * const packageSessionIds = await findPackageSessionIdsWithRetry(courseId, {
 *     maxRetries: 3,
 *     retryDelayMs: 2000,
 *     onRetry: (attempt) => setProgress(`Waiting for course... (attempt ${attempt})`)
 * });
 */
export async function findPackageSessionIdsWithRetry(
    packageId: string,
    options: {
        maxRetries?: number;
        retryDelayMs?: number;
        instituteId?: string;
        onRetry?: (attempt: number) => void;
    } = {}
): Promise<string[]> {
    const { maxRetries = 3, retryDelayMs = 2000, instituteId, onRetry } = options;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const ids = await findPackageSessionIdsByPackageId(packageId, instituteId);

        if (ids.length > 0) {
            return ids;
        }

        if (attempt < maxRetries) {
            if (onRetry) {
                onRetry(attempt);
            }
            await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
    }

    throw new Error(
        `Package session IDs not found for package ${packageId} after ${maxRetries} attempts. ` +
            'The course may need more time to be fully created. Please try again.'
    );
}

/**
 * Get batch details by package session ID
 *
 * @param packageSessionId - The package session ID
 * @param instituteId - Optional institute ID
 * @returns Batch details or null if not found
 */
export async function getBatchDetailsByPackageSessionId(
    packageSessionId: string,
    instituteId?: string
): Promise<PaginatedBatch | null> {
    if (!packageSessionId) {
        return null;
    }

    try {
        const response = await fetchBatchesByIds([packageSessionId], instituteId);
        return response.content[0] || null;
    } catch (error) {
        console.error('[getBatchDetailsByPackageSessionId] Error:', error);
        return null;
    }
}

/**
 * Build a display name for a batch
 *
 * @param batch - The batch object
 * @param format - Format style: 'full' | 'compact'
 * @returns Formatted display name
 *
 * @example
 * const name = getBatchDisplayName(batch, 'full');
 * // "Physics Foundation - Class 10 - 2024-25"
 *
 * const compactName = getBatchDisplayName(batch, 'compact');
 * // "Physics Foundation (Class 10)"
 */
export function getBatchDisplayName(
    batch: PaginatedBatch,
    format: 'full' | 'compact' = 'full'
): string {
    const packageName = batch.package_dto?.package_name || 'Unknown';
    const levelName = batch.level?.level_name || '';
    const sessionName = batch.session?.session_name || '';

    if (format === 'compact') {
        if (levelName && levelName !== 'DEFAULT') {
            return `${packageName} (${levelName})`;
        }
        return packageName;
    }

    // Full format
    const parts = [packageName];
    if (levelName && levelName !== 'DEFAULT') {
        parts.push(levelName);
    }
    if (sessionName && sessionName !== 'DEFAULT') {
        parts.push(sessionName);
    }

    return parts.join(' - ');
}
