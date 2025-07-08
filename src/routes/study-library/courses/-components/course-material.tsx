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
    const [allCoursesData, setAllCoursesData] = useState<AllCoursesApiResponse | null>(null);
    const [authoredCoursesData, setAuthoredCoursesData] = useState<AllCoursesApiResponse | null>(
        null
    );
    const [courseRequestsData, setCourseRequestsData] = useState<AllCoursesApiResponse | null>(
        null
    );
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState({
        allCourses: true,
        authoredCourses: true,
        courseRequests: true,
    });

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
            deleteCourseMutation.mutate(courseId, {
                onSuccess: () => {
                    toast.success('Course deleted successfully');
                },
                onError: (error: unknown) => {
                    const errMsg =
                        error && typeof error === 'object' && 'message' in error
                            ? (error as { message?: string }).message
                            : undefined;
                    toast.error(errMsg || 'Failed to delete course');
                },
            });
        }
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
    }, [tokenData, instituteDetails?.id]);

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
        setLoading({ allCourses: true, authoredCourses: true, courseRequests: true });
        // AllCourses
        getAllCoursesWithFilters(
            pageRef.current,
            10,
            instituteDetails.id,
            selectedFiltersRef.current
        )
            .then((data) => setAllCoursesData(data))
            .finally(() => setLoading((l) => ({ ...l, allCourses: false })));
        // AuthoredCourses
        const authoredFilters = {
            ...selectedFiltersRef.current,
            faculty_ids: tokenData?.user ? [tokenData.user] : [],
        };
        getAllCoursesWithFilters(pageRef.current, 10, instituteDetails.id, authoredFilters)
            .then((data) => setAuthoredCoursesData(data))
            .finally(() => setLoading((l) => ({ ...l, authoredCourses: false })));
        // CourseRequests
        getAllTeacherCoursesWithFilters(
            pageRef.current,
            10,
            instituteDetails.id,
            selectedFiltersRef.current
        )
            .then((data) => setCourseRequestsData(data))
            .finally(() => setLoading((l) => ({ ...l, courseRequests: false })));
    }, [instituteDetails?.id, page, JSON.stringify(selectedFilters)]);
    // Helper to get available tabs
    const availableTabs = useMemo(() => {
        const safeRoles = Array.isArray(roles) ? roles : [];
        const tabs: { key: string; label: string; show: boolean }[] = [
            {
                key: 'AllCourses',
                label: 'All Courses',
                show: (allCoursesData?.content?.length ?? 0) > 0,
            },
            {
                key: 'AuthoredCourses',
                label: 'Authored Courses',
                show:
                    safeRoles.includes('ADMIN') && (authoredCoursesData?.content?.length ?? 0) > 0,
            },
            {
                key: 'CourseRequests',
                label: 'Course Requests',
                show: safeRoles.includes('ADMIN') && (courseRequestsData?.content?.length ?? 0) > 0,
            },
        ];
        if (safeRoles.includes('TEACHER') && !safeRoles.includes('ADMIN') && tabs[1] && tabs[2]) {
            tabs[1].show = (authoredCoursesData?.content?.length ?? 0) > 0;
            tabs[2].show = (courseRequestsData?.content?.length ?? 0) > 0;
        }
        return tabs.filter((t) => t.show);
    }, [roles, allCoursesData, authoredCoursesData, courseRequestsData]);
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
    const getCurrentTabData = () => {
        if (selectedTab === 'AllCourses') return allCoursesData;
        if (selectedTab === 'AuthoredCourses') return authoredCoursesData;
        if (selectedTab === 'CourseRequests') return courseRequestsData;
        return null;
    };
    // Fetch public URLs for course images when current tab data changes
    useEffect(() => {
        const fetchImages = async () => {
            const data = getCurrentTabData();
            const contentArr: CourseItem[] = Array.isArray(data?.content)
                ? data.content.filter((course): course is CourseItem => !!course)
                : [];
            const urlPromises = contentArr.map(async (course) => {
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
                if (id) urlMap[id] = url;
            });
            setCourseImageUrls(urlMap);
        };
        fetchImages();
    }, [allCoursesData, authoredCoursesData, courseRequestsData, selectedTab]);

    if (
        isUsersLoading ||
        loading.allCourses ||
        loading.authoredCourses ||
        loading.courseRequests ||
        !instituteDetails?.id ||
        availableTabs.length === 0
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
                            allCourses={
                                tab.key === 'AllCourses'
                                    ? allCoursesData
                                    : tab.key === 'AuthoredCourses'
                                      ? authoredCoursesData
                                      : tab.key === 'CourseRequests'
                                        ? courseRequestsData
                                        : null
                            }
                            courseImageUrls={courseImageUrls}
                            handleCourseDelete={handleCourseDelete}
                            page={page}
                            handlePageChange={handlePageChange}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};
