import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChapterMaterial } from "@/components/common/study-library/upload-study-material/class-study-material/subject-material/module-material/chapter-material/chapter-material";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { SearchInput } from "@/components/common/search-input";
import { useState } from "react";
import { MyButton } from "@/components/design-system/button";
import { Plus } from "@phosphor-icons/react";

export const Route = createFileRoute("/study-library/$class/$subject/$module/$chapter/")({
    component: Chapters,
});

function Chapters() {
    const params = Route.useParams();
    const { subject, module: moduleParam, chapter: chapterParam } = Route.useParams();
    const [inputSearch, setInputSearch] = useState("");

    //Sidebar component
    const { open } = useSidebar();
    const navigate = useNavigate();

    const handleSubjectRoute = () => {
        navigate({
            to: "/study-library/$class/$subject",
            params: {
                class: params.class,
                subject: params.subject,
            },
            search: {},
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

    const SidebarComponent = (
        <div>
            <div className={`flex w-full flex-col gap-6 ${open ? "px-10" : "px-6"}`}>
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
                    <p className="cursor-pointer text-primary-500">{chapterParam}</p>
                </div>
                <SearchInput
                    searchInput={inputSearch}
                    placeholder="Search chapters"
                    onSearchChange={handleSearchChange}
                />
                <div className="flex w-full flex-col gap-6"></div>
            </div>
            <SidebarFooter className="absolute bottom-0 right-0 flex items-center justify-center py-10">
                <MyButton
                    buttonType="primary"
                    scale="large"
                    layoutVariant={open ? "default" : "icon"}
                    className={` ${open ? "" : ""} `}
                >
                    <Plus />
                    <p className={`${open ? "visible" : "hidden"}`}>Add</p>
                </MyButton>
            </SidebarFooter>
        </div>
    );

    return (
        <LayoutContainer sidebarComponent={SidebarComponent}>
            <ChapterMaterial />
        </LayoutContainer>
    );
}
