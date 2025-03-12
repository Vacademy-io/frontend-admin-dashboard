import { createFileRoute } from "@tanstack/react-router";
import "./styles.css";
import { SlidesList } from "@/components/common/slides/SlideList";
export const Route = createFileRoute("/study-library/present/")({
    component: RouteComponent,
});

function RouteComponent() {
    return <SlidesList />;
}
