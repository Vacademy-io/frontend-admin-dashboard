// Types that define Admin/Teacher display settings configuration

export type UserRoleForDisplaySettings = 'ADMIN' | 'TEACHER';

// Identifier for a top-level sidebar tab
export interface SidebarTabConfig {
    id: string; // e.g., 'dashboard', 'manage-institute'
    label?: string; // optional custom display label
    route?: string; // route for non-collapsible tabs or custom tabs
    order: number; // ordering among tabs
    visible: boolean; // whether the tab is visible for the role
    // List of sub-tabs (if any). For non-collapsible tabs this can be empty
    subTabs?: Array<{
        id: string; // e.g., 'batches', 'sessions'
        label?: string; // optional custom label
        route: string; // route to navigate when selected
        order: number; // ordering among sub-tabs
        visible: boolean; // whether the sub-tab is visible for the role
    }>;
    // Whether this tab was added as a custom tab from settings
    isCustom?: boolean;
}

// Dashboard widget identifiers. These are string literal ids that we can enforce in UI.
// The list is derived from widgets present in `src/routes/dashboard/index.tsx`.
export type DashboardWidgetId =
    | 'recentNotifications'
    | 'realTimeActiveUsers'
    | 'currentlyActiveUsers'
    | 'userActivitySummary'
    | 'enrollLearners'
    | 'learningCenter'
    | 'assessmentCenter'
    | 'roleTypeUsers'
    | 'myCourses'
    | 'unresolvedDoubts'
    | 'liveClasses'
    | 'aiFeaturesCard'
    | 'instituteOverview';

export interface DashboardWidgetConfig {
    id: DashboardWidgetId;
    order: number;
    visible: boolean;
}

export type CourseListTabId =
    | 'AllCourses'
    | 'AuthoredCourses'
    | 'CourseApproval'
    | 'CourseInReview';

export interface CourseListTabConfig {
    id: CourseListTabId;
    label?: string;
    order: number;
    visible: boolean;
}

export type CourseDetailsTabId =
    | 'OUTLINE'
    | 'CONTENT_STRUCTURE'
    | 'LEARNER'
    | 'TEACHER'
    | 'ASSESSMENT';

export interface CourseDetailsTabConfig {
    id: CourseDetailsTabId;
    label?: string;
    order: number;
    visible: boolean;
}

export interface DisplaySettingsData {
    // 1) Sidebar tabs and sub-tabs configuration and ordering
    sidebar: SidebarTabConfig[];

    // 2) Dashboard widgets visibility and ordering
    dashboard: {
        widgets: DashboardWidgetConfig[];
    };

    // 3) Course list page tab configuration
    courseList?: {
        tabs: CourseListTabConfig[];
        defaultTab: CourseListTabId;
    };

    // 4) Course details tab configuration
    courseDetails?: {
        tabs: CourseDetailsTabConfig[];
        defaultTab: CourseDetailsTabId;
    };

    // 5) Permissions and profile visibility/editing controls
    permissions: {
        canViewInstituteDetails: boolean;
        canEditInstituteDetails: boolean;
        canViewProfileDetails: boolean;
        canEditProfileDetails: boolean;
    };

    // 6) Global UI toggles
    ui?: {
        showSupportButton: boolean;
    };

    // 7) Post-login redirect route
    postLoginRedirectRoute: string; // e.g., '/dashboard'
}

export const ADMIN_DISPLAY_SETTINGS_KEY = 'ADMIN_DISPLAY_SETTINGS' as const;
export const TEACHER_DISPLAY_SETTINGS_KEY = 'TEACHER_DISPLAY_SETTINGS' as const;
