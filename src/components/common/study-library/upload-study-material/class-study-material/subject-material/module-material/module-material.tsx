import { useEffect, useState } from "react";
import { AddModulesButton } from "./add-modules.tsx/add-modules-button";
import { ModuleType, Modules } from "./add-modules.tsx/modules";
import { useRouter } from "@tanstack/react-router";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { CaretLeft } from "@phosphor-icons/react";
import { formatClassName, getClassSuffix } from "@/lib/study-library/class-formatter";

interface ModuleMaterialProps {
    classNumber: string;
    subject: string;
    module: string;
}

export const ModuleMaterial = ({ classNumber, subject, module }: ModuleMaterialProps) => {
    const [modules, setModules] = useState<ModuleType[]>([]);

    const handleAddModule = (module: ModuleType) => {
        setModules((prev) => [...prev, module]);
    };

    const handleDeleteModule = (index: number) => {
        setModules((prev) => prev.filter((_, i) => i !== index));
    };

    const handleEditModule = (index: number, updatedSubject: ModuleType) => {
        setModules((prev) => prev.map((subject, i) => (i === index ? updatedSubject : subject)));
    };
    const router = useRouter();
    const formattedClass = formatClassName(classNumber);

    const handleBackClick = () => {
        const formattedClassName = `${classNumber}${getClassSuffix(
            classNumber,
        )}-class-study-library`;
        const formattedSubject = subject.toLowerCase().replace(/\s+/g, "-");

        router.navigate({
            to: `/study-library/${formattedClassName}/${formattedSubject}`,
        });
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>{`${formattedClass} Class ${subject} - ${module}`}</div>
        </div>
    );

    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading(heading);
    }, []);

    return (
        <div className="flex h-full w-full flex-col gap-12 text-neutral-600">
            <div className="flex items-center justify-between gap-80">
                <div className="flex w-full flex-col gap-2">
                    <div className="text-h3 font-semibold">Manage Your Modules</div>
                    <div className="text-subtitle">
                        Explore and manage modules for 10th Class Physics. Click on a module to view
                        and organize chapters, eBooks, and video lectures, or add new resources to
                        expand your study materials.
                    </div>
                </div>
                <AddModulesButton onAddModule={handleAddModule} />
            </div>
            <Modules
                modules={modules}
                onDeleteModule={handleDeleteModule}
                onEditModule={handleEditModule}
            />
        </div>
    );
};
