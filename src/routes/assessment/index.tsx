import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/assessment/")({
    component: AssessmentPage,
});

function AssessmentPage() {
    return <LayoutContainer></LayoutContainer>;
}
