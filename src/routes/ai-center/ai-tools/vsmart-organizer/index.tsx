import { createFileRoute } from "@tanstack/react-router";
import SortAndSplitTopicQuestions from "./-components/SortAndSplitTopicQuestions";
import { AICenterProvider } from "@/routes/ai-center/-contexts/useAICenterContext";

export const Route = createFileRoute("/ai-center/ai-tools/vsmart-organizer/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <AICenterProvider>
            <SortAndSplitTopicQuestions />
        </AICenterProvider>
    );
}
