import { useEffect } from "react";
import { usePageStore } from "@/stores/usePageStore";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute } from "@tanstack/react-router";
import { EmptyDashboard } from "@/components/common/students/empty-dashboard/empty-dashboard";

export const Route = createFileRoute("/students/students-list/")({
    component: StudentDashboard,
});

export function StudentDashboard() {
    const { setCurrentPage } = usePageStore();

    useEffect(() => {
        setCurrentPage("Students", "/students/students-list/");
    }, []);

    return (
        <LayoutContainer>
            <EmptyDashboard />
        </LayoutContainer>
    );
}
