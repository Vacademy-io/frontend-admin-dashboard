import { createFileRoute } from "@tanstack/react-router";
import { AICenterProvider } from "@/routes/ai-center/-contexts/useAICenterContext";
export const Route = createFileRoute("/ai-center/ai-tools/vsmart-chat/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <AICenterProvider>
            <div>Hello /ai-center/ai-tools/vsmart-chat/!</div>
        </AICenterProvider>
    );
}
