import { useSidebar } from "@/components/ui/sidebar";
import { Sortable, SortableDragHandle, SortableItem } from "@/components/ui/sortable";
import { truncateString } from "@/lib/reusable/truncateString";
import { useContentStore } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/chapter-sidebar-store";
import { DotsSixVertical, FileDoc, FilePdf, PlayCircle } from "@phosphor-icons/react";
import { ReactNode, useEffect } from "react";
import {
    Slide,
    slideOrderPayloadType,
    useSlides,
} from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useRouter } from "@tanstack/react-router";
import { useFieldArray, useForm } from "react-hook-form";
import { CheckCircle } from "phosphor-react";
import { useSaveDraft } from "../../-context/saveDraftContext";

interface FormValues {
    slides: Slide[];
}

export const ChapterSidebarSlides = ({
    handleSlideOrderChange,
}: {
    handleSlideOrderChange: (slideOrderPayload: slideOrderPayloadType) => void;
}) => {
    const { open, state, toggleSidebar } = useSidebar();
    const { setItems, activeItem, setActiveItem, items } = useContentStore();
    const router = useRouter();
    const { chapterId, slideId } = router.state.location.search;
    const { slides, isLoading } = useSlides(chapterId || "");
    const { getCurrentEditorHTMLContent, saveDraft } = useSaveDraft();

    const handleSlideClick = async (slide: Slide) => {
        // Check if we need to save the current slide before switching
        if (
            activeItem &&
            activeItem.source_type === "DOCUMENT" &&
            activeItem.document_type === "DOC"
        ) {
            const currentContent = getCurrentEditorHTMLContent();
            console.log("currentContent: ", currentContent);
            if (currentContent) {
                if (
                    (activeItem.status === "UNSYNC" || activeItem.status === "DRAFT") &&
                    activeItem.document_data !== currentContent
                ) {
                    await saveDraft(activeItem);
                } else if (
                    activeItem.status === "PUBLISHED" &&
                    activeItem.published_data !== currentContent
                ) {
                    await saveDraft(activeItem);
                }
            }
        }

        // Now set the new active item
        setActiveItem(slide);
        if (state == "expanded") toggleSidebar();
    };

    useEffect(() => {
        form.setValue("slides", items || []);
    }, [items]);

    const form = useForm<FormValues>({
        defaultValues: {
            slides: items || [],
        },
    });

    const { fields, move } = useFieldArray({
        control: form.control,
        name: "slides",
    });

    useEffect(() => {
        if (slides?.length) {
            form.reset({ slides });
            setItems(slides);

            if (slideId) {
                const targetSlide: Slide = slides.find(
                    (slide: Slide) => slide.slide_id === slideId,
                );
                if (targetSlide) {
                    setActiveItem(targetSlide);
                    return;
                }
            }

            setActiveItem(slides[0]);
        } else {
            setActiveItem(null);
        }
    }, [slides, slideId]);

    const getIcon = (slide: Slide): ReactNode => {
        const type =
            slide.published_url != null || slide.video_url != null ? "VIDEO" : slide.document_type;
        switch (type) {
            case "PDF":
                return <FilePdf className="size-6" />;
            case "VIDEO":
                return <PlayCircle className="size-6" />;
            case "DOC":
                return <FileDoc className="size-6" />;
            case "DOCX":
                return <FileDoc className="size-6" />;
            default:
                return <></>;
        }
    };

    const handleMove = ({ activeIndex, overIndex }: { activeIndex: number; overIndex: number }) => {
        move(activeIndex, overIndex);

        // Create order payload after move
        const updatedFields = form.getValues("slides");

        // Create order payload with the updated order
        const orderPayload = updatedFields.map((slide, index) => ({
            slide_id: slide.slide_id,
            slide_order: index + 1,
        }));

        // Call the handler to update the order through API
        handleSlideOrderChange(orderPayload);
    };

    if (isLoading) {
        return <DashboardLoader />;
    }

    return (
        <Sortable value={fields} onMove={handleMove} fast={false}>
            <div className="flex w-full flex-col items-center gap-6 text-neutral-600">
                {fields.map((slide, index) => (
                    <SortableItem key={index} value={slide.id} asChild className="cursor-pointer">
                        <div className="w-full" onClick={() => handleSlideClick(slide)}>
                            <div
                                className={`flex w-full items-center gap-3 rounded-xl ${
                                    open ? "px-4 py-2" : "px-4 py-4"
                                } ${
                                    slide.slide_id === activeItem?.slide_id
                                        ? "border border-neutral-200 bg-white text-primary-500"
                                        : "hover:border hover:border-neutral-200 hover:bg-white hover:text-primary-500"
                                }`}
                            >
                                <div className="flex flex-1 items-center justify-between gap-2">
                                    <div className="flex flex-1 items-center gap-3">
                                        <p
                                            className={`${
                                                open ? "visible" : "hidden"
                                            } font-semibold`}
                                        >
                                            S{index + 1}
                                        </p>
                                        {getIcon(slide)}
                                        <p
                                            className={`flex-1 text-subtitle ${
                                                open ? "visible" : "hidden"
                                            } text-body`}
                                        >
                                            {truncateString(
                                                slide.document_title || slide.video_title || "",
                                                12,
                                            )}
                                        </p>
                                    </div>
                                    {slide.status != "DRAFT" && state == "expanded" && (
                                        <CheckCircle
                                            weight="fill"
                                            className="text-success-600"
                                            size={20}
                                        />
                                    )}
                                </div>
                                {open && (
                                    <div className="drag-handle-container">
                                        <SortableDragHandle
                                            variant="ghost"
                                            size="icon"
                                            className="cursor-grab hover:bg-neutral-100 active:cursor-grabbing"
                                        >
                                            <DotsSixVertical
                                                className={`size-6 flex-shrink-0 ${
                                                    open ? "visible" : "hidden"
                                                }`}
                                            />
                                        </SortableDragHandle>
                                    </div>
                                )}
                            </div>
                        </div>
                    </SortableItem>
                ))}
            </div>
        </Sortable>
    );
};
