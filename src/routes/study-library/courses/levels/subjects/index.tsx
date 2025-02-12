// routes/study-library/$class/$subject/index.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { InitStudyLibraryProvider } from "@/providers/study-library/init-study-library-provider";
import { SubjectMaterial } from "@/components/common/study-library/course-material/level-study-material/subject-material";
import { useEffect } from "react";
import { CaretLeft } from "phosphor-react";
import { getLevelName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getLevelNameById";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";

interface LevelSearchParams {
    courseId: string;
    levelId: string;
}

export const Route = createFileRoute("/study-library/courses/levels/subjects/")({
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
    const navigate = useNavigate();
    const { courseId, levelId } = Route.useSearch();
    const classNumber = getLevelName(levelId);

    const handleBackClick = () => {
        if (levelId == "DEFAULT") {
            navigate({
                to: "/study-library/courses",
            });
        } else {
            navigate({
                to: "/study-library/courses/levels",
                search: { courseId: courseId },
            });
        }
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>{`${classNumber} Class Study Library`}</div>
        </div>
    );

    // Ensure dependencies are complete
    useEffect(() => {
        setNavHeading(heading);
    }, []);

    return (
        <LayoutContainer>
            <InitStudyLibraryProvider>
                <SubjectMaterial />
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
