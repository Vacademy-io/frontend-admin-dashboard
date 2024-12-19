import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { StudyLibrary } from "@/components/common/study-library/study-library";

export const Route = createFileRoute("/study-library/")({
    component: StudentsList,
});

export function StudentsList() {
    return (
        <LayoutContainer>
            <StudyLibrary />
        </LayoutContainer>
    );
}
