import { getFieldsForLocation } from '@/lib/custom-fields/utils';

// Map custom field IDs to their corresponding table column IDs
export const CUSTOM_FIELD_TO_COLUMN_MAP: Record<string, string> = {
    // Core identity fields
    name: 'full_name',
    email: 'email',
    username: 'username',
    password: 'password',
    phone: 'mobile_number',
    batch: 'package_session_id',

    // Demographic fields
    gender: 'gender',
    enrollment_number: 'institute_enrollment_id',
    college_school: 'linked_institute_name',
    city: 'city',
    state: 'region',
    country: 'country',
    attendance: 'attendance',

    // Family information
    father_name: 'father_name',
    mother_name: 'mother_name',
    father_mobile: 'parents_mobile_number',
    father_email: 'parents_email',
    mother_mobile: 'parents_to_mother_mobile_number',
    mother_email: 'parents_to_mother_email',

    // Financial fields
    plan_type: 'plan_type',
    amount_paid: 'amount_paid',
    preferred_batch: 'preffered_batch',
    payment_status: 'payment_status',

    // Status fields
    status: 'status',
    expiry_date: 'expiry_date',
};

// Reverse mapping for easier lookups
export const COLUMN_TO_CUSTOM_FIELD_MAP: Record<string, string> = Object.fromEntries(
    Object.entries(CUSTOM_FIELD_TO_COLUMN_MAP).map(([key, value]) => [value, key])
);

// Default visibility fallback if no custom fields found
export const DEFAULT_COLUMN_VISIBILITY: Record<string, boolean> = {
    // Always visible core columns
    checkbox: true,
    details: true,

    // Common visible columns by default
    full_name: true,
    username: true,
    package_session_id: true, // batch
    institute_enrollment_id: true,
    gender: true,
    mobile_number: true,
    email: true,
    expiry_date: true,
    status: true,

    // Hidden by default (these can be shown via custom field settings)
    linked_institute_name: true,
    father_name: true,
    mother_name: true,
    parents_mobile_number: true,
    parents_email: true,
    parents_to_mother_mobile_number: true,
    parents_to_mother_email: true,
    city: true,
    region: true,
    country: true,
    attendance: true,
    plan_type: true,
    amount_paid: true,
    preffered_batch: true,
    payment_status: true,
};

/**
 * Simple function to get column visibility based on custom fields
 * @returns Record of column IDs to visibility boolean
 */
export const getColumnVisibilityForLearnersList = (): Record<string, boolean> => {
    try {
        // Get custom fields for Learner's List
        const customFields = getFieldsForLocation("Learner's List");
        console.log('fields :', customFields);
        // If no custom fields found, return default visibility (all true)
        if (!customFields || customFields.length === 0) {
            console.log('No custom fields found, showing default columns');
            return {
                checkbox: true,
                details: true,
                full_name: true,
                username: true,
                email: true,
                mobile_number: true,
                package_session_id: true,
                institute_enrollment_id: true,
                gender: true,
                status: true,
                expiry_date: true,
                // Hide optional columns by default
                linked_institute_name: false,
                father_name: false,
                mother_name: false,
                parents_mobile_number: false,
                parents_email: false,
                parents_to_mother_mobile_number: false,
                parents_to_mother_email: false,
                city: false,
                region: false,
                country: false,
                attendance: false,
                plan_type: false,
                amount_paid: false,
                preffered_batch: false,
                payment_status: false,
            };
        }

        // Build visibility object based on custom fields
        const visibility: Record<string, boolean> = {
            // Always show these
            checkbox: true,
            details: true,
        };
        // Check each custom field and map to column
        customFields.forEach((field) => {
            console.log('Processing field:', field.id, '(', field.name, ')');
            const columnId = CUSTOM_FIELD_TO_COLUMN_MAP[field.id];
            console.log('Mapped to column ID:', columnId);

            if (columnId) {
                visibility[columnId] = true;
                console.log(`✅ Made column "${columnId}" visible for field "${field.name}"`);
            } else {
                console.warn(`❌ No mapping found for field.id: "${field.id}" (${field.name})`);
                console.log('Available mappings:', Object.keys(CUSTOM_FIELD_TO_COLUMN_MAP));
            }
        });

        console.log('Final visibility:', visibility);
        return visibility;
    } catch (error) {
        console.error('Error in getColumnVisibilityForLearnersList:', error);
        // Return default visibility with most common columns visible
        return {
            checkbox: true,
            details: true,
            full_name: true,
            username: true,
            email: true,
            mobile_number: true,
            package_session_id: true,
            institute_enrollment_id: true,
            gender: true,
            status: true,
            expiry_date: true,
        };
    }
};

/**
 * Get the list of visible column IDs for Learner's List
 * @returns Array of column IDs that should be visible
 */
export const getVisibleColumnsForLearnersList = (): string[] => {
    const visibility = getColumnVisibilityForLearnersList();
    return Object.entries(visibility)
        .filter(([, isVisible]) => isVisible)
        .map(([columnId]) => columnId);
};

/**
 * Check if a specific column should be visible for Learner's List
 * @param columnId - The column ID to check
 * @returns boolean indicating if the column should be visible
 */
export const isColumnVisibleForLearnersList = (columnId: string): boolean => {
    const visibility = getColumnVisibilityForLearnersList();
    return visibility[columnId] ?? false;
};

/**
 * Get custom field configuration summary for debugging
 */
export const getCustomFieldConfigSummary = () => {
    const customFields = getFieldsForLocation("Learner's List");
    const visibility = getColumnVisibilityForLearnersList();
    const visibleColumns = getVisibleColumnsForLearnersList();

    return {
        customFieldsCount: customFields.length,
        customFields: customFields.map((f) => ({ id: f.id, name: f.name, required: f.required })),
        visibleColumnsCount: visibleColumns.length,
        visibleColumns,
        columnVisibility: visibility,
        fieldToColumnMapping: CUSTOM_FIELD_TO_COLUMN_MAP,
    };
};

/**
 * Debug function - call this from browser console to see what's happening
 * Usage: window.debugCustomFields()
 */
export const debugCustomFields = () => {
    console.log('🐛 === DEBUG CUSTOM FIELDS ===');

    const summary = getCustomFieldConfigSummary();
    console.log('📊 Summary:', summary);

    console.log('\n🗂️ === ALL AVAILABLE MAPPINGS ===');
    Object.entries(CUSTOM_FIELD_TO_COLUMN_MAP).forEach(([fieldId, columnId]) => {
        console.log(`${fieldId} → ${columnId}`);
    });

    console.log('\n🎯 === TESTING VISIBILITY FUNCTION ===');
    const visibility = getColumnVisibilityForLearnersList();
    console.log('Visibility result:', visibility);

    console.log('\n📋 === TABLE VISIBILITY BREAKDOWN ===');
    const visibleCount = Object.values(visibility).filter(Boolean).length;
    const hiddenCount = Object.values(visibility).filter((v) => !v).length;
    console.log(`Visible columns: ${visibleCount}`);
    console.log(`Hidden columns: ${hiddenCount}`);

    return summary;
};

// Make debug function available globally for console testing
if (typeof window !== 'undefined') {
    (window as { debugCustomFields?: () => void }).debugCustomFields = debugCustomFields;
}
