import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute } from "@tanstack/react-router";
import { ScheduleTestMainComponent } from "./-components/ScheduleTestMainComponent";
export const Route = createFileRoute("/assessment/tests/")({
    component: () => (
        <LayoutContainer>
            <ScheduleTestMainComponent />
        </LayoutContainer>
    ),
});
