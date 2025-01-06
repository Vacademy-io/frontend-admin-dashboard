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
        description:
            "Explore and manage chapters for 10th Class Physics. Click on a chapter to view and access eBooks, video lectures, and study resources, or add new materials to enhance your learning experience.",
    };

    const data = [
        {
            id: "M1",
            name: "Live Session",
        },
        {
            id: "M2",
            name: "NCERT",
        },
    ];

    // const {sidebarOpen} = useSidebarStore();

    const SidebarComponent = (
        <div className="flex w-full flex-col gap-6">
            {data.map((obj, key) => (
                <div
                    key={key}
                    className="flex w-full items-center gap-3 px-4 py-2 text-neutral-500 hover:border hover:border-neutral-300 hover:bg-white hover:text-primary-500"
                >
                    <p className="text-h3 font-semibold">{obj.id}</p>
                    <p>{obj.name}</p>
                </div>
            ))}
        </div>
    );

    return (
        <LayoutContainer sidebarComponent={SidebarComponent}>
            <ModuleMaterial
                classNumber={classNumber}
                subject={formattedSubject}
                module={moduleData}
            />
        </LayoutContainer>
    );
}
