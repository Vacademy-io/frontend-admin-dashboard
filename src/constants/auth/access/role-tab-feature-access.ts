type Role = 'TEACHER';
type TabId = 'dashboard';
export type FeatureId =
    | 'instituteProfile'
    | 'manageUsers'
    | 'aiFeatures'
    | 'enrollStudents'
    | 'learning'
    | 'assessment';

type RoleFeatureAccess = {
    [role in Role]: {
        [tab in TabId]: {
            [feature in FeatureId]: boolean;
        };
    };
};

export const ROLE_FEATURE_ACCESS: RoleFeatureAccess = {
    TEACHER: {
        dashboard: {
            instituteProfile: false,
            manageUsers: false,
            aiFeatures: true,
            enrollStudents: false,
            learning: true,
            assessment: true,
        },
    },
};

export const hasFeatureAccess = (role: Role, tabId: TabId, featureId: FeatureId): boolean => {
    return ROLE_FEATURE_ACCESS[role]?.[tabId]?.[featureId] === true;
};
