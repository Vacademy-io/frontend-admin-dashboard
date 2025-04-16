import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "./-components/layout-container/layout-container";

export const Route = createFileRoute("/evaluator-ai/")({
    component: () => (
        <LayoutContainer>
            <RouteComponent />
        </LayoutContainer>
    ),
});

function RouteComponent() {
    return <div>Hello evaluator-ai!</div>;
}
