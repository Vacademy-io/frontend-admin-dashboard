// Types for Student Display Settings (Learner Portal)

export const STUDENT_DISPLAY_SETTINGS_KEY = 'STUDENT_DISPLAY_SETTINGS' as const;

// Sidebar
export interface StudentSidebarSubTabConfig {
    id: string;
    label?: string;
    route: string;
    order: number;
    visible: boolean;
}

export interface StudentSidebarTabConfig {
    id: string; // dashboard, learning-center, homework, assessment-center, referral, attendance, etc.
    label?: string;
    route?: string;
    order: number;
    visible: boolean;
    subTabs?: StudentSidebarSubTabConfig[];
    isCustom?: boolean;
}

// Dashboard Widgets
export type StudentDashboardWidgetId =
    | 'coursesStat'
    | 'assessmentsStat'
    | 'evaluationStat'
    | 'continueLearning'
    | 'learningAnalytics'
    | 'activityTrend'
    | 'dailyProgress'
    | 'liveClasses'
    | 'thisWeekAttendance'
    | 'referAFriend'
    | 'myClasses'
    | 'custom';

export interface StudentDashboardWidgetConfig {
    id: StudentDashboardWidgetId;
    order: number;
    visible: boolean;
    isCustom?: boolean;
    title?: string;
    subTitle?: string;
    link?: string; // route or external link for onClick
}

// Signup/Login configuration
export type StudentSignupProvider = 'google' | 'github' | 'usernamePassword' | 'emailOtp';
export type StudentDefaultProvider = StudentSignupProvider;
export type UsernameStrategy = 'email' | 'random' | 'manual';
export type PasswordStrategy = 'manual' | 'autoRandom';
export type PasswordDelivery = 'showOnScreen' | 'sendEmail' | 'none';

export interface StudentSignupSettings {
    providers: {
        google: boolean;
        github: boolean;
        usernamePassword: boolean;
        emailOtp: boolean;
        defaultProvider: StudentDefaultProvider;
    };
    usernameStrategy: UsernameStrategy;
    passwordStrategy: PasswordStrategy;
    passwordDelivery: PasswordDelivery;
}

// Course details settings
export type StudentCourseDetailsTabId =
    | 'OUTLINE'
    | 'CONTENT_STRUCTURE'
    | 'TEACHERS'
    | 'ASSESSMENTS';

export interface StudentCourseDetailsTabConfig {
    id: StudentCourseDetailsTabId;
    label?: string;
    order: number;
    visible: boolean;
}

export type OutlineMode = 'expanded' | 'collapsed';

export interface StudentCourseDetailsSettings {
    tabs: StudentCourseDetailsTabConfig[];
    defaultTab: StudentCourseDetailsTabId;
    outlineMode: OutlineMode;
    ratingsAndReviewsVisible: boolean;
    // New toggles
    showCourseConfiguration: boolean;
    showCourseContentPrefixes: boolean;
    courseOverview: { visible: boolean; showSlidesData: boolean };
    slidesView: { showLearningPath: boolean; feedbackVisible: boolean; canAskDoubt: boolean };
}

// All Courses page settings
export type StudentAllCoursesTabId = 'InProgress' | 'Completed' | 'AllCourses';

export interface StudentAllCoursesTabConfig {
    id: StudentAllCoursesTabId;
    label?: string;
    order: number;
    visible: boolean;
}

export interface StudentAllCoursesSettings {
    tabs: StudentAllCoursesTabConfig[];
    defaultTab: StudentAllCoursesTabId;
}

// Permissions
export interface StudentPermissions {
    canViewProfile: boolean;
    canEditProfile: boolean;
    canDeleteProfile: boolean;
}

// Certificates
export interface StudentCertificateSettings {
    // Percentage threshold after which certificate can be generated
    generationThresholdPercent: number;
}

// Root schema
export interface StudentDisplaySettingsData {
    sidebar: {
        visible: boolean; // toggle to show/hide entire sidebar
        tabs: StudentSidebarTabConfig[];
    };
    dashboard: {
        widgets: StudentDashboardWidgetConfig[];
    };
    signup: StudentSignupSettings;
    permissions: StudentPermissions;
    courseDetails: StudentCourseDetailsSettings;
    allCourses: StudentAllCoursesSettings;
    notifications: {
        allowSystemAlerts: boolean;
        allowDashboardPins: boolean;
        allowBatchStream: boolean;
    };
    certificates: StudentCertificateSettings;
    postLoginRedirectRoute: string;
}
