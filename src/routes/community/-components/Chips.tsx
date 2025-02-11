import { useState } from "react";
interface ChipProps {
    tag: string;
}

export function Chip({ tag }: ChipProps) {
    const [selected, setSelected] = useState<boolean>(false);
    function onSelected() {
        setSelected(!selected);
    }
    return (
        <div
            className={`rounded-md border ${
                selected ? "border-primary-500 bg-primary-100" : ""
            } cursor-pointer px-3 py-2 text-body`}
            onClick={onSelected}
        >
            {tag}
        </div>
    );
}
