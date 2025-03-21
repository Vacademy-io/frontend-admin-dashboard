import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { InitStudyLibraryProvider } from "@/providers/study-library/init-study-library-provider";
import { ModulesWithChaptersProvider } from "@/providers/study-library/modules-with-chapters-provider";
import { ModuleMaterial } from "@/routes/study-library/courses/levels/subjects/modules/-components/module-material";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { CaretLeft } from "phosphor-react";
import { getSubjectName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getSubjectNameById";
import { useEffect } from "react";

interface SubjectSearchParams {
    courseId: string;
    levelId: string;
    subjectId: string;
}

export const Route = createFileRoute("/study-library/courses/levels/subjects/modules/")({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): SubjectSearchParams => {
        return {
            courseId: search.courseId as string,
            levelId: search.levelId as string,
            subjectId: search.subjectId as string,
        };
    },
});

function RouteComponent() {
    const searchParams = Route.useSearch();

    const { setNavHeading } = useNavHeadingStore();
    const navigate = useNavigate();
    const { courseId, levelId, subjectId } = Route.useSearch();
    const subjectName = getSubjectName(subjectId);

    const handleBackClick = () => {
        navigate({
            to: "/study-library/courses/levels/subjects",
            search: { courseId, levelId },
        });
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>{`${subjectName} Modules`}</div>
        </div>
    );

    // Ensure dependencies are complete
    useEffect(() => {
        setNavHeading(heading);
    }, []);

    return (
        <LayoutContainer>
            <InitStudyLibraryProvider>
                <ModulesWithChaptersProvider subjectId={searchParams.subjectId}>
                    <ModuleMaterial />
                </ModulesWithChaptersProvider>
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
