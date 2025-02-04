import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { SearchInput } from "@/components/common/students/students-list/student-list-section/search-input";
import { SlideMaterial } from "@/components/common/study-library/course-material/level-study-material/subject-material/module-material/chapter-material/add-chapters/slide-material";
import { ChapterSidebarAddButton } from "@/components/common/study-library/course-material/level-study-material/subject-material/module-material/chapter-material/slides-material/slides-sidebar/slides-sidebar-add-button";
import { ChapterSidebarSlides } from "@/components/common/study-library/course-material/level-study-material/subject-material/module-material/chapter-material/slides-material/slides-sidebar/slides-sidebar-slides";
import { SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { truncateString } from "@/lib/reusable/truncateString";
import { InitStudyLibraryProvider } from "@/providers/study-library/init-study-library-provider";
import { ModulesWithChaptersProvider } from "@/providers/study-library/modules-with-chapters-provider";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { getChapterName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getChapterNameById";
import { getLevelName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getLevelNameById";
import { getModuleName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getModuleNameById";
import { getSubjectName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getSubjectNameById";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { CaretLeft, MagnifyingGlass } from "phosphor-react";
import { useEffect, useState } from "react";

interface ChapterSearchParams {
    courseId: string;
    levelId: string;
    subjectId: string;
    moduleId: string;
    chapterId: string;
    slideId: string;
}

export const Route = createFileRoute(
    "/study-library/courses/levels/subjects/modules/chapters/slides/",
)({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): ChapterSearchParams => {
        return {
            courseId: search.courseId as string,
            levelId: search.levelId as string,
            subjectId: search.subjectId as string,
            moduleId: search.moduleId as string,
            chapterId: search.chapterId as string,
            slideId: search.slideId as string,
        };
    },
});

function RouteComponent() {
    const searchParams = Route.useSearch();
    const [inputSearch, setInputSearch] = useState("");
    const { open, state, toggleSidebar } = useSidebar();
    const navigate = useNavigate();

    const handleSubjectRoute = () => {
        navigate({
            to: "/study-library/courses/levels/subjects/modules",
            params: {},
            search: {
                courseId: searchParams.courseId,
                levelId: searchParams.levelId,
                subjectId: searchParams.subjectId,
            },
            hash: "",
        });
    };

    const handleModuleRoute = () => {
        navigate({
            to: "/study-library/courses/levels/subjects/modules/chapters",
            params: {},
            search: {
                courseId: searchParams.courseId,
                levelId: searchParams.levelId,
                subjectId: searchParams.subjectId,
                moduleId: searchParams.moduleId,
            },
            hash: "",
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputSearch(e.target.value);
    };

    const chapterName = getChapterName(searchParams.chapterId);
    const subject = getSubjectName(searchParams.subjectId);
    const moduleName = getModuleName(searchParams.moduleId);

    const trucatedChapterName = truncateString(chapterName, 9);

    const SidebarComponent = (
        <div className="flex w-full flex-col items-center">
            <div className={`flex w-full flex-col gap-6 ${open ? "px-6" : "px-6"} -mt-10`}>
                <div className="flex flex-wrap items-center gap-1 text-neutral-500">
                    <p
                        className={`cursor-pointer ${open ? "visible" : "hidden"}`}
                        onClick={handleSubjectRoute}
                    >
                        {subject}
                    </p>
                    <ChevronRightIcon className={`size-4 ${open ? "visible" : "hidden"}`} />
                    <p
                        className={`cursor-pointer ${open ? "visible" : "hidden"}`}
                        onClick={handleModuleRoute}
                    >
                        {moduleName}
                    </p>
                    <ChevronRightIcon className={`size-4 ${open ? "visible" : "hidden"}`} />
                    <p className="cursor-pointer text-primary-500">
                        {open ? chapterName : trucatedChapterName}
                    </p>
                </div>
                <div className="flex w-full flex-col items-center gap-6">
                    {open ? (
                        <SearchInput
                            searchInput={inputSearch}
                            placeholder="Search chapters"
                            onSearchChange={handleSearchChange}
                        />
                    ) : (
                        <MagnifyingGlass
                            className="size-5 cursor-pointer text-neutral-500"
                            onClick={() => {
                                if (state === "collapsed") toggleSidebar();
                            }}
                        />
                    )}
                    <ChapterSidebarSlides />
                </div>
            </div>
            <SidebarFooter className="absolute bottom-0 flex w-full items-center justify-center py-10">
                <ChapterSidebarAddButton />
            </SidebarFooter>
        </div>
    );

    const { courseId, levelId, subjectId, moduleId } = Route.useSearch();

    const { setNavHeading } = useNavHeadingStore();

    // Module page heading
    const levelName = getLevelName(levelId);
    const subjectName = getSubjectName(subjectId);

    const handleBackClick = () => {
        navigate({
            to: `/study-library/courses/levels/subjects/modules/chapters`,
            search: {
                courseId,
                levelId,
                subjectId,
                moduleId,
            },
        });
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>{`${levelName} Class ${subjectName}`}</div>
        </div>
    );

    useEffect(() => {
        setNavHeading(heading);
    }, []);

    return (
        <LayoutContainer sidebarComponent={SidebarComponent}>
            <InitStudyLibraryProvider>
                <ModulesWithChaptersProvider subjectId={searchParams.subjectId}>
                    <SlideMaterial />
                </ModulesWithChaptersProvider>
            </InitStudyLibraryProvider>
        </LayoutContainer>
    );
}
