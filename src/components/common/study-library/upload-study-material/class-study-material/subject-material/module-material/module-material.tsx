// module-material.tsx
import { useEffect } from "react";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "@tanstack/react-router";
import { ModuleType } from "./add-modules.tsx/modules";
import { formatClassName } from "@/lib/study-library/class-formatter";

interface ModuleMaterialProps {
    classNumber: string | undefined;
    subject: string;
    module: ModuleType;
}

export const ModuleMaterial = ({ classNumber, subject, module }: ModuleMaterialProps) => {
    const router = useRouter();
    const { setNavHeading } = useNavHeadingStore();

    const formattedClass = formatClassName(classNumber);

    const handleBackClick = () => {
        const formattedSubject = subject.toLowerCase().replace(/\s+/g, "-");
        router.navigate({
            to: `/study-library/${formattedClass.toLowerCase()}-class-study-library/${formattedSubject}`,
        });
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>{`${formattedClass} Class ${subject} - ${module.name}`}</div>
        </div>
    );

    useEffect(() => {
        setNavHeading(heading);
    }, []);

    return (
        <div className="flex h-full w-full flex-col gap-12 text-neutral-600">
            <div className="flex items-center justify-between gap-80">
                <div className="flex w-full flex-col gap-2">
                    <div className="text-h3 font-semibold">{module.name}</div>
                    <div className="text-subtitle">{module.description}</div>
                </div>
            </div>
            {/* Add your module content here */}
        </div>
    );
};
