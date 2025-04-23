import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AICenterProvider } from "@/routes/ai-center/-contexts/useAICenterContext";
import { CaretLeft } from "phosphor-react";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";

export const Route = createFileRoute("/ai-center/ai-tools/vsmart-chat/")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        const heading = (
            <div className="flex items-center gap-4">
                <CaretLeft
                    onClick={() => {
                        navigate({
                            to: "/ai-center",
                        });
                    }}
                    className="cursor-pointer"
                />
                <div>VSmart Chat</div>
            </div>
        );

        setNavHeading(heading);
    }, []);
    ``;

    return (
        <AICenterProvider>
            <div>Hello /ai-center/ai-tools/vsmart-chat/!</div>
        </AICenterProvider>
    );
}
