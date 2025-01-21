import { useRouter } from "@tanstack/react-router";
import { DotsSixVertical } from "phosphor-react";
import { useState } from "react";
import { MenuOptions } from "./module-menu-options";
import { MyDialog } from "@/components/design-system/dialog";
import { AddModulesForm } from "./add-modules-form";
import { useSidebar } from "@/components/ui/sidebar";

interface ModuleCardProps {
    module: ModuleType;
    onDelete: () => void;
    onEdit: (updatedModule: ModuleType) => void;
    classNumber: string;
    subject: string;
}

// Update the ModuleType interface
export interface ModuleType {
    name: string;
    description: string;
    imageUrl?: string;
}

// Update the ModuleCard component
export const ModuleCard = ({ module, onDelete, onEdit, classNumber, subject }: ModuleCardProps) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const router = useRouter();
    const { open } = useSidebar();

    const handleCardClick = (e: React.MouseEvent) => {
        if (
            (e.target as HTMLElement).closest(".menu-options-container") ||
            (e.target as HTMLElement).closest('[role="menu"]') ||
            (e.target as HTMLElement).closest('[role="dialog"]')
        ) {
            return;
        }

        const moduleRoute = module.name.toLowerCase().replace(/\s+/g, "-");
        const formattedClassName = `${classNumber}th-class-study-library`;
        const formattedSubject = subject.toLowerCase().replace(/\s+/g, "-");

        router.navigate({
            to: `/study-library/${formattedClassName}/${formattedSubject}/${moduleRoute}`,
        });
    };

    return (
        <div onClick={handleCardClick} className="cursor-pointer">
            <div
                className={`flex ${
                    open ? "w-[370px]" : "w-[416px]"
                } flex-col gap-4 rounded-lg border border-neutral-300 bg-neutral-50 p-6 shadow-md`}
            >
                <div className="flex items-center justify-between text-h2 font-semibold">
                    <div>{module.name}</div>
                    <DotsSixVertical />
                </div>

                {module.imageUrl ? (
                    <img
                        src={module.imageUrl}
                        alt={module.name}
                        className="h-[300px] w-full rounded-lg object-cover"
                    />
                ) : (
                    <div className="flex h-[200px] w-full items-center justify-center rounded-lg bg-neutral-100">
                        <span className="text-neutral-400">No Image</span>
                    </div>
                )}

                <div className="flex gap-2 text-title font-semibold">
                    <div className="text-primary-500">0</div>
                    <div>Chapters</div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-body text-neutral-500">{module.description}</div>
                    <MenuOptions onDelete={onDelete} onEdit={() => setIsEditDialogOpen(true)} />
                </div>
            </div>

            <MyDialog
                trigger={<></>}
                heading="Edit Module"
                dialogWidth="w-[400px]"
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            >
                <AddModulesForm
                    initialValues={module}
                    onSubmitSuccess={(updatedModule) => {
                        onEdit(updatedModule);
                        setIsEditDialogOpen(false);
                    }}
                />
            </MyDialog>
        </div>
    );
};
