import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { StudyLibrary } from "@/components/common/study-library/study-library";
import { InitStudyLibraryProvider } from "@/providers/study-library/init-study-library-provider";

export const Route = createFileRoute("/study-library/")({
    component: StudyLibraryPage,
});

export function StudyLibraryPage() {
    return (
        <LayoutContainer>
            <InitStudyLibraryProvider>
                <StudyLibrary />
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
