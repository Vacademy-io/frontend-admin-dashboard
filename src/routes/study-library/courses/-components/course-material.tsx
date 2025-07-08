import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState, useMemo } from 'react';
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
} from '../-services/courses-services';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useDeleteCourse } from '@/services/study-library/course-operations/delete-course';
import { toast } from 'sonner';
import CourseListPage from './course-list-page';

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
    percentage_completed: number;
    rating: number;
    package_session_id: string;
    level_id: string;
    level_name: string;
    instructors: CourseInstructor[];
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
            roles: [
                { id: '1', name: 'ADMIN' },
                { id: '5', name: 'TEACHER' },
            ],
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
                if (selectedTab === 'CourseRequests') {
                    handleGetTeacherCourses();
                } else {
                    handleGetCourses();
                }
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
                <TabsList className="inline-flex h-auto w-full justify-start gap-4 rounded-none border-b !bg-transparent p-0">
                    <TabsTrigger
                        value="AllCourses"
                        className={`-mb-px rounded-none border-b-2 text-sm font-semibold !shadow-none
                            ${selectedTab === 'AllCourses' ? 'border-primary-500 !text-primary-500' : 'border-transparent text-gray-500'}`}
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
                                className={`-mb-px rounded-none border-b-2 text-sm font-semibold !shadow-none
                                    ${selectedTab === 'AuthoredCourses' ? 'border-primary-500 !text-primary-500' : 'border-transparent text-gray-500'}`}
                            >
                                <span
                                    className={`${selectedTab === 'AuthoredCourses' ? 'text-primary-500' : ''}`}
                                >
                                    Authored Courses
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="CourseRequests"
                                className={`-mb-px rounded-none border-b-2 text-sm font-semibold !shadow-none
                                    ${selectedTab === 'CourseRequests' ? 'border-primary-500 !text-primary-500' : 'border-transparent text-gray-500'}`}
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
                            className={`-mb-px rounded-none border-b-2 text-sm font-semibold !shadow-none
                                ${selectedTab === 'AuthoredCourses' ? 'border-primary-500 !text-primary-500' : 'border-transparent text-gray-500'}`}
                        >
                            <span
                                className={`${selectedTab === 'AuthoredCourses' ? 'text-primary-500' : ''}`}
                            >
                                Authored Courses
                            </span>
                        </TabsTrigger>
                    )}
                </TabsList>
                <TabsContent value="AllCourses">
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
                        allCourses={allCourses}
                        courseImageUrls={courseImageUrls}
                        handleCourseDelete={handleCourseDelete}
                        page={page}
                        handlePageChange={handlePageChange}
                    />
                </TabsContent>
                {roles?.includes('ADMIN') && (
                    <TabsContent value="AuthoredCourses">
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
                            allCourses={allCourses}
                            courseImageUrls={courseImageUrls}
                            handleCourseDelete={handleCourseDelete}
                            page={page}
                            handlePageChange={handlePageChange}
                        />
                    </TabsContent>
                )}
                {roles?.includes('TEACHER') && !roles?.includes('ADMIN') && (
                    <TabsContent value="CourseRequests">
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
                            allCourses={allCourses}
                            courseImageUrls={courseImageUrls}
                            handleCourseDelete={handleCourseDelete}
                            page={page}
                            handlePageChange={handlePageChange}
                        />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};
