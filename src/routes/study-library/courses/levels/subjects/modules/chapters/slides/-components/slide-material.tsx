/* eslint-disable prettier/prettier */
import YooptaEditor, { createYooptaEditor } from "@yoopta/editor";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from "react";
import { MyButton } from "@/components/design-system/button";
import PDFViewer from "./pdf-viewer";
import { ActivityStatsSidebar } from "./stats-dialog/activity-sidebar";
import { useContentStore } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/chapter-sidebar-store";
import { EmptySlideMaterial } from "@/assets/svgs";
import { useState } from "react";
import YouTubePlayer from "./youtube-player";
import { html } from "@yoopta/exports";
import { SlidesMenuOption } from "./slides-menu-options/slides-menu-option";
import { plugins, TOOLS, MARKS } from "@/constants/study-library/yoopta-editor-plugins-tools";
import { useRouter } from "@tanstack/react-router";
import { getPublicUrl } from "@/services/upload_file";
import { PublishDialog } from "./publish-slide-dialog";
import { UnpublishDialog } from "./unpublish-slide-dialog";
import {
    Slide,
    useSlides,
} from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides";
import { toast } from "sonner";
import { Check, DownloadSimple, PencilSimpleLine } from "phosphor-react";
import { formatReadableDate } from "@/utils/formatReadableData";
import { convertHtmlToPdf } from "../-helper/html-to-pdf";
import { StudyLibraryQuestionsPreview } from "./questions-preview";

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

