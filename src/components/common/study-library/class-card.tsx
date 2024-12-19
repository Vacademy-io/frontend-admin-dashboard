// import { FC, SVGProps } from "react";

// interface ClassCardProps {
//     image: FC<SVGProps<SVGSVGElement>>;
//     class: string;
// }

// export const ClassCard = ({image, class}: ClassCardProps) => {
//     return(
//         <div className="shadow shadow-[0px 1px 40px 0px rgba(0, 0, 0, 0.05)] h-full w-full flex flex-col items-center justify-center py-40">
//             <image />
//             <div className="text-primary-500 font-semibold text-h1">{class} Class</div>
//         </div>
//     )
// }

import { FC, SVGProps } from "react";
import React from "react";

interface ClassCardProps {
    image: FC<SVGProps<SVGSVGElement>>;
    classLevel: string; // renamed from 'class'
}

export const ClassCard = ({ image, classLevel }: ClassCardProps) => {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-xl py-40 shadow-xl">
            {React.createElement(image)}
            <div className="text-h1 font-semibold text-primary-500">{classLevel} Class</div>
        </div>
    );
};
