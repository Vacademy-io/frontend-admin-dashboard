import { createFileRoute } from '@tanstack/react-router';

// Route definition only - component is lazy loaded from index.lazy.tsx
export const Route = createFileRoute('/templates/create/')({
    // Component is defined in index.lazy.tsx
});

function TemplateCreatePage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-screen w-screen bg-background">
                    <Loader2 className="size-6 animate-spin" />
                    <span className="ml-2">Loading editor...</span>
                </div>
            }
        >
            <TemplateEditorGrapes templateId={null} />
        </Suspense>
    );
}
