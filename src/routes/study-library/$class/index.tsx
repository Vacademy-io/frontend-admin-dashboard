import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { ClassStudyMaterial } from "@/components/common/study-library/upload-study-material/class-study-material/class-study-material";

export const Route = createFileRoute("/study-library/$class/")({
    component: ClassStudyMaterialPage,
    beforeLoad: ({ params }) => {
        const validClassNames = [
            "10th-class-study-library",
            "9th-class-study-library",
            "8th-class-study-library",
        ];

        if (!validClassNames.includes(params.class)) {
            throw new Error("Invalid class name");
        }
    },
});

function ClassStudyMaterialPage() {
    const { class: className } = Route.useParams();
    const classNumber = className.split("th-")[0];

    return (
        <LayoutContainer>
            <ClassStudyMaterial classNumber={classNumber} />
        </LayoutContainer>
    );
}
