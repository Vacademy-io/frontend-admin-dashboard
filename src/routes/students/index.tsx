import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/students/")({
    component: () => <div>Hello /students/!</div>,
});
