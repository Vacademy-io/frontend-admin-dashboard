import YooptaEditor, {
    createYooptaEditor,
    // Elements,
    // Blocks,
    // useYooptaEditor,
    // YooptaContentValue,
    // YooptaOnChangeOptions,
} from "@yoopta/editor";

import Paragraph from "@yoopta/paragraph";
import Blockquote from "@yoopta/blockquote";
import Embed from "@yoopta/embed";
import Image from "@yoopta/image";
import Link from "@yoopta/link";
import Callout from "@yoopta/callout";
import Video from "@yoopta/video";
import File from "@yoopta/file";
//   import Accordion from '@yoopta/accordion';
import { NumberedList, BulletedList, TodoList } from "@yoopta/lists";
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from "@yoopta/marks";
import { HeadingOne, HeadingThree, HeadingTwo } from "@yoopta/headings";
import Code from "@yoopta/code";
//   import Table from '@yoopta/table';
import Divider from "@yoopta/divider";
import ActionMenuList, { DefaultActionMenuRender } from "@yoopta/action-menu-list";
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";
import LinkTool, { DefaultLinkToolRender } from "@yoopta/link-tool";

//   import { uploadToCloudinary } from '@/utils/cloudinary';
import { useEffect, useMemo, useRef } from "react";
import { MyButton } from "@/components/design-system/button";
import { DotsThree } from "@phosphor-icons/react";
import PDFViewer from "@/components/common/study-library/pdf-viewer";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ActivityStatsSidebar } from "./activity-stats-sidebar/activity-sidebar";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { EmptyModulesImage } from "@/assets/svgs";
import { useState } from "react";

const plugins = [
    Paragraph,
    // Table,
    Divider,
    // Accordion,
    HeadingOne,
    HeadingTwo,
    HeadingThree,
    Blockquote,
    Callout,
    NumberedList,
    BulletedList,
    TodoList,
    Code,
    Link,
    Embed,
    Image,
    Video,
    File,
];

const TOOLS = {
    ActionMenu: {
        render: DefaultActionMenuRender,
        tool: ActionMenuList,
    },
    Toolbar: {
        render: DefaultToolbarRender,
        tool: Toolbar,
    },
    LinkTool: {
        render: DefaultLinkToolRender,
        tool: LinkTool,
    },
};

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

export const ChapterMaterial = () => {
    const { items, activeItemId, setActiveItem } = useContentStore();
    const activeItem = items.find((item) => item.id === activeItemId);
    const editor = useMemo(() => createYooptaEditor(), []);
    const selectionRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [heading, setHeading] = useState(activeItem?.name || "");

    useEffect(() => {
        if (activeItem) {
            setHeading(activeItem.name);
        }
    }, [activeItem]);

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
                <div className="flex h-full flex-col items-center justify-center rounded-lg bg-neutral-50">
                    <EmptyModulesImage />
                    <p className="mt-4 text-neutral-500">No study material has been added yet</p>
                </div>
            );
        }

        switch (activeItem.type) {
            case "pdf":
                return <PDFViewer />;
            case "video":
                return (
                    <iframe
                        width="100%"
                        height="600"
                        src={activeItem.url}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                );
            case "doc":
                return (
                    <YooptaEditor
                        editor={editor}
                        plugins={plugins}
                        tools={TOOLS}
                        marks={MARKS}
                        selectionBoxRoot={selectionRef}
                        autoFocus
                    />
                );
        }
    };

    return (
        <SidebarProvider style={{ ["--sidebar-width" as string]: "530px" }}>
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
                        <div className="flex items-center gap-[80px]">
                            <SidebarTrigger>
                                <MyButton
                                    buttonType="primary"
                                    scale="medium"
                                    layoutVariant="default"
                                >
                                    Activity Stats
                                </MyButton>
                            </SidebarTrigger>
                            <MyButton buttonType="secondary" scale="medium" layoutVariant="default">
                                Edit
                            </MyButton>
                        </div>
                        <MyButton buttonType="secondary" scale="large" layoutVariant="icon">
                            <DotsThree />
                        </MyButton>
                    </div>
                </div>
                <div className="mt-14 h-full w-full px-10">{renderContent()}</div>
            </div>
            <ActivityStatsSidebar />
        </SidebarProvider>
    );
};
