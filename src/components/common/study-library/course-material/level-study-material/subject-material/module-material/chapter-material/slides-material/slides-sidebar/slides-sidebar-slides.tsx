// components/common/study-library/slides-sidebar-slides.tsx
import { useSidebar } from "@/components/ui/sidebar";
import { Sortable, SortableDragHandle, SortableItem } from "@/components/ui/sortable";
import { truncateString } from "@/lib/reusable/truncateString";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { DotsSixVertical, FileDoc, FilePdf, PlayCircle } from "@phosphor-icons/react";
import { ReactNode, useEffect } from "react";
import { useSlides } from "@/hooks/study-library/use-slides";
import { SidebarContentItem } from "@/types/study-library/chapter-sidebar";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useRouter } from "@tanstack/react-router";

export const ChapterSidebarSlides = () => {
    const { open } = useSidebar();
    const { activeItemId, setActiveItem, reorderItems } = useContentStore();
    const router = useRouter();
    const { chapterId } = router.state.location.search;
    const { slides, isLoading } = useSlides(chapterId || "");

    useEffect(() => {
        console.log("chapter id: ", chapterId);
    });

    const getIcon = (type: string): ReactNode => {
        switch (type) {
            case "PDF":
                return <FilePdf className="size-6" />;
            case "VIDEO":
                return <PlayCircle className="size-6" />;
            case "DOC":
                return <FileDoc className="size-6" />;
            default:
                return <></>;
        }
    };

    const handleMove = ({ activeIndex, overIndex }: { activeIndex: number; overIndex: number }) => {
        reorderItems(activeIndex, overIndex);
        const updatedItems = useContentStore.getState().items;

        // Log or use the updated order
        console.log(
            "Updated order:",
            updatedItems.map((item, index) => ({
                id: item.id,
                name: item.title,
                order: index,
            })),
        );
    };

    if (isLoading) {
        return <DashboardLoader />;
    }

    return (
        <Sortable value={slides} onMove={handleMove} fast={false}>
            <div className="flex w-full flex-col items-center gap-6 text-neutral-600">
                {slides?.map((slide: SidebarContentItem) => (
                    <SortableItem key={slide.id} value={slide.id} asChild>
                        <div className="w-full cursor-grab active:cursor-grabbing">
                            <div
                                onClick={() => setActiveItem(slide)}
                                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2 ${
                                    slide.id === activeItemId
                                        ? "border border-neutral-200 bg-white text-primary-500"
                                        : "hover:border hover:border-neutral-200 hover:bg-white hover:text-primary-500"
                                }`}
                                title={slide.title}
                            >
                                {getIcon(slide.type)}
                                <p
                                    className={`flex-1 text-subtitle ${
                                        open ? "visible" : "hidden"
                                    } text-body`}
                                >
                                    {truncateString(slide.title, 18)}
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
