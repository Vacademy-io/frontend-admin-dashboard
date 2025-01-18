import { useSidebar } from "@/components/ui/sidebar";
import { FC, SVGProps } from "react";
import React from "react";
interface ClassCardProps {
    image: FC<SVGProps<SVGSVGElement>> | undefined;
    classLevel: string;
    levelId: string;
    route?: string;
}

export const ClassCard = ({ image, classLevel }: ClassCardProps) => {
    const { open } = useSidebar();
    return (
        <div className="flex cursor-pointer flex-col items-center justify-center rounded-xl py-5 shadow-xl">
            {image &&
                React.createElement(image, {
                    className: open ? "w-[360px] h-[300px]" : "w-[420px] h-[300px]",
                })}
            <div className="text-h1 font-semibold text-primary-500">{classLevel} Class</div>
        </div>
    );
};
