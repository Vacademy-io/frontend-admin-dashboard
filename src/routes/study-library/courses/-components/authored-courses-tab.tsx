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
    TrashSimple,
    ClockCounterClockwise,
} from 'phosphor-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import {
    getMyCourses,
    createEditableCopy,
    submitForReview,
    getMyCourseHistory,
} from '../-services/approval-services';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { useDeleteCourse } from '@/services/study-library/course-operations/delete-course';
import { useFileUpload } from '@/hooks/use-file-upload';
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
import { MyDialog } from '@/components/design-system/dialog';

interface PackageEntity {
    id: string;
    packageName: string;
    updatedAt: string;
    thumbnail_file_id: string | null;
    status: 'DRAFT' | 'IN_REVIEW' | 'ACTIVE';
    createdAt: string;
    isCoursePublishedToCatalaouge: boolean | null;
    course_preview_image_media_id: string | null;
    course_banner_media_id: string | null;
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
    thumbnail_file_id: string | null;
    course_preview_image_media_id: string | null;
    course_banner_media_id: string | null;
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
    const [historyDialogCourseId, setHistoryDialogCourseId] = useState<string | null>(null);

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
            navigate({ to: '/study-library/courses' });
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

    // Course History query (teacher)
    interface CourseHistoryLogItem {
        timestamp: number;
        actorUserId: string;
        action: string;
        message: string;
        comment?: string;
    }

    interface CourseHistoryResponse {
        courseId: string;
        courseName: string;
        status: string;
        createdByUserId: string;
        originalCourseId?: string | null;
        originalCourseName?: string | null;
        originalCourseStatus?: string | null;
        versionNumber?: number | null;
        auditLogs: CourseHistoryLogItem[];
    }

    const {
        data: courseHistory,
        isFetching: isHistoryFetching,
        error: historyError,
    } = useQuery<CourseHistoryResponse | undefined>({
        queryKey: ['teacher-course-history', historyDialogCourseId],
        queryFn: () => getMyCourseHistory(historyDialogCourseId as string),
        enabled: Boolean(historyDialogCourseId),
    });

    const sortByTimestampAsc = (a: CourseHistoryLogItem, b: CourseHistoryLogItem): number =>
        a.timestamp - b.timestamp;

