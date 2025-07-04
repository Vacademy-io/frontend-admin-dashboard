import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ModulesWithChaptersProvider } from '@/providers/study-library/modules-with-chapters-provider';
import { InitStudyLibraryProvider } from '@/providers/study-library/init-study-library-provider';
import { useEffect, useState } from 'react';
import { CaretLeft } from 'phosphor-react';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { getModuleName } from '@/utils/helpers/study-library-helpers.ts/get-name-by-id/getModuleNameById';
import { useQueryClient } from '@tanstack/react-query';
import { useContentStore } from './slides/-stores/chapter-sidebar-store';
import { ChapterSidebarComponent } from './-components/chapter-material/chapter-sidebar-component';
import { ChapterMaterial } from './-components/chapter-material';

interface ModulesSearchParams {
    courseId: string;
    levelId: string;
    subjectId: string;
    moduleId: string;
    sessionId: string;
}

export const Route = createFileRoute(
    '/study-library/courses/course-details/subjects/modules/chapters/'
)({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): ModulesSearchParams => {
        return {
            courseId: search.courseId as string,
            levelId: search.levelId as string,
            subjectId: search.subjectId as string,
            moduleId: search.moduleId as string,
            sessionId: search.sessionId as string,
        };
    },
});

function RouteComponent() {
    const navigate = useNavigate();
    const { courseId, levelId, subjectId, moduleId } = Route.useSearch();
    const [currentModuleId, setCurrentModuleId] = useState(moduleId);
    const { setNavHeading } = useNavHeadingStore();
    const { setActiveItem, setItems } = useContentStore();
    const queryClient = useQueryClient(); // Get the queryClient instance

    const invalidateModulesQuery = () => {
        queryClient.invalidateQueries({
            queryKey: ['GET_MODULES_WITH_CHAPTERS', subjectId],
        });
    };

    useEffect(() => {
        setActiveItem(null);
        setItems([]);
    }, []);

    useEffect(() => {
        navigate({
            to: '/study-library/courses/course-details',
            search: {
                courseId,
            },
            replace: true,
        });
    }, [currentModuleId, courseId, levelId, subjectId]);

    const moduleName = getModuleName(moduleId);

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={() => window.history.back()} className="cursor-pointer" />
            <div>{`${moduleName} Chapters`}</div>
        </div>
    );

    useEffect(() => {
        setNavHeading(heading);
        invalidateModulesQuery();
    }, []);

    return (
        <LayoutContainer
            hasInternalSidebarComponent={true}
            internalSidebarComponent={
                <ChapterSidebarComponent
                    currentModuleId={currentModuleId}
                    setCurrentModuleId={setCurrentModuleId}
                />
            }
        >
            <InitStudyLibraryProvider>
                <ModulesWithChaptersProvider>
                    <ChapterMaterial currentModuleId={currentModuleId} />
                </ModulesWithChaptersProvider>
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
