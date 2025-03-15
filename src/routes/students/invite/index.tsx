import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Invite } from "./-components/invite";

export const Route = createFileRoute("/students/invite/")({
    component: RouteComponent,
});

function RouteComponent() {
    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading("Invite Link");
    }, []);

    return (
        <LayoutContainer>
            <Invite />
        </LayoutContainer>
    );
}
