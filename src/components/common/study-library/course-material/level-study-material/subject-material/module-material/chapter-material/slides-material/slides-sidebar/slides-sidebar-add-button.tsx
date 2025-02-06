import { useState } from "react";
import { MyButton } from "@/components/design-system/button";
import { MyDropdown } from "@/components/design-system/dropdown";
import { useSidebar } from "@/components/ui/sidebar";
import { Plus, FilePdf, FileDoc, YoutubeLogo } from "@phosphor-icons/react";
import { MyDialog } from "@/components/design-system/dialog";
import { AddVideoDialog } from "./add-video-dialog";
import { AddDocDialog } from "./add-doc-dialog";
import { AddPdfDialog } from "./add-pdf-dialog";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { SidebarContentItem } from "@/types/study-library/chapter-sidebar";
import { YooptaContentValue } from "@yoopta/editor";

export const ChapterSidebarAddButton = () => {
    const { open } = useSidebar();
    const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
    const [isDocUploadDialogOpen, setIsDocUploadDialogOpen] = useState(false);
    const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
    const addItem = useContentStore((state) => state.addItem);

    const dropdownList = [
        {
            label: "Pdf",
            value: "pdf",
            icon: <FilePdf className="size-4" />,
        },
        {
            label: "Doc",
            value: "doc",
            icon: <FileDoc className="size-4" />,
            subItems: [
                { label: "Upload from device", value: "upload-doc" },
                { label: "Create new doc", value: "create-doc" },
            ],
        },
        {
            label: "Video",
            value: "video",
            icon: <YoutubeLogo className="size-4" />,
        },
    ];

    const handleSelect = (value: string) => {
        switch (value) {
            case "pdf":
                setIsPdfDialogOpen(true);
                break;
            case "upload-doc":
                setIsDocUploadDialogOpen(true);
                break;
            case "create-doc": {
                // Create a new empty document with proper Yoopta structure
                const emptyYooptaContent: YooptaContentValue = {
                    "block-0": {
                        id: crypto.randomUUID(),
                        type: "paragraph",
                        value: [
                            {
                                id: crypto.randomUUID(),
                                type: "paragraph",
                                children: [{ text: "" }],
                            },
                        ],
                        meta: {
                            order: 0,
                            depth: 0,
                        },
                    },
                };

                console.log("emptyYooptaContent: ", emptyYooptaContent);

                const newDoc: SidebarContentItem = {
                    id: crypto.randomUUID(),
                    type: "",
                    title: "",
                    url: "",
                    content: "",
                    status: "",
                    source_type: "",
                    slide_description: "",
                    document_title: "",
                    document_url: "",
                    document_path: "",
                    video_url: "",
                    video_description: "",
                    createdAt: new Date(),
                };
                addItem(newDoc);
                break;
            }
            case "video":
                setIsVideoDialogOpen(true);
                break;
        }
    };

    return (
        <>
            <MyDropdown dropdownList={dropdownList} onSelect={handleSelect}>
                <MyButton
                    buttonType="primary"
                    scale="large"
                    layoutVariant={open ? "default" : "icon"}
                    className={`${open ? "" : ""}`}
                >
                    <Plus />
                    <p className={`${open ? "visible" : "hidden"}`}>Add</p>
                </MyButton>
            </MyDropdown>

            {/* PDF Upload Dialog */}
            <MyDialog
                trigger={<></>}
                heading="Upload PDF"
                dialogWidth="w-[400px]"
                open={isPdfDialogOpen}
                onOpenChange={setIsPdfDialogOpen}
            >
                <AddPdfDialog openState={setIsPdfDialogOpen} />
            </MyDialog>

            {/* Doc Upload Dialog */}
            <MyDialog
                trigger={<></>}
                heading="Upload Document"
                dialogWidth="w-[400px]"
                open={isDocUploadDialogOpen}
                onOpenChange={setIsDocUploadDialogOpen}
            >
                <AddDocDialog openState={setIsDocUploadDialogOpen} />
            </MyDialog>

            {/* Video Upload Dialog */}
            <MyDialog
                trigger={<></>}
                heading="Upload Video"
                dialogWidth="w-[400px]"
                open={isVideoDialogOpen}
                onOpenChange={setIsVideoDialogOpen}
            >
                <AddVideoDialog openState={setIsVideoDialogOpen} />
            </MyDialog>
        </>
    );
};
