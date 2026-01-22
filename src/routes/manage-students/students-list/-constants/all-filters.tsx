import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { FilterConfig } from '@/routes/manage-students/students-list/-types/students-list-types';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { InstituteDetailsType } from '@/schemas/student/student-list/institute-schema';
import { removeDefaultPrefix } from '@/utils/helpers/removeDefaultPrefix';
import { PaginatedBatch } from '@/services/paginated-batches';

// Types for filter data
export interface BatchFilterItem {
    id: string;
    label: string;
}

export interface FilterDataOptions {
    /** Institute details (without relying on batches_for_sessions) */
    instituteDetails: InstituteDetailsType;
    /** Current session ID for filtering */
    currentSession: string;
    /** Batches filtered by session (can come from paginated API) */
    sessionBatches?: PaginatedBatch[];
    /** Whether any batch has is_org_associated (from summary API) */
    hasOrgAssociatedBatches?: boolean;
}

export const GetFilterData = (instituteDetails: InstituteDetailsType, currentSession: string) => {
    const batches = instituteDetails?.batches_for_sessions.filter(
        (batch) => batch.session.id === currentSession
    );
    const batchFilterList = batches?.map((batch) => {
        // If level is DEFAULT, only show package name
        if (batch.level.id === 'DEFAULT') {
            const packageName = removeDefaultPrefix(batch.package_dto.package_name);
            return {
                id: batch.id,
                label: packageName,
            };
        }

        // Otherwise show level + package name without "default" prefix
        const levelName = removeDefaultPrefix(batch.level.level_name);
        const packageName = removeDefaultPrefix(batch.package_dto.package_name);

        return {
            id: batch.id,
            label: `${levelName} ${packageName}`.trim(),
        };
    });

    const statuses = instituteDetails?.student_statuses.map((status, index) => ({
        id: index.toString(),
        label: status,
    }));

    const genders = instituteDetails?.genders.map((gender, index) => ({
        id: index.toString(),
        label: gender,
    }));

    const sessionExpiry = instituteDetails?.session_expiry_days.map((days, index) => ({
        id: index.toString(),
        label: `Expiring in ${days} days`,
    }));

    // Check if any batch has is_org_associated = true
    const hasOrgAssociatedBatches = instituteDetails?.batches_for_sessions.some(
        (batch) => batch.is_org_associated === true
    );

    const filterData: FilterConfig[] = [
        {
            id: 'batch',
            title: getTerminology(ContentTerms.Batch, SystemTerms.Batch),
            filterList: batchFilterList || [],
        },
        {
            id: 'statuses',
            title: 'Status',
            filterList: statuses || [],
        },
        {
            id: 'gender',
            title: 'Gender',
            filterList: genders || [],
        },
        {
            id: 'session_expiry_days',
            title: `${getTerminology(ContentTerms.Session, SystemTerms.Session)} Expiry`,
            filterList: sessionExpiry || [],
        },
        {
            id: 'payment_statuses',
            title: 'Payment Status',
            filterList: [
                { id: 'PAID', label: 'Paid' },
                { id: 'FAILED', label: 'Failed' },
                { id: 'PAYMENT_FAILED', label: 'Payment Failed' },
            ],
        },
        {
            id: 'approval_statuses',
            title: 'Approval Status',
            filterList: [
                { id: 'PENDING_FOR_APPROVAL', label: 'Pending for Approval' },
                { id: 'INVITED', label: 'Invited' },
            ],
        },
    ];

    // Add role filter if org-associated batches exist
    if (hasOrgAssociatedBatches && instituteDetails?.sub_org_roles) {
        const roles = instituteDetails.sub_org_roles.map((role, index) => ({
            id: role,
            label: role.replace(/_/g, ' '),
        }));

        filterData.push({
            id: 'sub_org_user_types',
            title: 'Role',
            filterList: roles,
        });
    }

    // Add custom field filters
    if (instituteDetails?.dropdown_custom_fields) {
        instituteDetails.dropdown_custom_fields.forEach((customField) => {
            try {
                const config = JSON.parse(customField.config);
                const options = config.map((option: any) => ({
                    id: option.value,
                    label: option.label,
                }));

                filterData.push({
                    id: customField.fieldKey,
                    title: customField.fieldName,
                    filterList: options,
                });
            } catch (error) {
                console.error(
                    `Error parsing custom field config for ${customField.fieldName}:`,
                    error
                );
            }
        });
    }

    return filterData;
};

/**
 * Helper function to build batch filter list from batches
 * Works with both legacy BatchForSessionType and PaginatedBatch
 */
