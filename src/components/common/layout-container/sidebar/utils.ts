import {
    House,
    Users,
    BookOpen,
    Scroll,
    Globe,
    FileMagnifyingGlass,
    HeadCircuit,
} from '@phosphor-icons/react';
import {
    SidebarItemsType,
    subItemsType,
} from '../../../../types/layout-container/layout-container-types';
import { NotePencil, UsersFour } from 'phosphor-react';
import { PERMISSION_IDS } from '@/types/permission';

export const SidebarItemsData: SidebarItemsType[] = [
    {
        icon: House,
        title: 'Dashboard',
        id: 'dashboard',
        to: '/dashboard',
        permission: PERMISSION_IDS.DASHBOARD_VIEW,
    },
    {
        icon: UsersFour,
        title: 'Manage Institute',
        id: 'manage-institute',
        permission: PERMISSION_IDS.MANAGE_INSTITUTE_VIEW,
        subItems: [
            {
                subItem: 'Batches',
                subItemLink: '/manage-institute/batches',
                permission: PERMISSION_IDS.BATCHES_VIEW,
            },
            {
                subItem: 'Session',
                subItemLink: '/manage-institute/sessions',
                permission: PERMISSION_IDS.SESSIONS_VIEW,
            },
            {
                subItem: 'Teams',
                subItemLink: '/manage-institute/teams',
                permission: PERMISSION_IDS.TEAMS_VIEW,
            },
        ],
    },
    {
        icon: Users,
        title: 'Manage Learner',
        id: 'student-mangement',
        permission: PERMISSION_IDS.MANAGE_LEARNERS_VIEW,
        subItems: [
            {
                subItem: 'Learner list',
                subItemLink: '/manage-students/students-list',
                permission: PERMISSION_IDS.LEARNER_LIST_VIEW,
            },
            {
                subItem: 'Enroll Requests',
                subItemLink: '/manage-students/enroll-requests',
                permission: PERMISSION_IDS.ENROLL_REQUEST_VIEW,
            },
            {
                subItem: 'Invite',
                subItemLink: '/manage-students/invite',
                permission: PERMISSION_IDS.INVITE_VIEW,
            },
        ],
    },

    {
        icon: BookOpen,
        title: 'Learning Center',
        id: 'study-library',
        permission: PERMISSION_IDS.LEARNING_CENTRE_VIEW,
        subItems: [
            {
                subItem: 'Courses',
                subItemLink: '/study-library/courses',
                permission: PERMISSION_IDS.COURSES_VIEW,
            },
            {
                subItem: 'Live Session',
                subItemLink: '/study-library/live-session',
                permission: PERMISSION_IDS.LIVE_SESSION_VIEW,
            },
            {
                subItem: 'Reports',
                subItemLink: '/study-library/reports',
                permission: PERMISSION_IDS.REPORTS_VIEW,
            },
            {
                subItem: 'Volt',
                subItemLink: '/study-library/volt',
                permission: PERMISSION_IDS.PRESENTATION_VIEW,
            },
            {
                subItem: 'Doubt Management',
                subItemLink: '/study-library/doubt-management',
                permission: PERMISSION_IDS.DOUBT_MANAGEMENT_VIEW,
            },
        ],
    },
    {
        icon: NotePencil,
        id: 'Homework Creation',
        title: 'Homework',
        to: '/homework-creation/assessment-list?selectedTab=liveTests',
        permission: PERMISSION_IDS.HOMEWORK_VIEW,
    },
    {
        icon: Scroll,
        title: 'Assessment Centre',
        id: 'assessment-centre',
        to: '/assessment',
        permission: PERMISSION_IDS.ASSESSMENT_CENTRE_VIEW,
        subItems: [
            {
                subItem: 'Assessment List',
                subItemLink: '/assessment/assessment-list?selectedTab=liveTests',
                permission: PERMISSION_IDS.ASSESSMENT_LIST_VIEW,
            },
            {
                subItem: 'Question Papers',
                subItemLink: '/assessment/question-papers',
                permission: PERMISSION_IDS.QUESTION_PAPER_VIEW,
            },
        ],
    },
    {
        icon: FileMagnifyingGlass,
        title: 'Evaluation Centre',
        id: 'evaluation-centre',
        permission: PERMISSION_IDS.EVALUATION_CENTRE_VIEW,
        subItems: [
            {
                subItem: 'Evaluations',
                subItemLink: '/evaluation/evaluations',
                permission: PERMISSION_IDS.EVALUATION_VIEW,
            },
            {
                subItem: 'Evaluation tool',
                subItemLink: '/evaluation/evaluation-tool',
                permission: PERMISSION_IDS.EVALUATION_TOOL_VIEW,
            },
        ],
    },
    {
        icon: Globe,
        id: 'Community Centre',
        title: 'Community Centre',
        to: '/community',
        permission: PERMISSION_IDS.COMMUNITY_CENTRE_VIEW,
    },
    {
        icon: HeadCircuit,
        title: 'VSmart AI Tools',
        id: 'AI Center',
        to: '/ai-center',
        permission: PERMISSION_IDS.VSMART_AI_TOOLS_VIEW,
        subItems: [
            {
                subItem: 'AI Tools',
                subItemLink: '/ai-center/ai-tools',
                permission: PERMISSION_IDS.VSMART_AI_TOOLS_VIEW,
            },
            {
                subItem: 'My Resources',
                subItemLink: '/ai-center/my-resources',
                permission: PERMISSION_IDS.VSMART_AI_TOOLS_VIEW,
            },
        ],
    },
];

const filterSubItems = (subItems: subItemsType[], permissions: string[]): subItemsType[] => {
    return subItems.filter((subItem) => {
        if (subItem.permission) {
            return permissions.includes(subItem.permission);
        }
        return true;
    });
};

export const filterSidebarData = (
    items: SidebarItemsType[],
    permissions: string[]
): SidebarItemsType[] => {
    if (!permissions || permissions.length === 0) {
        return items;
    }
    return items
        .map((item) => {
            if (item.subItems) {
                const filteredSubItems = filterSubItems(item.subItems, permissions);
                if (filteredSubItems.length > 0) {
                    if (!item.permission || permissions.includes(item.permission)) {
                        return { ...item, subItems: filteredSubItems };
                    }
                }
            }

            if (item.permission && permissions.includes(item.permission)) {
                return item;
            }

            if (!item.permission) {
                return item;
            }

            return null;
        })
        .filter((item): item is SidebarItemsType => item !== null);
};
