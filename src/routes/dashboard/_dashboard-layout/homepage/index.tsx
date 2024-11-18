import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/_dashboard-layout/homepage/")({
    component: () => <div>Dashboard Homepage</div>,
});
