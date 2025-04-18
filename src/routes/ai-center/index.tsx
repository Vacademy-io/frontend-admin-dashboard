import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute } from "@tanstack/react-router";
import GenerateAIAssessmentComponent from "./-components/generate-assessment/GenerateAssessment";
import { GenerateQuestionsFromAudio } from "./-components/generate-questions-from-audio/GenerateQuestionsFromAudio";
import GenerateAiQuestionPaperComponent from "./-components/generate-question/GenerateQuestionPaper";
import GenerateAiQuestionFromImageComponent from "./-components/generate-question-from-image/GenerateQuestionPaper";
import { GenerateQuestionsFromText } from "./-components/generate-questions-from-text/GenerateQuestionsFromText";
import SortAndSplitTopicQuestions from "./-components/sort-split-ai-pdf/SortAndSplitTopicQuestions";
import SortTopicQuestions from "./-components/sort-questions-ai-pdf/SortTopicQuestions";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { AICenterProvider } from "./-contexts/useAICenterContext";

export const Route = createFileRoute("/ai-center/")({
    component: () => (
        <LayoutContainer>
            <AICenterProvider>
                <RouteComponent />
            </AICenterProvider>
        </LayoutContainer>
    ),
});

function RouteComponent() {
    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading("AI Center");
    }, []);

    return (
        <div className="grid grid-cols-3 gap-10">
            <GenerateAIAssessmentComponent />
            <GenerateQuestionsFromAudio />
            <GenerateAiQuestionPaperComponent />
            <GenerateAiQuestionFromImageComponent />
            <GenerateQuestionsFromText />
            <SortAndSplitTopicQuestions />
            <SortTopicQuestions />
        </div>
    );
}
