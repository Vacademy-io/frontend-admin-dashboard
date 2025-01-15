import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";

export const Route = createFileRoute("/dashboard/")({
    component: Dashboard,
});

export function Dashboard() {
    return <LayoutContainer></LayoutContainer>;
}
