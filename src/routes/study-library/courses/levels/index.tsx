// routes/study-library/$class/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { InitStudyLibraryProvider } from "@/providers/study-library/init-study-library-provider";
import { LevelPage } from "@/components/common/study-library/course-material/level-study-material/level-page";

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
    return (
        <LayoutContainer>
            <InitStudyLibraryProvider>
                <LevelPage />
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
