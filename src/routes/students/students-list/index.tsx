import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
// import { EmptyDashboard } from "@/components/common/students/empty-dashboard/empty-dashboard";
import { StudentsListSection } from "@/components/common/students/students-list/student-list-section/students-list-section";
import { Helmet } from "react-helmet";

export const Route = createFileRoute("/students/students-list/")({
    component: StudentsList,
});

export function StudentsList() {
    return (
        <LayoutContainer>
            {/* <EmptyDashboard /> */}
            <Helmet>
                <title>Students</title>
                <meta
                    name="description"
                    content="This page shows all the students of the institute."
                />
            </Helmet>
            <StudentsListSection />
        </LayoutContainer>
    );
}
