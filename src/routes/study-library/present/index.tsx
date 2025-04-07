import { createFileRoute } from "@tanstack/react-router";
import "./styles.css";
import SlidesEditor from "@/components/common/slides/SlideEditorComponent";
export const Route = createFileRoute("/study-library/present/")({
    component: RouteComponent,
});

function RouteComponent() {
    return <SlidesEditor />;
}
