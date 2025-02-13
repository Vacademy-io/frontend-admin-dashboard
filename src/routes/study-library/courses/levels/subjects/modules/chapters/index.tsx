// routes/study-library/$class/$subject/$module/$chapter/index.tsx
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChapterMaterial } from "@/components/common/study-library/course-material/level-study-material/subject-material/module-material/chapter-material";
import { ModulesWithChaptersProvider } from "@/providers/study-library/modules-with-chapters-provider";
import { InitStudyLibraryProvider } from "@/providers/study-library/init-study-library-provider";
import { ChapterSidebarComponent } from "@/components/common/study-library/course-material/level-study-material/subject-material/module-material/chapter-material/chapter-sidebar-component";
import { useEffect, useState } from "react";
import { CaretLeft } from "phosphor-react";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { getModuleName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getModuleNameById";

interface ModulesSearchParams {
    courseId: string;
    levelId: string;
    subjectId: string;
    moduleId: string;
}

export const Route = createFileRoute("/study-library/courses/levels/subjects/modules/chapters/")({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): ModulesSearchParams => {
        return {
            courseId: search.courseId as string,
            levelId: search.levelId as string,
            subjectId: search.subjectId as string,
            moduleId: search.moduleId as string,
        };
    },
});

function RouteComponent() {
    const navigate = useNavigate();

    const { courseId, levelId, subjectId, moduleId } = Route.useSearch();

    const [currentModuleId, setCurrentModuleId] = useState(moduleId);

    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        navigate({
            to: "/study-library/courses/levels/subjects/modules/chapters",
            search: {
                courseId,
                levelId,
                subjectId,
                moduleId: currentModuleId,
            },
            replace: true,
        });
    }, [currentModuleId, courseId, levelId, subjectId]);

    const moduleName = getModuleName(moduleId);

    const handleBackClick = () => {
        navigate({
            to: `/study-library/courses/levels/subjects/modules`,
            search: {
                courseId,
                levelId,
                subjectId,
            },
        });
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>{`${moduleName} Chapters`}</div>
        </div>
    );

    useEffect(() => {
        setNavHeading(heading);
    }, []);

    return (
        <LayoutContainer
            sidebarComponent={
                <ChapterSidebarComponent
                    currentModuleId={currentModuleId}
                    setCurrentModuleId={setCurrentModuleId}
                />
            }
        >
            <InitStudyLibraryProvider>
                <ModulesWithChaptersProvider subjectId={subjectId}>
                    <ChapterMaterial currentModuleId={currentModuleId} />
                </ModulesWithChaptersProvider>
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
