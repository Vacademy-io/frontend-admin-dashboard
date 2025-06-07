import { FEATURE_PERMISSION_MAP } from '@/constants/permission/permission-mapping';
import { getUserPermissions } from '@/hooks/useUserPermissions';
import { FeatureConfig } from '@/routes/dashboard/-components/PermissionDialog';
import type { PermissionLevel, PermissionUpdatePayload } from '@/types/permission';

// Convert UI permission levels to permission IDs
export function getPermissionIdsForFeature(feature: string, level: PermissionLevel): string[] {
    if (level === 'none') return [];

    const featureMap = FEATURE_PERMISSION_MAP[feature as keyof typeof FEATURE_PERMISSION_MAP];
    if (!featureMap) return [];

    // The type assertion here is a good practice as well for consistency
    const permissions = featureMap[level] as readonly string[] | undefined;
    return permissions ? Array.from(permissions) : [];
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
        // **FIX APPLIED HERE:** Assert the type to readonly string[] before calling .every()
        const editPermissions = levels.edit as readonly string[];
        const viewPermissions = levels.view as readonly string[];

        if (editPermissions.every((id) => permissionIds.includes(id))) {
            featurePermissions[feature] = 'edit';
        } else if (viewPermissions.every((id) => permissionIds.includes(id))) {
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
        return true; // If no permissions are set, assume access is allowed
    }

    return userPermissions.includes(requiredPermission);
};

export const getPermissionLevelFromIds = (
    featureId: keyof typeof FEATURE_PERMISSION_MAP,
    userPermissionIds: string[]
): PermissionLevel => {
    const mapping = FEATURE_PERMISSION_MAP[featureId];
    if (!mapping) {
        return 'none';
    }

    // **FIX APPLIED HERE:** Assert the type to readonly string[] before calling .every()
    const editPermissions = mapping.edit as readonly string[];
    const viewPermissions = mapping.view as readonly string[];

    const hasEdit = editPermissions.every((id) => userPermissionIds.includes(id));
    if (hasEdit) {
        return 'edit';
    }

    const hasView = viewPermissions.every((id) => userPermissionIds.includes(id));
    if (hasView) {
        return 'view';
    }

    return 'none';
};

export const mapPermissionsToFeatures = (
    defaultFeatures: FeatureConfig[],
    userPermissionIds: string[]
): FeatureConfig[] => {
    return defaultFeatures.map((feature) => {
        const featureKey = feature.id as keyof typeof FEATURE_PERMISSION_MAP;
        const mainPermissionLevel = getPermissionLevelFromIds(featureKey, userPermissionIds);

        const updatedSubFeatures = feature.subFeatures?.map((subFeature) => ({
            ...subFeature,
            permission: getPermissionLevelFromIds(
                subFeature.id as keyof typeof FEATURE_PERMISSION_MAP,
                userPermissionIds
            ),
        }));

        return {
            ...feature,
            visible: mainPermissionLevel !== 'none',
            subFeatures: updatedSubFeatures,
        };
    });
};
