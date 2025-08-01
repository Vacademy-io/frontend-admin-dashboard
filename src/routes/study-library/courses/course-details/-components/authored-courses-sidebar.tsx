import React from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { MyButton } from '@/components/design-system/button';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';

interface AuthoredCoursesSidebarProps {
    sideBarList?: { value: string; id: string }[];
    sideBarData?: { title: string; listIconText: string; searchParam: string };
}

export const AuthoredCoursesSidebar = ({
    sideBarList,
    sideBarData,
}: AuthoredCoursesSidebarProps) => {
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

    const handleViewAllCourses = () => {
        navigate({ to: '/study-library/courses' });
    };

    if (!sideBarList || sideBarList.length === 0) {
        return (
            <div className="relative flex h-screen w-[307px] flex-col gap-6 overflow-y-scroll bg-primary-50 pb-5 pt-10">
                <div className="px-6">
                    <MyButton
                        buttonType="primary"
                        onClick={handleViewAllCourses}
                        className="w-full mb-4"
                    >
                        View All {getTerminology(ContentTerms.Course, SystemTerms.Course)}s
                    </MyButton>
                </div>
                <div className="px-6">
                    <p className="text-sm text-gray-500">
                        No authored {getTerminology(ContentTerms.Course, SystemTerms.Course).toLowerCase()}s found.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex h-screen w-[307px] flex-col gap-6 overflow-y-scroll bg-primary-50 pb-5 pt-10">
            {/* Button to navigate to all courses */}
            <div className="px-6">
                <MyButton
                    buttonType="primary"
                    onClick={handleViewAllCourses}
                    className="w-full mb-4"
                >
                    View All {getTerminology(ContentTerms.Course, SystemTerms.Course)}s
                </MyButton>
            </div>

            {/* Authored courses list */}
            <div className="px-6">
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700">
                        My {sideBarData?.title || getTerminology(ContentTerms.Course, SystemTerms.Course)}s
                    </h3>
                </div>

                <div className="space-y-2">
                    {sideBarList.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleCourseNavigation(item.id)}
                            className={cn(
                                'group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                courseId === item.id
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            )}
                        >
                            <div
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded text-xs font-medium',
                                    courseId === item.id
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                                )}
                            >
                                {sideBarData?.listIconText || 'C'}
                            </div>
                            <span className="flex-1 truncate">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
