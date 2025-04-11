import SlidesEditor from "@/components/common/slides/SlideEditorComponent";
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/study-library/present/add/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <SlidesEditor />;
}

