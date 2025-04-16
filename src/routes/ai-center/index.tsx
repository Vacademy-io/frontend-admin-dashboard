import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute } from "@tanstack/react-router";
import GenerateAIAssessmentComponent from "./-components/GenerateAssessment";
import GenerateAiQuestionPaperComponent from "./-components/-question-paper/GenerateQuestionPaper";

export const Route = createFileRoute("/ai-center/")({
    component: () => (
        <LayoutContainer>
            <RouteComponent />
        </LayoutContainer>
    ),
});

function RouteComponent() {
    return (
        <div className="grid grid-cols-3 gap-4">
            <GenerateAIAssessmentComponent />
            <GenerateAiQuestionPaperComponent />
        </div>
    );
}
