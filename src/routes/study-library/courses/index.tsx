import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { CourseMaterial } from "@/components/common/study-library/course-material/course-material";
import { InitStudyLibraryProvider } from "@/providers/study-library/init-study-library-provider";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/study-library/courses/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <LayoutContainer>
            <InitStudyLibraryProvider>
                <CourseMaterial />
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
