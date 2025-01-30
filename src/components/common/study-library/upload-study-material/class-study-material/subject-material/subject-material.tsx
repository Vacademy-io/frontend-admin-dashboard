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
import { useSuspenseQuery } from "@tanstack/react-query";
import { useModulesWithChaptersQuery } from "@/services/study-library/getModulesWithChapters";
import { DashboardLoader } from "@/components/core/dashboard-loader";

interface SubjectModulesProps {
    classNumber: string | undefined;
    subject: string;
    subjectId: string;
}

export const SubjectMaterial = ({ classNumber, subject, subjectId }: SubjectModulesProps) => {
    // const [isModuleLoading, setIsModuleLoading] = useState(false);
    const isModuleLoading = false;
    // const { modulesWithChaptersData, setModulesWithChaptersData } = useModulesWithChaptersStore();
    const { modulesWithChaptersData } = useModulesWithChaptersStore();
    const { isLoading } = useSuspenseQuery(useModulesWithChaptersQuery(subjectId));
    const router = useRouter();
    // const [isModuleLoading, setIsModuleLoading] = useState(false);

    const [searchInput, setSearchInput] = useState("");

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleAddModule = (module: Module) => {
        // setModulesWithChaptersData((prev) => [...prev, module]);
        console.log("module to add: ", module);
    };

    const handleDeleteModule = (index: number) => {
        // setModulesWithChaptersData((prev) => prev.filter((_, i) => i !== index));
        console.log("module to delete: ", index);
    };

    const handleEditModule = (index: number, updatedModule: Module) => {
        // setModulesWithChaptersData((prev) => prev.map((module, i) => (i === index ? updatedModule : module)));
        console.log("module to update: ", index, updatedModule);
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

    if (isLoading) {
        return <DashboardLoader />;
    }

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
                isLoading={isModuleLoading}
            />
        </div>
    );
};
