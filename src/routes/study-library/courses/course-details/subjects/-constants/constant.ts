import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { RoleTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';

export enum TabType {
    OUTLINE = 'OUTLINE',
    STUDENT = 'STUDENT',
    TEACHERS = 'TEACHERS',
    ASSESSMENT = 'ASSESSMENT',
    // ASSIGNMENT = 'ASSIGNMENT',
    // GRADING = 'GRADING',
    // ANNOUNCEMENT = 'ANNOUNCEMENT',
}
export const tabs = [
    { label: 'Outline', value: 'OUTLINE' },
    { label: `${getTerminology(RoleTerms.Learner, SystemTerms.Learner)}`, value: 'STUDENT' },
    { label: `${getTerminology(RoleTerms.Teacher, SystemTerms.Teacher)}`, value: 'TEACHERS' },
    { label: 'Assessment', value: 'ASSESSMENT' },
    // { label: 'Assignment ', value: 'ASSIGNMENT' },
    // { label: 'Grading ', value: 'GRADING' },
    // { label: 'Announcements ', value: 'ANNOUNCEMENT' },
];
