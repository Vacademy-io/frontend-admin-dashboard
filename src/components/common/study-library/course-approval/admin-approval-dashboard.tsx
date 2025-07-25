import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MyButton } from '@/components/design-system/button';
import {
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    User,
    Calendar,
    Warning,
    ArrowRight,
    Funnel,
} from 'phosphor-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import {
    useCoursesForReview,
    useApproveCourse,
    useRejectCourse,
    useApprovalSummary,
    getApprovalActionBadgeColor,
    getApprovalActionLabel,
    isUrgentlyPending,
} from '@/services/study-library/course-approval/admin-approval-services';
import {
    AdminApprovalCourse,
    AdminApprovalFilters,
    CourseApprovalStatus,
} from '@/types/course/course-approval';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface AdminApprovalDashboardProps {
    filters?: AdminApprovalFilters;
}

export const AdminApprovalDashboard: React.FC<AdminApprovalDashboardProps> = ({ filters }) => {
    const navigate = useNavigate();
    const [selectedFilters, setSelectedFilters] = useState<AdminApprovalFilters>(filters || {});
    const [searchQuery, setSearchQuery] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedCourseForRejection, setSelectedCourseForRejection] = useState<string | null>(
        null
    );
    const [selectedOriginalCourseId, setSelectedOriginalCourseId] = useState<string | null>(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const {
        data: courses,
        isLoading,
        error,
    } = useCoursesForReview({
        ...selectedFilters,
        search: searchQuery,
        status: [CourseApprovalStatus.IN_REVIEW], // Only show courses pending review
    });

    const { data: approvalSummary } = useApprovalSummary();
    const approveMutation = useApproveCourse();
    const rejectMutation = useRejectCourse();

    const handleApproveCourse = async (courseId: string, originalCourseId?: string) => {
        try {
            await approveMutation.mutateAsync({
                courseId,
                originalCourseId,
            });
            toast.success('Course approved and published successfully!');
        } catch (error) {
            toast.error('Failed to approve course');
            console.error(error);
        }
    };

    const handleRejectCourse = async (originalCourseId?: string) => {
        if (!selectedCourseForRejection || !rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            await rejectMutation.mutateAsync({
                courseId: selectedCourseForRejection,
                originalCourseId,
                reason: rejectionReason,
            });
            toast.success('Course rejected successfully');
            setShowRejectDialog(false);
            setRejectionReason('');
            setSelectedCourseForRejection(null);
        } catch (error) {
            toast.error('Failed to reject course');
            console.error(error);
        }
    };

    const handleViewCourse = (courseId: string) => {
        navigate({
            to: `/study-library/courses/course-details?courseId=${courseId}&isReview=true`,
        });
    };

    const openRejectDialog = (courseId: string, originalCourseId?: string) => {
        setSelectedCourseForRejection(courseId);
        setSelectedOriginalCourseId(originalCourseId || null);
        setShowRejectDialog(true);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                    <div className="mb-2 size-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                    <p className="text-sm text-neutral-600">Loading approval dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                    <XCircle size={48} className="mx-auto mb-4 text-danger-500" />
                    <p className="text-sm text-neutral-600">Failed to load approval dashboard</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            {approvalSummary && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-600">
                                Pending Review
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-center">
                                <div className="text-2xl font-bold text-warning-600">
                                    {approvalSummary.pending_count}
                                </div>
                                <Clock size={20} className="ml-2 text-warning-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-600">
                                Recently Approved
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-center">
                                <div className="text-2xl font-bold text-success-600">
                                    {approvalSummary.recent_approved_count}
                                </div>
                                <CheckCircle size={20} className="ml-2 text-success-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-600">
                                Recently Rejected
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-center">
                                <div className="text-2xl font-bold text-danger-600">
                                    {approvalSummary.recent_rejected_count}
                                </div>
                                <XCircle size={20} className="ml-2 text-danger-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-md"
                    />
                </div>
                <MyButton
                    buttonType="secondary"
                    layoutVariant="icon"
                    onClick={() => {
                        // Toggle filters - could expand to show date range picker
                    }}
                >
                    <Funnel size={16} />
                </MyButton>
            </div>

            {/* Courses List */}
            {!courses || courses.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                        <CheckCircle size={48} className="mx-auto mb-4 text-success-400" />
                        <h3 className="mb-2 text-lg font-medium text-neutral-900">
                            No {getTerminology(ContentTerms.Course, SystemTerms.Course)}s Pending
                            Review
                        </h3>
                        <p className="text-sm text-neutral-600">
                            All courses are up to date! Check back later for new submissions.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {courses.map((course) => {
                        const isUrgent = isUrgentlyPending(course.submittedAt);

                        return (
                            <Card
                                key={course.id}
                                className={`transition-all hover:shadow-md ${
                                    isUrgent ? 'border-warning-200 bg-warning-50' : ''
                                }`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 space-y-3">
                                            {/* Course Title and Urgent Badge */}
                                            <div className="flex items-start gap-3">
                                                <h3 className="flex-1 text-lg font-semibold text-neutral-900">
                                                    {course.packageName}
                                                </h3>
                                                {isUrgent && (
                                                    <Badge className="bg-warning-100 text-warning-700">
                                                        <Warning size={12} className="mr-1" />
                                                        Urgent
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Course Details */}
                                            <div className="grid gap-2 text-sm text-neutral-600 md:grid-cols-2">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} />
                                                    <span>
                                                        Created by: {course.createdByUserName}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    <span>
                                                        Submitted:{' '}
                                                        {new Date(
                                                            course.submittedAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>Depth: Level {course.courseDepth}</span>
                                                </div>
                                                {course.tags && course.tags.length > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <span>Tags: {course.tags.join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Description */}
                                            {course.description && (
                                                <p className="line-clamp-2 text-sm text-neutral-700">
                                                    {course.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="ml-6 flex flex-col gap-2">
                                            <MyButton
                                                size="small"
                                                buttonType="secondary"
                                                layoutVariant="default"
                                                onClick={() => handleViewCourse(course.id)}
                                                className="text-xs"
                                            >
                                                <Eye size={14} className="mr-1" />
                                                Review
                                            </MyButton>
                                            <MyButton
                                                size="small"
                                                buttonType="success"
                                                layoutVariant="default"
                                                onClick={() => handleApproveCourse(course.id)}
                                                disabled={approveMutation.isPending}
                                                className="text-xs"
                                            >
                                                <CheckCircle size={14} className="mr-1" />
                                                Approve
                                            </MyButton>
                                            <MyButton
                                                size="small"
                                                buttonType="danger"
                                                layoutVariant="default"
                                                onClick={() => openRejectDialog(course.id)}
                                                disabled={rejectMutation.isPending}
                                                className="text-xs"
                                            >
                                                <XCircle size={14} className="mr-1" />
                                                Reject
                                            </MyButton>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Reject Course Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reject Course</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-neutral-600">
                            Please provide a reason for rejecting this course. This will help the
                            teacher understand what needs to be improved.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="rejection-reason">Rejection Reason</Label>
                            <Textarea
                                id="rejection-reason"
                                placeholder="Enter detailed feedback for the teacher..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <MyButton buttonType="secondary" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                        </MyButton>
                        <MyButton
                            buttonType="danger"
                            onClick={handleRejectCourse}
                            disabled={!rejectionReason.trim() || rejectMutation.isPending}
                        >
                            Reject Course
                        </MyButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
