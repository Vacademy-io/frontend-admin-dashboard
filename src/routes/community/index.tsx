import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { PublishTab } from "./-components/PublishTab";
import { CommunityPageHeader } from "./-components/CommunityPageHeader";
import { useEffect } from "react";
import { Helmet } from "react-helmet";

export const Route = createFileRoute("/community/")({
    component: () => (
        <LayoutContainer className="!m-0">
            <CommunityPage />
        </LayoutContainer>
    ),
});

function CommunityPage() {
    const { setNavHeading } = useNavHeadingStore();
    useEffect(() => {
        setNavHeading(<h1 className="text-lg">Community</h1>);
    }, []);
    return (
        <>
            <Helmet>
                <title>Community</title>
                <meta
                    name="description"
                    content="This page contails all the qustion/question-bank created by the vacademy community"
                />
            </Helmet>
            <div className="flex flex-col">
                <PublishTab></PublishTab>
                <CommunityPageHeader></CommunityPageHeader>
            </div>
        </>
    );
}
