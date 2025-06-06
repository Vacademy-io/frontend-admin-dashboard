import { FEATURE_PERMISSION_MAP } from '@/constants/permission/permission-mapping';
import { getUserPermissions } from '@/hooks/useUserPermissions';
import type { PermissionLevel, PermissionUpdatePayload } from '@/types/permission';

// Convert UI permission levels to permission IDs
export function getPermissionIdsForFeature(feature: string, level: PermissionLevel): string[] {
    if (level === 'none') return [];

    const featureMap = FEATURE_PERMISSION_MAP[feature as keyof typeof FEATURE_PERMISSION_MAP];
    if (!featureMap) return [];

    return featureMap[level] ? Array.from(featureMap[level]) : [];
}

// Create the exact payload format your backend expects
export function createPermissionUpdatePayload(
    userId: string,
    instituteId: string,
    currentPermissions: string[],
    newPermissions: string[]
): PermissionUpdatePayload {
    const addedPermissions = newPermissions.filter((p) => !currentPermissions.includes(p));
    const removedPermissions = currentPermissions.filter((p) => !newPermissions.includes(p));

    return {
        user_id: userId,
        institute_id: instituteId,
        added_permission_ids: addedPermissions,
        removed_permission_ids: removedPermissions,
    };
}

// Convert feature permissions to flat permission ID array
export function convertFeaturePermissionsToIds(
    featurePermissions: Record<string, PermissionLevel>
): string[] {
    const permissionIds: string[] = [];

    Object.entries(featurePermissions).forEach(([feature, level]) => {
        const ids = getPermissionIdsForFeature(feature, level);
        permissionIds.push(...ids);
    });

    // Remove duplicates
    return [...new Set(permissionIds)];
}

// Convert permission IDs back to feature permissions for UI
export function convertPermissionIdsToFeatures(
    permissionIds: string[]
): Record<string, PermissionLevel> {
    const featurePermissions: Record<string, PermissionLevel> = {};

    Object.entries(FEATURE_PERMISSION_MAP).forEach(([feature, levels]) => {
        if (levels.edit.every((id) => permissionIds.includes(id))) {
            featurePermissions[feature] = 'edit';
        } else if (levels.view.every((id) => permissionIds.includes(id))) {
            featurePermissions[feature] = 'view';
        } else {
            featurePermissions[feature] = 'none';
        }
    });

    return featurePermissions;
}

export const hasPermission = (requiredPermission: string): boolean => {
    const userPermissions = getUserPermissions();

    if (userPermissions.length === 0) {
        return false;
    }

    return userPermissions.includes(requiredPermission);
};
