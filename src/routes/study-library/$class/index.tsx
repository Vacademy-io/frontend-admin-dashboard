// routes/study-library/$class/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { ClassStudyMaterial } from "@/components/common/study-library/course-material/level-study-material/level-study-material";
import { InitStudyLibraryProvider } from "@/providers/study-library/init-study-library-provider";

export const Route = createFileRoute("/study-library/$class/")({
    component: ClassStudyMaterialPage,
});

function ClassStudyMaterialPage() {
    const { class: className } = Route.useParams();
    const classNumber = className.replace("-class-study-library", "");

    return (
        <LayoutContainer>
            <InitStudyLibraryProvider>
                <ClassStudyMaterial classNumber={classNumber} />
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
