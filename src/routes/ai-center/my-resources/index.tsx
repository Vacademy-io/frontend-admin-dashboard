import { createFileRoute } from '@tanstack/react-router';
import MyResources from '../-components/My-Resources-List/MyResources';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { AICenterProvider } from '../-contexts/useAICenterContext';

export const Route = createFileRoute('/ai-center/my-resources/')({
    component: () => (
        <LayoutContainer>
            <AICenterProvider>
                <RouteComponent />
            </AICenterProvider>
        </LayoutContainer>
    ),
});

function RouteComponent() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="mb-4 text-2xl font-bold">My Resources</h1>
            <MyResources />;
        </div>
    );
}
