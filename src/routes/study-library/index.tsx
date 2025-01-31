import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { LevelPage } from "@/components/common/study-library/course-material/level-study-material/level-page";
import { InitStudyLibraryProvider } from "@/providers/study-library/init-study-library-provider";

export const Route = createFileRoute("/study-library/")({
    component: StudyLibraryPage,
});

export function StudyLibraryPage() {
    return (
        <LayoutContainer>
            <InitStudyLibraryProvider>
                <LevelPage />
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
