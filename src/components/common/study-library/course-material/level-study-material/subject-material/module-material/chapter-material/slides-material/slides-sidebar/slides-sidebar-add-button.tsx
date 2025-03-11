import { MyButton } from "@/components/design-system/button";
import { MyDropdown } from "@/components/design-system/dropdown";
import { useSidebar } from "@/components/ui/sidebar";
import { Plus, FilePdf, FileDoc, YoutubeLogo } from "@phosphor-icons/react";
import { MyDialog } from "@/components/design-system/dialog";
import { AddVideoDialog } from "./add-video-dialog";
import { AddDocDialog } from "./add-doc-dialog";
import { AddPdfDialog } from "./add-pdf-dialog";
import { useRouter } from "@tanstack/react-router";
import { useSlides } from "@/hooks/study-library/use-slides";
import { formatHTMLString } from "../../add-chapters/slide-material";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { useDialogStore } from "@/stores/study-library/slide-add-dialogs-store";

export const ChapterSidebarAddButton = () => {
    const { open } = useSidebar();
    const route = useRouter();
    const { chapterId } = route.state.location.search;
    const { addUpdateDocumentSlide } = useSlides(chapterId || "");
    const { setActiveItem, getSlideById } = useContentStore();

    // Use the Zustand store instead of useState
    const {
        isPdfDialogOpen,
        isDocUploadDialogOpen,
        isVideoDialogOpen,
        openPdfDialog,
        closePdfDialog,
        openDocUploadDialog,
        closeDocUploadDialog,
        openVideoDialog,
        closeVideoDialog,
    } = useDialogStore();

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

    const handleSelect = async (value: string) => {
        switch (value) {
            case "pdf":
                openPdfDialog(); // Use store action instead of setState
                break;
            case "upload-doc":
                openDocUploadDialog(); // Use store action instead of setState
                break;
            case "create-doc": {
                try {
                    const documentData = formatHTMLString("");
                    const slideId = crypto.randomUUID();
                    const response = await addUpdateDocumentSlide({
                        id: slideId,
                        title: "New Document",
                        image_file_id: "",
                        description: "",
                        slide_order: 0,
                        document_slide: {
                            id: crypto.randomUUID(),
                            type: "DOC",
                            data: documentData,
                            title: "New Document",
                            cover_file_id: "",
                            total_pages: 1,
                            published_data: null,
                            published_document_total_pages: 0,
                        },
                        status: "DRAFT",
                        new_slide: true,
                        notify: false,
                    });

                    if (response) {
                        setTimeout(() => {
                            setActiveItem(getSlideById(slideId));
                        }, 500);
                    }
                } catch (err) {
                    console.error("Error creating new doc:", err);
                }
                break;
            }
            case "video":
                openVideoDialog(); // Use store action instead of setState
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
                    id="add-slides"
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
                onOpenChange={closePdfDialog} // Pass the action function directly
            >
                <AddPdfDialog openState={(open) => !open && closePdfDialog()} />
            </MyDialog>

            {/* Doc Upload Dialog */}
            <MyDialog
                trigger={<></>}
                heading="Upload Document"
                dialogWidth="w-[400px]"
                open={isDocUploadDialogOpen}
                onOpenChange={closeDocUploadDialog} // Pass the action function directly
            >
                <AddDocDialog openState={(open) => !open && closeDocUploadDialog()} />
            </MyDialog>

            {/* Video Upload Dialog */}
            <MyDialog
                trigger={<></>}
                heading="Upload Video"
                dialogWidth="w-[400px]"
                open={isVideoDialogOpen}
                onOpenChange={closeVideoDialog} // Pass the action function directly
            >
                <AddVideoDialog openState={(open) => !open && closeVideoDialog()} />
            </MyDialog>
        </>
    );
};
