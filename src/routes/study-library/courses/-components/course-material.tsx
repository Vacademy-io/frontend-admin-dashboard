import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState, useMemo, useRef } from 'react';
import { AddCourseButton } from '@/components/common/study-library/add-course/add-course-button';
import useIntroJsTour from '@/hooks/use-intro';
import { StudyLibraryIntroKey } from '@/constants/storage/introKey';
import { studyLibrarySteps } from '@/constants/intro/steps';
import { CourseCatalog } from '@/svgs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import type { LevelType } from '@/schemas/student/student-list/institute-schema';
import { handleGetInstituteUsersForAccessControl } from '@/routes/dashboard/-services/dashboard-services';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import {
    getAllCoursesWithFilters,
    getAllTeacherCoursesWithFilters,
    getMyAuthoredCourses,
} from '../-services/courses-services';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useDeleteCourse } from '@/services/study-library/course-operations/delete-course';
import { toast } from 'sonner';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import CourseListPage from './course-list-page';
import { TeacherCoursesList } from '@/components/common/study-library/course-approval/teacher-courses-list';
import { AdminApprovalDashboard } from '@/components/common/study-library/course-approval/admin-approval-dashboard';
import { MyButton } from '@/components/design-system/button';
import { Clock, Eye, PencilSimpleLine, Copy } from 'phosphor-react';
import { useNavigate } from '@tanstack/react-router';
import {
    useSubmitForReview,
    useCreateEditableCopy,
} from '@/services/study-library/course-approval/teacher-approval-services';
import { isUserAdmin } from '@/utils/userDetails';

export interface AllCourseFilters {
    status: string[];
    level_ids: string[];
    tag: string[];
    faculty_ids: string[];
    search_by_name: string;
    min_percentage_completed: number;
    max_percentage_completed: number;
    sort_columns: Record<string, 'ASC' | 'DESC'>;
}

// Add types for API response and course item
export interface CourseInstructor {
    id: string;
    username: string;
    email: string;
    full_name: string;
    address_line: string;
    city: string;
    region: string;
    pin_code: string;
    mobile_number: string;
    date_of_birth: string;
    gender: string;
    password: string;
    profile_pic_file_id: string;
    roles: string[];
    root_user: boolean;
}

export interface CourseItem {
    id: string;
    package_name: string;
    thumbnail_file_id: string;
    is_course_published_to_catalaouge: boolean;
    course_preview_image_media_id: string;
    course_banner_media_id: string;
    course_media_id: string;
    why_learn_html: string;
    who_should_learn_html: string;
    about_the_course_html: string;
    comma_separeted_tags: string;
    course_depth: number;
    course_html_description_html: string;
    courseHtmlDescription?: string;
    courseDepth: number;
    percentage_completed: number;
    rating: number;
    package_session_id: string;
    level_id: string;
    level_name: string;
    instructors: CourseInstructor[];
    status: string;
    course_name: string;
    description: string;
    originalCourseId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AllCoursesApiResponse {
    totalPages: number;
    totalElements: number;
    pageable: unknown;
    numberOfElements: number;
    size: number;
    content: CourseItem[];
    number: number;
    sort: unknown;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// Component for simplified authored courses tab (non-admin users)
const AuthoredCoursesSimpleTab = ({
    data,
    courseImageUrls,
}: {
    data: AllCoursesApiResponse | null;
    courseImageUrls: Record<string, string>;
}) => {
    const [clientSearchValue, setClientSearchValue] = useState('');
    const navigate = useNavigate();
    const submitForReviewMutation = useSubmitForReview();
    const createEditableCopyMutation = useCreateEditableCopy();
    const isAdmin = isUserAdmin();

    // Handler for submitting course for review
    const handleSubmitForReview = async (courseId: string) => {
        try {
            await submitForReviewMutation.mutateAsync({ courseId });
            toast.success('Course submitted for review successfully!');
            // Refresh the page to show updated data
            window.location.reload();
        } catch (error) {
            toast.error('Failed to submit course for review');
            console.error(error);
        }
    };

    // Handler for editing course
    const handleEditCourse = async (courseId: string, courseStatus: string) => {
        if (isAdmin) {
            // Admin can edit directly
            navigate({ to: `/study-library/courses/course-details?courseId=${courseId}` });
        } else {
            // Non-admin: create editable copy for published courses
            if (courseStatus === 'ACTIVE') {
                try {
                    const response = await createEditableCopyMutation.mutateAsync({
                        originalCourseId: courseId,
                    });
                    toast.success('Editable copy created successfully!');
                    console.log('New course copy created:', response.newCourseId);
                    // Refresh the page to show the new course copy
                    window.location.reload();
                } catch (error) {
                    toast.error('Failed to create editable copy');
                    console.error(error);
                }
            } else {
                // For draft courses, navigate directly to edit
                navigate({ to: `/study-library/courses/course-details?courseId=${courseId}` });
            }
        }
    };

    // Get status color and text
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return {
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    text: 'Draft',
                };
            case 'ACTIVE':
                return {
                    color: 'bg-green-100 text-green-800 border-green-200',
                    text: 'Published',
                };
            case 'IN_REVIEW':
                return {
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    text: 'In Review',
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    text: status,
                };
        }
    };

