import { createFileRoute } from "@tanstack/react-router";
import HeroSection from "./evaluation-tool/-components/home";

export const Route = createFileRoute("/evaluation/")({
    component: RouteComponent,
});

function RouteComponent() {
    return <HeroSection />;
}
