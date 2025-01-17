import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { ModuleMaterial } from "@/components/common/study-library/upload-study-material/class-study-material/subject-material/module-material/module-material";
import { useSidebar } from "@/components/ui/sidebar";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { truncateString } from "@/lib/reusable/truncateString";
// import { SearchInput } from "@/components/common/search-input";
// import { useState } from "react";

export const Route = createFileRoute("/study-library/$class/$subject/$module/")({
    component: ModuleMaterialPage,
});

function ModuleMaterialPage() {
    const { class: className, subject, module: moduleParam } = Route.useParams();

    //Sidebar component
    const { open } = useSidebar();
    const data = [
        {
            id: "M1",
            name: "Live Session",
        },
    ];
    const navigate = useNavigate();
    const handleSubjectRoute = () => {
        navigate({
            to: "..",
            params: {},
            search: {},
            hash: "",
        });
    };

    const truncatedModule = truncateString(moduleParam, 10);

    const SidebarComponent = (
        <div className={`flex w-full flex-col gap-6 ${open ? "px-10" : "px-6"}`}>
            <div className="flex flex-wrap items-center gap-1 text-neutral-500">
                <p
                    className={`cursor-pointer ${open ? "visible" : "hidden"}`}
                    onClick={handleSubjectRoute}
                >
                    {subject}
                </p>
                <ChevronRightIcon className={`size-4 ${open ? "visible" : "hidden"}`} />
                <p className="cursor-pointer text-primary-500">
                    {open ? moduleParam : truncatedModule}
                </p>
            </div>
            {data.map((obj, key) => (
                <div
                    key={key}
                    className="flex w-full items-center gap-3 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-primary-500 hover:cursor-pointer hover:border hover:border-neutral-300 hover:bg-white hover:text-primary-500"
                >
                    <p className="text-h3 font-semibold">{obj.id}</p>
                    <p className={`${open ? "visible" : "hidden"}`}>{obj.name}</p>
                </div>
            ))}
        </div>
    );

    // Module page heading
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
