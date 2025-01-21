// modules.tsx
import { EmptyModulesImage } from "@/assets/svgs";
import { ModuleCard, ModuleType } from "./module-card";

interface ModulesProps {
    modules: ModuleType[];
    onDeleteModule: (index: number) => void;
    onEditModule: (index: number, updatedModule: ModuleType) => void;
    classNumber: string;
    subject: string;
}

export const Modules = ({
    modules,
    onDeleteModule,
    onEditModule,
    classNumber,
    subject,
}: ModulesProps) => {
    return (
        <div className="h-full w-full">
            {!modules.length && (
                <div className="flex w-full flex-col items-center justify-center gap-8 rounded-lg py-10">
                    <EmptyModulesImage />
                    <div>No Modules have been added yet.</div>
                </div>
            )}
            <div className="grid grid-cols-3 gap-10">
                {modules.map((module, index) => (
                    <ModuleCard
                        key={index}
                        module={module}
                        onDelete={() => onDeleteModule(index)}
                        onEdit={(updatedModule) => onEditModule(index, updatedModule)}
                        classNumber={classNumber}
                        subject={subject}
                    />
                ))}
            </div>
        </div>
    );
};
