// modules.tsx
import { EmptyModulesImage } from "@/assets/svgs";
import { MyButton } from "@/components/design-system/button";
import { MyDialog } from "@/components/design-system/dialog";
import { MyDropdown } from "@/components/design-system/dropdown";
import { DotsSixVertical, DotsThree } from "@phosphor-icons/react";
import { AddModulesForm } from "./add-modules-form";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";

export interface ModuleType {
    name: string;
    description: string;
}

interface MenuOptionsProps {
    onDelete: () => void;
    onEdit: () => void;
}

const MenuOptions = ({ onDelete, onEdit }: MenuOptionsProps) => {
    const DropdownList = ["Edit Module", "Delete Module"];

    const handleMenuOptionsChange = (value: string) => {
        if (value === "Delete Module") {
            onDelete();
        } else if (value === "Edit Module") {
            onEdit();
        }
    };

    return (
        <div className="menu-options-container">
            <MyDropdown dropdownList={DropdownList} onSelect={handleMenuOptionsChange}>
                <MyButton
                    buttonType="secondary"
                    scale="small"
                    layoutVariant="icon"
                    className="flex items-center justify-center"
                >
                    <DotsThree />
                </MyButton>
            </MyDropdown>
        </div>
    );
};

interface ModuleCardProps {
    module: ModuleType;
    onDelete: () => void;
    onEdit: (updatedModule: ModuleType) => void;
    classNumber: string;
    subject: string;
}

const ModuleCard = ({ module, onDelete, onEdit, classNumber, subject }: ModuleCardProps) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const router = useRouter();

    const handleCardClick = (e: React.MouseEvent) => {
        if (
            (e.target as HTMLElement).closest(".menu-options-container") ||
            (e.target as HTMLElement).closest('[role="menu"]') ||
            (e.target as HTMLElement).closest('[role="dialog"]')
        ) {
            return;
        }

        const moduleRoute = module.name.replace(/\s+/g, "-");
        const formattedClassName = `${classNumber}th-class-study-library`;
        const formattedSubject = subject.toLowerCase().replace(/\s+/g, "-");

        router.navigate({
            to: `/study-library/${formattedClassName}/${formattedSubject}/${moduleRoute}`,
        });
    };

    return (
        <div onClick={handleCardClick} className="cursor-pointer">
            <div className="flex h-[200px] min-w-[416px] flex-col justify-center gap-4 rounded-lg border border-neutral-300 bg-neutral-50 p-6 shadow-md">
                <div className="flex items-center justify-between text-h2 font-semibold">
                    <div>{module.name}</div>
                    <DotsSixVertical />
                </div>
                <div className="flex gap-2 text-title font-semibold">
                    <div className="text-primary-500">10</div>
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
                <div className="flex h-[500px] w-full flex-col items-center justify-center gap-8 rounded-lg bg-neutral-100">
                    <EmptyModulesImage />
                    <div>No Modules have been added yet.</div>
                </div>
            )}
            <div className="grid grid-cols-4 gap-10">
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
