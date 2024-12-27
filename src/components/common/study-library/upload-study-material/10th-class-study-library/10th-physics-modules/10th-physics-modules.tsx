import { useEffect, useState } from "react";
import { AddModulesButton } from "./add-modules.tsx/add-modules-button";
import { Modules, ModuleType } from "./add-modules.tsx/modules";
import { useRouter } from "@tanstack/react-router";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { CaretLeft } from "@phosphor-icons/react";

export const Class10PhysicsModules = () => {
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

    const handleBackClick = () => {
        router.navigate({
            to: "/study-library/10-class-study-library",
        });
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>10th Class Physics</div>
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
