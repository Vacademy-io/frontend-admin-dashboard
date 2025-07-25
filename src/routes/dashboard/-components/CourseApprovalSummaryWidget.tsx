import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MyButton } from '@/components/design-system/button';
import {
    Clock,
    CheckCircle,
    XCircle,
    ArrowRight,
    Warning
} from 'phosphor-react';
import { useNavigate } from '@tanstack/react-router';
import { useApprovalSummary } from '@/services/study-library/course-approval/admin-approval-services';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';

interface CourseApprovalSummaryWidgetProps {
    className?: string;
}

export const CourseApprovalSummaryWidget: React.FC<CourseApprovalSummaryWidgetProps> = ({
    className = ''
}) => {
    const navigate = useNavigate();
    const { data: approvalSummary, isLoading, error } = useApprovalSummary();

    const handleViewApprovals = () => {
        navigate({
            to: '/study-library/courses',
            search: { tab: 'AdminApproval' }
        });
    };

    if (isLoading) {
        return (
            <Card className={`${className}`}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">
                        {getTerminology(ContentTerms.Course, SystemTerms.Course)} Approvals
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex h-24 items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !approvalSummary) {
        return (
            <Card className={`${className}`}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">
                        {getTerminology(ContentTerms.Course, SystemTerms.Course)} Approvals
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex h-24 items-center justify-center text-neutral-500">
                        <div className="text-center">
                            <XCircle size={20} className="mx-auto mb-1" />
                            <p className="text-xs">Unable to load data</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const hasUrgentPending = approvalSummary.pending_count > 5;

    return (
        <Card className={`${className} ${hasUrgentPending ? 'border-warning-200 bg-warning-50' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                        {getTerminology(ContentTerms.Course, SystemTerms.Course)} Approvals
                    </CardTitle>
                    {hasUrgentPending && (
                        <Badge className="bg-warning-100 text-warning-700">
                            <Warning size={12} className="mr-1" />
                            Urgent
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                            <div className="flex items-center justify-center">
                                <Clock size={16} className="mr-1 text-warning-600" />
                                <span className="text-lg font-semibold text-warning-600">
                                    {approvalSummary.pending_count}
                                </span>
                            </div>
                            <p className="text-xs text-neutral-600">Pending</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center">
                                <CheckCircle size={16} className="mr-1 text-success-600" />
                                <span className="text-lg font-semibold text-success-600">
                                    {approvalSummary.recent_approved_count}
                                </span>
                            </div>
                            <p className="text-xs text-neutral-600">Approved</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center">
                                <XCircle size={16} className="mr-1 text-danger-600" />
                                <span className="text-lg font-semibold text-danger-600">
                                    {approvalSummary.recent_rejected_count}
                                </span>
                            </div>
                            <p className="text-xs text-neutral-600">Rejected</p>
                        </div>
                    </div>

                    {/* Recent Pending Courses Preview */}
                    {approvalSummary.pending_courses.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-neutral-700">Recent Submissions:</p>
                            <div className="space-y-1">
                                {approvalSummary.pending_courses.slice(0, 2).map((course) => (
                                    <div key={course.id} className="flex items-center justify-between text-xs">
                                        <span className="truncate text-neutral-700" title={course.packageName}>
                                            {course.packageName}
                                        </span>
                                        <span className="text-neutral-500">
                                            {new Date(course.submittedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {approvalSummary.pending_courses.length > 2 && (
                                <p className="text-xs text-neutral-500">
                                    +{approvalSummary.pending_courses.length - 2} more pending
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action Button */}
                    <MyButton
                        size="small"
                        buttonType={approvalSummary.pending_count > 0 ? "primary" : "secondary"}
                        layoutVariant="default"
                        onClick={handleViewApprovals}
                        className="w-full text-xs"
                    >
                        {approvalSummary.pending_count > 0
                            ? `Review ${approvalSummary.pending_count} Pending`
                            : 'View Approvals'
                        }
                        <ArrowRight size={14} className="ml-1" />
                    </MyButton>
                </div>
            </CardContent>
        </Card>
    );
};
