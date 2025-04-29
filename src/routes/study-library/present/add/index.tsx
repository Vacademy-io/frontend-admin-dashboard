import SlidesEditorComponent from "@/components/common/slides/SlideEditorComponent";
import { createFileRoute } from "@tanstack/react-router"

interface AddPresentParams {
  title: string;
  description: string;
  id: string;
  isEdit: boolean;
}
export const Route = createFileRoute("/study-library/present/add/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): AddPresentParams => {
    return {
      title: search.title as string,
      description: search.description as string,
      id: search.id as string,
      isEdit: search.isEdit as boolean,
    };
  },
})

function RouteComponent() {
  const { title = "", description = "", id, isEdit } = Route.useSearch();
  return <SlidesEditorComponent metaData={{ title, description }} presentationId={id} isEdit={isEdit} />;
}