export function buildBatchFilterList(
    batches: Array<{
        id: string;
        level: { id: string; level_name: string };
        package_dto: { package_name: string };
    }>
): BatchFilterItem[] {
    return (
        batches?.map((batch) => {
            // If level is DEFAULT, only show package name
            if (batch.level.id === 'DEFAULT') {
                const packageName = removeDefaultPrefix(batch.package_dto.package_name);
                return {
                    id: batch.id,
                    label: packageName,
                };
            }

            // Otherwise show level + package name without "default" prefix
            const levelName = removeDefaultPrefix(batch.level.level_name);
            const packageName = removeDefaultPrefix(batch.package_dto.package_name);

            return {
                id: batch.id,
                label: `${levelName} ${packageName}`.trim(),
            };
        }) || []
    );
}

/**
 * Optimized version of GetFilterData that accepts pre-fetched batch data
 *
 * This version can accept:
 * - sessionBatches: Batches filtered by session (from paginated API with sessionId filter)
 * - hasOrgAssociatedBatches: From the batches-summary API
 *
 * This avoids needing to load all batches_for_sessions at once.
 *
 * @example
 * // Using with paginated API
 * const { data: sessionBatches } = usePaginatedBatches({ sessionId: currentSession });
 * const { data: summary } = useBatchesSummary();
 *
 * const filterData = GetFilterDataOptimized({
 *     instituteDetails,
 *     currentSession,
 *     sessionBatches: sessionBatches?.content,
 *     hasOrgAssociatedBatches: summary?.has_org_associated
 * });
 */
export const GetFilterDataOptimized = (options: FilterDataOptions): FilterConfig[] => {
    const { instituteDetails, sessionBatches, hasOrgAssociatedBatches } = options;

    // Build batch filter list - either from provided batches or fall back to legacy
    let batchFilterList: BatchFilterItem[];

    if (sessionBatches && sessionBatches.length > 0) {
        // Use pre-fetched batches from paginated API
        batchFilterList = buildBatchFilterList(sessionBatches);
    } else if (instituteDetails?.batches_for_sessions) {
        // Fallback to legacy approach
        const batches = instituteDetails.batches_for_sessions.filter(
            (batch) => batch.session.id === options.currentSession
        );
        batchFilterList = buildBatchFilterList(batches);
    } else {
        batchFilterList = [];
    }

    const statuses =
        instituteDetails?.student_statuses.map((status, index) => ({
            id: index.toString(),
            label: status,
        })) || [];

    const genders =
        instituteDetails?.genders.map((gender, index) => ({
            id: index.toString(),
            label: gender,
        })) || [];

    const sessionExpiry =
        instituteDetails?.session_expiry_days.map((days, index) => ({
            id: index.toString(),
            label: `Expiring in ${days} days`,
        })) || [];

    // Determine if we should show role filter
    // Use provided value or fall back to checking legacy data
    const showRoleFilter =
        hasOrgAssociatedBatches ??
        instituteDetails?.batches_for_sessions?.some((batch) => batch.is_org_associated === true) ??
        false;

    const filterData: FilterConfig[] = [
        {
            id: 'batch',
            title: getTerminology(ContentTerms.Batch, SystemTerms.Batch),
            filterList: batchFilterList,
        },
        {
            id: 'statuses',
            title: 'Status',
            filterList: statuses,
        },
        {
            id: 'gender',
            title: 'Gender',
            filterList: genders,
        },
        {
            id: 'session_expiry_days',
            title: `${getTerminology(ContentTerms.Session, SystemTerms.Session)} Expiry`,
            filterList: sessionExpiry,
        },
        {
            id: 'payment_statuses',
            title: 'Payment Status',
            filterList: [
                { id: 'PAID', label: 'Paid' },
                { id: 'FAILED', label: 'Failed' },
                { id: 'PAYMENT_FAILED', label: 'Payment Failed' },
            ],
        },
        {
            id: 'approval_statuses',
            title: 'Approval Status',
            filterList: [
                { id: 'PENDING_FOR_APPROVAL', label: 'Pending for Approval' },
                { id: 'INVITED', label: 'Invited' },
            ],
        },
    ];

    // Add role filter if org-associated batches exist
    if (showRoleFilter && instituteDetails?.sub_org_roles) {
        const roles = instituteDetails.sub_org_roles.map((role) => ({
            id: role,
            label: role.replace(/_/g, ' '),
        }));

        filterData.push({
            id: 'sub_org_user_types',
            title: 'Role',
            filterList: roles,
        });
    }

    // Add custom field filters
    if (instituteDetails?.dropdown_custom_fields) {
        instituteDetails.dropdown_custom_fields.forEach((customField) => {
            try {
                const config = JSON.parse(customField.config);
                const options = config.map((option: { value: string; label: string }) => ({
                    id: option.value,
                    label: option.label,
                }));

                filterData.push({
                    id: customField.fieldKey,
                    title: customField.fieldName,
                    filterList: options,
                });
            } catch (error) {
                console.error(
                    `Error parsing custom field config for ${customField.fieldName}:`,
                    error
                );
            }
        });
    }

    return filterData;
};
