import { createFileRoute } from "@tanstack/react-router";
import CreateAssessmentComponent from "./-components/CreateAssessmentComponent";

export const Route = createFileRoute("/assessment/create-assessment/$examtype/")({
    component: () => <CreateAssessmentComponent />,
});
