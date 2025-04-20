import SlidesEditor from "@/components/common/slides/SlideEditorComponent";
import { createFileRoute } from "@tanstack/react-router"

interface AddPresentParams {
  title: string;
  description: string;
  id: string
}
export const Route = createFileRoute("/study-library/present/add/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): AddPresentParams => {
    return {
      title: search.title as string,
      description: search.description as string,
      id: search.id as string,
    };
  },
})

function RouteComponent() {
  const { title = "", description = "", id } = Route.useSearch();
  return <SlidesEditor metaData={{ title, description }} presentationId={id} />;
}

