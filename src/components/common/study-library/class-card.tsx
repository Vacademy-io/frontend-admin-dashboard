import { FC, SVGProps } from "react";
import React from "react";

interface ClassCardProps {
    image: FC<SVGProps<SVGSVGElement>>;
    classLevel: string;
    route?: string;
}

export const ClassCard = ({ image, classLevel }: ClassCardProps) => {
    return (
        <div className="flex cursor-pointer flex-col items-center justify-center rounded-xl py-10 shadow-xl">
            {React.createElement(image)}
            <div className="text-h1 font-semibold text-primary-500">{classLevel} Class</div>
        </div>
    );
};
