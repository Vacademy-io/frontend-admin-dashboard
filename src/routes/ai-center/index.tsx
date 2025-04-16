import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute } from "@tanstack/react-router";
import GenerateAIAssessmentComponent from "./-components/generate-assessment/GenerateAssessment";
import { GenerateQuestionsFromAudio } from "./-components/generate-questions-from-audio/GenerateQuestionsFromAudio";
import { useState } from "react";
import { DashboardLoader } from "@/components/core/dashboard-loader";

export const Route = createFileRoute("/ai-center/")({
    component: () => (
        <LayoutContainer>
            <RouteComponent />
        </LayoutContainer>
    ),
});

function RouteComponent() {
    const [loader, setLoader] = useState(false);
    const handleLoader = (value: boolean) => {
        setLoader(value);
    };
    return loader ? (
        <DashboardLoader />
    ) : (
        <div className="flex items-center justify-start gap-8">
            <GenerateAIAssessmentComponent />
            <GenerateQuestionsFromAudio handleLoader={handleLoader} />
        </div>
    );
}
