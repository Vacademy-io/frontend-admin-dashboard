import { useState } from "react";
import { AddModulesButton } from "./module-material/add-modules.tsx/add-modules-button";
import { Modules } from "./module-material/add-modules.tsx/modules";
import { Module } from "@/stores/study-library/use-modules-with-chapters-store";
import { useRouter } from "@tanstack/react-router";
import { SessionDropdown } from "@/components/common/session-dropdown";
import { SearchInput } from "@/components/common/students/students-list/student-list-section/search-input";
import { useModulesWithChaptersStore } from "@/stores/study-library/use-modules-with-chapters-store";
import { useAddModule } from "@/services/study-library/module-operations/add-module";
import { useUpdateModule } from "@/services/study-library/module-operations/update-module";
import { useDeleteModule } from "@/services/study-library/module-operations/delete-module";
import { getLevelName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getLevelNameById";
import { getSubjectName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getSubjectNameById";

export const ModuleMaterial = () => {
    const router = useRouter();
    const { modulesWithChaptersData } = useModulesWithChaptersStore();

    const addModuleMutation = useAddModule();
    const updateModuleMutation = useUpdateModule();
    const deleteModuleMutation = useDeleteModule();

    const [searchInput, setSearchInput] = useState("");

    const { courseId, subjectId, levelId } = router.state.location.search;

    // Ensure courseId, subjectId, and levelId exist before proceeding
    if (!courseId) return <>Course Not found</>;
    if (!subjectId) return <>Subject Not found</>;
    if (!levelId) return <>Level Not found</>;

    const subject = getSubjectName(subjectId);
    const levelName = getLevelName(levelId);

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleAddModule = (module: Module) => {
        addModuleMutation.mutate({ subjectId, module });
    };

    const handleDeleteModule = (module: Module) => {
        deleteModuleMutation.mutate(module.id);
    };

    const handleEditModule = (updatedModule: Module) => {
        updateModuleMutation.mutate({ moduleId: updatedModule.id, module: updatedModule });
    };

    const isLoading =
        addModuleMutation.isPending ||
        deleteModuleMutation.isPending ||
        updateModuleMutation.isPending;

    return (
        <div className="flex h-full w-full flex-col gap-8 text-neutral-600">
            <div className="flex items-center justify-between gap-80">
                <div className="flex w-full flex-col gap-2">
                    <div className="text-h3 font-semibold">Manage Your Modules</div>
                    <div className="text-subtitle">
                        Explore and manage modules for {levelName} Class {subject}. Click on a
                        module to view and organize chapters, eBooks, and video lectures, or add new
                        resources to expand your study materials.
                    </div>
                </div>
                <AddModulesButton onAddModule={handleAddModule} />
            </div>
            <div className="flex items-center gap-6">
                <SessionDropdown className="text-title font-semibold" />
                <SearchInput
                    searchInput={searchInput}
                    onSearchChange={handleSearchInputChange}
                    placeholder="Search module"
                />
            </div>
            <Modules
                modules={modulesWithChaptersData}
                onDeleteModule={handleDeleteModule}
                onEditModule={handleEditModule}
                isLoading={isLoading}
            />
        </div>
    );
};
