import { Users, Scroll, FileMagnifyingGlass } from '@phosphor-icons/react';
import { SidebarItemsType } from '@/types/layout-container/layout-container-types';
import { PERMISSION_IDS } from '@/types/permission';

export const SidebarItemsData: SidebarItemsType[] = [
    {
        icon: Users,
        title: 'Learner List',
        id: 'student-mangement',
        to: '/evaluator-ai/students',
        permission: PERMISSION_IDS.LEARNER_LIST_EDIT,
    },
    {
        icon: Scroll,
        title: 'Assessment Centre',
        id: 'assessment-centre',
        to: '/evaluator-ai/assessment',
        permission: PERMISSION_IDS.ASSESSMENT_CENTRE_EDIT,
    },
    {
        icon: FileMagnifyingGlass,
        title: 'Evaluation Centre',
        id: 'evaluation-centre',
        to: '/evaluator-ai/evaluation',
        permission: PERMISSION_IDS.EVALUATION_CENTRE_EDIT,
    },
];
