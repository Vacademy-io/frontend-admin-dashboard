import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MyButton } from '@/components/design-system/button';
import { Eye, PencilSimpleLine, Clock, CheckCircle, XCircle, Warning, Copy } from 'phosphor-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import {
    useTeacherCourses,
    useSubmitForReview,
    useWithdrawFromReview,
    useCreateEditableCopy,
    getCourseStatusBadgeColor,
    getCourseStatusLabel,
} from '@/services/study-library/course-approval/teacher-approval-services';
import {
    TeacherCourse,
    TeacherCourseFilters,
    CourseApprovalStatus,
} from '@/types/course/course-approval';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface TeacherCoursesListProps {
    filters?: TeacherCourseFilters;
}

export const TeacherCoursesList: React.FC<TeacherCoursesListProps> = ({ filters }) => {
    const navigate = useNavigate();
    const [selectedFilters, setSelectedFilters] = useState<TeacherCourseFilters>(filters || {});
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: courses,
        isLoading,
        error,
    } = useTeacherCourses({
        ...selectedFilters,
        search: searchQuery,
    });

    const submitForReviewMutation = useSubmitForReview();
    const withdrawFromReviewMutation = useWithdrawFromReview();
    const createEditableCopyMutation = useCreateEditableCopy();

    const handleSubmitForReview = async (courseId: string) => {
        try {
            await submitForReviewMutation.mutateAsync({ courseId });
            toast.success('Course submitted for review successfully!');
        } catch (error) {
            toast.error('Failed to submit course for review');
            console.error(error);
        }
    };

    const handleWithdrawFromReview = async (courseId: string) => {
        try {
            await withdrawFromReviewMutation.mutateAsync({ courseId });
            toast.success('Course withdrawn from review successfully!');
        } catch (error) {
            toast.error('Failed to withdraw course from review');
            console.error(error);
        }
    };

    const handleCreateEditableCopy = async (originalCourseId: string) => {
        try {
            const response = await createEditableCopyMutation.mutateAsync({ originalCourseId });
            toast.success('Editable copy created successfully!');
            navigate({
                to: `/study-library/courses/course-details?courseId=${response.newCourseId}`,
            });
        } catch (error) {
            toast.error('Failed to create editable copy');
            console.error(error);
        }
    };

    const handleEditCourse = (courseId: string) => {
        navigate({
            to: `/study-library/courses/course-details?courseId=${courseId}`,
        });
    };

    const handleViewCourse = (courseId: string) => {
        navigate({
            to: `/study-library/courses/course-details?courseId=${courseId}`,
        });
    };

    const getStatusIcon = (status: CourseApprovalStatus) => {
        switch (status) {
            case CourseApprovalStatus.DRAFT:
                return <PencilSimpleLine size={16} className="text-neutral-600" />;
            case CourseApprovalStatus.IN_REVIEW:
                return <Clock size={16} className="text-warning-600" />;
            case CourseApprovalStatus.APPROVED:
                return <CheckCircle size={16} className="text-success-600" />;
            case CourseApprovalStatus.REJECTED:
                return <XCircle size={16} className="text-danger-600" />;
            case CourseApprovalStatus.ACTIVE:
                return <CheckCircle size={16} className="text-primary-600" />;
            default:
                return <Warning size={16} className="text-neutral-600" />;
        }
    };

    const getCourseActions = (course: TeacherCourse) => {
        const actions = [];

        // View action - always available
        actions.push(
            <MyButton
                key="view"
                scale="small"
                buttonType="secondary"
                layoutVariant="icon"
                onClick={() => handleViewCourse(course.id)}
                title="View Course"
            >
                <Eye size={16} />
            </MyButton>
        );

        switch (course.status) {
            case CourseApprovalStatus.DRAFT:
                actions.push(
                    <MyButton
                        key="edit"
                        scale="small"
                        buttonType="primary"
                        layoutVariant="icon"
                        onClick={() => handleEditCourse(course.id)}
                        title="Edit Course"
                    >
                        <PencilSimpleLine size={16} />
                    </MyButton>,
                    <MyButton
                        key="submit"
                        scale="small"
                        buttonType="primary"
                        layoutVariant="default"
                        onClick={() => handleSubmitForReview(course.id)}
                        disabled={submitForReviewMutation.isPending}
                        className="bg-green-600 text-xs hover:bg-green-700"
                    >
                        Submit for Review
                    </MyButton>
                );
                break;

            case CourseApprovalStatus.IN_REVIEW:
                actions.push(
                    <MyButton
                        key="withdraw"
                        scale="small"
                        buttonType="secondary"
                        layoutVariant="default"
                        onClick={() => handleWithdrawFromReview(course.id)}
                        disabled={withdrawFromReviewMutation.isPending}
                        className="border-orange-600 bg-orange-600 text-xs text-white hover:bg-orange-700"
                    >
                        Withdraw
                    </MyButton>
                );
                break;

            case CourseApprovalStatus.ACTIVE:
                // For published courses, show create editable copy
                actions.push(
                    <MyButton
                        key="copy"
                        scale="small"
                        buttonType="secondary"
                        layoutVariant="icon"
                        onClick={() => handleCreateEditableCopy(course.id)}
                        disabled={createEditableCopyMutation.isPending}
                        title="Create Editable Copy"
                    >
                        <Copy size={16} />
                    </MyButton>
                );
                break;

            case CourseApprovalStatus.REJECTED:
                actions.push(
                    <MyButton
                        key="edit"
                        scale="small"
                        buttonType="primary"
                        layoutVariant="icon"
                        onClick={() => handleEditCourse(course.id)}
                        title="Edit and Resubmit"
                    >
                        <PencilSimpleLine size={16} />
                    </MyButton>
                );
                break;
        }

        return actions;
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                    <div className="mb-2 size-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                    <p className="text-sm text-neutral-600">Loading courses...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                    <XCircle size={48} className="mx-auto mb-4 text-danger-500" />
                    <p className="text-sm text-neutral-600">Failed to load courses</p>
                </div>
            </div>
        );
    }

    if (!courses || courses.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                    <PencilSimpleLine size={48} className="mx-auto mb-4 text-neutral-400" />
                    <h3 className="mb-2 text-lg font-medium text-neutral-900">
                        No {getTerminology(ContentTerms.Course, SystemTerms.Course)}s Found
                    </h3>
                    <p className="text-sm text-neutral-600">
                        You haven&apos;t created any courses yet. Start by creating your first
                        course!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="mb-6 flex items-center gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-md"
                    />
                </div>
                <Select
                    value={selectedFilters.status?.[0] || 'all'}
                    onValueChange={(value) => {
                        setSelectedFilters({
                            ...selectedFilters,
                            status: value === 'all' ? undefined : [value as CourseApprovalStatus],
                        });
                    }}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value={CourseApprovalStatus.DRAFT}>Draft</SelectItem>
                        <SelectItem value={CourseApprovalStatus.IN_REVIEW}>In Review</SelectItem>
                        <SelectItem value={CourseApprovalStatus.APPROVED}>Approved</SelectItem>
                        <SelectItem value={CourseApprovalStatus.REJECTED}>Rejected</SelectItem>
                        <SelectItem value={CourseApprovalStatus.ACTIVE}>Published</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Courses Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                    <Card key={course.id} className="relative transition-shadow hover:shadow-md">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <CardTitle className="line-clamp-2 text-sm font-medium">
                                    {course.packageName}
                                </CardTitle>
                                <Badge
                                    className={`ml-2 shrink-0 ${getCourseStatusBadgeColor(course.status)}`}
                                >
                                    <span className="mr-1">
                                        {getStatusIcon(course.status as CourseApprovalStatus)}
                                    </span>
                                    {getCourseStatusLabel(course.status)}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {/* Course Details */}
                                <div className="space-y-1 text-xs text-neutral-600">
                                    <div>
                                        Created: {new Date(course.createdAt).toLocaleDateString()}
                                    </div>
                                    {course.submittedAt && (
                                        <div>
                                            Submitted:{' '}
                                            {new Date(course.submittedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                    {course.originalCourseId && (
                                        <div className="flex items-center gap-1">
                                            <Copy size={12} />
                                            <span>Edited Version</span>
                                        </div>
                                    )}
                                </div>

                                {/* Rejection Reason */}
                                {course.status === CourseApprovalStatus.REJECTED &&
                                    course.rejectionReason && (
                                        <div className="rounded border border-danger-200 bg-danger-50 p-2 text-xs">
                                            <p className="font-medium text-danger-700">
                                                Rejection Reason:
                                            </p>
                                            <p className="mt-1 text-danger-600">
                                                {course.rejectionReason}
                                            </p>
                                        </div>
                                    )}

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2">
                                    {getCourseActions(course)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
