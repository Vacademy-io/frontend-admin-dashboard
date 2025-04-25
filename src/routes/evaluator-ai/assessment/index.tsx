import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "../-components/layout-container/layout-container";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect, useState } from "react";
import { MyButton } from "@/components/design-system/button";
import { Examination } from "@/svgs";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CalendarBlank } from "phosphor-react";

interface assessment {
    assessmentId: string;
    title: string;
}

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
    const [assessments, setAssessments] = useState<assessment[]>([]);

    useEffect(() => {
        setNavHeading(<h1 className="text-lg">Assessment</h1>);
        const storedData = localStorage.getItem("assessments");
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                setAssessments(parsed);
                console.log("Parsed assessment:", parsed);
            } catch (err) {
                console.error("Error parsing assessment:", err);
            }
        }
    }, []);

    return (
        <main className="flex min-h-screen scroll-mt-10 flex-col">
            <div className="mt-4">
                {assessments.length > 0 ? (
                    <div className="flex flex-col space-y-5">
                        <div className="flex w-full items-center justify-between">
                            <h1 className="text-xl font-semibold">Assessment List</h1>
                            <MyButton
                                scale="large"
                                buttonType="primary"
                                layoutVariant="default"
                                className="ml-auto"
                                onClick={() =>
                                    navigate({ to: "/evaluator-ai/assessment/create-assessment" })
                                }
                            >
                                <CalendarBlank size={32} />
                                Create Assessment
                            </MyButton>
                        </div>
                        {assessments.map((assessment) => (
                            <div
                                key={assessment.assessmentId}
                                className="flex flex-col rounded-md border bg-white p-4 shadow-sm transition hover:shadow-md"
                            >
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800">
                                        {assessment.title}
                                    </h3>
                                    <span className="text-xs text-gray-500">
                                        Assessment ID: {assessment.assessmentId}
                                    </span>
                                </div>
                                <Button
                                    className="ml-auto"
                                    variant={"destructive"}
                                    onClick={() => {
                                        const updatedAssessments = assessments.filter(
                                            (a) => a.assessmentId !== assessment.assessmentId,
                                        );
                                        setAssessments(updatedAssessments);
                                        localStorage.setItem(
                                            "assessments",
                                            JSON.stringify(updatedAssessments),
                                        );
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center text-gray-500">
                        <Examination className="mx-auto mb-4 size-40 text-gray-400" />
                        <p className="mb-2">No assessments available</p>
                        <MyButton
                            scale="large"
                            buttonType="primary"
                            layoutVariant="default"
                            className="ml-auto"
                            onClick={() =>
                                navigate({ to: "/evaluator-ai/assessment/create-assessment" })
                            }
                        >
                            <CalendarBlank size={32} />
                            Create Assessment
                        </MyButton>
                    </div>
                )}
            </div>
        </main>
    );
}