    // Get appropriate actions based on course status
    const getCourseActions = (course: CourseItem) => {
        const actions = [];

        // Check if there's already a draft copy for this published course
        const hasDraftCopy = data?.content?.some(
            (c: CourseItem) => c.status === 'DRAFT' && c.originalCourseId === course.id
        );

        if (course.status === 'DRAFT') {
            // Draft courses: Show "Send for Approval" button
            actions.push(
                <MyButton
                    key="submit-review"
                    scale="small"
                    buttonType="primary"
                    layoutVariant="default"
                    onClick={() => handleSubmitForReview(course.id)}
                    disabled={submitForReviewMutation.isPending}
                    className="flex-1"
                >
                    <Clock size={14} className="mr-1" />
                    {submitForReviewMutation.isPending ? 'Submitting...' : 'Send for Approval'}
                </MyButton>
            );

            // Draft courses: Show "Edit" button
            actions.push(
                <MyButton
                    key="edit"
                    scale="small"
                    buttonType="secondary"
                    layoutVariant="default"
                    onClick={() => handleEditCourse(course.id, course.status)}
                >
                    <PencilSimpleLine size={14} className="mr-1" />
                    Edit
                </MyButton>
            );
        } else if (course.status === 'ACTIVE') {
            // Published courses
            if (isAdmin) {
                // Admin: Show direct "Edit" button
                actions.push(
                    <MyButton
                        key="edit"
                        scale="small"
                        buttonType="secondary"
                        layoutVariant="default"
                        onClick={() => handleEditCourse(course.id, course.status)}
                        className="flex-1"
                    >
                        <PencilSimpleLine size={14} className="mr-1" />
                        Edit
                    </MyButton>
                );
            } else {
                // Non-admin: Show "Create Copy to Edit" or indicate draft exists
                if (hasDraftCopy) {
                    actions.push(
                        <span
                            key="draft-exists"
                            className="flex-1 py-2 text-center text-xs italic text-gray-500"
                        >
                            Draft copy exists
                        </span>
                    );
                } else {
                    actions.push(
                        <MyButton
                            key="create-copy"
                            scale="small"
                            buttonType="secondary"
                            layoutVariant="default"
                            onClick={() => handleEditCourse(course.id, course.status)}
                            disabled={createEditableCopyMutation.isPending}
                            className="flex-1"
                        >
                            <Copy size={14} className="mr-1" />
                            {createEditableCopyMutation.isPending
                                ? 'Creating Copy...'
                                : 'Create Copy to Edit'}
                        </MyButton>
                    );
                }
            }
        }

        // View action - always available
        actions.push(
            <MyButton
                key="view"
                scale="small"
                buttonType="primary"
                layoutVariant="default"
                onClick={() => {
                    navigate({ to: `/study-library/courses/course-details?courseId=${course.id}` });
                }}
            >
                <Eye size={14} className="mr-1" />
                View
            </MyButton>
        );

        return actions;
    };

