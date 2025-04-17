import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "../-components/layout-container/layout-container";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { StudentEnrollmentDialog } from "./-components/add-student-dialog";

export const Route = createFileRoute("/evaluator-ai/students/")({
    component: () => (
        <LayoutContainer>
            <RouteComponent />
        </LayoutContainer>
    ),
});

function RouteComponent() {
    const { setNavHeading } = useNavHeadingStore();
    useEffect(() => {
        setNavHeading(<h1 className="text-lg">Students</h1>);
    }, []);
    return (
        <main className="flex min-h-screen scroll-mt-10 flex-col">
            <StudentEnrollmentDialog />
        </main>
    );
}
