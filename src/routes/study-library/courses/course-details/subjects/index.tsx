// routes/study-library/$class/$subject/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { InitStudyLibraryProvider } from '@/providers/study-library/init-study-library-provider';
import { useEffect, useState } from 'react';
import { CaretLeft } from 'phosphor-react';
import { getLevelName } from '@/utils/helpers/study-library-helpers.ts/get-name-by-id/getLevelNameById';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { getCourseNameById } from '@/utils/helpers/study-library-helpers.ts/get-name-by-id/getCourseNameById';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { useStudyLibraryStore } from '@/stores/study-library/use-study-library-store';
import { SubjectMaterial } from './-components/subject-material';
interface LevelSearchParams {
    courseId: string;
    levelId: string;
}

export const Route = createFileRoute('/study-library/courses/course-details/subjects/')({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): LevelSearchParams => {
        return {
            courseId: search.courseId as string,
            levelId: search.levelId as string,
        };
    },
});

function RouteComponent() {
    const { setNavHeading } = useNavHeadingStore();
    const { courseId, levelId } = Route.useSearch();
    const levelName = getLevelName(levelId);
    const { getLevelsFromPackage } = useInstituteDetailsStore();
    const { studyLibraryData } = useStudyLibraryStore();

    const levelList = getLevelsFromPackage({ courseId: courseId });
    const [courseName, setCourseName] = useState(getCourseNameById(courseId));

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={() => window.history.back()} className="cursor-pointer" />
            <div>
                {levelId === 'DEFAULT' ? '' : levelName} {courseName}
            </div>
        </div>
    );

    useEffect(() => {
        setCourseName(getCourseNameById(courseId));
    }, [studyLibraryData]);

    // Ensure dependencies are complete
    useEffect(() => {
        setNavHeading(heading);
    }, []);

    return (
        <LayoutContainer
            internalSideBar
            sideBarList={levelList.map((level) => {
                return {
                    value: level.name,
                    id: level.id,
                };
            })}
            sideBarData={{ title: 'Levels', listIconText: 'L', searchParam: 'levelId' }}
        >
            <InitStudyLibraryProvider>
                <SubjectMaterial />
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
