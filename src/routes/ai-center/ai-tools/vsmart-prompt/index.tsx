import { createFileRoute } from "@tanstack/react-router";
import { GenerateQuestionsFromText } from "./-components/GenerateQuestionsFromText";
import { AICenterProvider } from "@/routes/ai-center/-contexts/useAICenterContext";

export const Route = createFileRoute("/ai-center/ai-tools/vsmart-prompt/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <AICenterProvider>
            <GenerateQuestionsFromText />
        </AICenterProvider>
    );
}
