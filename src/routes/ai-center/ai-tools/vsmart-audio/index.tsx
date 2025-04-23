import { createFileRoute } from "@tanstack/react-router";
import { GenerateQuestionsFromAudio } from "./-components/GenerateQuestionsFromAudio";
import { AICenterProvider } from "@/routes/ai-center/-contexts/useAICenterContext";
export const Route = createFileRoute("/ai-center/ai-tools/vsmart-audio/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <AICenterProvider>
            <GenerateQuestionsFromAudio />
        </AICenterProvider>
    );
}
