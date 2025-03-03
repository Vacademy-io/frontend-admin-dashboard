import { createFileRoute } from "@tanstack/react-router";
import PDFEvaluator from "./-components/pdf-editor";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";

export const Route = createFileRoute("/assessment/evaluation/")({
    component: () => (
        <LayoutContainer>
            <PDFEvaluator />
        </LayoutContainer>
    ),
});
