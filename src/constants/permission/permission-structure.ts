import { FEATURES, type PermissionLevel } from '@/types/permission';

// Simple structure - just feature + permission level
export interface FeaturePermission {
    feature: string;
    level: PermissionLevel;
    parent?: string; // For sub-features
}

// All features with their hierarchy
export const FEATURE_STRUCTURE: FeaturePermission[] = [
    // Main modules
    { feature: FEATURES.dashboard, level: 'none' },
    { feature: FEATURES.manage_institute, level: 'none' },
    { feature: FEATURES.manage_learners, level: 'none' },
    { feature: FEATURES.learning_centre, level: 'none' },
    { feature: FEATURES.homework, level: 'none' },
    { feature: FEATURES.assessment_centre, level: 'none' },
    { feature: FEATURES.evaluation_centre, level: 'none' },
    { feature: FEATURES.community_centre, level: 'none' },
    { feature: FEATURES.vsmart_ai_tools, level: 'none' },

    // Manage Institute sub-features
    { feature: FEATURES.batches, level: 'none', parent: FEATURES.manage_institute },
    { feature: FEATURES.sessions, level: 'none', parent: FEATURES.manage_institute },
    { feature: FEATURES.teams, level: 'none', parent: FEATURES.manage_institute },

    // Manage Learners sub-features
    { feature: FEATURES.learner_list, level: 'none', parent: FEATURES.manage_learners },
    { feature: FEATURES.enroll_request, level: 'none', parent: FEATURES.manage_learners },
    { feature: FEATURES.invite, level: 'none', parent: FEATURES.manage_learners },

    // Learning Centre sub-features
    { feature: FEATURES.courses, level: 'none', parent: FEATURES.learning_centre },
    { feature: FEATURES.live_session, level: 'none', parent: FEATURES.learning_centre },
    { feature: FEATURES.doubt_management, level: 'none', parent: FEATURES.learning_centre },
    { feature: FEATURES.reports, level: 'none', parent: FEATURES.learning_centre },
    { feature: FEATURES.presentation, level: 'none', parent: FEATURES.learning_centre },

    // Assessment Centre sub-features
    { feature: FEATURES.assessment_list, level: 'none', parent: FEATURES.assessment_centre },
    { feature: FEATURES.question_paper, level: 'none', parent: FEATURES.assessment_centre },

    // Evaluation Centre sub-features
    { feature: FEATURES.evaluation, level: 'none', parent: FEATURES.evaluation_centre },
    { feature: FEATURES.evaluation_tool, level: 'none', parent: FEATURES.evaluation_centre },
];

