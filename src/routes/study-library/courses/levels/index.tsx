// routes/study-library/$class/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { InitStudyLibraryProvider } from "@/providers/study-library/init-study-library-provider";
import { LevelPage } from "@/components/common/study-library/course-material/level-study-material/level-page";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useNavigate } from "@tanstack/react-router";
import { CaretLeft } from "phosphor-react";
import { useEffect } from "react";

interface CourseSearchParams {
    courseId: string;
}

export const Route = createFileRoute("/study-library/courses/levels/")({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): CourseSearchParams => {
        return {
            courseId: search.courseId as string,
        };
    },
});

function RouteComponent() {
    const { setNavHeading } = useNavHeadingStore();
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate({
            to: `/study-library/courses`,
        });
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>{`Levels`}</div>
        </div>
    );

    useEffect(() => {
        setNavHeading(heading);
    }, []);

    return (
        <LayoutContainer>
            <InitStudyLibraryProvider>
                <LevelPage />
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
