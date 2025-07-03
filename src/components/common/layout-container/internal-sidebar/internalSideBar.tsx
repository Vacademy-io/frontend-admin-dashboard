'use client';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getCourseLevels } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getLevelWithDetails';
import { getCourseSubjects } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSubjects';
import { getCourseSessions } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSessionsForLevels';
import { CaretRight, Folder, Book, Bookmark } from 'phosphor-react';
import { cn } from '@/lib/utils';
import { LevelWithDetailsType } from '@/stores/study-library/use-study-library-store';

export const InternalSideBar = ({
    sideBarList,
    sideBarData,
}: {
    sideBarList?: { value: string; id: string }[];
    sideBarData?: { title: string; listIconText: string; searchParam: string };
}) => {
    const router = useRouter();
    const navigate = useNavigate();
    const { search } = router.state.location;

    const courseId = (search as Record<string, string | undefined>).courseId;
    const levelId = (search as Record<string, string | undefined>).levelId;
    const subjectId = (search as Record<string, string | undefined>).subjectId;

    const handleCourseNavigation = (clickedCourseId: string) => {
        navigate({
            to: '/study-library/courses/course-details',
            search: { courseId: clickedCourseId },
        });
    };

    const handleLevelNavigation = (clickedLevelId: string) => {
        if (!courseId) return;
        navigate({
            to: '/study-library/courses/course-details/subjects',
            search: (prev) => ({
                ...prev,
                courseId,
                levelId: clickedLevelId,
                subjectId: undefined,
            }),
        });
    };

    const handleSubjectNavigation = (clickedSubjectId: string) => {
        if (!courseId || !levelId) return;
        navigate({
            to: '/study-library/courses/course-details/subjects',
            search: (prev) => ({ ...prev, courseId, levelId, subjectId: clickedSubjectId }),
        });
    };

    if (!sideBarList || sideBarList.length === 0) {
        return null;
    }

    return (
        <div className="flex h-full w-[307px] flex-col gap-4 bg-primary-50 px-3 py-6">
            <div className="px-3 text-lg font-semibold text-gray-800">{sideBarData?.title}</div>
            <div className="flex-1 space-y-1 overflow-y-auto pr-1">
                {sideBarList.map((course) => {
                    const sessions = getCourseSessions(course.id);
                    const levels = sessions.flatMap((session) =>
                        getCourseLevels(course.id, session.id)
                    );
                    const uniqueLevels = Array.from(new Set(levels.map((l) => l.id)))
                        .map((id) => levels.find((l) => l.id === id))
                        .filter(Boolean) as LevelWithDetailsType[];

                    return (
                        <Collapsible
                            key={course.id}
                            open={course.id === courseId}
                            className="space-y-1"
                        >
                            <CollapsibleTrigger
                                className="w-full"
                                onClick={() => handleCourseNavigation(course.id)}
                            >
                                <div
                                    className={cn(
                                        'flex items-center gap-2 rounded-md p-2 text-sm font-medium',
                                        course.id === courseId
                                            ? 'bg-primary-100'
                                            : 'hover:bg-gray-200'
                                    )}
                                >
                                    <Folder
                                        size={18}
                                        weight={course.id === courseId ? 'fill' : 'duotone'}
                                        className={cn(course.id === courseId && 'text-primary-600')}
                                    />
                                    <span className="flex-1 truncate text-left">
                                        {course.value}
                                    </span>
                                    <CaretRight
                                        size={14}
                                        weight="bold"
                                        className={cn(
                                            'transform transition-transform',
                                            course.id === courseId && 'rotate-90'
                                        )}
                                    />
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-4">
                                {uniqueLevels.map((level) => {
                                    const subjects = getCourseSubjects(course.id, '', level.id);
                                    const isSingleLevel = uniqueLevels.length === 1;

                                    return (
                                        <Collapsible
                                            key={level.id}
                                            open={isSingleLevel || level.id === levelId}
                                            className="space-y-1"
                                        >
                                            <CollapsibleTrigger
                                                className="w-full"
                                                onClick={() => handleLevelNavigation(level.id)}
                                            >
                                                <div
                                                    className={cn(
                                                        'flex items-center gap-2 rounded-md p-2 text-sm font-medium',
                                                        level.id === levelId
                                                            ? 'bg-primary-100'
                                                            : 'hover:bg-gray-200'
                                                    )}
                                                >
                                                    <Book
                                                        size={16}
                                                        weight={
                                                            level.id === levelId
                                                                ? 'fill'
                                                                : 'duotone'
                                                        }
                                                        className={cn(
                                                            level.id === levelId &&
                                                                'text-primary-600'
                                                        )}
                                                    />
                                                    <span className="flex-1 truncate text-left">
                                                        {level.name}
                                                    </span>
                                                    {!isSingleLevel && (
                                                        <CaretRight
                                                            size={14}
                                                            weight="bold"
                                                            className={cn(
                                                                'transform transition-transform',
                                                                level.id === levelId && 'rotate-90'
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="pl-4">
                                                {subjects.map((subject) => (
                                                    <div
                                                        key={subject.id}
                                                        onClick={() =>
                                                            handleSubjectNavigation(subject.id)
                                                        }
                                                        className={cn(
                                                            'flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-gray-200',
                                                            subject.id === subjectId &&
                                                                'text-primary-600 bg-primary-100'
                                                        )}
                                                    >
                                                        <Bookmark
                                                            size={14}
                                                            weight={
                                                                subject.id === subjectId
                                                                    ? 'fill'
                                                                    : 'duotone'
                                                            }
                                                        />
                                                        <span className="flex-1 truncate text-left">
                                                            {subject.subject_name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </CollapsibleContent>
                                        </Collapsible>
                                    );
                                })}
                            </CollapsibleContent>
                        </Collapsible>
                    );
                })}
            </div>
        </div>
    );
};
