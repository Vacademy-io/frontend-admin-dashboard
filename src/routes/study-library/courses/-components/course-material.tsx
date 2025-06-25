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
import { useSuspenseQuery } from '@tanstack/react-query';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import type { UserRolesDataEntry } from '@/types/dashboard/user-roles';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

export const CourseMaterial = () => {
    const { instituteDetails } = useInstituteDetailsStore();
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const [roles, setRoles] = useState<string[] | undefined>([]);

    const { data: accessControlUsers, isLoading: isUsersLoading } = useSuspenseQuery(
        handleGetInstituteUsersForAccessControl(instituteDetails?.id, {
            roles: [{ id: '5', name: 'TEACHER' }],
            status: [{ id: '1', name: 'ACTIVE' }],
        })
    );

    const { setNavHeading } = useNavHeadingStore();
    const [selectedTab, setSelectedTab] = useState('AllCourses');
    const [selectedFilters, setSelectedFilters] = useState<{
        status: string[];
        level_ids: string[];
        tag: string[];
        faculty_ids: string[];
        search_by_name: string;
        min_percentage_completed: number;
        max_percentage_completed: number;
        sort_columns: Record<string, 'ASC' | 'DESC'>;
    }>({
        status: ['ACTIVE'],
        level_ids: [],
        tag: [],
        faculty_ids: [],
        search_by_name: '',
        min_percentage_completed: 0,
        max_percentage_completed: 0,
        sort_columns: { created_at: 'DESC' },
    });
    console.log(selectedFilters);
    const [activeCard, setActiveCard] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState('oldest');
    const [searchValue, setSearchValue] = useState('');

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
        // Use selectedFilters for API/filtering logic
    };

    // Level color mapping
    const levelStyles: Record<string, string> = {
        Beginner: 'bg-green-100 text-green-700',
        Intermediate: 'bg-blue-100 text-blue-600',
        Advanced: 'bg-yellow-100 text-yellow-700',
    };
    const levelsList = ['Beginner', 'Intermediate', 'Advanced'];

    // Tag color mapping
    const tagStyles: Record<string, string> = {
        Math: 'bg-red-100 text-red-700',
        Science: 'bg-blue-100 text-blue-700',
        History: 'bg-yellow-100 text-yellow-800',
        Coding: 'bg-green-100 text-green-700',
        Art: 'bg-pink-100 text-pink-700',
        English: 'bg-purple-100 text-purple-700',
    };
    const tagsList = [
        ['Math', 'Science', 'Coding'],
        ['History', 'Art'],
        ['English', 'Math'],
        ['Science', 'Coding', 'Art'],
    ];

    // Sample instructors data for each card
    const instructorsList = [
        [
            {
                id: 1,
                name: 'Alice',
                profilePicId: 'https://randomuser.me/api/portraits/women/1.jpg',
            },
            { id: 2, name: 'Bob', profilePicId: 'https://randomuser.me/api/portraits/men/2.jpg' },
        ],
        [{ id: 3, name: 'Charlie', profilePicId: 'https://randomuser.me/api/portraits/men/3.jpg' }],
        [
            {
                id: 4,
                name: 'Diana',
                profilePicId: 'https://randomuser.me/api/portraits/women/4.jpg',
            },
            { id: 5, name: 'Eve', profilePicId: 'https://randomuser.me/api/portraits/women/5.jpg' },
            { id: 6, name: 'Frank', profilePicId: 'https://randomuser.me/api/portraits/men/6.jpg' },
        ],
        [{ id: 7, name: 'Grace', profilePicId: 'https://randomuser.me/api/portraits/women/7.jpg' }],
    ];

    const handleCardClick = (i: number) => {
        setActiveCard(i);
        setTimeout(() => setActiveCard(null), 300); // Remove scale after 300ms
    };

    useEffect(() => {
        setNavHeading('Explore Courses');
    }, []);

    // Update sort_columns in selectedFilters when sortBy changes
    useEffect(() => {
        setSelectedFilters((prev) => ({
            ...prev,
            sort_columns: sortBy === 'newest' ? { created_at: 'ASC' } : { created_at: 'DESC' },
        }));
    }, [sortBy]);

    useEffect(() => {
        if (tokenData && instituteDetails?.id) {
            setRoles(tokenData.authorities[instituteDetails?.id]?.roles);
        }
    }, []);

    if (isUsersLoading) return <DashboardLoader />;

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
                                    <div className="mb-1 mt-4 text-sm font-semibold">Users</div>
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
                                {[1, 2, 3, 4].map((i) => {
                                    // Assign a random level for each card
                                    const level =
                                        levelsList[(i - 1) % levelsList.length] || 'Beginner';
                                    const levelClass =
                                        levelStyles[level] ?? 'bg-gray-100 text-gray-700';
                                    const tags = tagsList[(i - 1) % tagsList.length] ?? [];
                                    const instructors =
                                        instructorsList[(i - 1) % instructorsList.length] ?? [];
                                    return (
                                        <div
                                            key={i}
                                            className={`animate-fade-in group relative flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-0 shadow-sm transition-transform duration-500 hover:scale-[1.025] hover:shadow-md ${activeCard === i ? 'z-10 scale-105' : ''}`}
                                            onMouseDown={() => handleCardClick(i)}
                                            style={{
                                                transitionTimingFunction:
                                                    'cubic-bezier(0.22, 1, 0.36, 1)',
                                            }}
                                        >
                                            {/* Course Banner Image */}
                                            <div className="h-48 w-full overflow-hidden rounded-lg p-4">
                                                <img
                                                    src={`https://images.pexels.com/photos/31530661/pexels-photo-31530661.jpeg`}
                                                    alt={`Course ${i}`}
                                                    className="size-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1 p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-lg font-extrabold text-neutral-800">
                                                        Course Title {i}
                                                    </div>
                                                    <div
                                                        className={`rounded-lg p-1 px-2 text-xs font-semibold ${levelClass}`}
                                                    >
                                                        {level}
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-sm text-neutral-600">
                                                    A short description of the course goes here.
                                                    Make it concise and informative.
                                                </div>
                                                {/* Instructors Section */}
                                                <div className="mt-2 flex items-center gap-2">
                                                    {instructors.map((inst) => (
                                                        <img
                                                            key={inst.id}
                                                            src={inst.profilePicId}
                                                            alt={inst.name}
                                                            className="-ml-2 size-7 rounded-full border border-neutral-200 object-cover first:ml-0"
                                                        />
                                                    ))}
                                                    <span className="ml-2 text-xs text-neutral-600">
                                                        {instructors
                                                            .map((inst) => inst.name)
                                                            .join(', ')}
                                                    </span>
                                                </div>
                                                {/* Tags Section */}
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className={`rounded px-2 py-0.5 text-xs font-medium ${tagStyles[tag] ?? 'bg-gray-100 text-gray-700'}`}
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="my-2 -mb-2 flex items-center gap-2">
                                                    <StarRatingComponent
                                                        score={80}
                                                        maxScore={100}
                                                    />
                                                    <span className="text-neutral-500">4.5</span>
                                                </div>
                                                {/* View Course Button */}
                                                <MyButton
                                                    className="mt-4 w-full"
                                                    buttonType="primary"
                                                >
                                                    View Course
                                                </MyButton>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
