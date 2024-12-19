import { MyButton } from "@/components/design-system/button";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { FC, SVGProps, useEffect } from "react";
import { BookOpenText } from "@phosphor-icons/react";
import { Class10CardImage } from "@/assets/svgs";
import { Class9CardImage } from "@/assets/svgs";
import { Class8CardImage } from "@/assets/svgs";
import { ClassCard } from "./class-card";

interface ClassCardType {
    id: string;
    image: FC<SVGProps<SVGSVGElement>>;
    class: string;
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
                <div className="flex flex-col">
                    <div className="text-subtitle font-semibold">E-Books</div>
                    <div className="text-h1 font-semibold text-primary-500">1658</div>
                </div>
                <div className="flex flex-col">
                    <div className="text-subtitle font-semibold">Videos</div>
                    <div className="text-h1 font-semibold text-primary-500">157</div>
                </div>
            </div>
            <div className="flex gap-12">
                {ClassCardData.map((card, key) => (
                    <ClassCard key={key} image={card.image} classLevel={card.class} />
                ))}
            </div>
            <MyButton
                buttonType="primary"
                scale="large"
                layoutVariant="default"
                className="fixed bottom-8 right-8 h-14 w-fit gap-1 text-subtitle"
            >
                <BookOpenText className="size-6" />
                <div>Upload Study Material</div>
            </MyButton>
        </div>
    );
};
