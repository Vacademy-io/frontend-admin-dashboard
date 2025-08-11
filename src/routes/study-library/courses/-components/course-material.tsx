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
import { useSuspenseQuery, useQuery } from '@tanstack/react-query';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { getAllCoursesWithFilters } from '../-services/courses-services';

import { useDeleteCourse } from '@/services/study-library/course-operations/delete-course';
import { toast } from 'sonner';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import CourseListPage from './course-list-page';
import { AdminApprovalDashboard } from './admin-approval-dashboard';
import { AuthoredCoursesTab } from './authored-courses-tab';
import { CourseInReviewTab } from './course-in-review-tab';
import { useNavigate } from '@tanstack/react-router';
import {
    ADMIN_DISPLAY_SETTINGS_KEY,
    TEACHER_DISPLAY_SETTINGS_KEY,
    type DisplaySettingsData,
    type CourseListTabId,
} from '@/types/display-settings';
import { getDisplaySettings, getDisplaySettingsFromCache } from '@/services/display-settings';
import { useImageCache } from '@/hooks/use-image-cache';
import { fetchMultipleImagesWithCache } from '@/utils/image-cache-utils';

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

interface CourseMaterialProps {
    initialSelectedTab?: 'AuthoredCourses' | 'AllCourses' | 'CourseInReview' | 'CourseApproval';
}

