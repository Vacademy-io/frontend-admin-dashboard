import { FilterDropdown } from "./FilterDropdown";
import { Chip } from "./Chips";
import { useState, useRef, useEffect } from "react";
// import { useSelectedFilterStore } from "../-store/useSlectedFilterOption";
const chipsData = [
    "First 10",
    "Second 20",
    "Third 30",
    "Fourth 40",
    "Fifth 50",
    "Sixth 60",
    "Seventh 70",
    "Eighth 80",
    "Ninth 90",
    "Tenth 100",
    "Sixth 60",
    "Seventh 70",
    "Eighth 80",
    "Ninth 90",
    "Tenth 100",
    "Sixth 60",
    "Seventh 70",
    "Eighth 80",
    "Ninth 90",
    "Tenth 100",
];

export function FiltersTab() {
    const [expanded, setExpanded] = useState(false);
    const [visibleCount, setVisibleCount] = useState(chipsData.length);
    const containerRef = useRef<HTMLDivElement>(null);
    // const { selected } = useSelectedFilterStore();
    useEffect(() => {
        if (containerRef.current && !expanded) {
            const containerWidth = containerRef.current.offsetWidth;
            let totalWidth = 0;
            let count = 0;

            for (const chip of containerRef.current.children) {
                const chipWidth = (chip as HTMLElement).offsetWidth;
                if (totalWidth + chipWidth > containerWidth) break;
                totalWidth += chipWidth + 16;
                count++;
            }
            setVisibleCount(count);
        } else {
            setVisibleCount(chipsData.length);
        }
    }, [expanded]);
    return (
        <div className="mx-10 mb-10 flex flex-col gap-6 border-b pb-6">
            <div className="flex flex-row flex-wrap justify-around gap-4 rounded bg-sidebar-background p-4">
                <FilterDropdown
                    sessionDirection="flex-row"
                    defaultSession={"Stream"}
                    // onSessionChange={onSessionChange}
                    onSessionChange={() => {}}
                />
                <FilterDropdown
                    sessionDirection="flex-row"
                    defaultSession={"Subject"}
                    // onSessionChange={onSessionChange}
                    onSessionChange={() => {}}
                />
                <FilterDropdown
                    sessionDirection="flex-row"
                    defaultSession={"Difficulty"}
                    // onSessionChange={onSessionChange}
                    onSessionChange={() => {}}
                />
                <FilterDropdown
                    sessionDirection="flex-row"
                    defaultSession={"Type"}
                    // onSessionChange={onSessionChange}
                    onSessionChange={() => {}}
                />
            </div>
            <div ref={containerRef} className="relative flex flex-row flex-wrap gap-4 pb-6">
                {chipsData
                    .slice(0, expanded ? chipsData.length : visibleCount)
                    .map((tag, index) => (
                        <Chip key={index} tag={tag} />
                    ))}
                <div className="absolute -bottom-5 right-0">
                    <div
                        className="mt-2 cursor-pointer text-primary-500"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {!expanded ? "See More" : "See Less"}
                    </div>
                </div>
            </div>
        </div>
    );
}
