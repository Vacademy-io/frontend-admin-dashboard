import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
// import { EmptyDashboard } from "@/components/common/students/empty-dashboard/empty-dashboard";
import { StudentsListSection } from "@/components/common/students/students-list/students-list-section";

export const Route = createFileRoute("/students/students-list/")({
    component: StudentsList,
});

export function StudentsList() {
    return (
        <LayoutContainer>
            {/* <EmptyDashboard /> */}
            <StudentsListSection />
        </LayoutContainer>
    );
}
