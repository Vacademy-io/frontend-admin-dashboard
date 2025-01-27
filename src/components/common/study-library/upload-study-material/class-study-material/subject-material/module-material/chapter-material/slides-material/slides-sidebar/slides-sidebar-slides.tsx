import { useSidebar } from "@/components/ui/sidebar";
import { truncateString } from "@/lib/reusable/truncateString";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { DotsSixVertical, FileDoc, FilePdf, PlayCircle } from "@phosphor-icons/react";
import { ReactNode } from "react";

export const ChapterSidebarSlides = () => {
    const { open } = useSidebar();
    const { items, activeItemId, setActiveItem } = useContentStore();

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

    return (
        <div className="flex w-full flex-col items-center gap-6 text-neutral-600">
            {items.map((item) => (
                <div
                    key={item.id}
                    onClick={() => setActiveItem(item)} // Pass the entire item
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2 ${
                        item.id === activeItemId
                            ? "border border-neutral-200 bg-white text-primary-500"
                            : "hover:border hover:border-neutral-200 hover:bg-white hover:text-primary-500"
                    }`}
                    title={item.name}
                >
                    {getIcon(item.type)}
                    <p className={`flex-1 text-subtitle ${open ? "visible" : "hidden"} text-body`}>
                        {truncateString(item.name, 18)}
                    </p>
                    <DotsSixVertical
                        className={`size-6 flex-shrink-0 ${open ? "visible" : "hidden"}`}
                    />
                </div>
            ))}
        </div>
    );
};
