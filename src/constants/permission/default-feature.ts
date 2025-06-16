import { FeatureConfig } from '@/routes/dashboard/-components/PermissionDialog';

import {
    Settings,
    Users,
    GraduationCap,
    BookOpen,
    FileText,
    ClipboardCheck,
    MessageSquare,
    Brain,
} from 'lucide-react';

type UserRole = 'ADMIN' | 'TEACHER' | 'COURSE_CREATOR' | 'ASSESSMENT_CREATOR' | 'EVALUATOR';

export const defaultFeatures: FeatureConfig[] = [
    { id: 'dashboard', name: 'Dashboard', icon: Settings, visible: true },
    {
        id: 'manage_institute',
        name: 'Manage Institute',
        icon: Users,
        visible: false,
        subFeatures: [
            { id: 'batches', name: 'Batches', permission: 'none' },
            { id: 'sessions', name: 'Sessions', permission: 'none' },
            { id: 'teams', name: 'Teams', permission: 'none' },
        ],
    },
    {
        id: 'manage_learners',
        name: 'Manage Learners',
        icon: GraduationCap,
        visible: true,
        subFeatures: [
            { id: 'learner_list', name: 'Learner List', permission: 'none' },
            { id: 'enroll_request', name: 'Enroll Request', permission: 'none' },
            { id: 'invite', name: 'Invite', permission: 'none' },
        ],
    },
    {
        id: 'learning_centre',
        name: 'Learning Centre',
        icon: BookOpen,
        visible: true,
        subFeatures: [
            { id: 'courses', name: 'Courses', permission: 'none' },
            { id: 'live_session', name: 'Live Session', permission: 'none' },
            { id: 'doubt_management', name: 'Doubt Management', permission: 'none' },
            { id: 'reports', name: 'Reports', permission: 'none' },
            { id: 'presentation', name: 'Presentation', permission: 'none' },
        ],
    },
    { id: 'homework', name: 'Homework', icon: FileText, visible: true },
    {
        id: 'assessment_centre',
        name: 'Assessment Centre',
        icon: ClipboardCheck,
        visible: true,
        subFeatures: [
            { id: 'assessment_list', name: 'Assessment List', permission: 'none' },
            { id: 'question_paper', name: 'Question Paper', permission: 'none' },
        ],
    },
    {
        id: 'evaluation_centre',
        name: 'Evaluation Centre',
        icon: ClipboardCheck,
        visible: false,
        subFeatures: [
            { id: 'evaluation', name: 'Evaluation', permission: 'none' },
            { id: 'evaluation_tool', name: 'Evaluation Tool', permission: 'none' },
        ],
    },
    { id: 'community_centre', name: 'Community Centre', icon: MessageSquare, visible: false },
    { id: 'vsmart_ai_tools', name: 'Vsmart AI Tools', icon: Brain, visible: true },
];

export const roleColors: Record<UserRole, string> = {
    ADMIN: 'bg-[#E6EFFC] text-blue-700 border-blue-200',
    TEACHER: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    COURSE_CREATOR: 'bg-[#E6FCEF] text-green-700 border-green-200',
    ASSESSMENT_CREATOR: 'bg-[#FCE6E7] text-red-700 border-red-200',
    EVALUATOR: 'bg-[#F0E6FC] text-purple-700 border-purple-200',
};