export const CourseMaterial = ({ initialSelectedTab }: CourseMaterialProps = {}) => {
    const deleteCourseMutation = useDeleteCourse();
    const { instituteDetails } = useInstituteDetailsStore();
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const navigate = useNavigate();
    const [roles, setRoles] = useState<string[] | undefined>([]);
    const [allCoursesData, setAllCoursesData] = useState<AllCoursesApiResponse | null>(null);
    const [authoredCoursesData, setAuthoredCoursesData] = useState<AllCoursesApiResponse | null>(
        null
    );

    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState({
        allCourses: true,
        authoredCourses: true,
    });
    const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
    const [instructorProfilePicUrls, setInstructorProfilePicUrls] = useState<
        Record<string, string>
    >({});
    const [isLoadingImages, setIsLoadingImages] = useState(false);

    // Image cache hook
    const imageCache = useImageCache();

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
    const [selectedTab, setSelectedTab] = useState<
        'AuthoredCourses' | 'AllCourses' | 'CourseInReview' | 'CourseApproval'
    >(initialSelectedTab || 'AuthoredCourses');

    // Role Display Settings (course list tabs)
    const [roleDisplay, setRoleDisplay] = useState<DisplaySettingsData | null>(null);
    useEffect(() => {
        // Determine role key from existing roles logic
        const safeRoles = Array.isArray(roles) ? roles : [];
        const isAdmin = safeRoles.includes('ADMIN');
        const roleKey = isAdmin ? ADMIN_DISPLAY_SETTINGS_KEY : TEACHER_DISPLAY_SETTINGS_KEY;
        const cached = getDisplaySettingsFromCache(roleKey);
        if (cached) {
            setRoleDisplay(cached);
        } else {
            getDisplaySettings(roleKey)
                .then(setRoleDisplay)
                .catch(() => setRoleDisplay(null));
        }
    }, [roles]);

    // Handle tab change with URL sync
    const handleTabChange = (
        newTab: 'AuthoredCourses' | 'AllCourses' | 'CourseInReview' | 'CourseApproval'
    ) => {
        setSelectedTab(newTab);
        // Update URL with new tab
        navigate({
            to: '/study-library/courses',
            search: { selectedTab: newTab },
            replace: true, // Replace current history entry instead of adding new one
        });
    };
    const [authoredSearchValue, setAuthoredSearchValue] = useState('');
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

    // Removed getAllCoursesMutation - now using React Query directly

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
        // React Query will automatically refetch when page changes
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

    const [courseImageUrls, setCourseImageUrls] = useState<Record<string, string>>({});

    // Create stable filter key for React Query
    const filtersKey = useMemo(() => {
        return {
            status: selectedFilters.status,
            level_ids: selectedFilters.level_ids,
            tag: selectedFilters.tag,
            faculty_ids: selectedFilters.faculty_ids,
            search_by_name: selectedFilters.search_by_name,
            min_percentage_completed: selectedFilters.min_percentage_completed,
            max_percentage_completed: selectedFilters.max_percentage_completed,
            sort_columns: selectedFilters.sort_columns,
        };
    }, [selectedFilters]);

    // Only fetch data for the active tab to prevent unnecessary API calls
    const { data: fetchedAllCoursesData, isLoading: isLoadingAllCourses } = useQuery({
        queryKey: ['allCourses', instituteDetails?.id, page, filtersKey],
        queryFn: () => getAllCoursesWithFilters(page, 10, instituteDetails?.id, filtersKey),
        enabled: !!instituteDetails?.id && selectedTab === 'AllCourses',
        staleTime: 30000, // Data is fresh for 30 seconds
        gcTime: 300000, // Cache for 5 minutes
    });

    const { data: fetchedAuthoredCoursesData, isLoading: isLoadingAuthoredCourses } = useQuery({
        queryKey: ['authoredCourses', instituteDetails?.id, page, filtersKey, tokenData?.user],
        queryFn: () => {
            const authoredFilters = {
                ...filtersKey,
                faculty_ids: tokenData?.user ? [tokenData.user] : [],
            };
            return getAllCoursesWithFilters(page, 10, instituteDetails?.id, authoredFilters);
        },
        enabled: !!instituteDetails?.id && !!tokenData?.user && selectedTab === 'AuthoredCourses',
        staleTime: 30000,
        gcTime: 300000,
    });

    // Update local state when React Query data changes
    useEffect(() => {
        if (fetchedAllCoursesData) {
            setAllCoursesData(fetchedAllCoursesData);
            setLoading((l) => ({ ...l, allCourses: false }));
        }
    }, [fetchedAllCoursesData]);

    useEffect(() => {
        if (fetchedAuthoredCoursesData) {
            setAuthoredCoursesData(fetchedAuthoredCoursesData);
            setLoading((l) => ({ ...l, authoredCourses: false }));
        }
    }, [fetchedAuthoredCoursesData]);

    // Update loading states - only consider active tab
    useEffect(() => {
        setLoading({
            allCourses: selectedTab === 'AllCourses' ? isLoadingAllCourses : false,
            authoredCourses: selectedTab === 'AuthoredCourses' ? isLoadingAuthoredCourses : false,
        });
    }, [isLoadingAllCourses, isLoadingAuthoredCourses, selectedTab]);

    // Helper to get available tabs
    const availableTabs = useMemo(() => {
        const labelFor = (id: CourseListTabId): string => {
            switch (id) {
                case 'AuthoredCourses':
                    return `Authored ${getTerminology(ContentTerms.Course, SystemTerms.Course)}s`;
                case 'AllCourses':
                    return `All ${getTerminology(ContentTerms.Course, SystemTerms.Course)}s`;
                case 'CourseInReview':
                    return `${getTerminology(ContentTerms.Course, SystemTerms.Course)}s In Review`;
                case 'CourseApproval':
                    return `${getTerminology(ContentTerms.Course, SystemTerms.Course)} Approval`;
                default:
                    return String(id);
            }
        };

        if (roleDisplay?.courseList?.tabs && roleDisplay.courseList.tabs.length > 0) {
            return roleDisplay.courseList.tabs
                .filter((t) => t.visible !== false)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((t) => ({ key: t.id, label: labelFor(t.id as CourseListTabId), show: true }));
        }

        // Fallback to original role-based defaults
        const safeRoles = Array.isArray(roles) ? roles : [];
        const isAdmin = safeRoles.includes('ADMIN');
        const tabs: { key: string; label: string; show: boolean }[] = [
            {
                key: 'AuthoredCourses',
                label: `Authored ${getTerminology(ContentTerms.Course, SystemTerms.Course)}s`,
                show: true,
            },
            {
                key: 'AllCourses',
                label: `All ${getTerminology(ContentTerms.Course, SystemTerms.Course)}s`,
                show: true,
            },
            {
                key: 'CourseInReview',
                label: `${getTerminology(ContentTerms.Course, SystemTerms.Course)}s In Review`,
                show: !isAdmin,
            },
            {
                key: 'CourseApproval',
                label: `${getTerminology(ContentTerms.Course, SystemTerms.Course)} Approval`,
                show: isAdmin,
            },
        ];
        return tabs.filter((t) => t.show);
    }, [roles, roleDisplay?.courseList]);
    // Apply default tab from role settings when appropriate
    useEffect(() => {
        const visibleKeys = new Set(availableTabs.map((t) => t.key));
        // Ensure current tab is valid
        if (!visibleKeys.has(selectedTab) && availableTabs.length > 0) {
            // Prefer role-defined default if present and visible
            type CourseListTabKey =
                | 'AuthoredCourses'
                | 'AllCourses'
                | 'CourseInReview'
                | 'CourseApproval';
            const defaultKey = roleDisplay?.courseList?.defaultTab as CourseListTabKey | undefined;
            const fallbackKey = availableTabs[0]?.key as CourseListTabKey;
            const next: CourseListTabKey =
                defaultKey && visibleKeys.has(defaultKey) ? defaultKey : fallbackKey;
            setSelectedTab(next);
        }
    }, [availableTabs, selectedTab, roleDisplay?.courseList?.defaultTab]);
    // Use correct data for CourseListPage
    const getCurrentTabData = () => {
        if (selectedTab === 'AllCourses') return allCoursesData;
        if (selectedTab === 'AuthoredCourses') return authoredCoursesData;
        return null;
    };
    // Fetch public URLs for course images and instructor profile pictures when current tab data changes
    useEffect(() => {
        const fetchImages = async () => {
            setIsLoadingImages(true);
            try {
                const data = getCurrentTabData();
                const contentArr: CourseItem[] = Array.isArray(data?.content)
                    ? data?.content?.filter((course): course is CourseItem => !!course) ?? []
                    : [];

                // Prepare course images for caching
                const courseImages = contentArr
                    .filter((course) => course.course_preview_image_media_id)
                    .map((course) => ({
                        id: course.id,
                        fileId: course.course_preview_image_media_id,
                    }));

                // Prepare instructor images for caching
                const instructorImages: Array<{ id: string; fileId: string }> = [];
                contentArr.forEach((course) => {
                    course.instructors?.forEach((instructor) => {
                        if (instructor.profile_pic_file_id && instructor.id) {
                            instructorImages.push({
                                id: instructor.id,
                                fileId: instructor.profile_pic_file_id,
                            });
                        }
                    });
                });

                // Fetch all images with caching
                const [courseResults, instructorResults] = await Promise.all([
                    fetchMultipleImagesWithCache(courseImages, imageCache),
                    fetchMultipleImagesWithCache(instructorImages, imageCache),
                ]);

                // Build course image URL map
                const courseUrlMap: Record<string, string> = {};
                courseResults.forEach(({ id, url }) => {
                    if (id) courseUrlMap[id] = url || '';
                });

                // Build instructor profile URL map
                const instructorUrlMap: Record<string, string> = {};
                instructorResults.forEach(({ id, url }) => {
                    if (id) instructorUrlMap[id] = url || '';
                });

                setCourseImageUrls(courseUrlMap);
                setInstructorProfilePicUrls(instructorUrlMap);
            } catch (error) {
                console.error('Error fetching images:', error);
            } finally {
                setIsLoadingImages(false);
            }
        };
        fetchImages();
    }, [allCoursesData, authoredCoursesData, selectedTab]);

    if (isUsersLoading || loading.allCourses || loading.authoredCourses || !instituteDetails?.id) {
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
            <Tabs
                value={selectedTab}
                onValueChange={(value) =>
                    handleTabChange(
                        value as
                            | 'AuthoredCourses'
                            | 'AllCourses'
                            | 'CourseInReview'
                            | 'CourseApproval'
                    )
                }
            >
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
                            // Handle new tab components
                            if (tab.key === 'AuthoredCourses') {
                                return (
                                    <AuthoredCoursesTab
                                        searchValue={authoredSearchValue}
                                        setSearchValue={setAuthoredSearchValue}
                                    />
                                );
                            }

                            if (tab.key === 'CourseInReview') {
                                return <CourseInReviewTab />;
                            }

                            if (tab.key === 'CourseApproval') {
                                return <AdminApprovalDashboard />;
                            }

                            // Handle existing All Courses tab
                            const data = tab.key === 'AllCourses' ? allCoursesData : null;

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
                                    instructorProfilePicUrls={instructorProfilePicUrls}
                                    isLoadingImages={isLoadingImages}
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
