import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LayoutContainer } from "./-components/layout-container/layout-container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/evaluator-ai/")({
    component: () => (
        <LayoutContainer>
            <RouteComponent />
        </LayoutContainer>
    ),
});

function RouteComponent() {
    const navigate = useNavigate();
    return (
        <div className="w-full rounded-md border bg-white p-8">
            <h1 className="mb-8 px-4 text-2xl font-semibold">AI Evaluator</h1>

            <div className="space-y-6">
                <Card
                    className="cursor-pointer rounded-md border"
                    onClick={() => {
                        navigate({ to: "/evaluator-ai/students" });
                    }}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-center text-xl">Enroll Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-center text-base text-gray-700">
                            Add student for which you have to perform evaluation
                        </CardDescription>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer rounded-md border"
                    onClick={() => {
                        navigate({ to: "/evaluator-ai/assessment" });
                    }}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-center text-xl">Create Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-center text-base text-gray-700">
                            Add assessments to evaluate
                        </CardDescription>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer rounded-md border"
                    onClick={() => {
                        navigate({ to: "/evaluator-ai/evaluation" });
                    }}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-center text-xl">Evaluate through AI</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-center text-base text-gray-700">
                            Link Students and assessment and see the magic
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
