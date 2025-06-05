import type { PermissionLevel } from '@/types/permission';

// Simple API payload - just feature:level pairs
export interface SimplePermissionPayload {
    user_id: string;
    institute_id: string;
    permissions: Record<string, PermissionLevel>;
}

// Convert UI permissions to API payload
export function createSimplePermissionPayload(
    userId: string,
    instituteId: string,
    permissions: Record<string, PermissionLevel>
): SimplePermissionPayload {
    return {
        user_id: userId,
        institute_id: instituteId,
        permissions: permissions,
    };
}

// Check if user has permission for a feature
export function hasPermission(
    userPermissions: Record<string, PermissionLevel>,
    feature: string,
    requiredLevel: PermissionLevel
): boolean {
    const userLevel = userPermissions[feature] || 'none';

    if (requiredLevel === 'none') return true;
    if (requiredLevel === 'view') return userLevel === 'view' || userLevel === 'edit';
    if (requiredLevel === 'edit') return userLevel === 'edit';

    return false;
}

// Get permission level hierarchy
export function getPermissionHierarchy(): Record<PermissionLevel, number> {
    return {
        none: 0,
        view: 1,
        edit: 2,
    };
}
