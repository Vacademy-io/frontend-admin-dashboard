import YooptaEditor, { createYooptaEditor } from "@yoopta/editor";
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

export const SlideMaterial = () => {
    const { items, activeItemId, setActiveItem } = useContentStore();
    const activeItem = items.find((item) => item.id === activeItemId);
    const editor = useMemo(() => createYooptaEditor(), []);
    const selectionRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [heading, setHeading] = useState(activeItem?.name || "");

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

    const renderContent = () => {
        if (!activeItem) {
            return (
                <div className="flex h-[500px] flex-col items-center justify-center rounded-lg py-10">
                    <EmptySlideMaterial />
                    <p className="mt-4 text-neutral-500">No study material has been added yet</p>
                </div>
            );
        }

        switch (activeItem.type) {
            case "pdf":
                return <PDFViewer />;
            case "video":
                return <YouTubePlayer videoUrl={activeItem.url} videoTitle={activeItem.name} />;

            case "doc": {
                console.log("Rendering doc content:", activeItem.content); // For debugging

                const content =
                    typeof activeItem.content === "string"
                        ? html.deserialize(editor, activeItem.content)
                        : activeItem.content;
                editor.setEditorValue(content);

                return (
                    <div className="w-full">
                        <YooptaEditor
                            editor={editor}
                            plugins={plugins}
                            tools={TOOLS}
                            marks={MARKS}
                            selectionBoxRoot={selectionRef}
                            autoFocus
                            onChange={(value) => {
                                console.log("Editor content changed:", value); // For debugging
                                // You might want to save changes here
                            }}
                            className="h-full w-full"
                            style={{ width: "100%", height: "100%" }}
                        />
                    </div>
                );
            }
            default:
                return null;
        }
    };

    useEffect(() => {
        if (activeItem) {
            setHeading(activeItem.name);
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
                            Edit
                        </MyButton>
                    </div>
                    <SlidesMenuOption />
                </div>
            </div>
            <div
                className={`mx-auto mt-14 ${
                    activeItem?.type == "pdf" ? "h-[calc(100vh-200px)]" : "h-full"
                } w-full overflow-hidden px-10`}
            >
                {renderContent()}
            </div>
        </div>
    );
};
