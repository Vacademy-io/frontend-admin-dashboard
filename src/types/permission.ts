// Simplified permission system with just 3 levels per feature
export type PermissionLevel = 'none' | 'view' | 'edit';

export interface SimplePermission {
    module: string;
    subModule?: string;
    level: PermissionLevel;
}

// Simple feature mapping - only 27 features instead of 79 permissions
export const FEATURES = {
    // Main modules (9)
    dashboard: 'dashboard',
    manage_institute: 'manage_institute',
    manage_learners: 'manage_learners',
    learning_centre: 'learning_centre',
    homework: 'homework',
    assessment_centre: 'assessment_centre',
    evaluation_centre: 'evaluation_centre',
    community_centre: 'community_centre',
    vsmart_ai_tools: 'vsmart_ai_tools',

    // Sub-features (18)
    batches: 'batches',
    sessions: 'sessions',
    teams: 'teams',
    learner_list: 'learner_list',
    enroll_request: 'enroll_request',
    invite: 'invite',
    courses: 'courses',
    live_session: 'live_session',
    doubt_management: 'doubt_management',
    reports: 'reports',
    presentation: 'presentation',
    assessment_list: 'assessment_list',
    question_paper: 'question_paper',
    evaluation: 'evaluation',
    evaluation_tool: 'evaluation_tool',
} as const;

export type FeatureKey = keyof typeof FEATURES;
