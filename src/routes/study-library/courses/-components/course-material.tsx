import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState, useMemo } from 'react';
import { AddCourseButton } from '@/components/common/study-library/add-course/add-course-button';
import useIntroJsTour from '@/hooks/use-intro';
import { StudyLibraryIntroKey } from '@/constants/storage/introKey';
import { studyLibrarySteps } from '@/constants/intro/steps';
import { CourseCatalog } from '@/svgs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MyButton } from '@/components/design-system/button';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { StarRatingComponent } from '@/components/common/star-rating-component';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import type { LevelType } from '@/schemas/student/student-list/institute-schema';
import { handleGetInstituteUsersForAccessControl } from '@/routes/dashboard/-services/dashboard-services';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import type { UserRolesDataEntry } from '@/types/dashboard/user-roles';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { MyPagination } from '@/components/design-system/pagination';
import {
    getAllCoursesWithFilters,
    getAllTeacherCoursesWithFilters,
} from '../-services/courses-services';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useNavigate } from '@tanstack/react-router';
import { useDeleteCourse } from '@/services/study-library/course-operations/delete-course';
import { toast } from 'sonner';
import { TrashSimple } from 'phosphor-react';

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
interface CourseInstructor {
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

interface CourseItem {
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
    percentage_completed: number;
    rating: number;
    package_session_id: string;
    level_id: string;
    level_name: string;
    instructors: CourseInstructor[];
}

interface AllCoursesApiResponse {
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

export const CourseMaterial = () => {
    const deleteCourseMutation = useDeleteCourse();
    const { instituteDetails } = useInstituteDetailsStore();
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const [roles, setRoles] = useState<string[] | undefined>([]);
    const [allCourses, setAllCourses] = useState<AllCoursesApiResponse | null>(null);
    const [page, setPage] = useState(0);

    const { data: accessControlUsers, isLoading: isUsersLoading } = useSuspenseQuery(
        handleGetInstituteUsersForAccessControl(instituteDetails?.id, {
            roles: [{ id: '5', name: 'TEACHER' }],
            status: [{ id: '1', name: 'ACTIVE' }],
        })
    );

    const { setNavHeading } = useNavHeadingStore();
    const [selectedTab, setSelectedTab] = useState('AllCourses');
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
            setAllCourses(data);
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
            setAllCourses(data);
        },
        onError: (error: unknown) => {
            throw error;
        },
    });

    const handleGetTeacherCourses = () => {
        getAllTeacherCoursesMutation.mutate({
            page: page,
            pageSize: 10,
            instituteId: instituteDetails?.id,
            data: selectedFilters,
        });
    };

    const handleGetCourses = () => {
        getAllCoursesMutation.mutate({
            page: page,
            pageSize: 10,
            instituteId: instituteDetails?.id,
            data: {
                ...selectedFilters,
                faculty_ids:
                    selectedTab === 'AuthoredCourses' && tokenData?.user
                        ? [...selectedFilters.faculty_ids, tokenData.user]
                        : selectedFilters.faculty_ids,
            },
        });
    };

    useIntroJsTour({
        key: StudyLibraryIntroKey.createCourseStep,
        steps: studyLibrarySteps.createCourseStep,
        partial: true,
    });

    const handleTabChange = (value: string) => {
        setSelectedTab(value);
    };

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

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        if (selectedTab === 'CourseRequests') {
            getAllTeacherCoursesMutation.mutate({
                page: newPage,
                pageSize: 10,
                instituteId: instituteDetails?.id,
                data: selectedFilters,
            });
        } else {
            getAllCoursesMutation.mutate({
                page: newPage,
                pageSize: 10,
                instituteId: instituteDetails?.id,
                data: {
                    ...selectedFilters,
                    faculty_ids:
                        selectedTab === 'AuthoredCourses' && tokenData?.user
                            ? [tokenData.user]
                            : selectedFilters.faculty_ids,
                },
            });
        }
    };

    const handleLevelChange = (levelId: string) => {
        setSelectedFilters((prev) => {
            const alreadySelected = prev.level_ids.includes(levelId);
            return {
                ...prev,
                level_ids: alreadySelected
                    ? prev.level_ids.filter((id) => id !== levelId)
                    : [...prev.level_ids, levelId],
            };
        });
    };

    const handleTagChange = (tagValue: string) => {
        setSelectedFilters((prev) => {
            const alreadySelected = prev.tag.includes(tagValue);
            return {
                ...prev,
                tag: alreadySelected
                    ? prev.tag.filter((t) => t !== tagValue)
                    : [...prev.tag, tagValue],
            };
        });
    };

    const handleUserChange = (userId: string) => {
        setSelectedFilters((prev) => {
            const alreadySelected = prev.faculty_ids.includes(userId);
            return {
                ...prev,
                faculty_ids: alreadySelected
                    ? prev.faculty_ids.filter((id) => id !== userId)
                    : [...prev.faculty_ids, userId],
            };
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        setSelectedFilters((prev) => ({ ...prev, search_by_name: value }));
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (selectedTab === 'CourseRequests') {
                handleGetTeacherCourses();
            } else {
                handleGetCourses();
            }
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
        if (selectedTab === 'CourseRequests') {
            getAllTeacherCoursesMutation.mutate({
                page: page,
                pageSize: 10,
                instituteId: instituteDetails?.id,
                data: {
                    status: ['ACTIVE'],
                    level_ids: [],
                    tag: [],
                    faculty_ids: [],
                    search_by_name: '',
                    min_percentage_completed: 0,
                    max_percentage_completed: 0,
                    sort_columns: { created_at: 'DESC' },
                },
            });
        } else {
            getAllCoursesMutation.mutate({
                page: page,
                pageSize: 10,
                instituteId: instituteDetails?.id,
                data: {
                    status: ['ACTIVE'],
                    level_ids: [],
                    tag: [],
                    faculty_ids: [],
                    search_by_name: '',
                    min_percentage_completed: 0,
                    max_percentage_completed: 0,
                    sort_columns: { created_at: 'DESC' },
                },
            });
        }
    };

    const handleApply = () => {
        if (selectedTab === 'CourseRequests') {
            handleGetTeacherCourses();
        } else {
            handleGetCourses();
        }
    };

    const handleCourseDelete = (courseId: string) => {
        deleteCourseMutation.mutate(courseId, {
            onSuccess: () => {
                toast.success('Course deleted successfully');
                handleGetCourses();
                handleGetTeacherCourses();
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to delete course');
            },
        });
    };

    useEffect(() => {
        setNavHeading('Explore Courses');
    }, []);

    // Update sort_columns in selectedFilters when sortBy changes and call handleGetCourses after update
    useEffect(() => {
        setSelectedFilters((prev) => {
            const newSortColumns =
                sortBy === 'newest'
                    ? { created_at: 'ASC' as const }
                    : { created_at: 'DESC' as const };
            if (JSON.stringify(prev.sort_columns) !== JSON.stringify(newSortColumns)) {
                const updated = { ...prev, sort_columns: newSortColumns };
                setTimeout(() => {
                    if (selectedTab === 'CourseRequests') {
                        handleGetTeacherCourses();
                    } else {
                        handleGetCourses();
                    }
                }, 0);
                return updated;
            }
            return prev;
        });
    }, [sortBy]);

    useEffect(() => {
        if (tokenData && instituteDetails?.id) {
            setRoles(tokenData.authorities[instituteDetails?.id]?.roles);
        }
    }, []);

    // Call handleGetCourses when selectedTab changes
    useEffect(() => {
        if (selectedTab === 'CourseRequests') {
            handleGetTeacherCourses();
        } else {
            handleGetCourses();
        }
    }, [selectedTab, instituteDetails?.id]);

    const { getPublicUrl } = useFileUpload();
    const [courseImageUrls, setCourseImageUrls] = useState<Record<string, string>>({});

    // Fetch public URLs for course images when allCourses.content changes
    useEffect(() => {
        const fetchImages = async () => {
            if (allCourses && Array.isArray(allCourses.content)) {
                const urlPromises = allCourses.content.map(async (course) => {
                    if (course.course_preview_image_media_id) {
                        const url = await getPublicUrl(course.course_preview_image_media_id);
                        return { id: course.id, url };
                    }
                    return { id: course.id, url: '' };
                });
                const results = await Promise.all(urlPromises);
                const urlMap: Record<string, string> = {};
                results.forEach(({ id, url }) => {
                    urlMap[id] = url;
                });
                setCourseImageUrls(urlMap);
            }
        };
        fetchImages();
    }, [allCourses]);

    const navigate = useNavigate();

    if (
        isUsersLoading ||
        !allCourses ||
        !instituteDetails?.id ||
        getAllCoursesMutation.status === 'pending'
    )
        return <DashboardLoader />;

    return (
        <div className="relative flex w-full flex-col gap-8 text-neutral-600">
            <div className="flex flex-col items-end gap-4">
                <AddCourseButton />
            </div>
            <div className="flex items-center gap-8">
                <div className="flex flex-col gap-2">
                    <div className="text-h3 font-semibold">Explore Courses</div>
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
            <Tabs value={selectedTab} onValueChange={handleTabChange}>
                <TabsList className="inline-flex h-auto justify-start gap-4 rounded-none border-b !bg-transparent p-0">
                    <TabsTrigger
                        value="AllCourses"
                        className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                            selectedTab === 'AllCourses'
                                ? 'border-4px rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50'
                                : 'border-none bg-transparent'
                        }`}
                    >
                        <span
                            className={`${selectedTab === 'AllCourses' ? 'text-primary-500' : ''}`}
                        >
                            All Courses
                        </span>
                    </TabsTrigger>
                    {/* Conditionally render tabs based on roles */}
                    {roles?.includes('ADMIN') && (
                        <>
                            <TabsTrigger
                                value="AuthoredCourses"
                                className={`inline-flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                    selectedTab === 'AuthoredCourses'
                                        ? 'rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50'
                                        : 'border-none bg-transparent'
                                }`}
                            >
                                <span
                                    className={`${selectedTab === 'AuthoredCourses' ? 'text-primary-500' : ''}`}
                                >
                                    Authored Courses
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="CourseRequests"
                                className={`inline-flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                    selectedTab === 'CourseRequests'
                                        ? 'rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50'
                                        : 'border-none bg-transparent'
                                }`}
                            >
                                <span
                                    className={`${selectedTab === 'CourseRequests' ? 'text-primary-500' : ''}`}
                                >
                                    Course Requests
                                </span>
                            </TabsTrigger>
                        </>
                    )}
                    {roles?.includes('TEACHER') && !roles?.includes('ADMIN') && (
                        <TabsTrigger
                            value="AuthoredCourses"
                            className={`inline-flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
                                selectedTab === 'AuthoredCourses'
                                    ? 'rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50'
                                    : 'border-none bg-transparent'
                            }`}
                        >
                            <span
                                className={`${selectedTab === 'AuthoredCourses' ? 'text-primary-500' : ''}`}
                            >
                                Authored Courses
                            </span>
                        </TabsTrigger>
                    )}
                </TabsList>
                <TabsContent value={selectedTab}>
                    <div className="mt-6 flex w-full gap-6">
                        {/* Filter Section */}
                        <div className="animate-fade-in flex h-fit min-w-[240px] max-w-[260px] flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                            <div className="mb-2 flex items-center justify-between">
                                <div className="text-base font-semibold">Filters</div>
                                {(selectedFilters.level_ids.length > 0 ||
                                    selectedFilters.tag.length > 0 ||
                                    selectedFilters.faculty_ids.length > 0) && (
                                    <div className="flex gap-2">
                                        <button
                                            className="text-xs font-medium text-primary-500 transition-transform hover:underline active:scale-95"
                                            onClick={handleClearAll}
                                        >
                                            Clear All
                                        </button>
                                        <button
                                            className="hover:bg-primary-600 rounded bg-primary-500 px-3 py-1 text-xs font-medium text-white transition-transform active:scale-95"
                                            onClick={handleApply}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="mb-1 text-sm font-semibold">Levels</div>
                            <div className="flex flex-col gap-2">
                                {levels.map((level) => (
                                    <label
                                        key={level.id}
                                        className="group flex cursor-pointer items-center gap-2"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedFilters.level_ids.includes(level.id)}
                                            onChange={() => handleLevelChange(level.id)}
                                            className="scale-110 accent-primary-500 transition-transform"
                                        />
                                        <span className="transition-colors group-hover:text-primary-500">
                                            {level.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {/* Tags Section */}
                            {tags.length > 0 && (
                                <>
                                    <div className="mb-1 mt-4 text-sm font-semibold">Tags</div>
                                    <div className="flex flex-col gap-2">
                                        {tags.map((tagValue: string) => (
                                            <label
                                                key={tagValue}
                                                className="group flex cursor-pointer items-center gap-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFilters.tag.includes(tagValue)}
                                                    onChange={() => handleTagChange(tagValue)}
                                                    className="scale-110 accent-primary-500 transition-transform"
                                                />
                                                <span className="transition-colors group-hover:text-primary-500">
                                                    {tagValue}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}
                            {/* Users Section */}
                            {Array.isArray(accessControlUsers) && accessControlUsers.length > 0 && (
                                <>
                                    <div className="mb-1 mt-4 text-sm font-semibold">
                                        Instructors
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {(accessControlUsers as UserRolesDataEntry[]).map(
                                            (user) => (
                                                <label
                                                    key={user.id}
                                                    className="group flex cursor-pointer items-center gap-2"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFilters.faculty_ids.includes(
                                                            user.id
                                                        )}
                                                        onChange={() => handleUserChange(user.id)}
                                                        className="scale-110 accent-primary-500 transition-transform"
                                                    />
                                                    <span className="transition-colors group-hover:text-primary-500">
                                                        {user.full_name}
                                                    </span>
                                                </label>
                                            )
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        {/* Courses Section */}
                        <div className="animate-fade-in flex flex-1 flex-col gap-4">
                            <div className="mb-2 flex w-full items-center justify-between gap-4">
                                {/* Search Bar */}
                                <div className="relative max-w-xs flex-1">
                                    {/* Search Icon */}
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                        <svg
                                            width="18"
                                            height="18"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                                            />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={searchValue}
                                        onChange={handleSearchChange}
                                        onKeyDown={handleSearchKeyDown}
                                        placeholder="Search courses..."
                                        className="w-full rounded-md border border-neutral-200 px-9 py-2 text-sm shadow-sm transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                                    />
                                    {/* Cross Button (visible only if searchValue) */}
                                    {searchValue && (
                                        <button
                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 transition-transform active:scale-95"
                                            aria-label="Clear search"
                                            onClick={() => {
                                                setSearchValue('');
                                                setSelectedFilters((prev) => ({
                                                    ...prev,
                                                    search_by_name: '',
                                                }));
                                            }}
                                            type="button"
                                        >
                                            <svg
                                                width="18"
                                                height="18"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                {/* Sort By */}
                                <div className="flex min-w-[180px] items-center justify-end gap-2">
                                    <span className="text-sm font-medium text-neutral-600">
                                        Sort by
                                    </span>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[110px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="oldest">Oldest</SelectItem>
                                            <SelectItem value="newest">Newest</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {Array.isArray(allCourses?.content) &&
                                allCourses.content.length > 0 ? (
                                    allCourses.content.map((course) => {
                                        const instructors = course.instructors || [];
                                        const tags = course.comma_separeted_tags
                                            ? course.comma_separeted_tags
                                                  .split(',')
                                                  .map((t) => t.trim())
                                            : [];
                                        return (
                                            <div
                                                key={course.id}
                                                className={`animate-fade-in group relative flex flex-col rounded-lg border border-neutral-200 bg-white p-0 shadow-sm transition-transform duration-500 hover:scale-[1.025] hover:shadow-md`}
                                            >
                                                {/* Course Banner Image */}
                                                <div className="flex size-full w-full items-center justify-center overflow-hidden rounded-lg px-3 pb-0 pt-4">
                                                    <img
                                                        src={
                                                            courseImageUrls[course.id] ||
                                                            course.thumbnail_file_id ||
                                                            'https://images.pexels.com/photos/31530661/pexels-photo-31530661.jpeg'
                                                        }
                                                        alt={course.package_name}
                                                        className="object-fit rounded-lg bg-white p-2 transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1 p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-lg font-extrabold text-neutral-800">
                                                            {course.package_name}
                                                        </div>
                                                        <div
                                                            className={`rounded-lg bg-gray-100 p-1 px-2 text-xs font-semibold text-gray-700`}
                                                        >
                                                            {course.level_name || 'Level'}
                                                        </div>
                                                    </div>
                                                    {/* Description section */}
                                                    <div
                                                        className={
                                                            (
                                                                course.course_html_description_html ||
                                                                ''
                                                            )
                                                                .replace(/<[^>]*>/g, '')
                                                                .slice(0, 120).length > 0
                                                                ? 'mt-2 text-sm text-neutral-600'
                                                                : 'text-sm text-neutral-600'
                                                        }
                                                    >
                                                        {(course.course_html_description_html || '')
                                                            .replace(/<[^>]*>/g, '')
                                                            .slice(0, 120)}
                                                    </div>
                                                    {/* Instructors section */}
                                                    <div
                                                        className={
                                                            instructors && instructors.length > 0
                                                                ? 'mt-2 flex items-center gap-2'
                                                                : 'flex items-center gap-2'
                                                        }
                                                    >
                                                        {instructors?.map((inst) => (
                                                            <img
                                                                key={inst.id}
                                                                src={
                                                                    inst.profile_pic_file_id ||
                                                                    'https://randomuser.me/api/portraits/lego/1.jpg'
                                                                }
                                                                alt={inst.full_name}
                                                                className="-ml-2 size-7 rounded-full border border-neutral-200 object-cover first:ml-0"
                                                            />
                                                        ))}
                                                        <span className="ml-2 text-xs text-neutral-600">
                                                            {instructors
                                                                ?.map((inst) => inst.full_name)
                                                                .join(', ')}
                                                        </span>
                                                    </div>
                                                    {/* Tags section */}
                                                    <div
                                                        className={
                                                            tags && tags.length > 0
                                                                ? 'mt-2 flex flex-wrap gap-2'
                                                                : 'flex flex-wrap gap-2'
                                                        }
                                                    >
                                                        {tags?.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {/* Rating section */}
                                                    <div
                                                        className={
                                                            tags && tags.length > 0
                                                                ? 'my-2 -mb-2 flex items-center gap-2'
                                                                : '-mb-2 flex items-center gap-2'
                                                        }
                                                    >
                                                        <StarRatingComponent
                                                            score={course.rating * 20}
                                                            maxScore={100}
                                                        />
                                                        <span className="text-neutral-500">
                                                            {(course.rating || 0).toFixed(1)}
                                                        </span>
                                                    </div>
                                                    {/* View Course Button */}
                                                    <div className="mt-4 flex gap-2">
                                                        <MyButton
                                                            className="flex-1"
                                                            buttonType="primary"
                                                            onClick={() =>
                                                                navigate({
                                                                    to: `/study-library/courses/course-details?courseId=${course.id}`,
                                                                })
                                                            }
                                                        >
                                                            View Course
                                                        </MyButton>
                                                        <button
                                                            onClick={() =>
                                                                handleCourseDelete(course.id)
                                                            }
                                                            className="flex size-9 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-500 transition-colors hover:border-red-300 hover:bg-red-100 active:scale-95"
                                                            title="Delete course"
                                                        >
                                                            <TrashSimple size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-2 text-center text-neutral-400">
                                        No courses found.
                                    </div>
                                )}
                            </div>
                            <MyPagination
                                currentPage={page}
                                totalPages={allCourses?.totalPages || 0}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
