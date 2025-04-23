import { createFileRoute } from "@tanstack/react-router";
import GenerateAiQuestionFromImageComponent from "./-components/GenerateQuestionPaper";
import { AICenterProvider } from "@/routes/ai-center/-contexts/useAICenterContext";
export const Route = createFileRoute("/ai-center/ai-tools/vsmart-vision/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <AICenterProvider>
            <GenerateAiQuestionFromImageComponent />
        </AICenterProvider>
    );
}
