import { createFileRoute } from "@tanstack/react-router";
import { Class10StudyMaterial } from "@/components/common/study-library/upload-study-material/10th-class-study-library/class-10-study-material";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";

export const Route = createFileRoute("/study-library/10-class-study-library/")({
    component: ClassLibrary,
});

export function ClassLibrary() {
    return (
        <LayoutContainer>
            <Class10StudyMaterial />
        </LayoutContainer>
    );
}