export const SlideMaterial = ({
    setGetCurrentEditorHTMLContent,
    setSaveDraft,
}: {
    setGetCurrentEditorHTMLContent: (fn: () => string) => void;
    setSaveDraft: (fn: (slide: Slide) => Promise<void>) => void;
}) => {
    const { items, activeItem, setActiveItem } = useContentStore();
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
    const [isUnpublishDialogOpen, setIsUnpublishDialogOpen] = useState(false);
    const { addUpdateDocumentSlide } = useSlides(chapterId || "");
    const { addUpdateVideoSlide } = useSlides(chapterId || "");
    const handleHeadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHeading(e.target.value);
    };

    const updateHeading = async () => {
        const status = activeItem?.status == "DRAFT" ? "DRAFT" : "UNSYNC";
        if (activeItem) {
            if (activeItem.source_type == "VIDEO") {
                const url =
                    activeItem?.status == "PUBLISHED"
                        ? activeItem.published_url
                        : activeItem.video_url;
                await addUpdateVideoSlide({
                    id: activeItem.slide_id,
                    title: heading,
                    description: activeItem.slide_description,
                    image_file_id: activeItem.document_cover_file_id,
                    slide_order: null,
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
                if (activeItem.document_type == "DOC") await SaveDraft();
                await addUpdateDocumentSlide({
                    id: activeItem?.slide_id || "",
                    title: heading,
                    image_file_id: activeItem.document_cover_file_id || "",
                    description: activeItem?.slide_title || "",
                    slide_order: null,
                    document_slide: {
                        id: activeItem?.document_id || "",
                        type: activeItem.document_type,
                        data:
                            activeItem.status == "PUBLISHED"
                                ? activeItem.published_data
                                : activeItem.document_data,
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
        const docData =
            activeItem?.status == "PUBLISHED"
                ? activeItem.published_data
                : activeItem?.document_data;
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
        // editor.insertBlock('Paragraph',{ at: 1, focus: true });
        editor.focus();
    };

    const loadContent = async () => {
        if (activeItem == null) {
            setContent(
                <div className="flex h-[500px] flex-col items-center justify-center rounded-lg py-10">
                    <EmptySlideMaterial />
                    <p className="mt-4 text-neutral-500">No study material has been added yet</p>
                </div>,
            );
            return;
        } else if (activeItem.source_type == "VIDEO") {
            const videoURL =
                (activeItem.status == "PUBLISHED"
                    ? activeItem.published_url
                    : activeItem.video_url) || "";
            // TODO : add drive video upload functionality when drive video is handled at the students portal side
            // if (videoURL.includes("drive")) {
            //     if (videoURL.includes("drive")) {
            //         const videoId = videoURL.match(/\/d\/(.+?)\//)?.[1];
            //         const embedUrl = videoId
            //             ? `https://drive.google.com/file/d/${videoId}/preview`
            //             : null;

            //         console.log(embedUrl);

            //         setContent(
            //             embedUrl ? (
            //                 <div
            //                     key={`video-${activeItem.slide_id}`}
            //                     className="relative max-h-[80vh] w-full"
            //                 >
            //                     <div className="relative aspect-[16/9] max-h-[80vh] w-full">
            //                         <iframe
            //                             key={`drive-video-${activeItem.slide_id}`}
            //                             src={embedUrl}
            //                             className="absolute inset-0 h-full w-full"
            //                             allow="autoplay"
            //                             allowFullScreen
            //                         />
            //                     </div>
            //                 </div>
            //             ) : (
            //                 <div>Unable to load the video. Ensure it is publicly accessible.</div>
            //             ),
            //         );
            //     }
            // } else {
            //     setContent(
            //         <div key={`video-${activeItem.slide_id}`} className="size-full">
            //             <YouTubePlayer videoUrl={videoURL} videoTitle={activeItem.video_title} />
            //         </div>,
            //     );
            // }
            setContent(
                <div key={`video-${activeItem.slide_id}`} className="size-full">
                    <YouTubePlayer videoUrl={videoURL} videoTitle={activeItem.video_title} />
                </div>,
            );
            return;
        } else if (activeItem.source_type == "DOCUMENT" && activeItem.document_type == "PDF") {
            const url = await getPublicUrl(
                (activeItem.status == "PUBLISHED"
                    ? activeItem.published_data
                    : activeItem.document_data) || "",
            );
            setContent(<PDFViewer pdfUrl={url} />);
            return;
        } else if (activeItem.source_type == "DOCUMENT" && activeItem.document_type == "DOC") {
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
        } else if (activeItem.source_type == "QUESTION") {
            setContent(<StudyLibraryQuestionsPreview activeItem={activeItem} />);
            return;
        }

        return;
    };

    const handlePublishSlide = async (
        setIsOpen: Dispatch<SetStateAction<boolean>>,
        notify: boolean,
    ) => {
        const status = "PUBLISHED";
        if (activeItem?.source_type == "DOCUMENT") {
            if (activeItem.document_type == "DOC") SaveDraft();
            const publishedData = activeItem.document_data;
            try {
                await addUpdateDocumentSlide({
                    id: activeItem?.slide_id || "",
                    title: activeItem?.slide_title || "",
                    image_file_id: activeItem?.document_cover_file_id || "",
                    description: activeItem?.slide_title || "",
                    slide_order: null,
                    document_slide: {
                        id: activeItem?.document_id || "",
                        type: activeItem.document_type,
                        data: null,
                        title: activeItem?.document_title || "",
                        cover_file_id: activeItem.document_cover_file_id || "",
                        total_pages: 0,
                        published_data: publishedData,
                        published_document_total_pages: 0,
                    },
                    status: status,
                    new_slide: false,
                    notify: notify,
                });
                toast.success(`slide published successfully!`);
                setIsOpen(false);
            } catch {
                toast.error(`Error in publishing the slide`);
            }
        } else {
            try {
                await addUpdateVideoSlide({
                    id: activeItem?.slide_id,
                    title: activeItem?.slide_title || "",
                    description: activeItem?.slide_description || "",
                    image_file_id: activeItem?.document_cover_file_id || "",
                    slide_order: null,
                    video_slide: {
                        id: activeItem?.video_id || "",
                        description: activeItem?.video_description || "",
                        url: null,
                        title: activeItem?.video_title || "",
                        video_length_in_millis: 0,
                        published_url: activeItem?.video_url || null,
                        published_video_length_in_millis: 0,
                    },
                    status: status,
                    new_slide: false,
                    notify: notify,
                });
                toast.success(`slide published successfully!`);
                setIsOpen(false);
            } catch {
                toast.error(`Error in publishing the slide`);
            }
        }
    };
    const handleUnpublishSlide = async (
        setIsOpen: Dispatch<SetStateAction<boolean>>,
        notify: boolean,
    ) => {
        const status = "DRAFT";
        if (activeItem?.source_type == "DOCUMENT") {
            if (activeItem.document_type == "DOC") SaveDraft();
            const draftData = activeItem.document_data;
            try {
                await addUpdateDocumentSlide({
                    id: activeItem?.slide_id || "",
                    title: activeItem?.slide_title || "",
                    image_file_id: activeItem?.document_cover_file_id || "",
                    description: activeItem?.slide_title || "",
                    slide_order: null,
                    document_slide: {
                        id: activeItem?.document_id || "",
                        type: activeItem.document_type,
                        data: draftData,
                        title: activeItem?.document_title || "",
                        cover_file_id: activeItem.document_cover_file_id || "",
                        total_pages: 0,
                        published_data: null,
                        published_document_total_pages: 0,
                    },
                    status: status,
                    new_slide: false,
                    notify: notify,
                });
                toast.success(`slide unpublished successfully!`);
                setIsOpen(false);
            } catch {
                toast.error(`Error in unpublishing the slide`);
            }
        } else {
            try {
                await addUpdateVideoSlide({
                    id: activeItem?.slide_id,
                    title: activeItem?.slide_title || "",
                    description: activeItem?.slide_description || "",
                    image_file_id: activeItem?.document_cover_file_id || "",
                    slide_order: null,
                    video_slide: {
                        id: activeItem?.video_id || "",
                        description: activeItem?.video_description || "",
                        url: activeItem?.video_url || null,
                        title: activeItem?.video_title || "",
                        video_length_in_millis: 0,
                        published_url: null,
                        published_video_length_in_millis: 0,
                    },
                    status: status,
                    new_slide: false,
                    notify: notify,
                });
                toast.success(`slide unpublished successfully!`);
                setIsOpen(false);
            } catch {
                toast.error(`Error in unpublishing the slide`);
            }
        }
    };

    const getCurrentEditorHTMLContent: () => string = () => {
        const data = editor.getEditorValue();
        const htmlString = html.serialize(editor, data);
        const formattedHtmlString = formatHTMLString(htmlString);
        return formattedHtmlString;
    };

    // Modified SaveDraft function
    const SaveDraft = async (slideToSave?: Slide | null) => {
        const slide = slideToSave ? slideToSave : activeItem;

        const currentHtml = getCurrentEditorHTMLContent();

        const status = slide
            ? slide.status == "PUBLISHED"
                ? "UNSYNC"
                : slide.status == "UNSYNC"
                  ? "UNSYNC"
                  : "DRAFT"
            : "DRAFT";

        try {
            await addUpdateDocumentSlide({
                id: slide?.slide_id || "",
                title: slide?.slide_title || "",
                image_file_id: "",
                description: slide?.slide_title || "",
                slide_order: null,
                document_slide: {
                    id: slide?.document_id || "",
                    type: "DOC",
                    data: currentHtml,
                    title: slide?.slide_title || "",
                    cover_file_id: "",
                    total_pages: 0,
                    published_data: null,
                    published_document_total_pages: 0,
                },
                status: status,
                new_slide: false,
                notify: false,
            });
        } catch {
            toast.error("error updating slide");
        }
    };

    const handleSaveDraftClick = async () => {
        try {
            await SaveDraft();
            toast.success("Slide saved successfully");
        } catch {
            toast.error("error saving document");
        }
    };

    const handleConvertAndUpload = async (htmlString: string | null): Promise<string | null> => {
        if (htmlString == null) return null;
        try {
            // Step 1: Convert HTML to PDF
            const pdfBlob = await convertHtmlToPdf(htmlString);

            // Step 2: Create a download link
            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "document.pdf";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Document downloaded successfully");
            return null;
        } catch (error) {
            console.error("Download Failed:", error);
            toast.error("Failed to download document. Please try again.");
        }
        return null;
    };

    useEffect(() => {
        if (items.length == 0) setActiveItem(null);
    }, [items]);

    useEffect(() => {
        setHeading(activeItem?.document_title || activeItem?.video_title || "");
        loadContent();
    }, [activeItem]);

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

    // Update the refs whenever these functions change
    useEffect(() => {
        setGetCurrentEditorHTMLContent(getCurrentEditorHTMLContent);
        setSaveDraft(SaveDraft);
    }, [editor]);

    return (
        <div className="flex w-full flex-1 flex-col" ref={selectionRef}>
            {activeItem && (
                <div className="-mx-8 -my-8 flex items-center justify-between gap-6 border-b border-neutral-300 px-8 py-4">
                    <div className="flex items-center gap-4">
                        {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                                <input
                                    type="text"
                                    value={heading}
                                    onChange={handleHeadingChange}
                                    className="w-fit text-h3 font-semibold text-neutral-600 focus:outline-none"
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
                        {activeItem.last_sync_date != null && (
                            <p className="text-neutral-500">
                                Last synced at: {formatReadableDate(activeItem.last_sync_date)}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-6">
                            {activeItem.source_type == "DOCUMENT" &&
                                activeItem.document_type == "DOC" && (
                                    <MyButton
                                        layoutVariant="icon"
                                        onClick={async () => {
                                            await SaveDraft();
                                            if (activeItem.status == "PUBLISHED") {
                                                await handleConvertAndUpload(
                                                    activeItem.published_data,
                                                );
                                            } else {
                                                await handleConvertAndUpload(
                                                    activeItem.document_data,
                                                );
                                            }
                                        }}
                                    >
                                        <DownloadSimple size={30} />
                                    </MyButton>
                                )}
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
                            <UnpublishDialog
                                isOpen={isUnpublishDialogOpen}
                                setIsOpen={setIsUnpublishDialogOpen}
                                handlePublishUnpublishSlide={handleUnpublishSlide}
                            />
                            <PublishDialog
                                isOpen={isPublishDialogOpen}
                                setIsOpen={setIsPublishDialogOpen}
                                handlePublishUnpublishSlide={handlePublishSlide}
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
