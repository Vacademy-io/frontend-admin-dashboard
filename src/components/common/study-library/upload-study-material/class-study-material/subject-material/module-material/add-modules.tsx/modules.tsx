// modules.tsx
import { EmptyModulesImage } from "@/assets/svgs";
import { ModuleCard, ModuleType } from "./module-card";
import { Sortable, SortableItem } from "@/components/ui/sortable";
import { closestCorners } from "@dnd-kit/core";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useEffect, useState } from "react";

interface ModulesProps {
    modules: ModuleType[];
    onDeleteModule: (index: number) => void;
    onEditModule: (index: number, updatedModule: ModuleType) => void;
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
    const [modules, setModules] = useState(initialModules);

    const handleValueChange = (updatedModules: ModuleType[]) => {
        setModules(updatedModules);

        // Create the order payload
        const orderPayload = updatedModules.map((module, index) => ({
            module_id: module.id,
            module_name: module.name,
            subject_id: "", // This needs to be filled with actual package session id
            module_order: index,
        }));

        console.log("Updated order: ", orderPayload);

        onOrderChange?.(orderPayload);
    };

    useEffect(() => {
        setModules(initialModules);
    }, [initialModules]);

    if (isLoading) {
        return <DashboardLoader />;
    }
    return (
        <div className="h-full w-full">
            {!modules.length && (
                <div className="flex w-full flex-col items-center justify-center gap-8 rounded-lg py-10">
                    <EmptyModulesImage />
                    <div>No Modules have been added yet.</div>
                </div>
            )}
            <Sortable
                orientation="mixed"
                collisionDetection={closestCorners}
                value={modules}
                onValueChange={handleValueChange}
                overlay={<div className="bg-primary/10 size-full rounded-md" />}
            >
                <div className="grid grid-cols-3 gap-10">
                    {modules.map((module, index) => (
                        <SortableItem key={module.id} value={module.id} asChild>
                            <div className="cursor-grab active:cursor-grabbing">
                                <ModuleCard
                                    key={index}
                                    module={module}
                                    onDelete={() => onDeleteModule(index)}
                                    onEdit={(updatedModule) => onEditModule(index, updatedModule)}
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
