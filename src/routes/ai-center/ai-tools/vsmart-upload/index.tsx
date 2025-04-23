import { createFileRoute } from "@tanstack/react-router";
import GenerateAIAssessmentComponent from "./-components/GenerateAssessment";
import { AICenterProvider } from "@/routes/ai-center/-contexts/useAICenterContext";
export const Route = createFileRoute("/ai-center/ai-tools/vsmart-upload/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <AICenterProvider>
            <GenerateAIAssessmentComponent />
        </AICenterProvider>
    );
}
