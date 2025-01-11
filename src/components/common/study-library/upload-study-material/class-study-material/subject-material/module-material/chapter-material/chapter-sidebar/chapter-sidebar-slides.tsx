import { useSidebar } from "@/components/ui/sidebar";
import { truncateString } from "@/lib/reusable/truncateString";
import { DotsSixVertical, FileDoc, FilePdf, PlayCircle } from "@phosphor-icons/react";

const SlidesdummyData = [
    {
        label: "pdf",
        slide_name: "Understanding the Human Eye",
    },
    {
        label: "video",
        slide_name: "Refraction in the dark",
    },
    {
        label: "doc",
        slide_name: "Understanding the Colourful world",
    },
];

const getIcon = (label: string) => {
    switch (label) {
        case "pdf":
            return <FilePdf className="size-6" />;
        case "video":
            return <PlayCircle className="size-6" />;
        case "doc":
            return <FileDoc className="size-6" />;
        default:
            return null;
    }
};

export const ChapterSidebarSlides = () => {
    const { open } = useSidebar();

    return (
        <div className="flex w-full flex-col items-center gap-6 text-neutral-600">
            {SlidesdummyData.map((obj, key) => (
                <div
                    key={key}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2 ${
                        obj.label == "pdf"
                            ? "border border-neutral-200 bg-white text-primary-500"
                            : "bg-none text-neutral-600 hover:border hover:border-neutral-200 hover:bg-white hover:text-primary-500"
                    } `}
                    title={obj.slide_name} // Show full name on hover
                >
                    {getIcon(obj.label)}
                    <p className={`flex-1 text-subtitle ${open ? "visible" : "hidden"} text-body`}>
                        {truncateString(obj.slide_name, 18)}
                    </p>
                    <DotsSixVertical
                        className={`size-6 flex-shrink-0 ${open ? "visible" : "hidden"}`}
                    />
                </div>
            ))}
        </div>
    );
};
