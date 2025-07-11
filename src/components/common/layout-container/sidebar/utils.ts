import {
    House,
    Users,
    BookOpen,
    Scroll,
    Globe,
    FileMagnifyingGlass,
    HeadCircuit,
    MonitorPlay,
} from '@phosphor-icons/react';
import { SidebarItemsType } from '../../../../types/layout-container/layout-container-types';
import { NotePencil, UsersFour } from 'phosphor-react';
import { getInstituteId } from '@/constants/helper';
import { HOLISTIC_INSTITUTE_ID } from '@/constants/urls';

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
                subItem: 'Batches',
                subItemLink: '/manage-institute/batches',
            },
            {
                subItem: 'Session',
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
        title: `Manage ${getInstituteId() === HOLISTIC_INSTITUTE_ID ? 'Members' : 'Learner'}`,
        id: 'student-mangement',
        subItems: [
            {
                subItem: `${getInstituteId() === HOLISTIC_INSTITUTE_ID ? 'Member' : 'Learner'} list`,
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
        icon: BookOpen,
        title: 'Learning Center',
        id: 'study-library',
        subItems: [
            {
                subItem: 'Courses',
                subItemLink: '/study-library/courses',
            },
            {
                subItem: 'Live Session',
                subItemLink: '/study-library/live-session',
            },
            {
                subItem: 'Reports',
                subItemLink: '/study-library/reports',
            },
            {
                subItem: 'Volt',
                subItemLink: '/study-library/volt',
            },
            {
                subItem: 'Doubt Management',
                subItemLink: '/study-library/doubt-management',
            },
        ],
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
];
