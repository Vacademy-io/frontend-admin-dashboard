import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MyButton } from '@/components/design-system/button';
import { Eye, ArrowLeft, Clock, User } from 'phosphor-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { getMyCourses, withdrawFromReview } from '../-services/approval-services';
import { formatDistanceToNow } from 'date-fns';

interface CoursePackageEntity {
    id: string;
    packageName: string;
    updatedAt: string;
    thumbnailFileId: string | null;
    status: string;
    createdAt: string;
    isCoursePublishedToCatalaouge: boolean | null;
    coursePreviewImageMediaId: string | null;
    courseBannerMediaId: string | null;
    courseMediaId: string | null;
    whyLearn: string | null;
    whoShouldLearn: string | null;
    aboutTheCourse: string | null;
    tags: string | null;
    courseDepth: number | null;
    courseHtmlDescription: string | null;
    originalCourseId: string | null;
    createdByUserId: string;
    versionNumber: number | null;
}

interface SessionInfo {
    sessionId: string;
    sessionName: string;
    sessionStatus: string;
    sessionStartDate: string;
}

interface CourseInReviewResponse {
    packageEntity: CoursePackageEntity;
    relationshipType: string;
    facultyAssignmentCount: number;
    assignedSubjects: unknown;
    courseId: string;
    courseName: string;
    courseStatus: string;
    createdAt: string;
    updatedAt: string;
    sessionInfo: SessionInfo;
}

export const CourseInReviewTab: React.FC = () => {
    const navigate = useNavigate();
    const [reviewCourses, setReviewCourses] = useState<CourseInReviewResponse[]>([]);

    // Fetch courses
    const {
        data: courses,
        isLoading,
        refetch,
        error,
    } = useQuery<CourseInReviewResponse[]>({
        queryKey: ['my-courses-in-review'],
        queryFn: getMyCourses,
        refetchInterval: 30000,
    });

    // Withdraw from review mutation
    const withdrawMutation = useMutation({
        mutationFn: withdrawFromReview,
        onSuccess: () => {
            toast.success('Course withdrawn from review');
            refetch();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to withdraw from review');
        },
    });

    // Filter only IN_REVIEW courses
    useEffect(() => {
        if (!courses) return;

        const filtered = courses.filter((course) => course.courseStatus === 'IN_REVIEW');
        setReviewCourses(filtered);
    }, [courses]);

    const handleViewCourse = (course: CourseInReviewResponse) => {
        navigate({
            to: `/study-library/courses/course-details?courseId=${course.courseId}`,
        });
    };

    const handleWithdrawFromReview = (courseId: string) => {
        withdrawMutation.mutate(courseId);
    };

    if (isLoading) {
        return <DashboardLoader />;
    }

    if (error) {
        return (
            <div className="flex h-40 flex-col items-center justify-center text-red-500">
                <p>Error loading courses</p>
                <MyButton onClick={() => refetch()} buttonType="secondary" className="mt-2">
                    Retry
                </MyButton>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="mb-2 text-lg font-semibold">Courses In Review</h3>
                <p className="text-gray-600">
                    These courses are currently being reviewed by administrators.
                </p>
            </div>

            {/* Courses List */}
            {reviewCourses.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Clock size={48} className="mb-4 text-gray-400" />
                        <h3 className="mb-2 text-lg font-semibold">No courses in review</h3>
                        <p className="text-gray-600">
                            You don&apos;t have any courses currently under review.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reviewCourses.map((course) => (
                        <Card
                            key={course.courseId}
                            className="border-orange-200 transition-shadow hover:shadow-md"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="line-clamp-2 text-lg">
                                            {course.courseName}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock size={14} />
                                                Submitted{' '}
                                                {formatDistanceToNow(new Date(course.updatedAt), {
                                                    addSuffix: true,
                                                })}
                                            </div>
                                        </CardDescription>
                                    </div>
                                    <div className="ml-2 flex flex-col gap-1">
                                        <Badge
                                            variant="default"
                                            className="bg-orange-100 text-orange-800"
                                        >
                                            In Review
                                        </Badge>
                                        {course.packageEntity.originalCourseId && (
                                            <Badge variant="outline" className="text-xs">
                                                Update
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                {/* Session Info */}
                                <div className="mb-4 rounded-lg bg-gray-50 p-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User size={14} />
                                        <span className="font-medium">Session:</span>
                                        <span>{course.sessionInfo.sessionName}</span>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500">
                                        Relationship: {course.relationshipType}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {/* View Button */}
                                    <MyButton
                                        onClick={() => handleViewCourse(course)}
                                        buttonType="secondary"
                                        className="w-full justify-center"
                                    >
                                        <Eye size={16} className="mr-1" />
                                        View Course
                                    </MyButton>

                                    {/* Withdraw from Review Button */}
                                    <MyButton
                                        onClick={() => handleWithdrawFromReview(course.courseId)}
                                        buttonType="secondary"
                                        className="w-full justify-center"
                                        disabled={withdrawMutation.isPending}
                                    >
                                        <ArrowLeft size={16} className="mr-1" />
                                        {withdrawMutation.isPending
                                            ? 'Withdrawing...'
                                            : 'Withdraw from Review'}
                                    </MyButton>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Info Section */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <Clock size={20} className="mt-0.5 text-blue-600" />
                        <div>
                            <h4 className="mb-1 font-semibold text-blue-900">Review Process</h4>
                            <p className="text-sm text-blue-700">
                                Once submitted, your courses will be reviewed by administrators. You
                                can withdraw courses from review at any time if you need to make
                                changes.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
