import type { AllCourseFilters, AllCoursesApiResponse, CourseInstructor } from './course-material';
import type { CourseItem } from './course-material';
import type { UserRolesDataEntry } from '@/types/dashboard/user-roles';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { StarRatingComponent } from '@/components/common/star-rating-component';
import { MyButton } from '@/components/design-system/button';
import { TrashSimple } from 'phosphor-react';
import { useNavigate } from '@tanstack/react-router';
import { MyPagination } from '@/components/design-system/pagination';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, RoleTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { Eye, EyeSlash } from '@phosphor-icons/react';
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
import { convertCapitalToTitleCase } from '@/lib/utils';
import { CourseImageShimmer, InstructorAvatarShimmer } from '@/components/ui/shimmer';

interface CourseListPageProps {
    selectedFilters: AllCourseFilters;
    setSelectedFilters: React.Dispatch<React.SetStateAction<AllCourseFilters>>;
    handleClearAll: () => void;
    handleApply: () => void;
    levels: Array<{ id: string; name: string }>;
    handleLevelChange: (levelId: string) => void;
    tags: string[];
    accessControlUsers: UserRolesDataEntry[];
    handleUserChange: (userId: string) => void;
    handleTagChange: (tagValue: string) => void;
    searchValue: string;
    setSearchValue: React.Dispatch<React.SetStateAction<string>>;
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    sortBy: string;
    setSortBy: React.Dispatch<React.SetStateAction<string>>;
    allCourses: AllCoursesApiResponse | null;
    courseImageUrls: Record<string, string>;
    instructorProfilePicUrls: Record<string, string>;
    isLoadingImages: boolean;
    handleCourseDelete: (courseId: string) => void;
    page: number;
    handlePageChange: (newPage: number) => void;
    deletingCourseId: string | null;
    showDeleteButton?: boolean;
}

