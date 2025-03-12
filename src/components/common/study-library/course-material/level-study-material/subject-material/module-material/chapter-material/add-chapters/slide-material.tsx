/* eslint-disable prettier/prettier */
import YooptaEditor, { createYooptaEditor } from "@yoopta/editor";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from "react";
import { MyButton } from "@/components/design-system/button";
import PDFViewer from "../slides-material/pdf-viewer";
import { ActivityStatsSidebar } from "../slides-material/stats-dialog/activity-sidebar";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { EmptySlideMaterial } from "@/assets/svgs";
import { useState } from "react";
import YouTubePlayer from "../slides-material/youtube-player";
import { html } from "@yoopta/exports";
import { SlidesMenuOption } from "../slides-material/slides-menu-options/slides-menu-option";
import { plugins, TOOLS, MARKS } from "@/constants/study-library/yoopta-editor-plugins-tools";
import { useRouter } from "@tanstack/react-router";
import { getPublicUrl } from "@/services/upload_file";
import { PublishUnpublishDialog } from "../slides-material/publish-slide-dialog";
import { useSlides } from "@/hooks/study-library/use-slides";
import { toast } from "sonner";
import { Check, PencilSimpleLine } from "phosphor-react";

export const formatHTMLString = (htmlString: string) => {
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

export const SlideMaterial = () => {
    const { items, activeItem } = useContentStore();
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
    const { addUpdateVideoSlide } = useSlides(chapterId || "");

    const handleHeadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHeading(e.target.value);
    };

    const updateHeading = async () => {
        const status = activeItem?.status == "DRAFT" ? "DRAFT" : "UNSYNC";
        if (activeItem) {
            if (activeItem.published_url != null) {
                const url =
                    activeItem?.status == "PUBLISHED"
                        ? activeItem.published_url
                        : activeItem.video_url;
                await addUpdateVideoSlide({
                    id: activeItem.slide_id,
                    title: heading,
                    description: activeItem.slide_description,
                    image_file_id: activeItem.document_cover_file_id,
                    slide_order: 0,
                    video_slide: {
                        id: activeItem.video_id || "",
                        description: activeItem.video_description || "",
                        url: url,
                        title: heading,
                        video_length_in_millis: 0,
                        published_url: null,
                        published_video_length_in_millis: 0,
                    },
                    status: status,
                    new_slide: false,
                    notify: false,
                });
                return;
            } else {
                await addUpdateDocumentSlide({
                    id: activeItem?.slide_id || "",
                    title: heading,
                    image_file_id: activeItem.document_cover_file_id || "",
                    description: activeItem?.slide_title || "",
                    slide_order: 0,
                    document_slide: {
                        id: activeItem?.document_id || "",
                        type: activeItem.document_type,
                        data:
                            activeItem.status == "PUBLISHED"
                                ? activeItem.document_data
                                : activeItem.published_data,
                        title: heading,
                        cover_file_id: activeItem.document_cover_file_id || "",
                        total_pages: 0,
                        published_data: null,
                        published_document_total_pages: 0,
                    },
                    status: status,
                    new_slide: false,
                    notify: false,
                });
            }
        }
        setIsEditing(false);
    };

    const setEditorContent = () => {
        console.log("inside set function");
        const docData =
            activeItem?.status == "PUBLISHED"
                ? activeItem.published_data
                : activeItem?.document_data;
        console.log("docData: ", docData);
        const editorContent = html.deserialize(editor, docData || "");
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
                    autoFocus={true}
                    onChange={() => {}}
                    className="size-full"
                    style={{ width: "100%", height: "100%" }}
                />
            </div>,
        );
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

        if (activeItem.published_url != null || activeItem.video_url != null) {
            setContent(
                <div key={`video-${activeItem.slide_id}`} className="size-full">
                    <YouTubePlayer
                        videoUrl={
                            (activeItem.status == "PUBLISHED"
                                ? activeItem.published_url
                                : activeItem.video_url) || ""
                        }
                        videoTitle={activeItem.video_title}
                    />
                </div>,
            );
            return;
        }

        if (activeItem?.document_type == "PDF") {
            const url = await getPublicUrl(
                (activeItem.status == "PUBLISHED"
                    ? activeItem.published_data
                    : activeItem.document_data) || "",
            );
            setContent(<PDFViewer pdfUrl={url} />);
            return;
        }

        if (activeItem?.document_type === "DOC") {
            try {
                setTimeout(() => {
                    setEditorContent();
                }, 300);
                setEditorContent();
            } catch (error) {
                console.error("Error preparing document content:", error);
                setContent(<div>Error loading document content</div>);
            }
            return;
        }

        return;
    };

    function calculateValue() {
        const data = editor.getEditorValue();
        const htmlString = html.serialize(editor, data);
        const formattedHtmlString = formatHTMLString(htmlString);
        if (activeItem?.status == "UNSYNC") {
            return activeItem?.document_type == "PDF"
                ? activeItem.document_data
                : formattedHtmlString;
        } else if (activeItem?.status == "PUBLISHED") {
            return activeItem.published_data;
        } else {
            return activeItem?.document_data;
        }
    }

    const handlePublishUnpublishSlide = async (
        setIsOpen: Dispatch<SetStateAction<boolean>>,
        notify: boolean,
    ) => {
        const status = activeItem?.status == "PUBLISHED" ? "DRAFT" : "PUBLISHED";
        const operation = status == "DRAFT" ? "unpublish" : "publish";
        if (activeItem?.document_type == "DOC" || activeItem?.document_type == "PDF") {
            const documentData = calculateValue() || null;
            try {
                await addUpdateDocumentSlide({
                    id: activeItem?.slide_id || "",
                    title: activeItem?.slide_title || "",
                    image_file_id: activeItem?.document_cover_file_id || "",
                    description: activeItem?.slide_title || "",
                    slide_order: 0,
                    document_slide: {
                        id: activeItem?.document_id || "",
                        type: activeItem.document_type,
                        data: operation == "unpublish" ? documentData : null,
                        title: activeItem?.document_title || "",
                        cover_file_id: activeItem.document_cover_file_id || "",
                        total_pages: 0,
                        published_data: operation == "publish" ? documentData : null,
                        published_document_total_pages: 0,
                    },
                    status: status,
                    new_slide: false,
                    notify: notify,
                });
                toast.success(`slide ${operation}ed successfully!`);
                setIsOpen(false);
            } catch {
                toast.error(`Error in ${operation}ing the slide`);
            }
        } else {
            try {
                await addUpdateVideoSlide({
                    id: activeItem?.slide_id,
                    title: activeItem?.slide_title || "",
                    description: activeItem?.slide_description || "",
                    image_file_id: activeItem?.document_cover_file_id || "",
                    slide_order: 0,
                    video_slide: {
                        id: activeItem?.video_id || "",
                        description: activeItem?.video_description || "",
                        url:
                            operation == "unpublish"
                                ? activeItem
                                    ? activeItem.published_url
                                    : null
                                : null,
                        title: activeItem?.video_title || "",
                        video_length_in_millis: 0,
                        published_url:
                            operation == "publish"
                                ? activeItem
                                    ? activeItem.video_url
                                    : null
                                : null,
                        published_video_length_in_millis: 0,
                    },
                    status: status,
                    new_slide: false,
                    notify: notify,
                });
                toast.success(`slide ${operation}ed successfully!`);
                setIsOpen(false);
            } catch {
                toast.error(`Error in ${operation}ing the slide`);
            }
        }
    };

    useEffect(() => {
        setHeading(activeItem?.document_title || activeItem?.video_title || "");
        setContent(null);
        console.log("active item changed: ", activeItem);
        loadContent();
    }, [activeItem, items]);

    // Modified SaveDraft function
    const SaveDraft = () => {
        const data = editor.getEditorValue();
        const htmlString = html.serialize(editor, data);
        const formattedHtmlString = formatHTMLString(htmlString);

        const status =
            activeItem?.status == "PUBLISHED"
                ? "UNSYNC"
                : activeItem?.status == "UNSYNC"
                  ? "UNSYNC"
                  : "DRAFT";

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
                        total_pages: 0,
                        published_data: null,
                        published_document_total_pages: 0,
                    },
                    status: status,
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
            {activeItem && (
                <div className="-mx-8 -my-8 flex items-center justify-between gap-6 border-b border-neutral-300 px-8 py-4">
                    {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                            <input
                                type="text"
                                value={heading}
                                onChange={handleHeadingChange}
                                className="w-full text-h3 font-semibold text-neutral-600 focus:outline-none"
                                autoFocus
                            />
                            <Check
                                onClick={updateHeading}
                                className="cursor-pointer hover:text-primary-500"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <h3 className="text-h3 font-semibold text-neutral-600">
                                {heading || "No content selected"}
                            </h3>
                            <PencilSimpleLine
                                className="cursor-pointer hover:text-primary-500"
                                onClick={() => setIsEditing(true)}
                            />
                        </div>
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
                            <PublishUnpublishDialog
                                isOpen={isPublishDialogOpen}
                                setIsOpen={setIsPublishDialogOpen}
                                handlePublishUnpublishSlide={handlePublishUnpublishSlide}
                            />
                        </div>
                        <SlidesMenuOption />
                    </div>
                </div>
            )}
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
