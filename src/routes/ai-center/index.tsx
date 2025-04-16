import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute } from "@tanstack/react-router";
import GenerateAIAssessmentComponent from "./-components/generate-assessment/GenerateAssessment";
import { GenerateQuestionsFromAudio } from "./-components/generate-questions-from-audio/GenerateQuestionsFromAudio";
import GenerateAiQuestionPaperComponent from "./-components/generate-question/GenerateQuestionPaper";
import GenerateAiQuestionFromImageComponent from "./-components/generate-question-from-image/GenerateQuestionPaper";

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
            <GenerateQuestionsFromAudio />
            <GenerateAiQuestionPaperComponent />
            <GenerateAiQuestionFromImageComponent />
        </div>
    );
}
