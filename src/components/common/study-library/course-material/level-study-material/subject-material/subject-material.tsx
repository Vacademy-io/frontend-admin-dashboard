// subject-material.tsx
import { useEffect, useState } from "react";
import { AddModulesButton } from "./module-material/add-modules.tsx/add-modules-button";
import { Modules } from "./module-material/add-modules.tsx/modules";
import { Module } from "@/types/study-library/modules-with-chapters";
import { useRouter } from "@tanstack/react-router";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { CaretLeft } from "@phosphor-icons/react";
import { formatClassName } from "@/lib/study-library/class-formatter";
import { SessionDropdown } from "@/components/common/session-dropdown";
import { SearchInput } from "@/components/common/students/students-list/student-list-section/search-input";
import { useModulesWithChaptersStore } from "@/stores/study-library/use-modules-with-chapters-store";
import { useAddModule } from "@/services/study-library/module-operations/add-module";
import { useUpdateModule } from "@/services/study-library/module-operations/update-module";
import { useDeleteModule } from "@/services/study-library/module-operations/delete-module";
interface SubjectModulesProps {
    classNumber: string | undefined;
    subject: string;
    subjectId: string;
}

export const SubjectMaterial = ({ classNumber, subject, subjectId }: SubjectModulesProps) => {
    const router = useRouter();
    const { modulesWithChaptersData } = useModulesWithChaptersStore();

    const addModuleMutation = useAddModule();
    const updateModuleMutation = useUpdateModule();
    const deleteModuleMutation = useDeleteModule();

    const [searchInput, setSearchInput] = useState("");

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleAddModule = (module: Module) => {
        addModuleMutation.mutate({ subjectId: subjectId, module: module });
    };

    const handleDeleteModule = (module: Module) => {
        deleteModuleMutation.mutate(module.id);
    };

    const handleEditModule = (updatedModule: Module) => {
        updateModuleMutation.mutate({ moduleId: updatedModule.id, module: updatedModule });
    };

    const formattedClass = formatClassName(classNumber);

    const handleBackClick = () => {
        router.navigate({
            to: `/study-library/${formattedClass.toLowerCase()}-class-study-library`,
        });
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>{`${formattedClass} Class ${subject}`}</div>
        </div>
    );

    const { setNavHeading } = useNavHeadingStore();

    const isLoading =
        addModuleMutation.isPending ||
        deleteModuleMutation.isPending ||
        updateModuleMutation.isPending;

    useEffect(() => {
        setNavHeading(heading);
    }, []);

    return (
        <div className="flex h-full w-full flex-col gap-8 text-neutral-600">
            <div className="flex items-center justify-between gap-80">
                <div className="flex w-full flex-col gap-2">
                    <div className="text-h3 font-semibold">Manage Your Modules</div>
                    <div className="text-subtitle">
                        Explore and manage modules for {formattedClass} Class {subject}. Click on a
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
                classNumber={classNumber || ""}
                subject={subject}
                isLoading={isLoading}
            />
        </div>
    );
};
