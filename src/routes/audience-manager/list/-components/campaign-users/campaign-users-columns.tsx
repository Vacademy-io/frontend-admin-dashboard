import { ColumnDef } from '@tanstack/react-table';
import { CustomFieldSetupItem } from '../../-services/get-custom-field-setup';
import { getCampaignCustomFields, CampaignFormCustomField } from '../../-utils/getCampaignCustomFields';

// Helper function to generate key from name
const generateKeyFromName = (name: string): string =>
    name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

export interface CampaignUserTable {
    id: string;
    index: number;
    submittedAt?: string;
    [key: string]: any; // Allow dynamic custom field properties
}

// S.No column (index column) - always shown
const indexColumn: ColumnDef<CampaignUserTable> = {
    accessorKey: 'index',
    header: 'S.No',
    size: 80,
    minSize: 80,
    maxSize: 80,
    enableResizing: false,
    cell: ({ row }) => (
        <div className="p-3 text-sm text-neutral-700">{row.original.index + 1}</div>
    ),
};


const getFieldFromLookup = (
    lookup: Map<string, CustomFieldSetupItem> | undefined,
    identifier?: string
) => {
    if (!lookup || !identifier) return undefined;
    return lookup.get(identifier) || lookup.get(identifier.toLowerCase());
};

/**
 * Generate dynamic columns based on custom fields from the campaign
 * This function:
 * 1. Extracts field IDs from campaign's institute_custom_fields
 * 2. Maps field IDs to field names using the custom field setup API response
 * 3. Creates table columns with field names as headers
 * 4. Uses field IDs as accessorKeys to get values from custom_field_values
 * All fields (including Name and Email) are treated dynamically from the API response
 */
export const generateDynamicColumns = (
    campaignCustomFields: any[] = [],
    fieldLookup?: Map<string, CustomFieldSetupItem>
): ColumnDef<CampaignUserTable>[] => {
    const columns: ColumnDef<CampaignUserTable>[] = [indexColumn]; // Start with S.No column

    try {
        const lookup = fieldLookup ?? new Map<string, CustomFieldSetupItem>();
        
        // Collect all field IDs from campaign/API that we need to create columns for
        const fieldMappings: Array<{ id: string; name: string; key: string }> = [];
        const processedFieldIds = new Set<string>(); // Track processed field IDs to avoid duplicates
        const fieldIdsToProcess = new Set<string>();
        
        if (campaignCustomFields && campaignCustomFields.length > 0) {
            campaignCustomFields.forEach((campaignField: any) => {
                const fieldId = 
                    campaignField.custom_field?.id || 
                    campaignField.id || 
                    campaignField._id ||
                    campaignField.field_id;
                if (fieldId) {
                    fieldIdsToProcess.add(fieldId);
                }
            });
        }

        // Process all field IDs from campaign - treat all fields dynamically (including Name and Email)
        fieldIdsToProcess.forEach((fieldId) => {
            if (!processedFieldIds.has(fieldId)) {
                const fieldInfo = 
                    getFieldFromLookup(lookup, fieldId) || getFieldFromLookup(lookup, fieldId?.toLowerCase());
                
                // Only create column if field info is found in lookup
                if (fieldInfo) {
                    const fieldName = fieldInfo.field_name 
                        ? fieldInfo.field_name.charAt(0).toUpperCase() + fieldInfo.field_name.slice(1)
                        : fieldInfo.field_key || fieldId;
                    const fieldKey = fieldInfo.field_key || generateKeyFromName(fieldInfo.field_name || fieldId);

                    fieldMappings.push({
                        id: fieldId,
                        name: fieldName,
                        key: fieldKey,
                    });
                    processedFieldIds.add(fieldId);
                }
            }
        });

        // Create columns for each field mapping (all fields are treated equally)
        fieldMappings.forEach((fieldMapping) => {
            const { id: fieldId, name: fieldName, key: fieldKey } = fieldMapping;

            // Determine cell styling based on field type
            const isNameField = fieldKey === 'full_name' || fieldKey === 'name';
            
            columns.push({
                accessorKey: fieldId, // Use field ID as accessorKey to match custom_field_values
                header: fieldName,
                size: isNameField ? 220 : 200,
                minSize: isNameField ? 180 : 150,
                maxSize: isNameField ? 300 : 250,
                cell: ({ row }) => {
                    // Get value directly from row data using field ID
                    // Value can be null if the user doesn't have data for this field
                    const value = row.original[fieldId];
                    // Display null as '-' for better UX, but the data is stored as null
                    const displayValue = value !== null && value !== undefined && value !== '' && value !== '-' && value !== 'N/A' 
                        ? String(value) 
                        : '-';
                    return (
                        <div className={`p-3 text-sm  ${isNameField ? 'font-medium text-neutral-900' : 'text-neutral-700'}`}>
                            {displayValue}
                        </div>
                    );
                },
            });
        });
        
    } catch (error) {
        console.error('❌ Error generating dynamic columns:', error);
    }

    // Add "Submitted On" column at the end
    columns.push({
        accessorKey: 'submittedAt',
        header: 'Submitted On',
        size: 250,
        minSize: 220,
        maxSize: 300,
        cell: ({ row }) => (
            <div className="p-3 text-sm text-neutral-700">{row.original.submittedAt || '-'}</div>
        ),
    });

    return columns;
};

// Default columns (fallback when no custom fields) - uses getCampaignCustomFields() for all columns
export const campaignUsersColumns: ColumnDef<CampaignUserTable>[] = (() => {
    const columns: ColumnDef<CampaignUserTable>[] = [indexColumn];
    
    try {
        const campaignCustomFields = getCampaignCustomFields();
        
        campaignCustomFields.forEach((field: CampaignFormCustomField) => {
            const fieldName = field.name;
            const fieldKey = field.key;

            if (!fieldName || !fieldKey) return;

            const isNameField = fieldKey === 'full_name';

            columns.push({
                accessorKey: fieldKey,
                header: fieldName,
                size: isNameField ? 220 : 200,
                minSize: isNameField ? 180 : 150,
                cell: ({ row }) => {
                    const value = row.original[fieldKey];
                    return (
                        <div className={`p-3 text-sm ${isNameField ? 'font-medium text-neutral-900' : 'text-neutral-700'}`}>
                            {value && value !== '-' && value !== 'N/A' ? String(value) : '-'}
                        </div>
                    );
                },
            });
        });
    } catch (error) {
        console.error('❌ Error generating default columns:', error);
    }

    // Add "Submitted On" column at the end
    columns.push({
        accessorKey: 'submittedAt',
        header: 'Submitted On',
        size: 200,
        minSize: 180,
        cell: ({ row }) => (
            <div className="p-3 text-sm text-neutral-700">{row.original.submittedAt || '-'}</div>
        ),
    });

    return columns;
})();

