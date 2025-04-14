import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/homework-creation/")({
    component: () => (
        <LayoutContainer>
            <RouteComponent />
        </LayoutContainer>
    ),
});

function RouteComponent() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate({
            to: "/homework-creation/assessment-list",
            params: {
                selectedTab: "liveTests",
            },
        });
    }, [navigate]);

    return null; // No need to render anything while redirecting
}
