import {
    House,
    Users,
    BookOpen,
    Scroll,
    Globe,
    FileMagnifyingGlass,
    HeadCircuit,
} from '@phosphor-icons/react';
import { SidebarItemsType } from '../../../../types/layout-container/layout-container-types';
import { NotePencil, UsersFour } from 'phosphor-react';

export const SidebarItemsData: SidebarItemsType[] = [
    {
        icon: House,
        title: 'Dashboard',
        id: 'dashboard',
        tabId: 'dashboard',
        to: '/dashboard',
    },
    {
        icon: UsersFour,
        title: 'Manage Institute',
        id: 'manage-institute',
        tabId: 'manageInstitute',
        subItems: [
            {
                subItem: 'Batches',
                subItemLink: '/manage-institute/batches',
                tabId: 'batches',
            },
            {
                subItem: 'Session',
                subItemLink: '/manage-institute/sessions',
                tabId: 'session',
            },
            {
                subItem: 'Teams',
                subItemLink: '/manage-institute/teams',
                tabId: 'teams',
            },
        ],
    },
    {
        icon: Users,
        title: 'Manage Learner',
        id: 'student-mangement',
        tabId: 'manageLearner',
        subItems: [
            {
                subItem: 'Learner list',
                subItemLink: '/manage-students/students-list',
                tabId: 'list',
            },
            {
                subItem: 'Enroll Requests',
                subItemLink: '/manage-students/enroll-requests',
                tabId: 'enroll',
            },
            {
                subItem: 'Invite',
                subItemLink: '/manage-students/invite',
                tabId: 'invite',
            },
        ],
    },

    {
        icon: BookOpen,
        title: 'Learning Center',
        id: 'study-library',
        tabId: 'studyLibrary',
        subItems: [
            {
                subItem: 'Courses',
                subItemLink: '/study-library/courses',
                tabId: 'courses',
            },
            {
                subItem: 'Live Session',
                subItemLink: '/study-library/live-session',
                tabId: 'live',
            },
            {
                subItem: 'Reports',
                subItemLink: '/study-library/reports',
                tabId: 'reports',
            },
            {
                subItem: 'Presentation',
                subItemLink: '/study-library/present',
                tabId: 'presentation',
            },
            {
                subItem: 'Doubt Management',
                subItemLink: '/study-library/doubt-management',
                tabId: 'doubtManagement',
            },
        ],
    },
    {
        icon: NotePencil,
        id: 'Homework Creation',
        tabId: 'homework',
        title: 'Homework',
        to: '/homework-creation/assessment-list?selectedTab=liveTests',
    },
    {
        icon: Scroll,
        title: 'Assessment Centre',
        id: 'assessment-centre',
        tabId: 'assessmentCentre',
        to: '/assessment',
        subItems: [
            {
                subItem: 'Assessment List',
                subItemLink: '/assessment/assessment-list?selectedTab=liveTests',
                tabId: 'assessmentList',
            },
            {
                subItem: 'Question Papers',
                subItemLink: '/assessment/question-papers',
                tabId: 'papers',
            },
        ],
    },
    {
        icon: FileMagnifyingGlass,
        title: 'Evaluation Centre',
        tabId: 'evaluationCentre',
        id: 'evaluation-centre',
        subItems: [
            {
                subItem: 'Evaluations',
                subItemLink: '/evaluation/evaluations',
                tabId: 'evaluations',
            },
            {
                subItem: 'Evaluation tool',
                subItemLink: '/evaluation/evaluation-tool',
                tabId: 'tool',
            },
        ],
    },
    {
        icon: Globe,
        id: 'Community Centre',
        title: 'Community Centre',
        tabId: 'communityCentre',
        to: '/community',
    },
    {
        icon: HeadCircuit,
        title: 'VSmart AI Tools',
        id: 'AI Center',
        tabId: 'vsmart',
        to: '/ai-center',
        subItems: [
            {
                subItem: 'AI Tools',
                subItemLink: '/ai-center/ai-tools',
                tabId: 'aiTools',
            },
            {
                subItem: 'My Resources',
                subItemLink: '/ai-center/my-resources',
                tabId: 'resources',
            },
        ],
    },
];
