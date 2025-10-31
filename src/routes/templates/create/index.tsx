import { createFileRoute } from '@tanstack/react-router';
import { TemplateEditorGrapes } from './-components/TemplateEditorGrapes';

export const Route = createFileRoute('/templates/create/')({
    component: TemplateCreatePage,
});

function TemplateCreatePage() {
    return <TemplateEditorGrapes templateId={null} />;
}

