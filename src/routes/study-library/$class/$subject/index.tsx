// routes/study-library/$class/$subject/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { parseClassFromRoute } from "@/lib/study-library/class-formatter";
import { SubjectMaterial } from "@/components/common/study-library/upload-study-material/class-study-material/subject-material/subject-material";

interface SubjectSearchParams {
    subjectId: string;
}

export const Route = createFileRoute("/study-library/$class/$subject/")({
    component: SubjectModulesPage,
    validateSearch: (search: Record<string, unknown>): SubjectSearchParams => {
        // You can add validation here if needed
        return {
            subjectId: search.subjectId as string,
        };
    },
});

function SubjectModulesPage() {
    const { class: className, subject } = Route.useParams();
    const searchParams = Route.useSearch();
    const classNumber = parseClassFromRoute(className);
    const subjectName = subject.replace(/-/g, " ");

    return (
        <LayoutContainer>
            <SubjectMaterial
                classNumber={classNumber}
                subject={subjectName}
                subjectId={searchParams.subjectId}
            />
        </LayoutContainer>
    );
}