const CourseListPage = ({
    selectedFilters,
    setSelectedFilters,
    handleClearAll,
    handleApply,
    levels,
    handleLevelChange,
    tags,
    accessControlUsers,
    handleUserChange,
    handleTagChange,
    searchValue,
    setSearchValue,
    handleSearchChange,
    handleSearchKeyDown,
    sortBy,
    setSortBy,
    allCourses,
    courseImageUrls,
    instructorProfilePicUrls,
    isLoadingImages,
    handleCourseDelete,
    page,
    handlePageChange,
    deletingCourseId,
    showDeleteButton = true,
}: CourseListPageProps) => {
    const navigate = useNavigate();
    return (
        <>
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
                    <div className="mb-1 text-sm font-semibold">
                        {getTerminology(ContentTerms.Level, SystemTerms.Level)}s
                    </div>
                    <div className="flex flex-col gap-2">
                        {levels.map((level: { id: string; name: string }) => (
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
                                    {convertCapitalToTitleCase(level.name)}
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
                                            {convertCapitalToTitleCase(tagValue)}
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
                                {getTerminology(RoleTerms.Teacher, SystemTerms.Teacher)}s
                            </div>
                            <div className="flex flex-col gap-2">
                                {(accessControlUsers as UserRolesDataEntry[]).map(
                                    (user: UserRolesDataEntry) => (
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
                            <span className="text-sm font-medium text-neutral-600">Sort by</span>
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
                        (allCourses?.content?.length ?? 0) > 0 ? (
                            allCourses?.content?.map((course: CourseItem) => {
                                const instructors: CourseInstructor[] = course.instructors || [];
                                const tags: string[] = course.comma_separeted_tags
                                    ? course.comma_separeted_tags
                                          .split(',')
                                          .map((t: string) => t.trim())
                                    : [];
                                return (
                                    <div
                                        key={course.id}
                                        className={`animate-fade-in group relative flex h-fit flex-col rounded-lg border border-neutral-200 bg-white p-0 shadow-sm transition-transform duration-500 hover:scale-[1.025] hover:shadow-md`}
                                    >
                                        {/* Course Banner Image */}
                                        {isLoadingImages ? (
                                            <CourseImageShimmer />
                                        ) : courseImageUrls[course.id] ? (
                                            <div className="flex size-full w-full items-center justify-center overflow-hidden rounded-lg px-3 pb-0 pt-4">
                                                <img
                                                    src={
                                                        courseImageUrls[course.id] ||
                                                        course.thumbnail_file_id ||
                                                        'https://images.pexels.com/photos/31530661/pexels-photo-31530661.jpeg'
                                                    }
                                                    alt={course.package_name}
                                                    className="rounded-lg bg-white object-cover p-2 transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </div>
                                        ) : null}
                                        <div className="flex flex-col gap-1 p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="text-lg font-extrabold text-neutral-800">
                                                    {convertCapitalToTitleCase(course.package_name)}
                                                </div>
                                                <div
                                                    className={`rounded-lg bg-gray-100 p-1 px-2 text-xs font-semibold text-gray-700`}
                                                >
                                                    {convertCapitalToTitleCase(course.level_name) ||
                                                        'Level'}
                                                </div>
                                            </div>
                                            {/* Description section */}
                                            <div
                                                className={
                                                    (course.course_html_description_html || '')
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
                                                {instructors?.map((inst: CourseInstructor) =>
                                                    isLoadingImages ? (
                                                        <InstructorAvatarShimmer key={inst.id} />
                                                    ) : (
                                                        <img
                                                            key={inst.id}
                                                            src={
                                                                instructorProfilePicUrls[inst.id] ||
                                                                'https://randomuser.me/api/portraits/lego/1.jpg'
                                                            }
                                                            alt={inst.full_name}
                                                            className="-ml-2 size-7 rounded-full border border-neutral-200 object-cover first:ml-0"
                                                        />
                                                    )
                                                )}
                                                <span className="ml-2 text-xs text-neutral-600">
                                                    {instructors
                                                        ?.map(
                                                            (inst: CourseInstructor) =>
                                                                inst.full_name
                                                        )
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
                                                {tags?.map((tag: string) => (
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
                                            {/* Catalog/Private status */}
                                            <span className="-mb-3 mt-2 flex items-center gap-1 rounded py-1 text-xs font-medium text-gray-500">
                                                {course.is_course_published_to_catalaouge ? (
                                                    <>
                                                        <Eye className="size-4" /> In Catalog
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeSlash className="size-4" /> Private
                                                    </>
                                                )}
                                            </span>
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
                                                    View{' '}
                                                    {getTerminology(
                                                        ContentTerms.Course,
                                                        SystemTerms.Course
                                                    )}
                                                </MyButton>
                                                {showDeleteButton && (
                                                    <AlertDialog
                                                        open={
                                                            deletingCourseId === course.id ||
                                                            undefined
                                                        }
                                                        onOpenChange={() => {
                                                            // Only allow closing if not currently deleting
                                                            if (
                                                                !deletingCourseId ||
                                                                deletingCourseId !== course.id
                                                            ) {
                                                                // If parent controls dialog open state, call parent handler here if needed
                                                            }
                                                        }}
                                                    >
                                                        <AlertDialogTrigger className="flex size-9 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-500 transition-colors hover:border-red-300 hover:bg-red-100 active:scale-95">
                                                            <TrashSimple size={18} />
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Are you sure you want to delete
                                                                    this course?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone.
                                                                    This will permanently delete
                                                                    your course and remove your
                                                                    course data from our servers.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel
                                                                    disabled={
                                                                        deletingCourseId ===
                                                                        course.id
                                                                    }
                                                                >
                                                                    Cancel
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() =>
                                                                        handleCourseDelete(
                                                                            course.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        deletingCourseId ===
                                                                        course.id
                                                                    }
                                                                    className="bg-primary-500 text-white"
                                                                >
                                                                    {deletingCourseId ===
                                                                    course.id ? (
                                                                        <svg
                                                                            className="animate-spin"
                                                                            width="18"
                                                                            height="18"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                        >
                                                                            <circle
                                                                                cx="12"
                                                                                cy="12"
                                                                                r="10"
                                                                                stroke="#ef4444"
                                                                                strokeWidth="4"
                                                                                strokeDasharray="60"
                                                                                strokeDashoffset="20"
                                                                            />
                                                                        </svg>
                                                                    ) : (
                                                                        'Confirm'
                                                                    )}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
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
        </>
    );
};

export default CourseListPage;
