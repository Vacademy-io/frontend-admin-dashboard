import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { Class10PhysicsModules } from "@/components/common/study-library/upload-study-material/10th-class-study-library/10th-physics-modules/10th-physics-modules";

export const Route = createFileRoute("/study-library/10-class-study-library/10-class-physics/")({
    component: SubjectLibrary,
});

export function SubjectLibrary() {
    return (
        <LayoutContainer>
            <Class10PhysicsModules />
        </LayoutContainer>
    );
}
