import { DropdownItem } from '@/components/design-system/utils/types/dropdown-types';
import { PERMISSION_IDS } from '@/types/permission';
import { hasPermission } from '@/utils/permission/permission';

export const getDropdownList = (): DropdownItem[] => {
    if (!hasPermission(PERMISSION_IDS.COURSES_EDIT)) {
        return [
            {
                label: 'View Chapter',
                value: 'view',
            },
        ];
    }
    return [
        {
            label: 'View Chapter',
            value: 'view',
        },
        {
            label: 'Edit Chapter Details',
            value: 'edit',
        },
        {
            label: 'Copy to',
            value: 'copy',
        },
        {
            label: 'Move to',
            value: 'move',
        },
        {
            label: 'Delete',
            value: 'delete',
        },
    ];
};
