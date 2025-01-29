// subject-material.tsx
import { useEffect, useState } from "react";
import { AddModulesButton } from "./module-material/add-modules.tsx/add-modules-button";
import { Modules } from "./module-material/add-modules.tsx/modules";
import { ModuleType } from "./module-material/add-modules.tsx/module-card";
import { useRouter } from "@tanstack/react-router";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { CaretLeft } from "@phosphor-icons/react";
import { formatClassName } from "@/lib/study-library/class-formatter";
import { SessionDropdown } from "@/components/common/session-dropdown";
import { SearchInput } from "@/components/common/students/students-list/student-list-section/search-input";

interface SubjectModulesProps {
    classNumber: string | undefined;
    subject: string;
}

export const SubjectMaterial = ({ classNumber, subject }: SubjectModulesProps) => {
    const [modules, setModules] = useState<ModuleType[]>([]);
    const router = useRouter();
    // const [isModuleLoading, setIsModuleLoading] = useState(false);
    const isModuleLoading = false;

    const [searchInput, setSearchInput] = useState("");

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleAddModule = (module: ModuleType) => {
        setModules((prev) => [...prev, module]);
    };

    const handleDeleteModule = (index: number) => {
        setModules((prev) => prev.filter((_, i) => i !== index));
    };

    const handleEditModule = (index: number, updatedModule: ModuleType) => {
        setModules((prev) => prev.map((module, i) => (i === index ? updatedModule : module)));
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
                modules={modules}
                onDeleteModule={handleDeleteModule}
                onEditModule={handleEditModule}
                classNumber={classNumber || ""}
                subject={subject}
                isLoading={isModuleLoading}
            />
        </div>
    );
};