    // Group courses by courseId and filter based on search
    useEffect(() => {
        if (!courses) return;

        // Group courses by courseId
        const groupedMap = new Map<string, GroupedCourse>();

        courses.forEach((response: DetailedCourseResponse) => {
            const courseId = response.courseId;
            const course = response.packageEntity;

            // Debug logging for API data
            console.log('API Response Debug:', {
                courseName: course.packageName,
                thumbnail_file_id: course.thumbnail_file_id,
                course_preview_image_media_id: course.course_preview_image_media_id,
                course_banner_media_id: course.course_banner_media_id,
            });

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
                    thumbnail_file_id: course.thumbnail_file_id,
                    course_preview_image_media_id: course.course_preview_image_media_id,
                    course_banner_media_id: course.course_banner_media_id,
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
        // Prevent multiple draft copies: Check if there's already a draft copy of this published course
        // by looking for any course where originalCourseId matches this course's ID and status is DRAFT
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

    // Thumbnail component that handles async URL fetching
    const CourseThumbnail: React.FC<{ course: GroupedCourse }> = ({ course }) => {
        const { getPublicUrl } = useFileUpload();
        const [imageUrl, setImageUrl] = useState<string>('');
        const [isLoading, setIsLoading] = useState(false);

        // Priority: thumbnail_file_id > course_preview_image_media_id > course_banner_media_id
        const mediaId =
            course.thumbnail_file_id ||
            course.course_preview_image_media_id ||
            course.course_banner_media_id;

        // Debug logging
        console.log('CourseThumbnail Debug:', {
            courseName: course.packageName,
            thumbnail_file_id: course.thumbnail_file_id,
            course_preview_image_media_id: course.course_preview_image_media_id,
            course_banner_media_id: course.course_banner_media_id,
            selectedMediaId: mediaId,
        });

        useEffect(() => {
            if (mediaId) {
                console.log('Fetching URL for mediaId:', mediaId);
                setIsLoading(true);
                getPublicUrl(mediaId)
                    .then((url: string | undefined) => {
                        console.log('Got URL:', url);
                        setImageUrl(url || '');
                    })
                    .catch((error: unknown) => {
                        console.error('Failed to get thumbnail URL:', error);
                        setImageUrl('');
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            }
        }, [mediaId, getPublicUrl]);

        if (!mediaId) {
            console.log('No mediaId found for course:', course.packageName);
            // Show placeholder for debugging
            return null;
        }

        if (isLoading) {
            return (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100">
                    <div className="flex h-full items-center justify-center">
                        <div className="size-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"></div>
                    </div>
                </div>
            );
        }

        if (!imageUrl) return null;

        return (
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img
                    src={imageUrl}
                    alt={course.packageName}
                    className="size-full object-cover"
                    onError={(e) => {
                        // Hide image if it fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            </div>
        );
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
                            className="flex flex-col overflow-hidden border border-gray-200 bg-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                        >
                            {/* Thumbnail */}
                            <CourseThumbnail course={course} />

                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="line-clamp-2 text-lg font-semibold leading-tight">
                                            {course.packageName}
                                        </CardTitle>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {getStatusBadge(course.status)}
                                        {course.originalCourseId && (
                                            <Badge className="px-1 text-xs">Copy</Badge>
                                        )}
                                    </div>
                                </div>
                                <CardDescription className="text-xs text-gray-500">
                                    Updated {formatDistanceToNow(new Date(course.updatedAt))} ago
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex flex-1 flex-col justify-between p-4 pt-0">
                                {/* Level Information */}
                                <div className="mb-4">
                                    {course.sessionLevelCombinations.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {(() => {
                                                // Filter out "invited" sessions but keep level information
                                                const filteredCombinations =
                                                    course.sessionLevelCombinations.filter(
                                                        (combo) => {
                                                            const sessionName =
                                                                combo.sessionInfo.sessionName?.toLowerCase() ||
                                                                '';
                                                            return !sessionName.includes('invited');
                                                        }
                                                    );

                                                return (
                                                    <>
                                                        {filteredCombinations
                                                            .slice(0, 3) // Show up to 3 level chips
                                                            .map(
                                                                (combo, index) =>
                                                                    combo.levelInfo.levelName && (
                                                                        <Badge
                                                                            key={index}
                                                                            variant="secondary"
                                                                            className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700"
                                                                        >
                                                                            {
                                                                                combo.levelInfo
                                                                                    .levelName
                                                                            }
                                                                        </Badge>
                                                                    )
                                                            )}
                                                        {filteredCombinations.length > 3 && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-600"
                                                            >
                                                                +{filteredCombinations.length - 3}{' '}
                                                                more
                                                            </Badge>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    {/* Primary View Button */}
                                    <MyButton
                                        onClick={() => handleViewCourse(course.id)}
                                        size="default"
                                        className="h-10 w-full text-sm font-medium"
                                    >
                                        <Eye size={16} className="mr-2" />
                                        View Course
                                    </MyButton>

                                    {/* Secondary Action Buttons */}
                                    {course.status === 'DRAFT' && !isAdmin ? (
                                        // Draft course: Submit (green), History, Delete buttons
                                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                                            <MyButton
                                                onClick={() => handleSubmitForReview(course.id)}
                                                size="icon"
                                                className="size-7 shrink-0 rounded-md bg-green-600 p-0 text-white hover:bg-green-700"
                                                disabled={submitReviewMutation.isPending}
                                                title="Submit for Review"
                                            >
                                                {submitReviewMutation.isPending ? (
                                                    <CircleNotch
                                                        size={16}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <PaperPlaneTilt size={16} />
                                                )}
                                            </MyButton>

                                            {/* History button */}
                                            <MyButton
                                                onClick={() => setHistoryDialogCourseId(course.id)}
                                                size="icon"
                                                className="size-7 shrink-0 rounded-md bg-blue-600 p-0 text-white hover:bg-blue-700"
                                                title="View History"
                                            >
                                                <ClockCounterClockwise size={16} />
                                            </MyButton>

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
                                                        size="icon"
                                                        className="size-7 shrink-0 rounded-md bg-red-600 p-0 text-white hover:bg-red-700"
                                                        disabled={deletingCourseId === course.id}
                                                        title="Delete Course"
                                                    >
                                                        {deletingCourseId === course.id ? (
                                                            <CircleNotch
                                                                size={16}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <TrashSimple size={16} />
                                                        )}
                                                    </MyButton>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Are you sure you want to delete this
                                                            course?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will
                                                            permanently delete your course and
                                                            remove your course data from our
                                                            servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel
                                                            disabled={
                                                                deletingCourseId === course.id
                                                            }
                                                        >
                                                            Cancel
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                handleDeleteCourse(course.id)
                                                            }
                                                            disabled={
                                                                deletingCourseId === course.id
                                                            }
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
                                    ) : (
                                        // Published course: Copy and Delete icon buttons
                                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                                            {course.status === 'ACTIVE' &&
                                                !isAdmin &&
                                                (canCreateCopy(course) ? (
                                                    <MyButton
                                                        onClick={() => handleCopyToEdit(course)}
                                                        size="icon"
                                                        className="size-7 shrink-0 rounded-md bg-blue-600 p-0 text-white hover:bg-blue-700"
                                                        disabled={copyingCourseId === course.id}
                                                        title="Copy to Edit"
                                                    >
                                                        {copyingCourseId === course.id ? (
                                                            <CircleNotch
                                                                size={16}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Copy size={16} />
                                                        )}
                                                    </MyButton>
                                                ) : (
                                                    <MyButton
                                                        size="icon"
                                                        className="size-7 shrink-0 cursor-not-allowed rounded-md bg-gray-400 p-0 text-gray-600"
                                                        disabled
                                                        title="Copy Already Exists"
                                                    >
                                                        <Copy size={16} />
                                                    </MyButton>
                                                ))}

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
                                                        size="icon"
                                                        className="size-7 shrink-0 rounded-md bg-red-600 p-0 text-white hover:bg-red-700"
                                                        disabled={deletingCourseId === course.id}
                                                        title="Delete Course"
                                                    >
                                                        {deletingCourseId === course.id ? (
                                                            <CircleNotch
                                                                size={16}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <TrashSimple size={16} />
                                                        )}
                                                    </MyButton>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Are you sure you want to delete this
                                                            course?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will
                                                            permanently delete your course and
                                                            remove your course data from our
                                                            servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel
                                                            disabled={
                                                                deletingCourseId === course.id
                                                            }
                                                        >
                                                            Cancel
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                handleDeleteCourse(course.id)
                                                            }
                                                            disabled={
                                                                deletingCourseId === course.id
                                                            }
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
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {/* Course History Dialog */}
            <MyDialog
                heading={
                    courseHistory?.courseName
                        ? `Course History · ${courseHistory.courseName}`
                        : 'Course History'
                }
                open={Boolean(historyDialogCourseId)}
                onOpenChange={(open) => {
                    if (!open) setHistoryDialogCourseId(null);
                }}
                dialogWidth="max-w-3xl"
            >
                {isHistoryFetching ? (
                    <div className="flex items-center justify-center py-6 text-gray-600">
                        <CircleNotch size={18} className="mr-2 animate-spin" /> Loading history…
                    </div>
                ) : historyError ? (
                    <div className="rounded-md bg-red-50 p-4 text-red-700">
                        Failed to load course history.
                    </div>
                ) : courseHistory ? (
                    <div className="space-y-4">
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium text-gray-800">Course ID:</span>{' '}
                                {courseHistory.courseId}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium text-gray-800">Status:</span>{' '}
                                {courseHistory.status}
                            </div>
                            {courseHistory.versionNumber != null && (
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium text-gray-800">Version:</span>{' '}
                                    {courseHistory.versionNumber}
                                </div>
                            )}
                            {courseHistory.originalCourseName && (
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium text-gray-800">Original:</span>{' '}
                                    {courseHistory.originalCourseName}{' '}
                                    {courseHistory.originalCourseStatus && (
                                        <span>({courseHistory.originalCourseStatus})</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <h4 className="mb-2 text-sm font-semibold text-gray-900">Audit Logs</h4>
                            {courseHistory.auditLogs && courseHistory.auditLogs.length > 0 ? (
                                <ul className="space-y-3">
                                    {courseHistory.auditLogs
                                        .slice()
                                        .sort(sortByTimestampAsc)
                                        .map((log: CourseHistoryLogItem, idx: number) => (
                                            <li
                                                key={`${log.timestamp}-${idx}`}
                                                className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs font-medium uppercase tracking-wide text-gray-700">
                                                        {log.action}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="mt-1 text-sm text-gray-800">
                                                    {log.message}
                                                </div>
                                                <div className="mt-1 text-xs text-gray-600">
                                                    By: {log.actorUserId}
                                                </div>
                                                {log.comment && (
                                                    <div className="mt-2 rounded bg-white p-2 text-xs text-gray-700">
                                                        Comment: {log.comment}
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                </ul>
                            ) : (
                                <div className="text-sm text-gray-600">No history available.</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-600">No history available.</div>
                )}
            </MyDialog>
        </div>
    );
};