// Default permissions for each role (much simpler)
export const DEFAULT_ROLE_PERMISSIONS = {
    ADMIN: {
        // Admin gets edit access to everything
        dashboard: 'edit' as PermissionLevel,
        manage_institute: 'edit' as PermissionLevel,
        batches: 'edit' as PermissionLevel,
        sessions: 'edit' as PermissionLevel,
        teams: 'edit' as PermissionLevel,
        manage_learners: 'edit' as PermissionLevel,
        learner_list: 'edit' as PermissionLevel,
        enroll_request: 'edit' as PermissionLevel,
        invite: 'edit' as PermissionLevel,
        learning_centre: 'edit' as PermissionLevel,
        courses: 'edit' as PermissionLevel,
        live_session: 'edit' as PermissionLevel,
        doubt_management: 'edit' as PermissionLevel,
        reports: 'edit' as PermissionLevel,
        presentation: 'edit' as PermissionLevel,
        homework: 'edit' as PermissionLevel,
        assessment_centre: 'edit' as PermissionLevel,
        assessment_list: 'edit' as PermissionLevel,
        question_paper: 'edit' as PermissionLevel,
        evaluation_centre: 'edit' as PermissionLevel,
        evaluation: 'edit' as PermissionLevel,
        evaluation_tool: 'edit' as PermissionLevel,
        community_centre: 'edit' as PermissionLevel,
        vsmart_ai_tools: 'edit' as PermissionLevel,
    },

    TEACHER: {
        dashboard: 'view' as PermissionLevel,
        manage_institute: 'view' as PermissionLevel,
        batches: 'view' as PermissionLevel,
        sessions: 'view' as PermissionLevel,
        teams: 'view' as PermissionLevel,
        manage_learners: 'view' as PermissionLevel,
        learner_list: 'view' as PermissionLevel,
        enroll_request: 'view' as PermissionLevel,
        invite: 'none' as PermissionLevel,
        learning_centre: 'edit' as PermissionLevel,
        courses: 'view' as PermissionLevel, // Can be upgraded by admin
        live_session: 'edit' as PermissionLevel,
        doubt_management: 'edit' as PermissionLevel,
        reports: 'view' as PermissionLevel,
        presentation: 'edit' as PermissionLevel,
        homework: 'edit' as PermissionLevel,
        assessment_centre: 'view' as PermissionLevel,
        assessment_list: 'view' as PermissionLevel,
        question_paper: 'view' as PermissionLevel,
        evaluation_centre: 'none' as PermissionLevel,
        evaluation: 'none' as PermissionLevel,
        evaluation_tool: 'none' as PermissionLevel,
        community_centre: 'edit' as PermissionLevel,
        vsmart_ai_tools: 'view' as PermissionLevel,
    },

    COURSE_CREATOR: {
        dashboard: 'view' as PermissionLevel,
        manage_institute: 'none' as PermissionLevel,
        batches: 'none' as PermissionLevel,
        sessions: 'none' as PermissionLevel,
        teams: 'none' as PermissionLevel,
        manage_learners: 'none' as PermissionLevel,
        learner_list: 'none' as PermissionLevel,
        enroll_request: 'none' as PermissionLevel,
        invite: 'none' as PermissionLevel,
        learning_centre: 'edit' as PermissionLevel,
        courses: 'edit' as PermissionLevel,
        live_session: 'none' as PermissionLevel,
        doubt_management: 'none' as PermissionLevel,
        reports: 'view' as PermissionLevel,
        presentation: 'edit' as PermissionLevel,
        homework: 'none' as PermissionLevel,
        assessment_centre: 'none' as PermissionLevel,
        assessment_list: 'none' as PermissionLevel,
        question_paper: 'none' as PermissionLevel,
        evaluation_centre: 'none' as PermissionLevel,
        evaluation: 'none' as PermissionLevel,
        evaluation_tool: 'none' as PermissionLevel,
        community_centre: 'edit' as PermissionLevel,
        vsmart_ai_tools: 'view' as PermissionLevel,
    },

    ASSESSMENT_CREATOR: {
        dashboard: 'view' as PermissionLevel,
        manage_institute: 'none' as PermissionLevel,
        batches: 'none' as PermissionLevel,
        sessions: 'none' as PermissionLevel,
        teams: 'none' as PermissionLevel,
        manage_learners: 'none' as PermissionLevel,
        learner_list: 'none' as PermissionLevel,
        enroll_request: 'none' as PermissionLevel,
        invite: 'none' as PermissionLevel,
        learning_centre: 'none' as PermissionLevel,
        courses: 'none' as PermissionLevel,
        live_session: 'none' as PermissionLevel,
        doubt_management: 'none' as PermissionLevel,
        reports: 'view' as PermissionLevel,
        presentation: 'none' as PermissionLevel,
        homework: 'none' as PermissionLevel,
        assessment_centre: 'edit' as PermissionLevel,
        assessment_list: 'edit' as PermissionLevel,
        question_paper: 'edit' as PermissionLevel,
        evaluation_centre: 'none' as PermissionLevel,
        evaluation: 'none' as PermissionLevel,
        evaluation_tool: 'none' as PermissionLevel,
        community_centre: 'edit' as PermissionLevel,
        vsmart_ai_tools: 'view' as PermissionLevel,
    },

    EVALUATOR: {
        dashboard: 'view' as PermissionLevel,
        manage_institute: 'none' as PermissionLevel,
        batches: 'none' as PermissionLevel,
        sessions: 'none' as PermissionLevel,
        teams: 'none' as PermissionLevel,
        manage_learners: 'none' as PermissionLevel,
        learner_list: 'none' as PermissionLevel,
        enroll_request: 'none' as PermissionLevel,
        invite: 'none' as PermissionLevel,
        learning_centre: 'none' as PermissionLevel,
        courses: 'none' as PermissionLevel,
        live_session: 'none' as PermissionLevel,
        doubt_management: 'none' as PermissionLevel,
        reports: 'view' as PermissionLevel,
        presentation: 'none' as PermissionLevel,
        homework: 'none' as PermissionLevel,
        assessment_centre: 'view' as PermissionLevel,
        assessment_list: 'view' as PermissionLevel,
        question_paper: 'none' as PermissionLevel,
        evaluation_centre: 'edit' as PermissionLevel,
        evaluation: 'edit' as PermissionLevel,
        evaluation_tool: 'edit' as PermissionLevel,
        community_centre: 'view' as PermissionLevel,
        vsmart_ai_tools: 'none' as PermissionLevel,
    },
};
