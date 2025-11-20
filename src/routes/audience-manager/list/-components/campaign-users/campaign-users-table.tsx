import { useMemo, useState, useEffect } from 'react';
import { MyTable } from '@/components/design-system/table';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { EmptyInvitePage } from '@/assets/svgs';
import { MyPagination } from '@/components/design-system/pagination';
import { useCampaignUsers } from '../../-hooks/useCampaignUsers';
import { campaignUsersColumns, CampaignUserTable, generateDynamicColumns } from './campaign-users-columns';
import { getDateFromUTCString } from '@/constants/helper';
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

export const CampaignUsersTable = ({ campaignId, campaignName, customFieldsJson }: CampaignUsersTableProps) => {
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
            console.log('🔄 [CampaignUsersTable] Parsed custom fields from campaign:', fields.length, 'fields');
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
                map.set(key, field);
                map.set(key.toLowerCase(), field);
            };

            registerKey(field.custom_field_id);
            registerKey(field.field_key);
        });

        console.log('📋 [CampaignUsersTable] Loaded custom field setup from API, count:', customFieldSetup.length);
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

    const columns = useMemo(() => {
        console.log('🔄 [CampaignUsersTable] Regenerating columns for campaign:', campaignId);
        console.log('🔄 [CampaignUsersTable] customFields count:', customFields.length);
        console.log('🔄 [CampaignUsersTable] usersResponse available:', !!usersResponse);
        
        // Collect all unique field IDs from:
        // 1. Campaign customFields (from campaign's institute_custom_fields)
        // 2. API response custom_field_values (from all users - these are the actual field IDs used)
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
                    console.log('📋 [CampaignUsersTable] Added field ID from campaign:', fieldId);
                }
            });
        }

        // Add field IDs from API response custom_field_values
        // THIS IS CRITICAL: These are the actual field IDs that have data
        if (usersResponse && usersResponse.content) {
            usersResponse.content.forEach((lead: any) => {
                const customValues = lead.custom_field_values || {};
                Object.keys(customValues).forEach((fieldId) => {
                    if (fieldId !== 'name' && fieldId !== 'email' && fieldId !== 'full_name') {
                        allFieldIds.add(fieldId);
                        console.log('📋 [CampaignUsersTable] Added field ID from API response:', fieldId);
                    }
                });
            });
        }

        const collectedFieldIds = Array.from(allFieldIds);
        console.log('📊 [CampaignUsersTable] Total collected field IDs:', collectedFieldIds.length);
        console.log('📊 [CampaignUsersTable] Collected field IDs:', collectedFieldIds);

        // Convert to array and create field objects for column generation
        const allCustomFieldsArray = collectedFieldIds.map(fieldId => ({
            id: fieldId,
            _id: fieldId,
            field_id: fieldId,
        }));

        if (allCustomFieldsArray.length === 0 && customFields.length === 0) {
            console.log('📊 [CampaignUsersTable] No custom fields, using default columns');
            return campaignUsersColumns;
        }

        console.log('📊 [CampaignUsersTable] Field IDs to use for columns:', allCustomFieldsArray.map(f => f.id));

        // Use all collected field IDs to generate columns
        // This maps each field ID to its name using the custom-field setup API response
        const fieldIdsToUse = allCustomFieldsArray.length > 0 ? allCustomFieldsArray : customFields;
        const generatedColumns = generateDynamicColumns(fieldIdsToUse, customFieldMap);
        console.log('📊 [CampaignUsersTable] Generated dynamic columns:', generatedColumns.length, 'columns');
        console.log('📊 [CampaignUsersTable] Column headers:', generatedColumns.map(col => {
            const colAny = col as any;
            return {
                accessorKey: colAny.accessorKey || colAny.id || 'no-key',
                header: typeof colAny.header === 'function' ? 'function' : colAny.header
            };
        }));
        return generatedColumns;
    }, [campaignId, customFields, usersResponse, customFieldSetup]); // Include custom field setup dependency

    // Create a unique key for the table to force re-render when columns change
    // This key must include field IDs from both campaign and API response
    const tableKey = useMemo(() => {
        const fieldIds: string[] = [];
        
        // Add field IDs from campaign
        if (customFields.length > 0) {
            customFields.forEach((f: any) => {
                const id = f.custom_field?.id || f.id || f._id || f.field_id;
                if (id) fieldIds.push(id);
            });
        }
        
        // Add field IDs from API response
        if (usersResponse && usersResponse.content) {
            usersResponse.content.forEach((lead: any) => {
                const customValues = lead.custom_field_values || {};
                Object.keys(customValues).forEach((fieldId) => {
                    if (fieldId !== 'name' && fieldId !== 'email' && fieldId !== 'full_name' && !fieldIds.includes(fieldId)) {
                        fieldIds.push(fieldId);
                    }
                });
            });
        }
        
        const fieldIdsKey = fieldIds.length > 0 ? fieldIds.sort().join('-') : 'default';
        return `campaign-users-table-${campaignId}-${fieldIdsKey}`;
    }, [campaignId, customFields, usersResponse]);

    // Map API response data to table rows
    // This will regenerate whenever usersResponse or customFields change
    const tableData = useMemo(() => {
        if (!usersResponse || !usersResponse.content || usersResponse.content.length === 0) {
            return undefined;
        }

        console.log('🔄 [CampaignUsersTable] Mapping', usersResponse.content.length, 'users to table data');
        console.log('🔄 [CampaignUsersTable] Custom fields count:', customFields.length);
        console.log('🔄 [CampaignUsersTable] First user custom_field_values keys:', 
            usersResponse.content[0]?.custom_field_values ? Object.keys(usersResponse.content[0].custom_field_values) : 'none');

        return {
            content: usersResponse.content.map((lead, index) => {
                const user = lead.user || {};
                const customValues = lead.custom_field_values || {};
                const submittedAt = lead.submitted_at_local
                    ? getDateFromUTCString(lead.submitted_at_local)
                    : '-';

                // Build dynamic row data - start with base fields
                const rowData: any = {
                    id: lead.response_id || lead.user_id || `${index}`,
                    submittedAt,
                    index: page * pageSize + index,
                };

                // 1. ALWAYS ADD MANDATORY FIELDS: Name and Email
                // Name - try multiple sources
                rowData.name = user.full_name || (user as any).name || customValues.name || customValues.full_name || '-';
                
                // Email - try multiple sources
                rowData.email = user.email || customValues.email || '-';

                // 2. Map ALL custom field values from API response
                // The API response has custom_field_values with field IDs as keys
                // We need to map ALL field IDs from custom_field_values, not just from campaign customFields
                const allFieldIdsFromAPI = Object.keys(customValues);
                
                console.log('🔄 [CampaignUsersTable] Field IDs from API custom_field_values:', allFieldIdsFromAPI);

                // Process all field IDs from the API response
                // CRITICAL: Map each field ID to its value and add to rowData
                allFieldIdsFromAPI.forEach((fieldId) => {
                    // Skip if it's name or email (already added)
                    if (fieldId === 'name' || fieldId === 'email' || fieldId === 'full_name') {
                        return;
                    }

                    // Get field info from API setup map
                    let fieldInfo =
                        customFieldMap.get(fieldId) ||
                        customFieldMap.get(fieldId.toLowerCase()) ||
                        customFieldMap.get(fieldId.toUpperCase());

                    // Get value from custom_field_values (primary source)
                    // This is the actual value from the API response
                    let value: any = customValues[fieldId];

                    // If value is empty, try user object
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
                                }
                            }
                        }
                    }

                    // Skip Name and Email fields (already added as mandatory)
                    if (fieldInfo) {
                        const fieldKey =
                            fieldInfo.field_key ||
                            generateKeyFromName(fieldInfo.field_name || fieldId);
                        if (fieldKey === 'name' || fieldKey === 'email' || fieldKey === 'full_name') {
                            return; // Skip, already added
                        }
                    }

                    // ALWAYS store value using field ID as key (matches column accessorKey)
                    // This ensures the column can find the value even if fieldInfo is not found
                    rowData[fieldId] = value !== undefined && value !== null && value !== '' ? value : '-';
                    
                    // Debug first row
                    if (index === 0) {
                        console.log(
                            '📝 [CampaignUsersTable] Mapped field:',
                            fieldId,
                            '->',
                            value,
                            '(found in API setup:',
                            !!fieldInfo,
                            ')'
                        );
                    }
                });

                // 3. Also process custom fields from campaign (in case they're not in API response yet)
                // This ensures we have columns for all campaign fields, even if no data yet
                if (customFields && customFields.length > 0) {
                    customFields.forEach((campaignField: any) => {
                        // Extract field ID from campaign field structure
                        const fieldId = 
                            campaignField.custom_field?.id || 
                            campaignField.id || 
                            campaignField._id ||
                            campaignField.field_id;

                        if (!fieldId) return;

                        // Skip if already processed from API response
                        if (rowData.hasOwnProperty(fieldId)) {
                            return;
                        }

                        // Skip Name and Email (already added as mandatory)
                        const fieldInfo =
                            customFieldMap.get(fieldId) ||
                            customFieldMap.get(fieldId.toLowerCase()) ||
                            customFieldMap.get(fieldId.toUpperCase());
                        if (fieldInfo) {
                            const fieldKey =
                                fieldInfo.field_key ||
                                generateKeyFromName(fieldInfo.field_name || fieldId);
                            if (fieldKey === 'name' || fieldKey === 'email' || fieldKey === 'full_name') {
                                return; // Skip, already added
                            }
                        }

                        // Try to get value from custom_field_values
                        let value: any = customValues[fieldId];

                        // If not found, try user object
                        if (value === undefined || value === null || value === '') {
                            if (fieldInfo && fieldInfo.field_key) {
                                const fieldKey = fieldInfo.field_key;
                                value = (user as any)[fieldKey];
                            }
                        }

                        // Store value using field ID as key (matches column accessorKey)
                        rowData[fieldId] = value !== undefined && value !== null && value !== '' ? value : '-';
                    });
                }

                // Debug: log first row data keys
                if (index === 0) {
                    console.log('🔄 [CampaignUsersTable] First row data keys:', Object.keys(rowData));
                }

                return rowData as CampaignUserTable;
            }),
            total_pages: usersResponse.totalPages,
            page_no: usersResponse.number,
            page_size: usersResponse.size,
            total_elements: usersResponse.totalElements,
            last: usersResponse.last,
        };
    }, [usersResponse, customFields, customFieldSetup, page, pageSize, customFieldMap]);

    // Debug: Log when campaignId changes (new campaign selected)
    useEffect(() => {
        console.log('🔄 [CampaignUsersTable] Campaign changed to:', campaignId);
        console.log('🔄 [CampaignUsersTable] Custom fields for this campaign:', customFields.length);
    }, [campaignId, customFields]);

    // Debug: Log when columns change
    useEffect(() => {
        console.log('🔄 [CampaignUsersTable] Columns changed, count:', columns.length);
        console.log('🔄 [CampaignUsersTable] Column accessorKeys:', columns.map(col => {
            const colAny = col as any;
            return colAny.accessorKey || colAny.id || 'no-key';
        }));
        console.log('🔄 [CampaignUsersTable] Column headers:', columns.map(col => {
            const colAny = col as any;
            return typeof colAny.header === 'function' ? 'function' : colAny.header;
        }));
    }, [columns]);

    // Debug: Log when tableData changes
    useEffect(() => {
        if (tableData && tableData.content && tableData.content.length > 0) {
            console.log('🔄 [CampaignUsersTable] Table data changed, rows:', tableData.content.length);
            const firstRow = tableData.content[0];
            if (firstRow) {
                console.log('🔄 [CampaignUsersTable] First row keys:', Object.keys(firstRow));
                console.log('🔄 [CampaignUsersTable] First row sample values:', 
                    Object.entries(firstRow).slice(0, 10).map(([key, value]) => `${key}: ${value}`));
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
                        <p className="text-sm text-neutral-600 mt-1">
                            Total Users: <span className="font-semibold">{tableData.total_elements}</span>
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

