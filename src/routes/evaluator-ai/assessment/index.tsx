import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "../-components/layout-container/layout-container";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MyButton } from "@/components/design-system/button";
import { Examination } from "@/svgs";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

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
        <Dialog>
            <DialogTrigger asChild>
                <MyButton
                    className="ml-auto w-1/3"
                    onClick={() => navigate({ to: "/evaluator-ai/assessment/create-assessment" })}
                >
                    Create Assessment
                </MyButton>
            </DialogTrigger>
            <div className="mt-4">
                {assessments.length > 0 ? (
                    <div className="space-y-5">
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
                        <Examination className="mx-auto mb-4 size-12 text-gray-400" />
                        <p className="mb-2">No assessments available</p>
                        <MyButton
                            onClick={() =>
                                navigate({ to: "/evaluator-ai/assessment/create-assessment" })
                            }
                        >
                            Create New Assessment
                        </MyButton>
                    </div>
                )}
            </div>
            <DialogContent className="mx-auto">
                <div className="mx-auto flex w-4/5 flex-col items-center rounded-md bg-gray-100 p-2 text-center">
                    <Examination />
                    <h2 className="text-lg font-semibold">Create Assessment</h2>
                    <p>
                        A Fixed assessment that goes live for specific schedule, simulating real
                        exam conditions.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
