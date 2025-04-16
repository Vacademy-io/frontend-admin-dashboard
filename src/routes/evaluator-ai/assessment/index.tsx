import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "../-components/layout-container/layout-container";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MyButton } from "@/components/design-system/button";
import { Examination } from "@/svgs";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/evaluator-ai/assessment/")({
    component: () => (
        <LayoutContainer>
            <RouteComponent />
        </LayoutContainer>
    ),
});

function RouteComponent() {
    const { setNavHeading } = useNavHeadingStore();
    const navigate = useNavigate();

    useEffect(() => {
        setNavHeading(<h1 className="text-lg">Assessment</h1>);
    }, []);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <MyButton
                    className="w-1/3 ml-auto"
                    onClick={() => navigate({ to: "/evaluator-ai/assessment/create-assessment" })}
                >
                    Create Assessment
                </MyButton>
            </DialogTrigger>
            <DialogContent className="mx-auto">
                <div className="p-2 bg-gray-100 rounded-md w-4/5 flex flex-col items-center mx-auto text-center">
                    <Examination />
                    <h2 className="text-lg font-semibold">Create Assessment</h2>
                    <p>A Fixed assessment that goes live for specific schedule, simulating real exam conditions.</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
