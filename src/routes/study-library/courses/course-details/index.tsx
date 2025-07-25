// routes/study-library/$class/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { InitStudyLibraryProvider } from '@/providers/study-library/init-study-library-provider';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { CaretLeft } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { useStudyLibraryStore } from '@/stores/study-library/use-study-library-store';
import { getCourses } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getCourses';
import { CourseDetailsPage } from './-components/course-details-page';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { convertCapitalToTitleCase } from '@/lib/utils';

interface CourseSearchParams {
    courseId: string;
}

export const Route = createFileRoute('/study-library/courses/course-details/')({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): CourseSearchParams => {
        return {
            courseId: search.courseId as string,
        };
    },
});

function RouteComponent() {
    const { setNavHeading } = useNavHeadingStore();
    const { courseId } = Route.useSearch();
    const [isLoading, setIsLoading] = useState(false);

    const { studyLibraryData } = useStudyLibraryStore();

    const [courses, setCourses] = useState(getCourses());

    useEffect(() => {
        setIsLoading(true);
        setCourses(getCourses());
        // Add a small delay to ensure smooth transition
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [studyLibraryData, courseId]);

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={() => window.history.back()} className="cursor-pointer" />
            <div>{getTerminology(ContentTerms.Course, SystemTerms.Course)} Details</div>
        </div>
    );

    useEffect(() => {
        setNavHeading(heading);
    }, []);

    return (
        <LayoutContainer
            internalSideBar
            sideBarList={courses.map((course) => {
                return {
                    value: convertCapitalToTitleCase(course.package_name),
                    id: course.id,
                };
            })}
            sideBarData={{
                title: getTerminology(ContentTerms.Course, SystemTerms.Course) + 's',
                listIconText: 'C',
                searchParam: 'courseId',
            }}
        >
            <InitStudyLibraryProvider>
                {isLoading ? (
                    <div className="flex min-h-screen items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <DashboardLoader size={32} />
                        </div>
                    </div>
                ) : (
                    <CourseDetailsPage />
                )}
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
