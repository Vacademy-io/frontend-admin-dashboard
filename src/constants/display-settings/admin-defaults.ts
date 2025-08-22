import { SidebarItemsData } from '@/components/common/layout-container/sidebar/utils';
import type { SidebarItemsType } from '@/types/layout-container/layout-container-types';
import type {
    DisplaySettingsData,
    SidebarTabConfig,
    DashboardWidgetConfig,
} from '@/types/display-settings';

function mapSidebarToConfig(menu: SidebarItemsType[]): SidebarTabConfig[] {
    return menu.map((item, index) => ({
        id: item.id,
        label: item.title,
        route: item.to,
        order: index + 1,
        visible: true,
        subTabs:
            item.subItems?.map((sub, subIndex) => ({
                id: sub.subItemId || sub.subItem || `${item.id}-${subIndex + 1}`,
                label: sub.subItem,
                route: sub.subItemLink || '#',
                order: subIndex + 1,
                visible: true,
            })) || [],
    }));
}

function defaultDashboardWidgetsAdmin(): DashboardWidgetConfig[] {
    const ids: DashboardWidgetConfig['id'][] = [
        'recentNotifications',
        'realTimeActiveUsers',
        'currentlyActiveUsers',
        'userActivitySummary',
        'enrollLearners',
        'learningCenter',
        'assessmentCenter',
        'roleTypeUsers',
        'unresolvedDoubts',
        'instituteOverview',
        'aiFeaturesCard',
        'liveClasses',
    ];
    return ids.map((id, idx) => ({ id, order: idx + 1, visible: true }));
}

export const DEFAULT_ADMIN_DISPLAY_SETTINGS: DisplaySettingsData = {
    sidebar: mapSidebarToConfig(SidebarItemsData),
    dashboard: {
        widgets: defaultDashboardWidgetsAdmin(),
    },
    coursePage: {
        viewInviteLinks: true,
        viewCourseConfiguration: true,
        viewCourseOverviewItem: true,
        viewContentNumbering: true,
    },
    courseList: {
        tabs: [
            { id: 'AllCourses', order: 1, visible: true },
            { id: 'AuthoredCourses', order: 2, visible: true },
            { id: 'CourseApproval', order: 3, visible: true },
            { id: 'CourseInReview', order: 4, visible: false },
        ],
        defaultTab: 'AllCourses',
    },
    courseDetails: {
        tabs: [
            { id: 'OUTLINE', order: 1, visible: true },
            { id: 'CONTENT_STRUCTURE', order: 2, visible: true },
            { id: 'LEARNER', order: 3, visible: true },
            { id: 'TEACHER', order: 4, visible: true },
            { id: 'ASSESSMENT', order: 5, visible: true },
        ],
        defaultTab: 'OUTLINE',
    },
    permissions: {
        canViewInstituteDetails: true,
        canEditInstituteDetails: true,
        canViewProfileDetails: true,
        canEditProfileDetails: true,
    },
    ui: {
        showSupportButton: true,
        showSidebar: true,
    },
    contentTypes: {
        pdf: true,
        video: { enabled: true, showInVideoQuestion: true },
        codeEditor: true,
        document: true,
        question: true,
        quiz: true,
        assignment: true,
        jupyterNotebook: true,
        scratch: true,
    },
    slideView: {
        showCopyTo: true,
        showMoveTo: true,
    },
    postLoginRedirectRoute: '/dashboard',
};