    // Filter courses based on client-side search and exclude IN_REVIEW
    const filteredCourses =
        data?.content?.filter(
            (course: CourseItem) =>
                course.status !== 'IN_REVIEW' &&
                course.package_name.toLowerCase().includes(clientSearchValue.toLowerCase())
        ) || [];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-8">
            {/* Search Bar */}
            <div className="flex w-full max-w-lg">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Search your courses..."
                        value={clientSearchValue}
                        onChange={(e) => setClientSearchValue(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-5 py-3 pl-12 text-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                    <svg
                        className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {/* Course Cards */}
            {filteredCourses.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                        <p className="text-lg font-medium text-gray-500">
                            {clientSearchValue
                                ? 'No courses found matching your search.'
                                : 'No courses found.'}
                        </p>
                        <p className="text-sm text-gray-400">
                            {!clientSearchValue && 'Create your first course to get started.'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCourses.map((course: CourseItem) => {
                        const statusBadge = getStatusBadge(course.status);
                        const tags: string[] = course.comma_separeted_tags
                            ? course.comma_separeted_tags.split(',').map((t: string) => t.trim())
                            : [];

                        return (
                            <div
                                key={course.id}
                                className="group relative flex h-fit flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50"
                            >
                                {/* Course Banner/Thumbnail - only show if there's an actual image */}
                                {courseImageUrls[course.id] && (
                                    <div className="relative h-52 w-full overflow-hidden">
                                        <img
                                            src={courseImageUrls[course.id]}
                                            alt={course.package_name}
                                            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                        {/* Status Badge */}
                                        <div className="absolute right-4 top-4">
                                            <span
                                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${statusBadge.color}`}
                                            >
                                                {statusBadge.text}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Course Content */}
                                <div className="flex flex-1 flex-col p-6">
                                    {/* Title and Status Badge (when no image) */}
                                    <div className="mb-4 flex items-start justify-between">
                                        <h3 className="line-clamp-2 flex-1 text-xl font-bold leading-tight text-gray-900">
                                            {course.package_name}
                                        </h3>
                                        {/* Show status badge here if no image */}
                                        {!courseImageUrls[course.id] && (
                                            <span
                                                className={`ml-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge.color}`}
                                            >
                                                {statusBadge.text}
                                            </span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {course.courseHtmlDescription && (
                                        <div className="mb-4">
                                            <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                                                {course.courseHtmlDescription
                                                    .replace(/<[^>]*>/g, '')
                                                    .slice(0, 120)}
                                                {course.courseHtmlDescription.length > 120 && '...'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {tags.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-1">
                                            {tags.slice(0, 3).map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {tags.length > 3 && (
                                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                                    +{tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Dates */}
                                    <div className="mb-4 space-y-1 text-xs text-neutral-500">
                                        <div>Created: {formatDate(course.createdAt)}</div>
                                        <div>Updated: {formatDate(course.updatedAt)}</div>
                                        {course.originalCourseId && (
                                            <div className="text-blue-600">
                                                📄 Copy of original course
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-auto flex w-full min-w-0 flex-col flex-wrap items-stretch gap-2 sm:flex-row">
                                        {getCourseActions(course).map((action, idx) => (
                                            <div
                                                key={idx}
                                                className="flex min-w-[120px] max-w-full flex-1 items-stretch"
                                            >
                                                {action}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Component for courses in review tab (non-admin users)
const CourseInReviewTab = ({ data }: { data: AllCoursesApiResponse | null }) => {
    const navigate = useNavigate();

    if (!data || !data.content || data.content.length === 0) {
        return (
            <div className="flex h-40 flex-col items-center justify-center text-gray-500">
                <Clock size={48} className="mx-auto mb-4 text-orange-400" />
                <h3 className="mb-2 text-lg font-medium text-neutral-900">
                    No {getTerminology(ContentTerms.Course, SystemTerms.Course)}s In Review
                </h3>
                <p className="text-sm text-neutral-600">
                    You don&apos;t have any courses currently under review.
                </p>
            </div>
        );
    }

    // Client-side filter to ensure only IN_REVIEW courses are shown
    const inReviewCourses = data.content.filter(
        (course: CourseItem) => course.status === 'IN_REVIEW'
    );

    if (inReviewCourses.length === 0) {
        return (
            <div className="flex h-40 flex-col items-center justify-center text-gray-500">
                <Clock size={48} className="mx-auto mb-4 text-orange-400" />
                <h3 className="mb-2 text-lg font-medium text-neutral-900">
                    No {getTerminology(ContentTerms.Course, SystemTerms.Course)}s In Review
                </h3>
                <p className="text-sm text-neutral-600">
                    You don&apos;t have any courses currently under review.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inReviewCourses.map((course: CourseItem) => (
                    <div
                        key={course.id}
                        className="rounded-lg border border-orange-200 bg-orange-50 p-4 shadow-sm"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-medium text-neutral-900">{course.package_name}</h3>
                            <span className="flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                                <Clock size={12} className="mr-1" />
                                In Review
                            </span>
                        </div>

                        {course.description && (
                            <p className="mb-3 line-clamp-2 text-sm text-neutral-600">
                                {course.description}
                            </p>
                        )}

                        <div className="text-xs text-neutral-500">Submitted for review</div>

                        <div className="mt-3 flex gap-2">
                            <MyButton
                                scale="small"
                                buttonType="secondary"
                                layoutVariant="default"
                                onClick={() => {
                                    navigate({
                                        to: `/study-library/courses/course-details?courseId=${course.id}`,
                                    });
                                }}
                            >
                                <Eye size={14} className="mr-1" />
                                View
                            </MyButton>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CourseMaterial = () => {
    const deleteCourseMutation = useDeleteCourse();
    const { instituteDetails } = useInstituteDetailsStore();
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const [roles, setRoles] = useState<string[] | undefined>([]);
    const [allCoursesData, setAllCoursesData] = useState<AllCoursesApiResponse | null>(null);
    const [authoredCoursesData, setAuthoredCoursesData] = useState<AllCoursesApiResponse | null>(
        null
    );
    const [authoredCoursesSimpleData, setAuthoredCoursesSimpleData] =
        useState<AllCoursesApiResponse | null>(null);
    const [courseInReviewData, setCourseInReviewData] = useState<AllCoursesApiResponse | null>(
        null
    );
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState({
        allCourses: true,
        authoredCourses: true,
        authoredCoursesSimple: true,
        courseInReview: true,
    });
    const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

    const { data: accessControlUsers, isLoading: isUsersLoading } = useSuspenseQuery(
        handleGetInstituteUsersForAccessControl(instituteDetails?.id, {
            roles: [
                { id: '1', name: 'ADMIN' },
                { id: '5', name: 'TEACHER' },
            ],
            status: [{ id: '1', name: 'ACTIVE' }],
        })
    );

    const { setNavHeading } = useNavHeadingStore();
    const [selectedTab, setSelectedTab] = useState('AuthoredCoursesSimple');
    const [selectedFilters, setSelectedFilters] = useState<AllCourseFilters>({
        status: ['ACTIVE'],
        level_ids: [],
        tag: [],
        faculty_ids: [],
        search_by_name: '',
        min_percentage_completed: 0,
        max_percentage_completed: 0,
        sort_columns: { created_at: 'DESC' },
    });

    const [sortBy, setSortBy] = useState('oldest');
    const [searchValue, setSearchValue] = useState('');

    const getAllTeacherCoursesMutation = useMutation({
        mutationFn: ({
            page,
            pageSize,
            instituteId,
            data,
        }: {
            page: number;
            pageSize: number;
            instituteId: string | undefined;
            data: AllCourseFilters;
        }) => getAllTeacherCoursesWithFilters(page, pageSize, instituteId, data),
        onSuccess: (data) => {
            setAllCoursesData(data);
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    const getAllCoursesMutation = useMutation({
        mutationFn: ({
            page,
            pageSize,
            instituteId,
            data,
        }: {
            page: number;
            pageSize: number;
            instituteId: string | undefined;
            data: AllCourseFilters;
        }) => getAllCoursesWithFilters(page, pageSize, instituteId, data),
        onSuccess: (data) => {
            setAllCoursesData(data);
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    useIntroJsTour({
        key: StudyLibraryIntroKey.createCourseStep,
        steps: studyLibrarySteps.createCourseStep,
        partial: true,
    });

    const levels = useMemo(() => {
        return (
            instituteDetails?.levels?.map((level: LevelType) => ({
                id: level.id,
                name: level.level_name,
            })) || []
        );
    }, [instituteDetails]);

    const tags = useMemo(() => {
        return instituteDetails?.tags || [];
    }, [instituteDetails]);

    const handlePageChange = (newPage: number = 0) => {
        setPage(newPage);
        if (!selectedTab || !tokenData || !instituteDetails?.id || !selectedFilters) return;
        const safeInstituteId: string = instituteDetails.id;
        const safeSelectedFilters: AllCourseFilters = {
            status: selectedFilters?.status ?? ['ACTIVE'],
            level_ids: selectedFilters?.level_ids ?? [],
            tag: selectedFilters?.tag ?? [],
            faculty_ids: selectedFilters?.faculty_ids ?? [],
            search_by_name: selectedFilters?.search_by_name ?? '',
            min_percentage_completed: selectedFilters?.min_percentage_completed ?? 0,
            max_percentage_completed: selectedFilters?.max_percentage_completed ?? 0,
            sort_columns: selectedFilters?.sort_columns ?? { created_at: 'DESC' as const },
        };

        const teacherMutate = getAllTeacherCoursesMutation.mutate;
        const coursesMutate = getAllCoursesMutation.mutate;

        if (selectedTab === 'CourseRequests') {
            if (typeof teacherMutate === 'function') {
                teacherMutate({
                    page: newPage,
                    pageSize: 10,
                    instituteId: safeInstituteId,
                    data: safeSelectedFilters,
                });
            }
        } else {
            if (typeof coursesMutate === 'function') {
                const safeStatus = safeSelectedFilters.status ?? ['ACTIVE'];
                const safeLevelIds = safeSelectedFilters.level_ids ?? [];
                const safeTag = safeSelectedFilters.tag ?? [];
                const safeFacultyIds = (safeSelectedFilters.faculty_ids ?? []).filter(
                    (id): id is string => typeof id === 'string'
                );
                const safeSearchByName = safeSelectedFilters.search_by_name ?? '';
                const safeMinCompleted = safeSelectedFilters.min_percentage_completed ?? 0;
                const safeMaxCompleted = safeSelectedFilters.max_percentage_completed ?? 0;
                const safeSortColumns: Record<string, 'ASC' | 'DESC'> =
                    safeSelectedFilters.sort_columns ?? { created_at: 'DESC' as const };
                coursesMutate({
                    page: newPage,
                    pageSize: 10,
                    instituteId: safeInstituteId,
                    data: {
                        status: safeStatus,
                        level_ids: safeLevelIds,
                        tag: safeTag,
                        faculty_ids: safeFacultyIds,
                        search_by_name: safeSearchByName,
                        min_percentage_completed: safeMinCompleted,
                        max_percentage_completed: safeMaxCompleted,
                        sort_columns: safeSortColumns,
                    },
                });
            }
        }
    };

    const handleLevelChange = (levelId: string) => {
        setSelectedFilters((prev) => {
            const level_ids = prev.level_ids ?? [];
            const alreadySelected = level_ids.includes(levelId);
            return {
                ...prev,
                level_ids: alreadySelected
                    ? level_ids.filter((id) => id !== levelId)
                    : [...level_ids, levelId],
            };
        });
    };

    const handleTagChange = (tagValue: string) => {
        setSelectedFilters((prev) => {
            const tag = prev.tag ?? [];
            const alreadySelected = tag.includes(tagValue);
            return {
                ...prev,
                tag: alreadySelected ? tag.filter((t) => t !== tagValue) : [...tag, tagValue],
            };
        });
    };

    const handleUserChange = (userId: string) => {
        setSelectedFilters((prev) => {
            const faculty_ids = prev.faculty_ids ?? [];
            const alreadySelected = faculty_ids.includes(userId);
            return {
                ...prev,
                faculty_ids: alreadySelected
                    ? faculty_ids.filter((id) => id !== userId)
                    : [...faculty_ids, userId],
            };
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e?.target?.value ?? '';
        setSearchValue(value);
        // Do NOT update selectedFilters here to avoid triggering API on every keystroke
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e?.key ?? '') === 'Enter') {
            // Only update selectedFilters (which triggers API) when Enter is pressed
            setSelectedFilters((prev) => ({ ...prev, search_by_name: searchValue }));
        }
    };

    const handleClearAll = () => {
        setSelectedFilters({
            status: ['ACTIVE'],
            level_ids: [],
            tag: [],
            faculty_ids: [],
            search_by_name: '',
            min_percentage_completed: 0,
            max_percentage_completed: 0,
            sort_columns: { created_at: 'DESC' },
        });
        setSearchValue('');
    };

    const handleApply = () => {
        // No need to manually fetch, just update filters
        setSelectedFilters((prev) => ({ ...prev }));
    };

    const handleCourseDelete = (courseId: string) => {
        if (deleteCourseMutation && toast) {
            setDeletingCourseId(courseId);
            deleteCourseMutation.mutate(courseId, {
                onSuccess: () => {
                    toast.success('Course deleted successfully');
                    handlePageChange(page);
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
        }
    };

    useEffect(() => {
        setNavHeading(`Explore ${getTerminology(ContentTerms.Course, SystemTerms.Course) + 's'}`);
    }, []);

    // Update sort_columns in selectedFilters when sortBy changes and call handleGetCourses after update
    useEffect(() => {
        setSelectedFilters((prev) => {
            const newSortColumns =
                sortBy === 'newest'
                    ? { created_at: 'ASC' as const }
                    : { created_at: 'DESC' as const };
            if (JSON.stringify(prev.sort_columns) !== JSON.stringify(newSortColumns)) {
                return { ...prev, sort_columns: newSortColumns };
            }
            return prev;
        });
    }, [sortBy]);

    useEffect(() => {
        if (tokenData && tokenData.authorities && instituteDetails?.id) {
            setRoles(tokenData.authorities[instituteDetails.id]?.roles ?? []);
        } else {
            setRoles([]);
        }
    }, [instituteDetails?.id]);

    const { getPublicUrl } = useFileUpload();
    const [courseImageUrls, setCourseImageUrls] = useState<Record<string, string>>({});

    // Store refs to prevent stale closures
    const selectedFiltersRef = useRef(selectedFilters);
    useEffect(() => {
        selectedFiltersRef.current = selectedFilters;
    }, [selectedFilters]);

    const pageRef = useRef(page);
    useEffect(() => {
        pageRef.current = page;
    }, [page]);
    // Fetch all tabs data in parallel

    useEffect(() => {
        if (!instituteDetails?.id) return;
        setLoading({
            allCourses: true,
            authoredCourses: true,
            authoredCoursesSimple: true,
            courseInReview: true,
        });

        const safeRoles = Array.isArray(roles) ? roles : [];
        const isAdmin = safeRoles.includes('ADMIN');

        // AllCourses - always fetch for both admin and non-admin
        getAllCoursesWithFilters(
            pageRef.current,
            10,
            instituteDetails.id,
            selectedFiltersRef.current
        )
            .then((data) => setAllCoursesData(data))
            .finally(() => setLoading((l) => ({ ...l, allCourses: false })));

        // AuthoredCoursesSimple - fetch user's own courses using my-courses API (ACTIVE and DRAFT only)
        getMyAuthoredCourses(pageRef.current, 10, ['ACTIVE', 'DRAFT'])
            .then((data) => setAuthoredCoursesSimpleData(data))
            .finally(() => setLoading((l) => ({ ...l, authoredCoursesSimple: false })));

        if (isAdmin) {
            // Admin users - also fetch legacy authored courses data (for backward compatibility if needed)
            const authoredFilters = {
                ...selectedFiltersRef.current,
                faculty_ids: tokenData?.user ? [tokenData.user] : [],
            };
            getAllCoursesWithFilters(pageRef.current, 10, instituteDetails.id, authoredFilters)
                .then((data) => setAuthoredCoursesData(data))
                .finally(() => setLoading((l) => ({ ...l, authoredCourses: false })));

            // Mark courseInReview as loaded since admins don't need it
            setLoading((l) => ({ ...l, courseInReview: false }));
        } else {
            // Non-admin users - fetch CourseInReview data (IN_REVIEW courses by user)
            getMyAuthoredCourses(pageRef.current, 10, ['IN_REVIEW'])
                .then((data) => setCourseInReviewData(data))
                .finally(() => setLoading((l) => ({ ...l, courseInReview: false })));

            // Mark admin-only data as loaded since non-admins don't need them
            setLoading((l) => ({ ...l, authoredCourses: false }));
        }
    }, [instituteDetails?.id, page, JSON.stringify(selectedFilters), roles]);

    // Helper to get available tabs
    const availableTabs = useMemo(() => {
        const safeRoles = Array.isArray(roles) ? roles : [];
        const isAdmin = safeRoles.includes('ADMIN');

        if (isAdmin) {
            // Admin users see simplified tabs
            const tabs: { key: string; label: string; show: boolean }[] = [
                {
                    key: 'AllCourses',
                    label: `All ${getTerminology(ContentTerms.Course, SystemTerms.Course)}s`,
                    show: true,
                },
                {
                    key: 'AuthoredCoursesSimple',
                    label: `Authored ${getTerminology(ContentTerms.Course, SystemTerms.Course)}s`,
                    show: true,
                },
                {
                    key: 'AdminApproval',
                    label: `${getTerminology(ContentTerms.Course, SystemTerms.Course)} Approval`,
                    show: true,
                },
            ];
            return tabs.filter((t) => t.show);
        } else {
            // Non-admin users see simplified tabs
            const tabs: { key: string; label: string; show: boolean }[] = [
                {
                    key: 'AuthoredCoursesSimple',
                    label: `Authored ${getTerminology(ContentTerms.Course, SystemTerms.Course)}s`,
                    show:
                        safeRoles.includes('TEACHER') ||
                        safeRoles.includes('COURSE CREATOR') ||
                        safeRoles.includes('ASSESSMENT CREATOR') ||
                        safeRoles.includes('EVALUATOR'),
                },
                {
                    key: 'AllCourses',
                    label: `All ${getTerminology(ContentTerms.Course, SystemTerms.Course)}s`,
                    show: true,
                },
                {
                    key: 'CourseInReview',
                    label: `${getTerminology(ContentTerms.Course, SystemTerms.Course)} In Review`,
                    show:
                        safeRoles.includes('TEACHER') ||
                        safeRoles.includes('COURSE CREATOR') ||
                        safeRoles.includes('ASSESSMENT CREATOR') ||
                        safeRoles.includes('EVALUATOR'),
                },
            ];
            return tabs.filter((t) => t.show);
        }
    }, [roles]);
    // If current tab is not available, switch to first available
    useEffect(() => {
        if (
            !availableTabs.find((t) => t.key === selectedTab) &&
            availableTabs.length > 0 &&
            availableTabs[0]
        ) {
            setSelectedTab(availableTabs[0]?.key);
        }
    }, [availableTabs, selectedTab]);
    // Use correct data for CourseListPage
    const getCourseData = () => {
        if (selectedTab === 'AllCourses') return allCoursesData;
        if (selectedTab === 'AuthoredCourses') return authoredCoursesData;
        if (selectedTab === 'CourseInReview') return courseInReviewData;
        return null;
    };
    // Fetch public URLs for course images when current tab data changes
    useEffect(() => {
        const fetchImages = async () => {
            const data = getCourseData();
            const contentArr: CourseItem[] = Array.isArray(data?.content)
                ? data?.content?.filter((course): course is CourseItem => !!course) ?? []
                : [];
            const urlPromises = contentArr?.map(async (course) => {
                const { id = '', course_preview_image_media_id = '' } = course;
                if (course_preview_image_media_id) {
                    const url = await getPublicUrl(course_preview_image_media_id);
                    return { id, url };
                }
                if (id) {
                    return { id, url: '' };
                }
                return { id: '', url: '' };
            });
            const results = await Promise.all(urlPromises);
            const urlMap: Record<string, string> = {};
            results.forEach(({ id, url }) => {
                if (id) urlMap[id] = url || '';
            });
            setCourseImageUrls(urlMap);
        };
        fetchImages();
    }, [allCoursesData, authoredCoursesData, courseInReviewData, selectedTab]);

    if (
        isUsersLoading ||
        loading.allCourses ||
        loading.authoredCourses ||
        loading.authoredCoursesSimple ||
        loading.courseInReview ||
        !instituteDetails?.id
    ) {
        return <DashboardLoader />;
    }

    if (availableTabs.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center py-20">
                <div className="mb-2 text-2xl font-semibold">
                    No {getTerminology(ContentTerms.Course, SystemTerms.Course)}s found
                </div>
                <div className="mb-4 text-gray-500">
                    Try adding a new {getTerminology(ContentTerms.Course, SystemTerms.Course)}.
                </div>
                <AddCourseButton />
            </div>
        );
    }

    return (
        <div className="relative flex w-full flex-col gap-8 text-neutral-600">
            <div className="flex flex-col items-end gap-4">
                <AddCourseButton />
            </div>
            <div className="flex items-center gap-8">
                <div className="flex flex-col gap-2">
                    <div className="text-h3 font-semibold">
                        Explore {getTerminology(ContentTerms.Course, SystemTerms.Course)}s
                    </div>
                    <div className="text-subtitle">
                        Effortlessly organize, upload, and track educational resources in one place.
                        Provide students with easy access to the materials they need to succeed,
                        ensuring a seamless learning experience.
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <CourseCatalog />
                </div>
            </div>

            {/* Add Tabs Section Here */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="inline-flex h-auto w-full justify-start gap-4 rounded-none border-b !bg-transparent p-0">
                    {availableTabs.map((tab) => (
                        <TabsTrigger
                            key={tab.key}
                            value={tab.key}
                            className={`-mb-px rounded-none border-b-2 text-sm font-semibold !shadow-none
                                ${selectedTab === tab.key ? 'border-primary-500 !text-primary-500' : 'border-transparent text-gray-500'}`}
                        >
                            <span className={selectedTab === tab.key ? 'text-primary-500' : ''}>
                                {tab.label}
                            </span>
                        </TabsTrigger>
                    ))}
                </TabsList>
                {availableTabs.map((tab) => (
                    <TabsContent key={tab.key} value={tab.key}>
                        {(() => {
                            // Handle new approval workflow tabs
                            if (tab.key === 'TeacherCourses') {
                                return <TeacherCoursesList />;
                            }

                            if (tab.key === 'AdminApproval') {
                                return <AdminApprovalDashboard />;
                            }

                            // Handle new non-admin tabs
                            if (tab.key === 'AuthoredCoursesSimple') {
                                return (
                                    <AuthoredCoursesSimpleTab
                                        data={authoredCoursesSimpleData}
                                        courseImageUrls={courseImageUrls}
                                    />
                                );
                            }

                            if (tab.key === 'CourseInReview') {
                                return <CourseInReviewTab data={courseInReviewData} />;
                            }

                            // Handle existing tabs
                            const data =
                                tab.key === 'AllCourses'
                                    ? allCoursesData
                                    : tab.key === 'AuthoredCourses'
                                      ? authoredCoursesData
                                      : null;
                            if (!data || !data.content || data.content.length === 0) {
                                return (
                                    <div className="flex h-40 flex-col items-center justify-center text-gray-500">
                                        No{' '}
                                        {getTerminology(
                                            ContentTerms.Course,
                                            SystemTerms.Course
                                        ).toLocaleLowerCase()}
                                        s found for this tab.
                                    </div>
                                );
                            }
                            return (
                                <CourseListPage
                                    selectedFilters={selectedFilters}
                                    setSelectedFilters={setSelectedFilters}
                                    handleClearAll={handleClearAll}
                                    handleApply={handleApply}
                                    levels={levels}
                                    handleLevelChange={handleLevelChange}
                                    tags={tags}
                                    accessControlUsers={accessControlUsers}
                                    handleUserChange={handleUserChange}
                                    handleTagChange={handleTagChange}
                                    searchValue={searchValue}
                                    setSearchValue={setSearchValue}
                                    handleSearchChange={handleSearchChange}
                                    handleSearchKeyDown={handleSearchKeyDown}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    allCourses={data}
                                    courseImageUrls={courseImageUrls}
                                    handleCourseDelete={handleCourseDelete}
                                    page={page}
                                    handlePageChange={handlePageChange}
                                    deletingCourseId={deletingCourseId}
                                />
                            );
                        })()}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};
