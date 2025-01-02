import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/study-library/$class/$subject/$module/tsx/")({
    component: () => <div>Hello /study-library/$class/$subject/$module/tsx/!</div>,
});
