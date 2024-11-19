import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute } from "@tanstack/react-router";
import { QuestionPapersComponent } from "./-components/QuestionPapersComponent";

export const Route = createFileRoute("/dashboard/assessment/question-papers/")({
    component: () => (
        <LayoutContainer>
            <QuestionPapersComponent />
        </LayoutContainer>
    ),
});
