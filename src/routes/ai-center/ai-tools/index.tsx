import { createFileRoute } from "@tanstack/react-router";
import { AICenterProvider } from "../-contexts/useAICenterContext";

export const Route = createFileRoute("/ai-center/ai-tools/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <AICenterProvider>
            <p>welcome to ai center</p>
        </AICenterProvider>
    );
}
