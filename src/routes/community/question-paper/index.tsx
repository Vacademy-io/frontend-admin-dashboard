import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { useEffect } from "react";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { InternalSidebar } from "./-components/InternalSidebar";
import { QuestionDisplay } from "./-components/QuestionDisplay";

export const Route = createFileRoute("/community/question-paper/")({
    component: () => (
        <LayoutContainer intrnalMargin={false} className="flex-1">
            <QuestionPaperLayout />
        </LayoutContainer>
    ),
});

function QuestionPaperLayout() {
    const { setNavHeading } = useNavHeadingStore();
    useEffect(() => {
        setNavHeading(<h1 className="text-lg">Community</h1>);
    }, []);
    return (
        <div className="flex h-full flex-1 flex-row">
            <InternalSidebar />
            <QuestionDisplay />
        </div>
    );
}
