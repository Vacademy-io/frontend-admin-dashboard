import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute } from "@tanstack/react-router";
import GenerateAIAssessmentComponent from "./-components/generate-assessment/GenerateAssessment";
import { GenerateQuestionsFromAudio } from "./-components/generate-questions-from-audio/GenerateQuestionsFromAudio";

export const Route = createFileRoute("/ai-center/")({
    component: () => (
        <LayoutContainer>
            <RouteComponent />
        </LayoutContainer>
    ),
});

function RouteComponent() {
    return (
        <div className="flex items-center justify-start gap-8">
            <GenerateAIAssessmentComponent />
            <GenerateQuestionsFromAudio />
        </div>
    );
}
