// modules.tsx
import { EmptyModulesImage } from "@/assets/svgs";
import { ModuleCard } from "./module-card";
import { Sortable, SortableItem } from "@/components/ui/sortable";
import { closestCorners } from "@dnd-kit/core";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useState } from "react";
import { Module, ModulesWithChapters } from "@/types/study-library/modules-with-chapters";

interface ModulesProps {
    modules: ModulesWithChapters[] | null;
    onDeleteModule: (module: Module) => void;
    onEditModule: (updatedModule: Module) => void;
    classNumber: string;
    subject: string;
    onOrderChange?: (
        updatedOrder: { module_id: string; subject_id: string; module_order: number }[],
    ) => void;
    isLoading?: boolean;
}

export const Modules = ({
    modules: initialModules,
    onDeleteModule,
    onEditModule,
    classNumber,
    onOrderChange,
    subject,
    isLoading = false,
}: ModulesProps) => {
    const [modules, setModules] = useState<ModulesWithChapters[] | null>(initialModules);

    const handleValueChange = (updatedModules: ModulesWithChapters[]) => {
        setModules(updatedModules);

        // Create the order payload
        const orderPayload = updatedModules.map((moduleWithChapters, index) => ({
            module_id: moduleWithChapters.module.id,
            module_name: moduleWithChapters.module.module_name,
            subject_id: "",
            module_order: index,
        }));

        onOrderChange?.(orderPayload);
    };

    if (isLoading) return <DashboardLoader />;

    return (
        <div className="h-full w-full">
            {(!modules || !modules.length) && (
                <div className="flex w-full flex-col items-center justify-center gap-8 rounded-lg py-10">
                    <EmptyModulesImage />
                    <div>No Modules have been added yet.</div>
                </div>
            )}
            <Sortable
                orientation="mixed"
                collisionDetection={closestCorners}
                value={modules?.map((m) => m.module) || []} // Pass only the modules for sorting
                onValueChange={(sortedModules) => {
                    // Reconstruct the ModulesWithChapters array with sorted modules
                    if (modules) {
                        const newOrder = sortedModules.map(
                            (sortedModule) => modules.find((m) => m.module.id === sortedModule.id)!,
                        );
                        handleValueChange(newOrder);
                    }
                }}
                overlay={<div className="bg-primary/10 size-full rounded-md" />}
                fast={false}
            >
                <div className="grid grid-cols-3 gap-10">
                    {modules?.map((moduleWithChapters, index) => (
                        <SortableItem
                            key={moduleWithChapters.module.id}
                            value={moduleWithChapters.module.id}
                            asChild
                        >
                            <div className="cursor-grab active:cursor-grabbing">
                                <ModuleCard
                                    key={index}
                                    module={moduleWithChapters.module}
                                    onDelete={() => onDeleteModule(moduleWithChapters.module)}
                                    onEdit={(updatedModule) => onEditModule(updatedModule)}
                                    classNumber={classNumber}
                                    subject={subject}
                                />
                            </div>
                        </SortableItem>
                    ))}
                </div>
            </Sortable>
        </div>
    );
};
