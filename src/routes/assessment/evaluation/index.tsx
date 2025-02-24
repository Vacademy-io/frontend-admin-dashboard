import { createFileRoute } from "@tanstack/react-router";
import PDFEvaluator from "./-components/pdf-editor";

export const Route = createFileRoute("/assessment/evaluation/")({
    component: () => <PDFEvaluator />,
});
