import {
    House,
    BookOpen,
    HeadCircuit,
    CreditCard,
    AddressBook,
    Robot,
    Megaphone,
} from '@phosphor-icons/react';
import { SidebarItemsType } from '../../../../types/layout-container/layout-container-types';
import { GearSix, UsersFour } from '@phosphor-icons/react';
import { StorageKey } from '@/constants/storage/storage';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { NamingSettingsType } from '@/routes/settings/-constants/terms';

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

// Utility function to get pluralized terminology
export const getTerminologyPlural = (key: string, defaultValue: string): string => {
    const singular = getTerminology(key, defaultValue);
    // Simple pluralization: add 's' or 'es' based on ending
    if (
        singular.endsWith('s') ||
        singular.endsWith('x') ||
        singular.endsWith('z') ||
        singular.endsWith('ch') ||
        singular.endsWith('sh')
    ) {
        return `${singular}es`;
    }
    if (
        singular.endsWith('y') &&
        !['a', 'e', 'i', 'o', 'u'].includes(singular.charAt(singular.length - 2).toLowerCase())
    ) {
        return `${singular.slice(0, -1)}ies`;
    }
    return `${singular}s`;
};

export const SidebarItemsData: SidebarItemsType[] = [
    {
        icon: House,
        title: 'Dashboard',
        id: 'dashboard',
        to: '/dashboard',
    },
    {
        icon: UsersFour,
        title: 'Manage Institute',
        id: 'manage-institute',
        subItems: [
            {
                subItem: getTerminologyPlural(ContentTerms.Batch, SystemTerms.Batch),
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
            {
                subItem: 'Inventory Management',
                subItemLink: '/manage-inventory',
                subItemId: 'inventory-management',
            },
        ],
    },

    {
        icon: BookOpen,
        title: 'Learning Center',
        id: 'study-library',
        to: '/study-library/courses',
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
                subItem: 'Volt',
                subItemLink: '/study-library/volt',
                subItemId: 'volt-sub',
            },
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
        icon: AddressBook,
        title: 'Manage Contacts',
        id: 'manage-contacts',
        subItems: [
            {
                subItem: 'All Contacts',
                subItemLink: '/manage-contacts',
                subItemId: 'all-contacts',
            },
            {
                subItem: 'Linked Course Contacts',
                subItemLink: '/manage-students/students-list',
                subItemId: 'linked-contacts',
            },
            {
                subItem: 'User Tags',
                subItemLink: '/user-tags/institute',
                subItemId: 'user-tags-main',
            },
            {
                subItem: 'Link Tag',
                subItemLink: '/user-tags/link',
                subItemId: 'link-tag',
            },
            {
                subItem: 'Invite Users',
                subItemLink: '/manage-students/invite',
                subItemId: 'invite',
            },
        ],
    },
    {
        icon: CreditCard,
        title: 'Membership',
        id: 'membership-management',
        subItems: [
            {
                subItem: 'Lead List',
                subItemLink: '/audience-manager/list',
                subItemId: 'lead-list',
            },
            {
                subItem: 'Manage Payments',
                subItemLink: '/manage-payments',
                subItemId: 'manage-payments-sub',
            },
            {
                subItem: 'Manage Expiry',
                subItemLink: '/membership-expiry',
                subItemId: 'membership-expiry-sub',
            },
            {
                subItem: 'Enrollment Stats',
                subItemLink: '/membership-stats',
                subItemId: 'membership-stats-sub',
            },
        ],
    },
    {
        icon: HeadCircuit,
        title: 'AI Suite',
        id: 'ai-suite',
        subItems: [
            {
                subItem: 'AI Tools',
                subItemLink: '/ai-center/ai-tools',
                subItemId: 'ai-tools-main',
            },
            {
                subItem: 'Instructor Copilot',
                subItemLink: '/instructor-copilot',
                subItemId: 'instructor-copilot-sub',
            },
            {
                subItem: 'AI Copilot',
                subItemLink: '/study-library/ai-copilot',
                subItemId: 'ai-copilot-sub',
            },
            {
                subItem: 'Video API Studio',
                subItemLink: '/video-api-studio',
                subItemId: 'video-api-studio',
            },
        ],
    },
    {
        icon: Megaphone,
        title: 'Communications',
        id: 'communications',
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
        icon: Robot,
        title: 'Automations',
        id: 'automations',
        subItems: [
            {
                subItem: 'Workflows',
                subItemLink: '/workflow/list',
                subItemId: 'workflow-list',
            },
            {
                subItem: 'Website Builder',
                subItemLink: '/manage-pages',
                subItemId: 'website-builder',
            },
        ],
    },

    {
        icon: GearSix,
        id: 'settings',
        title: 'Settings',
        to: '/settings',
    },
];
