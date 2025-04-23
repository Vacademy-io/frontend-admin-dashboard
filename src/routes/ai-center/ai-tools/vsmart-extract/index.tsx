import { createFileRoute } from "@tanstack/react-router";
import GenerateAiQuestionPaperComponent from "./-components/GenerateQuestionPaper";
import { AICenterProvider } from "@/routes/ai-center/-contexts/useAICenterContext";
export const Route = createFileRoute("/ai-center/ai-tools/vsmart-extract/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <AICenterProvider>
            <GenerateAiQuestionPaperComponent />
        </AICenterProvider>
    );
}
