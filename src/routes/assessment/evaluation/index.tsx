import { createFileRoute } from "@tanstack/react-router";
import PDFEvaluator from "./-components/pdf-editor";

export const Route = createFileRoute("/assessment/evaluation/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="m-2 w-full space-x-2 p-2">
            <PDFEvaluator />
        </div>
    );
}
