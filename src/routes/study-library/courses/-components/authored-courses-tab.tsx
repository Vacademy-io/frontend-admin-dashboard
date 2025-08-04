import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MyButton } from '@/components/design-system/button';
import {
    PaperPlaneTilt,
    Eye,
    Copy,
    CircleNotch,
    Calendar,
    GraduationCap,
    Users,
    TrashSimple,
} from 'phosphor-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { getMyCourses, createEditableCopy, submitForReview } from '../-services/approval-services';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { useDeleteCourse } from '@/services/study-library/course-operations/delete-course';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PackageEntity {
    id: string;
    packageName: string;
    updatedAt: string;
    thumbnailFileId: string | null;
    status: 'DRAFT' | 'IN_REVIEW' | 'ACTIVE';
    createdAt: string;
    isCoursePublishedToCatalaouge: boolean | null;
    coursePreviewImageMediaId: string | null;
    courseBannerMediaId: string | null;
    courseMediaId: string | null;
    whyLearn: string | null;
    whoShouldLearn: string | null;
    aboutTheCourse: string | null;
    tags: string[] | null;
    courseDepth: number | null;
    courseHtmlDescription: string | null;
    originalCourseId: string | null;
    createdByUserId: string | null;
    versionNumber: number | null;
}

interface SessionInfo {
    sessionId: string | null;
    sessionName: string | null;
    sessionStatus: string | null;
    sessionStartDate: string | null;
}

interface LevelInfo {
    levelId: string | null;
    levelName: string | null;
    durationInDays: number | null;
    levelStatus: string | null;
    levelThumbnailFileId: string | null;
    levelCreatedAt: string | null;
    levelUpdatedAt: string | null;
}

interface PackageSessionInfo {
    packageSessionIds: string | null;
    packageSessionCount: number;
    packageSessionStatuses: string | null;
}

interface DetailedCourseResponse {
    packageEntity: PackageEntity;
    relationshipType: 'CREATOR' | 'FACULTY_ASSIGNED';
    facultyAssignmentCount: number;
    assignedSubjects: string | null;
    courseId: string;
    courseName: string;
    courseStatus: 'DRAFT' | 'IN_REVIEW' | 'ACTIVE';
    createdAt: string;
    updatedAt: string;
    sessionInfo: SessionInfo;
    levelInfo: LevelInfo;
    packageSessionInfo: PackageSessionInfo;
    facultyAssigned: boolean;
    creator: boolean;
}

// Grouped course interface for display
interface GroupedCourse {
    id: string;
    packageId: string; // Package ID for deletion
    packageName: string;
    status: 'DRAFT' | 'IN_REVIEW' | 'ACTIVE';
    updatedAt: string;
    createdAt: string;
    originalCourseId: string | null;
    courseHtmlDescription: string | null;
    relationshipType: 'CREATOR' | 'FACULTY_ASSIGNED';
    facultyAssignmentCount: number;
    creator: boolean;
    facultyAssigned: boolean;
    sessionLevelCombinations: Array<{
        sessionInfo: SessionInfo;
        levelInfo: LevelInfo;
    }>;
}

interface AuthoredCoursesTabProps {
    searchValue: string;
    setSearchValue: (value: string) => void;
}

