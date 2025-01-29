// components/common/study-library/slides-sidebar-slides.tsx
import { useSidebar } from "@/components/ui/sidebar";
import { Sortable, SortableDragHandle, SortableItem } from "@/components/ui/sortable";
import { truncateString } from "@/lib/reusable/truncateString";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { DotsSixVertical, FileDoc, FilePdf, PlayCircle } from "@phosphor-icons/react";
import React, { ReactNode } from "react";

export const ChapterSidebarSlides = () => {
    const { open } = useSidebar();
    const { items, activeItemId, setActiveItem, reorderItems } = useContentStore();

    const getIcon = (type: "pdf" | "video" | "doc"): ReactNode => {
        switch (type) {
            case "pdf":
                return <FilePdf className="size-6" />;
            case "video":
                return <PlayCircle className="size-6" />;
            case "doc":
                return <FileDoc className="size-6" />;
        }
    };

    const handleMove = ({ activeIndex, overIndex }: { activeIndex: number; overIndex: number }) => {
        reorderItems(activeIndex, overIndex);
        console.log("Updated index: ", items);
    };

    return (
        <Sortable value={items} onMove={handleMove} fast={false}>
            <div className="flex w-full flex-col items-center gap-6 text-neutral-600">
                {items.map((item) => (
                    <SortableItem key={item.id} value={item.id} asChild>
                        <div className="w-full cursor-grab active:cursor-grabbing">
                            <div
                                onClick={(e: React.MouseEvent) => {
                                    if (
                                        e.target instanceof Element &&
                                        !e.target.closest(".drag-handle-container")
                                    ) {
                                        setActiveItem(item);
                                    }
                                }}
                                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2 ${
                                    item.id === activeItemId
                                        ? "border border-neutral-200 bg-white text-primary-500"
                                        : "hover:border hover:border-neutral-200 hover:bg-white hover:text-primary-500"
                                }`}
                                title={item.name}
                            >
                                {getIcon(item.type)}
                                <p
                                    className={`flex-1 text-subtitle ${
                                        open ? "visible" : "hidden"
                                    } text-body`}
                                >
                                    {truncateString(item.name, 18)}
                                </p>
                                <div className="drag-handle-container">
                                    <SortableDragHandle
                                        variant="ghost"
                                        size="icon"
                                        className="cursor-grab hover:bg-neutral-100"
                                    >
                                        <DotsSixVertical
                                            className={`size-6 flex-shrink-0 ${
                                                open ? "visible" : "hidden"
                                            }`}
                                        />
                                    </SortableDragHandle>
                                </div>
                            </div>
                        </div>
                    </SortableItem>
                ))}
            </div>
        </Sortable>
    );
};
