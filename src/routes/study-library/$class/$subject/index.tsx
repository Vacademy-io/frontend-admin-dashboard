// routes/study-library/$class/$subject/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { parseClassFromRoute } from "@/lib/study-library/class-formatter";
import { SubjectMaterial } from "@/components/common/study-library/upload-study-material/class-study-material/subject-material/subject-material";

export const Route = createFileRoute("/study-library/$class/$subject/")({
    component: SubjectModulesPage,
});

function SubjectModulesPage() {
    const { class: className, subject } = Route.useParams();
    const classNumber = parseClassFromRoute(className);
    const subjectName = subject.replace(/-/g, " ");

    return (
        <LayoutContainer>
            <SubjectMaterial classNumber={classNumber} subject={subjectName} />
        </LayoutContainer>
    );
}