export const AuthoredCoursesTab: React.FC<AuthoredCoursesTabProps> = ({
    searchValue,
    setSearchValue,
}) => {
    const navigate = useNavigate();
    const [filteredCourses, setFilteredCourses] = useState<GroupedCourse[]>([]);
    const [copyingCourseId, setCopyingCourseId] = useState<string | null>(null);
    const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

    // Delete course mutation
    const deleteCourseMutation = useDeleteCourse();

    // Get current user data
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const isAdmin =
        tokenData?.authorities &&
        Object.values(tokenData.authorities).some(
            (auth: { roles?: string[] }) =>
                Array.isArray(auth?.roles) && auth.roles.includes('ADMIN')
        );

    // Fetch authored courses
    const {
        data: courses,
        isLoading,
        refetch,
        error,
    } = useQuery<DetailedCourseResponse[]>({
        queryKey: ['my-courses'],
        queryFn: getMyCourses,
        refetchInterval: 30000,
    });



    // Create editable copy mutation
    const createCopyMutation = useMutation({
        mutationFn: createEditableCopy,
        onSuccess: () => {
            toast.success('Editable copy created successfully');
            refetch();
            setCopyingCourseId(null);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create editable copy');
            setCopyingCourseId(null);
        },
    });

    // Submit for review mutation
    const submitReviewMutation = useMutation({
        mutationFn: submitForReview,
        onSuccess: () => {
            toast.success('Course submitted for review');
            refetch();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to submit for review');
        },
    });

    // Group courses by courseId and filter based on search
    useEffect(() => {
        if (!courses) return;

        // Group courses by courseId
        const groupedMap = new Map<string, GroupedCourse>();

        courses.forEach((response) => {
            const courseId = response.courseId;
            const course = response.packageEntity;

            if (!groupedMap.has(courseId)) {
                groupedMap.set(courseId, {
                    id: courseId,
                    packageId: course.id, // Store the package ID for deletion
                    packageName: course.packageName,
                    status: course.status,
                    updatedAt: course.updatedAt,
                    createdAt: course.createdAt,
                    originalCourseId: course.originalCourseId,
                    courseHtmlDescription: course.courseHtmlDescription,
                    relationshipType: response.relationshipType,
                    facultyAssignmentCount: response.facultyAssignmentCount,
                    creator: response.creator,
                    facultyAssigned: response.facultyAssigned,
                    sessionLevelCombinations: [],
                });
            }

            const groupedCourse = groupedMap.get(courseId)!;

            // Add session/level combination
            groupedCourse.sessionLevelCombinations.push({
                sessionInfo: response.sessionInfo,
                levelInfo: response.levelInfo,
            });

            // Update other fields that might vary (take the latest values)
            if (new Date(response.updatedAt) > new Date(groupedCourse.updatedAt)) {
                groupedCourse.updatedAt = response.updatedAt;
            }
        });

        // Convert to array and filter
        const groupedCourses = Array.from(groupedMap.values());

        const filtered = groupedCourses.filter((course) => {
            // Show only ACTIVE and DRAFT courses (not IN_REVIEW ones - they go to separate tab)
            const isValidStatus = ['ACTIVE', 'DRAFT'].includes(course.status);

            // Search filter
            const matchesSearch =
                !searchValue ||
                course.packageName.toLowerCase().includes(searchValue.toLowerCase());

            return isValidStatus && matchesSearch;
        });

        setFilteredCourses(filtered);
    }, [courses, searchValue]);

    const handleViewCourse = (courseId: string) => {
        navigate({
            to: `/study-library/courses/course-details?courseId=${courseId}`,
        });
    };

    const handleCopyToEdit = (course: GroupedCourse) => {
        setCopyingCourseId(course.id);
        createCopyMutation.mutate(course.id);
    };



    const handleSubmitForReview = (courseId: string) => {
        submitReviewMutation.mutate(courseId);
    };

    const handleDeleteCourse = (courseId: string) => {
        // Find the course to get the packageId
        const course = filteredCourses.find((c) => c.id === courseId);
        if (!course) {
            toast.error('Course not found');
            return;
        }

        console.log('Deleting course:', { courseId, packageId: course.packageId });

        setDeletingCourseId(courseId);
        setDeleteDialogOpen(null); // Close the dialog
        deleteCourseMutation.mutate(course.packageId, {
            onSuccess: () => {
                toast.success('Course deleted successfully');
                refetch();
                setDeletingCourseId(null);
            },
            onError: (error: unknown) => {
                const errMsg =
                    error && typeof error === 'object' && 'message' in error
                        ? (error as { message?: string }).message
                        : undefined;
                toast.error(errMsg || 'Failed to delete course');
                setDeletingCourseId(null);
            },
        });
    };

    const canCreateCopy = (course: GroupedCourse) => {
        if (!filteredCourses) return false;
        // Check if there's already a draft copy of this published course
        const hasDraftCopy = filteredCourses.some(
            (c) => c.originalCourseId === course.id && c.status === 'DRAFT'
        );
        return !hasDraftCopy;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge className="bg-green-100 text-green-800">Published</Badge>;
            case 'DRAFT':
                return <Badge>Draft</Badge>;
            case 'IN_REVIEW':
                return <Badge>In Review</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getRelationshipBadge = (relationshipType: string) => {
        switch (relationshipType) {
            case 'CREATOR':
                return <Badge className="bg-blue-100 text-xs text-blue-800">Creator</Badge>;
            case 'FACULTY_ASSIGNED':
                return <Badge className="text-xs">Faculty</Badge>;
            default:
                return <Badge className="text-xs">{relationshipType}</Badge>;
        }
    };

    if (isLoading) {
        return <DashboardLoader />;
    }

    if (error) {
        return (
            <div className="flex h-40 flex-col items-center justify-center text-red-500">
                <p>Error loading courses</p>
                <MyButton onClick={() => refetch()} className="mt-2">
                    Retry
                </MyButton>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search courses..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="max-w-md"
                />
            </div>

            {/* Courses List */}
            {filteredCourses.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <h3 className="mb-2 text-lg font-semibold">No courses found</h3>
                        <p className="text-gray-600">
                            {searchValue
                                ? `No courses match "${searchValue}"`
                                : "You haven't created any courses yet."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCourses.map((course) => (
                        <Card
                            key={course.id}
                            className="flex flex-col transition-shadow hover:shadow-md"
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="line-clamp-2 text-base font-medium">
                                            {course.packageName}
                                        </CardTitle>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {getStatusBadge(course.status)}
                                        {getRelationshipBadge(course.relationshipType)}
                                        {course.originalCourseId && (
                                            <Badge className="px-1 text-xs">Copy</Badge>
                                        )}
                                    </div>
                                </div>
                                <CardDescription className="text-xs">
                                    Updated {formatDistanceToNow(new Date(course.updatedAt))} ago
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex flex-1 flex-col justify-between space-y-3 pt-0">
                                {/* Description */}
                                {course.courseHtmlDescription && (
                                    <div className="mb-3">
                                        <p
                                            className="line-clamp-2 text-xs text-gray-600"
                                            dangerouslySetInnerHTML={{
                                                __html: course.courseHtmlDescription,
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Session/Level Information */}
                                <div className="space-y-2">
                                    {course.sessionLevelCombinations.length > 0 && (
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-medium text-gray-700">
                                                Sessions & Levels:
                                            </h4>
                                            <div className="space-y-1">
                                                {course.sessionLevelCombinations
                                                    .slice(0, 2)
                                                    .map((combo, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-2 text-xs text-gray-600"
                                                        >
                                                            {combo.sessionInfo.sessionName &&
                                                                combo.sessionInfo.sessionName !==
                                                                    'default' && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar size={12} />
                                                                        <span className="truncate">
                                                                            {
                                                                                combo.sessionInfo
                                                                                    .sessionName
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            {combo.levelInfo.levelName &&
                                                                combo.levelInfo.levelName !==
                                                                    'default' && (
                                                                    <div className="flex items-center gap-1">
                                                                        <GraduationCap size={12} />
                                                                        <span className="truncate">
                                                                            {
                                                                                combo.levelInfo
                                                                                    .levelName
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    ))}
                                                {course.sessionLevelCombinations.length > 2 && (
                                                    <div className="text-xs text-gray-500">
                                                        +
                                                        {course.sessionLevelCombinations.length - 2}{' '}
                                                        more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Faculty Assignment Count */}
                                    {course.facultyAssigned &&
                                        course.facultyAssignmentCount > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <Users size={12} />
                                                <span>
                                                    {course.facultyAssignmentCount} faculty
                                                    assignments
                                                </span>
                                            </div>
                                        )}
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2">
                                    {/* View Button */}
                                    <MyButton
                                        onClick={() => handleViewCourse(course.id)}
                                        size="sm"
                                        className="h-8 w-full text-xs"
                                    >
                                        <Eye size={12} className="mr-1" />
                                        View
                                    </MyButton>

                                    {/* Action Buttons */}
                                    {course.status === 'DRAFT' && !isAdmin ? (
                                        // Draft course for non-admin: Only show submit button
                                        <div>
                                            <MyButton
                                                onClick={() => handleSubmitForReview(course.id)}
                                                size="sm"
                                                className="h-8 w-full bg-blue-600 text-xs text-white hover:bg-blue-700"
                                                disabled={submitReviewMutation.isPending}
                                            >
                                                <PaperPlaneTilt size={12} className="mr-1" />
                                                Submit
                                            </MyButton>
                                        </div>
                                    ) : (
                                        // For published courses, show copy button or copy exists message
                                        <div>
                                            {course.status === 'ACTIVE' ? (
                                                canCreateCopy(course) ? (
                                                    <MyButton
                                                        onClick={() => handleCopyToEdit(course)}
                                                        size="sm"
                                                        className="h-8 w-full bg-blue-600 text-xs text-white hover:bg-blue-700"
                                                        disabled={copyingCourseId === course.id}
                                                    >
                                                        {copyingCourseId === course.id ? (
                                                            <CircleNotch
                                                                size={12}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <>
                                                                <Copy size={12} className="mr-1" />
                                                                Copy to Edit
                                                            </>
                                                        )}
                                                    </MyButton>
                                                ) : (
                                                    <MyButton
                                                        size="sm"
                                                        className="h-8 w-full bg-gray-400 text-xs text-gray-600"
                                                        disabled
                                                    >
                                                        Copy Exists
                                                    </MyButton>
                                                )
                                            ) : null}
                                        </div>
                                    )}

                                    {/* Delete Button */}
                                    <AlertDialog
                                        open={deleteDialogOpen === course.id}
                                        onOpenChange={(open) => {
                                            if (open) {
                                                setDeleteDialogOpen(course.id);
                                            } else {
                                                setDeleteDialogOpen(null);
                                            }
                                        }}
                                    >
                                        <AlertDialogTrigger asChild>
                                            <MyButton
                                                size="sm"
                                                className="h-8 w-full bg-red-600 text-xs text-white hover:bg-red-700"
                                                disabled={deletingCourseId === course.id}
                                            >
                                                {deletingCourseId === course.id ? (
                                                    <CircleNotch
                                                        size={12}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <>
                                                        <TrashSimple size={12} className="mr-1" />
                                                        Delete
                                                    </>
                                                )}
                                            </MyButton>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Are you sure you want to delete this course?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will
                                                    permanently delete your course and remove your
                                                    course data from our servers.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel
                                                    disabled={deletingCourseId === course.id}
                                                >
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeleteCourse(course.id)}
                                                    disabled={deletingCourseId === course.id}
                                                    className="bg-red-600 text-white hover:bg-red-700"
                                                >
                                                    {deletingCourseId === course.id ? (
                                                        <CircleNotch
                                                            size={12}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        'Delete'
                                                    )}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
