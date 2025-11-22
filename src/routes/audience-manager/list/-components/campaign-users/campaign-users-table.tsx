import { useMemo, useState, useEffect } from 'react';
import { MyTable } from '@/components/design-system/table';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { EmptyInvitePage } from '@/assets/svgs';
import { MyPagination } from '@/components/design-system/pagination';
import { useCampaignUsers } from '../../-hooks/useCampaignUsers';
import {
    campaignUsersColumns,
    CampaignUserTable,
    generateDynamicColumns,
} from './campaign-users-columns';
import { convertToLocalDateTime } from '@/constants/helper';
import { useCustomFieldSetup } from '../../-hooks/useCustomFieldSetup';
import { CustomFieldSetupItem } from '../../-services/get-custom-field-setup';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';

// Helper function to generate key from name
const generateKeyFromName = (name: string): string =>
    name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

interface CampaignUsersTableProps {
    campaignId: string;
    campaignName?: string;
    customFieldsJson?: string;
}

export const CampaignUsersTable = ({
    campaignId,
    campaignName,
    customFieldsJson,
}: CampaignUsersTableProps) => {
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const { instituteDetails } = useInstituteDetailsStore();
    const instituteId = instituteDetails?.id;

    // Reset page when campaign changes
    useEffect(() => {
        setPage(0);
        console.log('🔄 [CampaignUsersTable] Campaign changed, resetting page to 0');
    }, [campaignId]);

    // Parse custom fields from JSON - this will update when customFieldsJson prop changes
    // This is the source of truth for which custom fields this campaign has
    const customFields = useMemo(() => {
        if (!customFieldsJson) return [];
        try {
            const parsed = JSON.parse(customFieldsJson);
            const fields = Array.isArray(parsed) ? parsed : [];
            console.log(
                '🔄 [CampaignUsersTable] Parsed custom fields from campaign:',
                fields.length,
                'fields'
            );
            return fields;
        } catch (error) {
            console.error('Error parsing custom fields:', error);
            return [];
        }
    }, [customFieldsJson]);

    const {
        data: customFieldSetup,
        isLoading: isCustomFieldsLoading,
        error: customFieldsError,
    } = useCustomFieldSetup(instituteId);

    const customFieldMap = useMemo(() => {
        const map = new Map<string, CustomFieldSetupItem>();
        if (!customFieldSetup || customFieldSetup.length === 0) {
            return map;
        }

        customFieldSetup.forEach((field) => {
            const registerKey = (key?: string) => {
                if (!key) return;
                // Register multiple variations for better lookup
                map.set(key, field);
                map.set(key.toLowerCase(), field);
                map.set(key.toUpperCase(), field);
                // Also try without special characters
                const normalized = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                if (normalized && normalized !== key.toLowerCase()) {
                    map.set(normalized, field);
                }
            };

            // Register all possible identifiers
            registerKey(field.custom_field_id);
            registerKey(field.field_key);
            // Also register field_name as a potential lookup key
            if (field.field_name) {
                const nameKey = generateKeyFromName(field.field_name);
                registerKey(nameKey);
            }
        });

        console.log(
            '📋 [CampaignUsersTable] Loaded custom field setup from API, count:',
            customFieldSetup.length
        );

        // Log sample fields for debugging
        if (customFieldSetup.length > 0) {
            console.log(
                '📋 [CampaignUsersTable] Sample fields from setup API:',
                customFieldSetup.slice(0, 5).map((f) => ({
                    custom_field_id: f.custom_field_id,
                    field_key: f.field_key,
                    field_name: f.field_name,
                }))
            );
        }

        console.log('📋 [CampaignUsersTable] Lookup map size:', map.size);
        console.log(
            '📋 [CampaignUsersTable] Lookup map keys (first 10):',
            Array.from(map.keys()).slice(0, 10)
        );
        return map;
    }, [customFieldSetup]);

    const leadsPayload = useMemo(
        () => ({
            audience_id: campaignId,
            page,
            size: pageSize,
            sort_by: 'submitted_at_local',
            sort_direction: 'DESC',
        }),
        [campaignId, page, pageSize]
    );

    const { data: usersResponse, isLoading, error } = useCampaignUsers(leadsPayload);

    // Collect ALL unique field IDs from ALL users in the API response
    // This ensures we show ALL fields that exist in the leads API, even if some users don't have data
    const allFieldIdsFromAllUsers = useMemo(() => {
        const allFieldIds = new Set<string>();

        // Add field IDs from campaign customFields
        if (customFields && customFields.length > 0) {
            customFields.forEach((campaignField: any) => {
                const fieldId =
                    campaignField.custom_field?.id ||
                    campaignField.id ||
                    campaignField._id ||
                    campaignField.field_id;
                if (fieldId) {
                    allFieldIds.add(fieldId);
                }
            });
        }

        // Add field IDs from API response custom_field_values from ALL users
        // This collects ALL fields that exist in ANY user's response
        if (usersResponse && usersResponse.content) {
            usersResponse.content.forEach((lead: any) => {
                const customValues = lead.custom_field_values || {};
                Object.keys(customValues).forEach((fieldId) => {
                    allFieldIds.add(fieldId);
                });
            });
        }

        const collectedFieldIds = Array.from(allFieldIds);
        console.log(
            '📊 [CampaignUsersTable] All field IDs from all users:',
            collectedFieldIds.length,
            'fields'
        );
        console.log('📊 [CampaignUsersTable] Field IDs:', collectedFieldIds);

        // Log sample field IDs for debugging
        if (collectedFieldIds.length > 0) {
            console.log(
                '📊 [CampaignUsersTable] Sample field IDs (first 5):',
                collectedFieldIds.slice(0, 5)
            );
        }

        return collectedFieldIds;
    }, [customFields, usersResponse]);

    // Create a map from campaign's custom fields for field name lookup
    const campaignFieldsMap = useMemo(() => {
        const map = new Map<string, { name: string; key?: string }>();
        if (!customFields || customFields.length === 0) {
            return map;
        }

        customFields.forEach((campaignField: any) => {
            const fieldId =
                campaignField.custom_field?.id ||
                campaignField.id ||
                campaignField._id ||
                campaignField.field_id;

            if (fieldId) {
                const meta = campaignField.custom_field || {};
                const fieldName =
                    meta.fieldName || meta.field_name || campaignField.field_name || '';
                const fieldKey = meta.fieldKey || meta.field_key || generateKeyFromName(fieldName);

                if (fieldName) {
                    // Register multiple variations
                    map.set(fieldId, { name: fieldName, key: fieldKey });
                    map.set(fieldId.toLowerCase(), { name: fieldName, key: fieldKey });
                    map.set(fieldId.toUpperCase(), { name: fieldName, key: fieldKey });
                }
            }
        });

        console.log('📋 [CampaignUsersTable] Created campaign fields map, size:', map.size);
        if (map.size > 0) {
            console.log(
                '📋 [CampaignUsersTable] Campaign fields map entries:',
                Array.from(map.entries()).slice(0, 5)
            );
        }
        return map;
    }, [customFields]);

    const columns = useMemo(() => {
        // Convert collected field IDs to array and create field objects for column generation
        const allCustomFieldsArray = allFieldIdsFromAllUsers.map((fieldId) => ({
            id: fieldId,
            _id: fieldId,
            field_id: fieldId,
        }));

        if (allCustomFieldsArray.length === 0 && customFields.length === 0) {
            return campaignUsersColumns;
        }

        // Check which field IDs are in the lookup
        const fieldsInLookup: string[] = [];
        const fieldsNotInLookup: string[] = [];
        allFieldIdsFromAllUsers.forEach((fieldId) => {
            const found =
                customFieldMap.has(fieldId) ||
                customFieldMap.has(fieldId.toLowerCase()) ||
                customFieldMap.has(fieldId.toUpperCase());
            if (found) {
                fieldsInLookup.push(fieldId);
            } else {
                fieldsNotInLookup.push(fieldId);
            }
        });

        // Use all collected field IDs to generate columns
        // This maps each field ID to its name using the custom-field setup API response
        // Pass campaignFieldsMap as fallback for field names
        const fieldIdsToUse = allCustomFieldsArray.length > 0 ? allCustomFieldsArray : customFields;
        const generatedColumns = generateDynamicColumns(
            fieldIdsToUse,
            customFieldMap,
            // campaignFieldsMap
        );
        return generatedColumns;
    }, [
        campaignId,
        customFields,
        allFieldIdsFromAllUsers,
        customFieldSetup,
        customFieldMap,
        campaignFieldsMap,
    ]); // Include custom field setup dependency

    // Create a unique key for the table to force re-render when columns change
    // This key must include field IDs from both campaign and API response
    const tableKey = useMemo(() => {
        const fieldIdsKey =
            allFieldIdsFromAllUsers.length > 0
                ? allFieldIdsFromAllUsers.sort().join('-')
                : 'default';
        return `campaign-users-table-${campaignId}-${fieldIdsKey}`;
    }, [campaignId, allFieldIdsFromAllUsers]);

    // Map API response data to table rows
    // This will regenerate whenever usersResponse or customFields change
    // CRITICAL: Ensure ALL fields from allFieldIdsFromAllUsers are present in each row
    const tableData = useMemo(() => {
        if (!usersResponse || !usersResponse.content || usersResponse.content.length === 0) {
            return undefined;
        }

        return {
            content: usersResponse.content.map((lead, index) => {
                const user = lead.user || {};
                const customValues = lead.custom_field_values || {};
                const submittedAt = lead.submitted_at_local
                    ? convertToLocalDateTime(lead.submitted_at_local)
                    : '-';

                // Build dynamic row data - start with base fields
                const rowData: any = {
                    id: lead.response_id || lead.user_id || `${index}`,
                    submittedAt,
                    index: page * pageSize + index,
                };

                // CRITICAL: Process ALL field IDs from ALL users (not just this user's fields)
                // This ensures every row has ALL fields, with null/- if the user doesn't have that field
                allFieldIdsFromAllUsers.forEach((fieldId) => {
                    // Get field info from API setup map - try multiple lookup strategies
                    let fieldInfo =
                        customFieldMap.get(fieldId) ||
                        customFieldMap.get(fieldId.toLowerCase()) ||
                        customFieldMap.get(fieldId.toUpperCase()) ||
                        customFieldMap.get(fieldId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());

                    // If not found, try to find by iterating through all fields
                    if (!fieldInfo && customFieldMap.size > 0) {
                        for (const [key, field] of customFieldMap.entries()) {
                            const customFieldId = field.custom_field_id?.toLowerCase();
                            const fieldKey = field.field_key?.toLowerCase();
                            const searchId = fieldId.toLowerCase();

                            if (
                                customFieldId === searchId ||
                                fieldKey === searchId ||
                                customFieldId?.replace(/[^a-zA-Z0-9]/g, '') ===
                                    searchId.replace(/[^a-zA-Z0-9]/g, '') ||
                                fieldKey?.replace(/[^a-zA-Z0-9]/g, '') ===
                                    searchId.replace(/[^a-zA-Z0-9]/g, '')
                            ) {
                                fieldInfo = field;
                                break;
                            }
                        }
                    }

                    // Get value from custom_field_values (primary source)
                    // This is the actual value from the API response for THIS user
                    let value: any = customValues[fieldId];

                    // If value is empty or not present for this user, try user object
                    if (value === undefined || value === null || value === '') {
                        if (fieldInfo && fieldInfo.field_key) {
                            const fieldKey = fieldInfo.field_key;
                            value = (user as any)[fieldKey];

                            // Try common field mappings
                            if (value === undefined || value === null) {
                                if (fieldKey === 'phone_number' && user.mobile_number) {
                                    value = user.mobile_number;
                                } else if (fieldKey === 'phone' && user.mobile_number) {
                                    value = user.mobile_number;
                                } else if (fieldKey === 'full_name' && user.full_name) {
                                    value = user.full_name;
                                } else if (fieldKey === 'email' && user.email) {
                                    value = user.email;
                                }
                            }
                        } else {
                            // Fallback: try common field names directly from user object
                            if (fieldId === 'full_name' || fieldId === 'name') {
                                value = user.full_name || (user as any).name;
                            } else if (fieldId === 'email') {
                                value = user.email;
                            }
                        }
                    }

                    // Store value using field ID as key (matches column accessorKey)
                    // If value is not present for this user, set to null (user requested null, but we'll use '-' for display)
                    rowData[fieldId] =
                        value !== undefined && value !== null && value !== '' ? value : null;

                    // Debug first row
                    if (index === 0) {
                        console.log(
                            '📝 [CampaignUsersTable] Mapped field:',
                            fieldId,
                            '->',
                            value !== undefined && value !== null && value !== '' ? value : 'null',
                            '(found in API setup:',
                            !!fieldInfo,
                            ')'
                        );
                    }
                });

                // Debug: log first row data keys
                if (index === 0) {
                    console.log(
                        '🔄 [CampaignUsersTable] First row data keys:',
                        Object.keys(rowData)
                    );
                    console.log(
                        '🔄 [CampaignUsersTable] First row null values:',
                        Object.entries(rowData)
                            .filter(([_, v]) => v === null)
                            .map(([k]) => k)
                    );
                }

                return rowData as CampaignUserTable;
            }),
            total_pages: usersResponse.totalPages,
            page_no: usersResponse.number,
            page_size: usersResponse.size,
            total_elements: usersResponse.totalElements,
            last: usersResponse.last,
        };
    }, [usersResponse, allFieldIdsFromAllUsers, customFieldMap, page, pageSize]);

    // Debug: Log when campaignId changes (new campaign selected)
    useEffect(() => {
        console.log('🔄 [CampaignUsersTable] Campaign changed to:', campaignId);
        console.log(
            '🔄 [CampaignUsersTable] Custom fields for this campaign:',
            customFields.length
        );
    }, [campaignId, customFields]);

    // Debug: Log when columns change
    useEffect(() => {
        console.log('🔄 [CampaignUsersTable] Columns changed, count:', columns.length);
        console.log(
            '🔄 [CampaignUsersTable] Column accessorKeys:',
            columns.map((col) => {
                const colAny = col as any;
                return colAny.accessorKey || colAny.id || 'no-key';
            })
        );
        console.log(
            '🔄 [CampaignUsersTable] Column headers:',
            columns.map((col) => {
                const colAny = col as any;
                return typeof colAny.header === 'function' ? 'function' : colAny.header;
            })
        );
    }, [columns]);

    // Debug: Log when tableData changes
    useEffect(() => {
        if (tableData && tableData.content && tableData.content.length > 0) {
            console.log(
                '🔄 [CampaignUsersTable] Table data changed, rows:',
                tableData.content.length
            );
            const firstRow = tableData.content[0];
            if (firstRow) {
                console.log('🔄 [CampaignUsersTable] First row keys:', Object.keys(firstRow));
                console.log(
                    '🔄 [CampaignUsersTable] First row sample values:',
                    Object.entries(firstRow)
                        .slice(0, 10)
                        .map(([key, value]) => `${key}: ${value}`)
                );
            }
        }
    }, [tableData]);

    // Debug: Log when tableKey changes
    useEffect(() => {
        console.log('🔄 [CampaignUsersTable] Table key changed:', tableKey);
    }, [tableKey]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    if (isLoading || isCustomFieldsLoading) {
        return (
            <div className="flex w-full flex-col items-center gap-4 py-12">
                <DashboardLoader />
                <p className="animate-pulse text-sm text-neutral-500">Loading campaign users...</p>
            </div>
        );
    }

    if (error || customFieldsError) {
        return (
            <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-2">
                <p className="text-red-500">Error loading campaign users</p>
            </div>
        );
    }

    if (!tableData || tableData.content.length === 0) {
        return (
            <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-2">
                <EmptyInvitePage />
                <p>No users enrolled in this campaign yet!</p>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-6">
            {campaignName && (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-h3 font-semibold">{campaignName}</h2>
                        <p className="mt-1 text-sm text-neutral-600">
                            Total Users:{' '}
                            <span className="font-semibold">{tableData.total_elements}</span>
                        </p>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-neutral-200/50 bg-gradient-to-br from-white to-neutral-50/30 shadow-sm">
                <MyTable<CampaignUserTable>
                    key={tableKey} // Force re-render when columns change
                    data={tableData}
                    columns={columns}
                    isLoading={isLoading || isCustomFieldsLoading}
                    error={error || customFieldsError}
                    currentPage={page}
                    tableState={{ columnVisibility: {} }}
                />
            </div>

            {tableData.total_pages > 1 && (
                <div className="flex justify-center">
                    <MyPagination
                        currentPage={page}
                        totalPages={tableData.total_pages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};
