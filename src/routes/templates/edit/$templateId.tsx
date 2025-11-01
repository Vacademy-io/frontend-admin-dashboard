import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const TemplateEditorGrapes = lazy(() => import('../create/-components/TemplateEditorGrapes').then(module => ({ default: module.TemplateEditorGrapes })));

export const Route = createFileRoute('/templates/edit/$templateId')({
    component: TemplateEditPage,
});

function TemplateEditPage() {
    const { templateId } = Route.useParams();
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-screen w-screen bg-background">
                    <Loader2 className="size-6 animate-spin" />
                    <span className="ml-2">Loading editor...</span>
                </div>
            }
        >
            <TemplateEditorGrapes templateId={templateId} />
        </Suspense>
    );
}

