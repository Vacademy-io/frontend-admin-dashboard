import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { FC, SVGProps, useEffect } from "react";
import { Class10CardImage } from "@/assets/svgs";
import { Class9CardImage } from "@/assets/svgs";
import { Class8CardImage } from "@/assets/svgs";
import { ClassCard } from "./class-card";
import { UploadStudyMaterialButton } from "./upload-study-material/upload-study-material-button";
import { useNavigate } from "@tanstack/react-router";
import { SessionDropdown } from "../session-dropdown";
import { CreateStudyDocButton } from "./upload-study-material/create-study-doc-button";
import { useSidebar } from "@/components/ui/sidebar";

interface ClassCardType {
    id: string;
    image: FC<SVGProps<SVGSVGElement>>;
    class: string;
    route?: string;
}

export const StudyLibrary = () => {
    const { setNavHeading } = useNavHeadingStore();
    const navigate = useNavigate();
    const { open } = useSidebar();

    useEffect(() => {
        setNavHeading("Study Library");
    }, []);

    const handleClassClick = (classId: string) => {
        const routeName = `${classId}th-class-study-library`;
        navigate({ to: `/study-library/${routeName}` });
    };

    const ClassCardData: ClassCardType[] = [
        {
            id: "10",
            image: Class10CardImage,
            class: "10th",
        },
        {
            id: "9",
            image: Class9CardImage,
            class: "9th",
        },
        {
            id: "8",
            image: Class8CardImage,
            class: "8th",
        },
    ];

    return (
        <div className="relative flex flex-col gap-8 text-neutral-600">
            <div className="flex items-center gap-20">
                <div className="flex flex-col gap-2">
                    <div className="text-h3 font-semibold">Class & Resource Management</div>
                    <div className="text-subtitle">
                        Effortlessly manage classes, subjects, and resources to ensure students have
                        access to the best education materials. Organize, upload, and track study
                        resources for 8th, 9th and 10th classes all in one place.
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <CreateStudyDocButton />
                    <UploadStudyMaterialButton />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <SessionDropdown className="text-title font-semibold" />
            </div>

            <div className={`flex ${open ? "gap-4" : "gap-8"} justify-between`}>
                {ClassCardData.map((card, key) => (
                    <div key={key} onClick={() => handleClassClick(card.id)}>
                        <ClassCard image={card.image} classLevel={card.class} />
                    </div>
                ))}
            </div>
        </div>
    );
};
