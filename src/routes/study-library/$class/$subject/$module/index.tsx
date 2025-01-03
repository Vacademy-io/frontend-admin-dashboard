// import { createFileRoute } from "@tanstack/react-router";

// export const Route = createFileRoute("/study-library/$class/$subject/$module/")({
//     component: () => <div>Hello /study-library/$class/$subject/$module/tsx/!</div>,
// });

// routes/study-library/$class/$subject/$module.tsx
import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { ModuleMaterial } from "@/components/common/study-library/upload-study-material/class-study-material/subject-material/module-material/module-material";

export const Route = createFileRoute("/study-library/$class/$subject/$module/")({
    component: ModuleMaterialPage,
});

function ModuleMaterialPage() {
    const { class: className, subject, module: moduleParam } = Route.useParams();
    const classNumber = className.split("th-")[0];
    const formattedSubject = subject
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    const formattedModuleName = moduleParam
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    const moduleData = {
        name: formattedModuleName,
        description: "", // You might want to store this in state management
    };

    return (
        <LayoutContainer>
            <ModuleMaterial
                classNumber={classNumber}
                subject={formattedSubject}
                module={moduleData}
            />
        </LayoutContainer>
    );
}
