import {
    House,
    Users,
    BookOpen,
    Scroll,
    Globe,
    FileMagnifyingGlass,
    HeadCircuit,
    MonitorPlay,
    ChartLineUp,
} from '@phosphor-icons/react';
import { SidebarItemsType } from '../../../../types/layout-container/layout-container-types';
import { GearSix, Lightning, Notepad, NotePencil, UsersFour } from 'phosphor-react';
import { getInstituteId } from '@/constants/helper';
import { HOLISTIC_INSTITUTE_ID } from '@/constants/urls';
import { StorageKey } from '@/constants/storage/storage';
import { ContentTerms, RoleTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { NamingSettingsType } from '@/routes/settings/-constants/terms';

// Utility function to get naming settings from localStorage
const getNamingSettings = (): NamingSettingsType[] => {
    try {
        const saved = localStorage.getItem(StorageKey.NAMING_SETTINGS);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Failed to parse naming settings from localStorage:', error);
        return [];
    }
};

// Utility function to get custom terminology with fallback to default
export const getTerminology = (key: string, defaultValue: string): string => {
    const settings = getNamingSettings();
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
            },
            {
                subItem: getTerminology(ContentTerms.Session, 'Session'), // Session
                subItemLink: '/manage-institute/sessions',
            },
            {
                subItem: 'Teams',
                subItemLink: '/manage-institute/teams',
            },
        ],
    },
    {
        icon: Users,
        title: `Manage ${getTerminology(RoleTerms.Learner, 'Learner')}`, // Student
        id: 'student-mangement',
        subItems: [
            {
                subItem: `${getTerminology(RoleTerms.Learner, 'Learner')} list`, // Student
                subItemLink: '/manage-students/students-list',
            },
            ...(getInstituteId() !== HOLISTIC_INSTITUTE_ID
                ? [
                      {
                          subItem: 'Enroll Requests',
                          subItemLink: '/manage-students/enroll-requests',
                      },
                      {
                          subItem: 'Invite',
                          subItemLink: '/manage-students/invite',
                      },
                  ]
                : []),
        ],
    },
    {
        icon: MonitorPlay,
        title: 'Live Classes',
        id: 'live-classes',
        to: '/study-library/live-session',
        showForInstitute: HOLISTIC_INSTITUTE_ID,
    },
    {
        icon: Notepad,
        title: 'Attendance Tracker',
        id: 'attendance-tracker',
        to: '/study-library/attendance-tracker',
        showForInstitute: HOLISTIC_INSTITUTE_ID,
    },
    {
        icon: BookOpen,
        title: 'Learning Center',
        id: 'study-library',
        subItems: [
            {
                subItem: getTerminology(ContentTerms.Course, SystemTerms.Course), // Course
                subItemLink: '/study-library/courses',
            },
            {
                subItem: `${getTerminology(ContentTerms.LiveSession, SystemTerms.LiveSession)}`, // LiveSession
                subItemLink: '/study-library/live-session',
            },
            {
                subItem: 'Attendance Tracker',
                subItemLink: '/study-library/attendance-tracker',
            },
            {
                subItem: 'Reports',
                subItemLink: '/study-library/reports',
            },
            {
                subItem: 'Doubt Management',
                subItemLink: '/study-library/doubt-management',
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
            },
            {
                subItem: 'Question Papers',
                subItemLink: '/assessment/question-papers',
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
            },
            {
                subItem: 'Evaluation tool',
                subItemLink: '/evaluation/evaluation-tool',
            },
        ],
    },
    {
        icon: Globe,
        id: 'Community Centre',
        title: 'Community Centre',
        to: '/community',
    },
    {
        icon: HeadCircuit,
        title: 'VSmart AI Tools',
        id: 'AI Center',
        to: '/ai-center',
        subItems: [
            {
                subItem: 'AI Tools',
                subItemLink: '/ai-center/ai-tools',
            },
            {
                subItem: 'My Resources',
                subItemLink: '/ai-center/my-resources',
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
