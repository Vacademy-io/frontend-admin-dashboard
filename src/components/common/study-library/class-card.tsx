import { FC, SVGProps } from "react";
import React from "react";
import { useRouter } from "@tanstack/react-router";

interface ClassCardProps {
    image: FC<SVGProps<SVGSVGElement>>;
    classLevel: string;
    route?: string;
}

export const ClassCard = ({ image, classLevel, route }: ClassCardProps) => {
    const router = useRouter();

    const handleCardClick = () => {
        router.navigate({
            to: route,
        });
    };
    return (
        <div
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-xl py-40 shadow-xl"
            onClick={handleCardClick}
        >
            {React.createElement(image)}
            <div className="text-h1 font-semibold text-primary-500">{classLevel} Class</div>
        </div>
    );
};
