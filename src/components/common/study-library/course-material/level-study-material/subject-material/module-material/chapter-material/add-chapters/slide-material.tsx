import YooptaEditor, { createYooptaEditor, YooptaContentValue } from "@yoopta/editor";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from "react";
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
import { getLevelName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getLevelNameById";
import { getSubjectName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getSubjectNameById";
import { getModuleName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getModuleNameById";
import { getChapterName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getChapterNameById";
import { getPublicUrl } from "@/services/upload_file";
import { PublishDialog } from "../slides-material/publish-slide-dialog";

interface SlideMaterialProps {
    setLevelName: Dispatch<SetStateAction<string>>;
    setSubjectName: Dispatch<SetStateAction<string>>;
    setModuleName: Dispatch<SetStateAction<string>>;
    setChapterName: Dispatch<SetStateAction<string>>;
}

export const SlideMaterial = ({
    setLevelName,
    setSubjectName,
    setModuleName,
    setChapterName,
}: SlideMaterialProps) => {
    const { activeItem, setActiveItem } = useContentStore();
    const editor = useMemo(() => createYooptaEditor(), []);
    const selectionRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [heading, setHeading] = useState(
        activeItem?.document_title || activeItem?.video_title || "",
    );
    const router = useRouter();
    const [content, setContent] = useState<JSX.Element | null>(null);

    const { levelId, subjectId, moduleId, chapterId } = router.state.location.search;
    const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

    useEffect(() => {
        setLevelName(getLevelName(levelId || ""));
        setSubjectName(getSubjectName(subjectId || ""));
        setModuleName(getModuleName(moduleId || ""));
        setChapterName(getChapterName(chapterId || ""));
    }, []);

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
                <div key={`video-${activeItem.slide_id}`} className="h-full w-full">
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

        if (activeItem?.document_type == "DOC") {
            console.log("Raw document data:", activeItem.document_data);

            let editorContent: YooptaContentValue | undefined;
            try {
                editorContent = html.deserialize(editor, activeItem.document_data || "");

                console.log("Deserialized content:", editorContent);

                if (editorContent) {
                    editor.setEditorValue(editorContent);

                    setContent(
                        <div className="w-full">
                            <YooptaEditor
                                editor={editor}
                                plugins={plugins}
                                tools={TOOLS}
                                marks={MARKS}
                                value={editorContent} // Now TypeScript knows this is YooptaContentValue | undefined
                                selectionBoxRoot={selectionRef}
                                autoFocus
                                onChange={(value) => {
                                    console.log("Editor content changed:", value);
                                }}
                                className="h-full w-full"
                                style={{ width: "100%", height: "100%" }}
                            />
                        </div>,
                    );
                }
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
            loadContent();
        }
    }, [activeItem]);

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
                        <MyButton buttonType="secondary" scale="medium" layoutVariant="default">
                            Save Draft
                        </MyButton>
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
