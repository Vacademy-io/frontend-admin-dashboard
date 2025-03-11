import { createFileRoute } from "@tanstack/react-router";
import PDFEvaluator from "./-components/pdf-editor";

export const Route = createFileRoute("/evaluation/evaluation-tool/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="m-2 w-full space-x-2 p-2">
            <PDFEvaluator />
        </div>
    );
}
