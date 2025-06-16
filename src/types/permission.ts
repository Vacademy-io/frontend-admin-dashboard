// Simple permission IDs - just strings for each feature and level
export const PERMISSION_IDS = {
    DASHBOARD_VIEW: 'DASH0',
    DASHBOARD_EDIT: 'DASH1',
    MANAGE_INSTITUTE_VIEW: 'MINS0',
    MANAGE_INSTITUTE_EDIT: 'MINS1',
    BATCHES_VIEW: 'BATS0',
    BATCHES_EDIT: 'BATS1',
    SESSIONS_VIEW: 'SESS0',
    SESSIONS_EDIT: 'SESS1',
    TEAMS_VIEW: 'TEAM0',
    TEAMS_EDIT: 'TEAM1',
    MANAGE_LEARNERS_VIEW: 'MLNS0',
    MANAGE_LEARNERS_EDIT: 'MLNS1',
    LEARNER_LIST_VIEW: 'LLST0',
    LEARNER_LIST_EDIT: 'LLST1',
    ENROLL_REQUEST_VIEW: 'ENRQ0',
    ENROLL_REQUEST_EDIT: 'ENRQ1',
    INVITE_VIEW: 'INVT0',
    INVITE_EDIT: 'INVT1',
    LEARNING_CENTRE_VIEW: 'LCTR0',
    LEARNING_CENTRE_EDIT: 'LCTR1',
    COURSES_VIEW: 'CRS0',
    COURSES_EDIT: 'CRS1',
    LIVE_SESSION_VIEW: 'LIVE0',
    LIVE_SESSION_EDIT: 'LIVE1',
    DOUBT_MANAGEMENT_VIEW: 'DOUB0',
    DOUBT_MANAGEMENT_EDIT: 'DOUB1',
    REPORTS_VIEW: 'RPTS0',
    REPORTS_EDIT: 'RPTS1',
    PRESENTATION_VIEW: 'PRES0',
    PRESENTATION_EDIT: 'PRES1',
    HOMEWORK_VIEW: 'HWK0',
    HOMEWORK_EDIT: 'HWK1',
    ASSESSMENT_CENTRE_VIEW: 'ASCN0',
    ASSESSMENT_CENTRE_EDIT: 'ASCN1',
    ASSESSMENT_LIST_VIEW: 'ASLT0',
    ASSESSMENT_LIST_EDIT: 'ASLT1',
    QUESTION_PAPER_VIEW: 'QPPR0',
    QUESTION_PAPER_EDIT: 'QPPR1',
    EVALUATION_CENTRE_VIEW: 'EVCN0',
    EVALUATION_CENTRE_EDIT: 'EVCN1',
    EVALUATION_VIEW: 'EVAL0',
    EVALUATION_EDIT: 'EVAL1',
    EVALUATION_TOOL_VIEW: 'EVTL0',
    EVALUATION_TOOL_EDIT: 'EVTL1',
    COMMUNITY_CENTRE_VIEW: 'CCTR0',
    COMMUNITY_CENTRE_EDIT: 'CCTR1',
    VSMART_AI_TOOLS_VIEW: 'VAI0',
    VSMART_AI_TOOLS_EDIT: 'VAI1',
} as const;

export type PermissionId = (typeof PERMISSION_IDS)[keyof typeof PERMISSION_IDS];
export type PermissionLevel = 'none' | 'view' | 'edit';

// API Payload interface
export interface PermissionUpdatePayload {
    user_id: string;
    institute_id: string;
    added_permission_ids: string[];
    removed_permission_ids: string[];
}

export const FEATURES = {
    dashboard: 'dashboard',
    manage_institute: 'manage_institute',
    batches: 'batches',
    sessions: 'sessions',
    teams: 'teams',
    manage_learners: 'manage_learners',
    learner_list: 'learner_list',
    enroll_request: 'enroll_request',
    invite: 'invite',
    learning_centre: 'learning_centre',
    courses: 'courses',
    live_session: 'live_session',
    doubt_management: 'doubt_management',
    reports: 'reports',
    presentation: 'presentation',
    homework: 'homework',
    assessment_centre: 'assessment_centre',
    assessment_list: 'assessment_list',
    question_paper: 'question_paper',
    evaluation_centre: 'evaluation_centre',
    evaluation: 'evaluation',
    evaluation_tool: 'evaluation_tool',
    community_centre: 'community_centre',
    vsmart_ai_tools: 'vsmart_ai_tools',
} as const;
