'use client';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Folder } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

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

    const handleCourseNavigation = (clickedCourseId: string) => {
        navigate({
            to: '/study-library/courses/course-details',
            search: { courseId: clickedCourseId },
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
                                </div>
                            </CollapsibleTrigger>
                        </Collapsible>
                    );
                })}
            </div>
        </div>
    );
};
