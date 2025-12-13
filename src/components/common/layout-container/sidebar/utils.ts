import {
    House,
    Users,
    BookOpen,
    Scroll,
    Globe,
    FileMagnifyingGlass,
    HeadCircuit,
    ChartLineUp,
    Tag,
    FlowArrow,
    CreditCard,
    Strategy,
    Timer,
    ChartBar,
    AddressBook,
} from '@phosphor-icons/react';
import { SidebarItemsType } from '../../../../types/layout-container/layout-container-types';
import { ChalkboardTeacher, GearSix, Lightning, NotePencil, UsersFour } from 'phosphor-react';
import { StorageKey } from '@/constants/storage/storage';
import { ContentTerms, RoleTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { NamingSettingsType, SettingsTabs } from '@/routes/settings/-constants/terms';

// Utility function to get naming settings from localStorage
const getNamingSettings = (): NamingSettingsType[] => {
    try {
        const saved = localStorage.getItem(StorageKey.NAMING_SETTINGS);
        if (!saved) return [];

        const parsed = JSON.parse(saved);

        // Ensure the parsed data is an array
        if (!Array.isArray(parsed)) {
            console.warn('Naming settings in localStorage is not an array:', parsed);
            return [];
        }

        return parsed;
    } catch (error) {
        console.error('Failed to parse naming settings from localStorage:', error);
        return [];
    }
};

// Utility function to get custom terminology with fallback to default
export const getTerminology = (key: string, defaultValue: string): string => {
    const settings = getNamingSettings();

    // Double-check that settings is an array before calling find
    if (!Array.isArray(settings)) {
        console.warn('Settings is not an array in getTerminology:', settings);
        return defaultValue;
    }

    const setting = settings.find((item) => item.key === key);
    return setting?.customValue || defaultValue;
};

export const SidebarItemsData: SidebarItemsType[] = [
    {
        icon: House,
        title: 'Dashboard',
        id: 'dashboard',
        to: '/dashboard',
    },
    {
        icon: ChartLineUp,
        title: 'Learner Live Activities',
        id: 'learner-insights',
        to: '/learner-insights',
    },
    {
        icon: UsersFour,
        title: 'Manage Institute',
        id: 'manage-institute',
        subItems: [
            {
                subItem: 'Batches',
                subItemLink: '/manage-institute/batches',
                subItemId: 'batches',
            },
            {
                subItem: getTerminology(ContentTerms.Session, SystemTerms.Session), // Session
                subItemLink: '/manage-institute/sessions',
                subItemId: 'sessions',
            },
            {
                subItem: 'Teams',
                subItemLink: '/manage-institute/teams',
                subItemId: 'teams',
            },
        ],
    },
    {
        icon: Users,
        title: `Manage ${getTerminology(RoleTerms.Learner, SystemTerms.Learner)}`, // Student
        id: 'student-mangement',
        subItems: [
            {
                subItem: `${getTerminology(RoleTerms.Learner, SystemTerms.Learner)} list`, // Student
                subItemLink: '/manage-students/students-list',
                subItemId: 'students-list',
            },
            {
                subItem: 'Enroll Requests',
                subItemLink: '/manage-students/enroll-requests',
                subItemId: 'enroll-requests',
            },
            {
                subItem: 'Invite',
                subItemLink: '/manage-students/invite',
                subItemId: 'invite',
            },
        ],
    },
    {
        icon: Tag,
        title: 'Manage User Tags',
        id: 'user-tags',
        subItems: [
            {
                subItem: 'Link Tag',
                subItemLink: '/user-tags/link',
                subItemId: 'link-tag',
            },
            {
                subItem: 'Institute Tags',
                subItemLink: '/user-tags/institute',
                subItemId: 'institute-tags',
            },
        ],
    },

    {
        icon: Users,
        title: 'Manage Campaigns',
        id: 'manage-campaigns',
        subItems: [
            {
                subItem: 'Campaign List',
                subItemLink: '/audience-manager/list',
                subItemId: 'list',
            },
        ],
    },
    {
        icon: Strategy,
        title: 'Planning',
        id: 'planning',
        subItems: [
            {
                subItem: 'Planning',
                subItemLink: '/planning/planning',
                subItemId: 'planning',
            },
            {
                subItem: 'Activity Logs',
                subItemLink: '/planning/activity-logs',
                subItemId: 'activity-logs',
            },
        ],
    },

    {
        icon: CreditCard,
        title: 'Manage Payments',
        id: 'manage-payments',
        to: '/manage-payments',
    },
    {
        icon: BookOpen,
        title: 'Learning Center',
        id: 'study-library',
        subItems: [
            {
                subItem: getTerminology(ContentTerms.Course, SystemTerms.Course), // Course
                subItemLink: '/study-library/courses',
                subItemId: 'course',
            },
            {
                subItem: `${getTerminology(ContentTerms.LiveSession, SystemTerms.LiveSession)}`, // LiveSession
                subItemLink: '/study-library/live-session',
                subItemId: 'live-session',
            },
            {
                subItem: 'Attendance Tracker',
                subItemLink: '/study-library/attendance-tracker',
                subItemId: 'attendance-tracker',
            },
            {
                subItem: 'Reports',
                subItemLink: '/study-library/reports',
                subItemId: 'reports',
            },
            {
                subItem: 'Doubt Management',
                subItemLink: '/study-library/doubt-management',
                subItemId: 'doubt-management',
            },
        ],
    },
    {
        icon: Lightning,
        id: 'volt',
        title: 'Volt',
        to: '/study-library/volt',
    },
    {
        icon: NotePencil,
        id: 'Homework Creation',
        title: 'Homework',
        to: '/homework-creation/assessment-list?selectedTab=liveTests',
    },
    {
        icon: Scroll,
        title: 'Assessment Centre',
        id: 'assessment-centre',
        to: '/assessment',
        subItems: [
            {
                subItem: 'Assessment List',
                subItemLink: '/assessment/assessment-list?selectedTab=liveTests',
                subItemId: 'assessment-list',
            },
            {
                subItem: 'Question Papers',
                subItemLink: '/assessment/question-papers',
                subItemId: 'question-papers',
            },
        ],
    },
    {
        icon: FileMagnifyingGlass,
        title: 'Evaluation Centre',
        id: 'evaluation-centre',
        subItems: [
            {
                subItem: 'Evaluations',
                subItemLink: '/evaluation/evaluations',
                subItemId: 'evaluations',
            },
            {
                subItem: 'Evaluation tool',
                subItemLink: '/evaluation/evaluation-tool',
                subItemId: 'evaluation-tool',
            },
        ],
    },
    {
        icon: HeadCircuit,
        title: 'Announcement',
        id: 'announcement',
        to: '/announcement/create',
        subItems: [
            {
                subItem: 'Create Announcement',
                subItemLink: '/announcement/create',
                subItemId: 'announcement-create',
            },
            {
                subItem: 'Email Campaigning',
                subItemLink: '/announcement/email-campaigning',
                subItemId: 'announcement-email-campaigning',
            },
            {
                subItem: 'Announcement History',
                subItemLink: '/announcement/history',
                subItemId: 'announcement-history',
                adminOnly: true,
            },
            {
                subItem: 'Schedule Announcement',
                subItemLink: '/announcement/schedule',
                subItemId: 'announcement-schedule',
            },
            {
                subItem: 'Announcement Approval',
                subItemLink: '/announcement/approval',
                subItemId: 'announcement-approval',
            },
        ],
    },
    {
        icon: FlowArrow,
        id: 'workflow',
        title: 'Workflows',
        to: '/workflow/list',
    },
    {
        icon: Globe,
        id: 'community-centre',
        title: 'Community Centre',
        to: '/community',
    },
    {
        icon: HeadCircuit,
        title: 'VSmart AI Tools',
        id: 'ai-center',
        to: '/ai-center',
        subItems: [
            {
                subItem: 'AI Tools',
                subItemLink: '/ai-center/ai-tools',
                subItemId: 'ai-tools',
            },
            {
                subItem: 'My Resources',
                subItemLink: '/ai-center/my-resources',
                subItemId: 'my-resources',
            },
        ],
    },
    {
        icon: ChalkboardTeacher,
        id: 'instructor-copilot',
        title: 'Instructor Copilot',
        to: '/instructor-copilot',
    },
    {
        icon: Timer,
        id: 'membership-expiry',
        title: 'Membership Expiry',
        to: '/membership-expiry',
    },
    {
        icon: ChartBar,
        id: 'membership-stats',
        title: 'Enrollment Stats',
        to: '/membership-stats',
    },
    {
        icon: AddressBook,
        id: 'manage-contacts',
        title: 'Manage Contacts',
        to: '/manage-contacts',
    },
    {
        icon: GearSix,
        id: 'settings',
        title: 'Settings',
        to: `/settings?selectedTab=${SettingsTabs.Tab}`,
    },
];
