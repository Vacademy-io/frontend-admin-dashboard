import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/assessment/")({
    component: () => <div>Hello /assessment/!</div>,
});
