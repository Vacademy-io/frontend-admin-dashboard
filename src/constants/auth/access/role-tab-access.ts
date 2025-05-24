export type TeacherTabs =
    | 'dashboard'
    | 'manageInstitute'
    | 'manageLearner'
    | 'studyLibrary'
    | 'homework'
    | 'assessmentCentre'
    | 'evaluationCentre'
    | 'communityCentre'
    | 'vsmart';

type TabConfig = {
    access: boolean;
    children: Record<string, boolean>;
};

type RoleTabAccess = {
    TEACHER: Record<TeacherTabs, TabConfig>;
};

export const ROLE_TAB_ACCESS: RoleTabAccess = {
    TEACHER: {
        dashboard: {
            access: true,
            children: {},
        },
        manageInstitute: {
            access: true,
            children: {
                batches: true,
                session: false,
                teams: false,
            },
        },
        manageLearner: {
            access: true,
            children: {
                list: true,
                enroll: false,
                invite: false,
            },
        },
        studyLibrary: {
            access: true,
            children: {
                courses: true,
                live: true,
                reports: true,
                presentation: true,
            },
        },
        homework: {
            access: true,
            children: {},
        },
        assessmentCentre: {
            access: true,
            children: {
                assessmentList: true,
                papers: false,
            },
        },
        evaluationCentre: {
            access: true,
            children: {
                evaluations: true,
                tool: false,
            },
        },
        communityCentre: {
            access: true,
            children: {},
        },
        vsmart: {
            access: true,
            children: {
                aiTools: true,
                resources: true,
            },
        },
    },
};

// Helper functions for permission checking
type Role = keyof RoleTabAccess;

export const hasTabAccess = (role: Role, tab: TeacherTabs): boolean => {
    return ROLE_TAB_ACCESS[role]?.[tab]?.access === true;
};

export const hasChildTabAccess = (role: Role, tab: TeacherTabs, childTab: string): boolean => {
    return ROLE_TAB_ACCESS[role]?.[tab]?.children?.[childTab] === true;
};
