import { createFileRoute } from "@tanstack/react-router";
import CreateAssessmentComponent from "./-components/CreateAssessmentComponent";

export const Route = createFileRoute("/assessment/tests/create-assessment/")({
    component: () => <CreateAssessmentComponent />,
});
