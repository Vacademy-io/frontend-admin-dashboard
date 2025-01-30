// routes/study-library/$class/$subject/$module/$chapter/index.tsx
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChapterMaterial } from "@/components/common/study-library/upload-study-material/class-study-material/subject-material/module-material/chapter-material/add-chapters/chapter-material";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { SearchInput } from "@/components/common/students/students-list/student-list-section/search-input";
import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { ChapterSidebarAddButton } from "@/components/common/study-library/upload-study-material/class-study-material/subject-material/module-material/chapter-material/slides-material/slides-sidebar/slides-sidebar-add-button";
import { truncateString } from "@/lib/reusable/truncateString";
import { ChapterSidebarSlides } from "@/components/common/study-library/upload-study-material/class-study-material/subject-material/module-material/chapter-material/slides-material/slides-sidebar/slides-sidebar-slides";

interface ChapterSearchParams {
    subjectId: string;
}

export const Route = createFileRoute("/study-library/$class/$subject/$module/$chapter/")({
    component: Chapters,
    validateSearch: (search: Record<string, unknown>): ChapterSearchParams => {
        return {
            subjectId: search.subjectId as string,
        };
    },
});

function Chapters() {
    const params = Route.useParams();
    const { subjectId } = Route.useSearch();
    const { subject, module: moduleParam, chapter: chapterParam } = Route.useParams();
    const [inputSearch, setInputSearch] = useState("");
    const { open, state, toggleSidebar } = useSidebar();
    const navigate = useNavigate();

    const handleSubjectRoute = () => {
        navigate({
            to: "/study-library/$class/$subject",
            params: {
                class: params.class,
                subject: params.subject,
            },
            search: { subjectId },
            hash: "",
        });
    };

    const handleModuleRoute = () => {
        navigate({
            to: "..",
            params: {},
            search: {},
            hash: "",
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputSearch(e.target.value);
    };

    const trucatedChapterName = truncateString(chapterParam, 9);

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
                        {moduleParam}
                    </p>
                    <ChevronRightIcon className={`size-4 ${open ? "visible" : "hidden"}`} />
                    <p className="cursor-pointer text-primary-500">
                        {open ? chapterParam : trucatedChapterName}
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

    return (
        <LayoutContainer sidebarComponent={SidebarComponent}>
            <ChapterMaterial />
        </LayoutContainer>
    );
}
