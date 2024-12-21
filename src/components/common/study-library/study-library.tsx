import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { FC, SVGProps, useEffect } from "react";
import { Class10CardImage } from "@/assets/svgs";
import { Class9CardImage } from "@/assets/svgs";
import { Class8CardImage } from "@/assets/svgs";
import { ClassCard } from "./class-card";
import { UploadStudyMaterialButton } from "./upload-study-material/upload-study-material-button";

interface ClassCardType {
    id: string;
    image: FC<SVGProps<SVGSVGElement>>;
    class: string;
    route?: string;
}

export const StudyLibrary = () => {
    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading("Study Library");
    }, []);

    const ClassCardData: ClassCardType[] = [
        {
            id: "1",
            image: Class10CardImage,
            class: "10th",
            route: "/study-library/10-class-study-library",
        },
        {
            id: "2",
            image: Class9CardImage,
            class: "9th",
        },
        {
            id: "3",
            image: Class8CardImage,
            class: "8th",
        },
    ];

    return (
        <div className="relative flex flex-col gap-12 text-neutral-600">
            <div className="flex items-center gap-20">
                <div className="flex flex-col gap-2">
                    <div className="text-h3 font-semibold">Class & Resource Management</div>
                    <div className="text-subtitle">
                        Effortlessly manage classes, subjects, and resources to ensure students have
                        access to the best education materials. Organize, upload, and track study
                        resources for 8th, 9th and 10th classes all in one place.
                    </div>
                </div>
                <UploadStudyMaterialButton />
            </div>
            <div className="flex gap-12">
                {ClassCardData.map((card, key) => (
                    <ClassCard
                        key={key}
                        image={card.image}
                        classLevel={card.class}
                        route={card.route}
                    />
                ))}
            </div>
        </div>
    );
};
