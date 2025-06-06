import { PERMISSION_IDS } from '@/types/permission';

// Helper function to map UI permission levels to permission IDs
export function mapPermissionLevelToIds(
    module: string,
    subModule: string | null,
    level: 'none' | 'view' | 'edit'
): string[] {
    if (level === 'none') return [];

    const baseKey = subModule ? `${module}_${subModule}` : module;
    const permissionIds: string[] = [];

    // Always include view permission if not 'none'
    if (level === 'view' || level === 'edit') {
        // Add module view permission
        const moduleViewKey = `${module.toUpperCase()}_VIEW` as keyof typeof PERMISSION_IDS;
        if (PERMISSION_IDS[moduleViewKey]) {
            permissionIds.push(PERMISSION_IDS[moduleViewKey]);
        }

        // Add sub-module view permission
        if (subModule) {
            const subModuleViewKey = `${baseKey.toUpperCase()}_VIEW` as keyof typeof PERMISSION_IDS;
            if (PERMISSION_IDS[subModuleViewKey]) {
                permissionIds.push(PERMISSION_IDS[subModuleViewKey]);
            }
        }
    }

    // Add edit permissions if level is 'edit'
    if (level === 'edit') {
        const editActions = ['EDIT', 'CREATE', 'DELETE', 'MANAGE'];
        editActions.forEach((action) => {
            const permissionKey =
                `${baseKey.toUpperCase()}_${action}` as keyof typeof PERMISSION_IDS;
            if (PERMISSION_IDS[permissionKey]) {
                permissionIds.push(PERMISSION_IDS[permissionKey]);
            }
        });
    }

    return permissionIds;
}

// Helper function to create permission update payload
export function createPermissionUpdatePayload(
    userId: string,
    instituteId: string,
    currentPermissions: string[],
    newPermissions: string[]
) {
    const addedPermissions = newPermissions.filter((p) => !currentPermissions.includes(p));
    const removedPermissions = currentPermissions.filter((p) => !newPermissions.includes(p));

    return {
        user_id: userId,
        institute_id: instituteId,
        added_permission_ids: addedPermissions,
        removed_permission_ids: removedPermissions,
    };
}
