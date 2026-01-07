import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { FilterConfig } from '@/routes/manage-students/students-list/-types/students-list-types';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { InstituteDetailsType } from '@/schemas/student/student-list/institute-schema';
import { removeDefaultPrefix } from '@/utils/helpers/removeDefaultPrefix';

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
                console.error(`Error parsing custom field config for ${customField.fieldName}:`, error);
            }
        });
    }

    return filterData;
};
