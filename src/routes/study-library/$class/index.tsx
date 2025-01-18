// routes/study-library/$class/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { ClassStudyMaterial } from "@/components/common/study-library/upload-study-material/class-study-material/class-study-material";

export const Route = createFileRoute("/study-library/$class/")({
    component: ClassStudyMaterialPage,
});

function ClassStudyMaterialPage() {
    const { class: className } = Route.useParams();
    const classNumber = className.replace("-class-study-library", "");

    return (
        <LayoutContainer>
            <ClassStudyMaterial classNumber={classNumber} />
        </LayoutContainer>
    );
}
