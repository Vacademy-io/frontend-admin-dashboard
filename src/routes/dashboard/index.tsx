import { createFileRoute } from "@tanstack/react-router";
// import { EmptyDashboard } from "@/components/common/students/empty-dashboard/empty-dashboard";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { StudentsListSection } from "@/components/common/students/students-list/students-list-section";

export const Route = createFileRoute("/dashboard/")({
    component: Dashboard,
});

export function Dashboard() {
    return (
        <LayoutContainer>
            {/* <EmptyDashboard /> */}
            <StudentsListSection />
        </LayoutContainer>
    );
}
