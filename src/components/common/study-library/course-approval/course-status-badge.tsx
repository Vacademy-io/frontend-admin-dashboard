import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
    PencilSimpleLine,
    Clock,
    CheckCircle,
    XCircle,
    Warning
} from 'phosphor-react';
import { CourseApprovalStatus } from '@/types/course/course-approval';
import {
    getCourseStatusBadgeColor,
    getCourseStatusLabel
} from '@/services/study-library/course-approval/teacher-approval-services';

interface CourseStatusBadgeProps {
    status: CourseApprovalStatus | string;
    showIcon?: boolean;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

export const CourseStatusBadge: React.FC<CourseStatusBadgeProps> = ({
    status,
    showIcon = true,
    size = 'medium',
    className = '',
}) => {
    const getStatusIcon = (status: CourseApprovalStatus | string) => {
        const iconSize = size === 'small' ? 12 : size === 'large' ? 18 : 14;

        switch (status) {
            case CourseApprovalStatus.DRAFT:
                return <PencilSimpleLine size={iconSize} className="text-neutral-600" />;
            case CourseApprovalStatus.IN_REVIEW:
                return <Clock size={iconSize} className="text-warning-600" />;
            case CourseApprovalStatus.APPROVED:
                return <CheckCircle size={iconSize} className="text-success-600" />;
            case CourseApprovalStatus.REJECTED:
                return <XCircle size={iconSize} className="text-danger-600" />;
            case CourseApprovalStatus.ACTIVE:
                return <CheckCircle size={iconSize} className="text-primary-600" />;
            default:
                return <Warning size={iconSize} className="text-neutral-600" />;
        }
    };

    const sizeClasses = {
        small: 'text-xs px-2 py-1',
        medium: 'text-sm px-2.5 py-1',
        large: 'text-sm px-3 py-1.5',
    };

    return (
        <Badge
            className={`inline-flex items-center gap-1 ${getCourseStatusBadgeColor(status)} ${sizeClasses[size]} ${className}`}
        >
            {showIcon && getStatusIcon(status as CourseApprovalStatus)}
            <span>{getCourseStatusLabel(status)}</span>
        </Badge>
    );
};

// Utility component for displaying urgent status
interface UrgentBadgeProps {
    daysOverdue: number;
    className?: string;
}

export const UrgentBadge: React.FC<UrgentBadgeProps> = ({ daysOverdue, className = '' }) => {
    if (daysOverdue < 3) return null;

    return (
        <Badge className={`bg-danger-100 text-danger-700 text-xs ${className}`}>
            <Warning size={12} className="mr-1" />
            {daysOverdue >= 7 ? 'Urgent' : 'Due Soon'}
        </Badge>
    );
};

// Utility component for displaying edit indicator
interface EditIndicatorProps {
    isEditedVersion: boolean;
    className?: string;
}

export const EditIndicator: React.FC<EditIndicatorProps> = ({ isEditedVersion, className = '' }) => {
    if (!isEditedVersion) return null;

    return (
        <Badge className={`bg-blue-100 text-blue-700 text-xs ${className}`}>
            <PencilSimpleLine size={12} className="mr-1" />
            Edited Version
        </Badge>
    );
};
