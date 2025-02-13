/* eslint-disable prettier/prettier */
import YooptaEditor, { createYooptaEditor, YooptaContentValue } from "@yoopta/editor";
import { useEffect, useMemo, useRef } from "react";
import { MyButton } from "@/components/design-system/button";
import PDFViewer from "../slides-material/pdf-viewer";
import { ActivityStatsSidebar } from "../slides-material/stats-dialog/activity-sidebar";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { EmptySlideMaterial } from "@/assets/svgs";
import { useState } from "react";
import YouTubePlayer from "../slides-material/youtube-player";
import { html } from "@yoopta/exports";
import { SlidesMenuOption } from "../slides-material/slides-menu-options/slildes-menu-option";
import { plugins, TOOLS, MARKS } from "@/constants/study-library/yoopta-editor-plugins-tools";
import { useRouter } from "@tanstack/react-router";
import { getPublicUrl } from "@/services/upload_file";
import { PublishDialog } from "../slides-material/publish-slide-dialog";
import { useSlides } from "@/hooks/study-library/use-slides";
import { toast } from "sonner";

export const SlideMaterial = () => {
    const { activeItem, setActiveItem } = useContentStore();
    const editor = useMemo(() => createYooptaEditor(), []);
    const selectionRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [heading, setHeading] = useState(
        activeItem?.document_title || activeItem?.video_title || "",
    );
    const router = useRouter();
    const [content, setContent] = useState<JSX.Element | null>(null);

    const { chapterId } = router.state.location.search;
    const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
    const { addUpdateDocumentSlide } = useSlides(chapterId || "");

    const handleHeadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHeading(e.target.value);
    };

    const saveHeading = () => {
        if (activeItem) {
            const updatedItem = { ...activeItem, name: heading };
            setActiveItem(updatedItem); // Use setActiveItem to update the store
        }
        setIsEditing(false);
    };

    const loadContent = async () => {
        if (!activeItem) {
            setContent(
                <div className="flex h-[500px] flex-col items-center justify-center rounded-lg py-10">
                    <EmptySlideMaterial />
                    <p className="mt-4 text-neutral-500">No study material has been added yet</p>
                </div>,
            );
            return;
        }

        if (activeItem.video_url != null) {
            console.log("video url: ", activeItem.video_url);
            setContent(
                <div key={`video-${activeItem.slide_id}`} className="size-full">
                    <YouTubePlayer
                        videoUrl={activeItem.video_url || ""}
                        videoTitle={activeItem.video_title}
                    />
                </div>,
            );
            return;
        }

        if (activeItem?.document_type == "PDF") {
            const url = await getPublicUrl(activeItem?.document_data);
            setContent(<PDFViewer pdfUrl={url} />);
            return;
        }

        if (activeItem?.document_type === "DOC" && activeItem.document_data) {
            console.log("Entered doc");
            let editorContent: YooptaContentValue | undefined;
            try {
                editorContent = html.deserialize(editor, activeItem.document_data || "");

                editor.setEditorValue(editorContent);
                setContent(
                    <div className="w-full">
                        <YooptaEditor
                            editor={editor}
                            plugins={plugins}
                            tools={TOOLS}
                            marks={MARKS}
                            value={editorContent}
                            selectionBoxRoot={selectionRef}
                            autoFocus
                            onChange={() => {}}
                            className="size-full"
                            style={{ width: "100%", height: "100%" }}
                        />
                    </div>,
                );
            } catch (error) {
                console.error("Error preparing document content:", error);
                setContent(<div>Error loading document content</div>);
            }
            return;
        }

        return;
    };

    useEffect(() => {
        if (activeItem) {
            setHeading(activeItem.document_title || activeItem.video_title || "");
            setContent(null);
            console.log("active item changed: ", activeItem);
            loadContent();
        }
    }, [activeItem]);

    const formatHTMLString = (htmlString: string) => {
        // Remove the body tag and its attributes
        let cleanedHtml = htmlString.replace(/<body[^>]*>|<\/body>/g, "");

        // Remove data-meta attributes and style from paragraphs
        cleanedHtml = cleanedHtml.replace(/<p[^>]*data-meta[^>]*style="[^"]*"[^>]*>/g, "<p>");

        // Add proper HTML structure
        const formattedHtml = `<html>
        <head></head>
        <body>
            <div>
                ${cleanedHtml}
            </div>
        </body>
    </html>`;

        return formattedHtml;
    };

    // Modified SaveDraft function
    const SaveDraft = () => {
        const data = editor.getEditorValue();
        const htmlString = html.serialize(editor, data);
        const formattedHtmlString = formatHTMLString(htmlString);

        try {
            const saveDocDraft = async () => {
                await addUpdateDocumentSlide({
                    id: activeItem?.slide_id || "",
                    title: activeItem?.slide_title || "",
                    image_file_id: "",
                    description: activeItem?.slide_title || "",
                    slide_order: 0,
                    document_slide: {
                        id: activeItem?.document_id || "",
                        type: "DOC",
                        data: formattedHtmlString, // Use the formatted HTML string
                        title: activeItem?.slide_title || "",
                        cover_file_id: "",
                    },
                    status: "DRAFT",
                    new_slide: false,
                    notify: false,
                });
            };
            saveDocDraft();
        } catch (err) {
            console.log("error updating slide: ", err);
        }
    };

    const handleSaveDraftClick = async () => {
        try {
            await SaveDraft();
            toast.success("Slide saved successfully");
        } catch (err) {
            console.log("error saving document: ", err);
        }
    };

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        let previousHtmlString: string | null = null;

        if (activeItem?.document_type === "DOC") {
            intervalId = setInterval(() => {
                const data = editor.getEditorValue();
                const htmlString = html.serialize(editor, data);
                const formattedHtmlString = formatHTMLString(htmlString);

                // Only save if the content has changed
                if (formattedHtmlString !== previousHtmlString) {
                    previousHtmlString = formattedHtmlString;
                    SaveDraft();
                }
            }, 60000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [activeItem?.document_type, editor]);

    return (
        <div className="flex w-full flex-col" ref={selectionRef}>
            <div className="-mx-8 -my-8 flex items-center justify-between gap-6 border-b border-neutral-300 px-8 py-4">
                {isEditing ? (
                    <input
                        type="text"
                        value={heading}
                        onChange={handleHeadingChange}
                        onBlur={saveHeading}
                        className="w-full text-h3 font-semibold text-neutral-600 focus:outline-none"
                        autoFocus
                    />
                ) : (
                    <h3
                        className="text-h3 font-semibold text-neutral-600"
                        onClick={() => setIsEditing(true)}
                    >
                        {heading || "No content selected"}
                    </h3>
                )}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-6">
                        <ActivityStatsSidebar />
                        {activeItem?.document_type == "DOC" && (
                            <MyButton
                                buttonType="secondary"
                                scale="medium"
                                layoutVariant="default"
                                onClick={handleSaveDraftClick}
                            >
                                Save Draft
                            </MyButton>
                        )}
                        <PublishDialog
                            isOpen={isPublishDialogOpen}
                            setIsOpen={setIsPublishDialogOpen}
                        />
                    </div>
                    <SlidesMenuOption />
                </div>
            </div>
            <div
                className={`mx-auto mt-14 ${
                    activeItem?.document_type == "PDF" ? "h-[calc(100vh-200px)]" : "h-full"
                } w-full overflow-hidden px-10`}
            >
                {content}
            </div>
        </div>
    );
};
