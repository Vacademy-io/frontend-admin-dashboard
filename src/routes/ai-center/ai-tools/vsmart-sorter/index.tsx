import { createFileRoute } from "@tanstack/react-router";
import SortTopicQuestions from "./-components/SortTopicQuestions";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { AICenterProvider } from "../../-contexts/useAICenterContext";

export const Route = createFileRoute("/ai-center/ai-tools/vsmart-sorter/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <LayoutContainer>
            <AICenterProvider>
                <SortTopicQuestions />
            </AICenterProvider>
        </LayoutContainer>
    );
}
