// routes/study-library/$class/$subject/$module/$chapter/index.tsx
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { useSidebar } from "@/components/ui/sidebar";
import { truncateString } from "@/lib/reusable/truncateString";
import { ChapterMaterial } from "@/components/common/study-library/course-material/level-study-material/subject-material/module-material/chapter-material";
import { ModulesWithChaptersProvider } from "@/providers/study-library/modules-with-chapters-provider";
import { InitStudyLibraryProvider } from "@/providers/study-library/init-study-library-provider";
import { getLevelName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getLevelNameById";
import { getSubjectName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getSubjectNameById";
import { getModuleName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getModuleNameById";

interface ModulesSearchParams {
    courseId: string;
    levelId: string;
    subjectId: string;
    moduleId: string;
}

export const Route = createFileRoute("/study-library/courses/levels/subjects/modules/chapters/")({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): ModulesSearchParams => {
        return {
            courseId: search.courseId as string,
            levelId: search.levelId as string,
            subjectId: search.subjectId as string,
            moduleId: search.moduleId as string,
        };
    },
});

function RouteComponent() {
    // const { class: className, subject, module: moduleName } = Route.useParams()

    const searchParams = Route.useSearch();

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
            search: {
                courseId: searchParams.courseId,
                levelId: searchParams.levelId,
                subjectId: searchParams.subjectId,
            },
            hash: "",
        });
    };

    const className = getLevelName(searchParams.levelId);
    const subject = getSubjectName(searchParams.subjectId);
    const moduleName = getModuleName(searchParams.moduleId);

    const truncatedModule = truncateString(moduleName, 10);

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
                    {open ? moduleName : truncatedModule}
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

    const formattedModuleName = moduleName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    const moduleData = {
        id: "123",
        module_name: formattedModuleName,
        description:
            "Explore and manage chapters for 10th Class Physics. Click on a chapter to view and access eBooks, video lectures, and study resources, or add new materials to enhance your learning experience.",
        status: "",
        thumbnail_id: "",
    };

    return (
        <LayoutContainer sidebarComponent={SidebarComponent}>
            <InitStudyLibraryProvider>
                <ModulesWithChaptersProvider subjectId={searchParams.subjectId}>
                    <ChapterMaterial
                        classNumber={classNumber}
                        subject={formattedSubject}
                        module={moduleData}
                    />
                </ModulesWithChaptersProvider>
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
