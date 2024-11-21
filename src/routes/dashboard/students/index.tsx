import { useEffect } from "react";
import { usePageStore } from "@/stores/usePageStore";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute } from "@tanstack/react-router";
// import { EmptyDashboard } from "@/components/common/students/empty-dashboard/empty-dashboard";
import { StudentsListSection } from "@/components/common/students/students-list/students-list-section";

export const Route = createFileRoute("/dashboard/students/")({
    component: StudentDashboard,
});

export function StudentDashboard() {
    const { setCurrentPage } = usePageStore();

    useEffect(() => {
        setCurrentPage("Students", "/dashboard/students");
    }, []);

    return (
        <LayoutContainer>
            {/* <EmptyDashboard /> */}
            <StudentsListSection />
        </LayoutContainer>
    );
}
