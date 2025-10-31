import { createFileRoute } from '@tanstack/react-router';
import { TemplateEditorGrapes } from '../create/-components/TemplateEditorGrapes';

export const Route = createFileRoute('/templates/edit/$templateId')({
    component: TemplateEditPage,
});

function TemplateEditPage() {
    const { templateId } = Route.useParams();
    return <TemplateEditorGrapes templateId={templateId} />;
}

