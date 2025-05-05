import { MyButton } from "@/components/design-system/button";
import { MyDropdown } from "@/components/design-system/dropdown";
import { useSidebar } from "@/components/ui/sidebar";
import { Plus, FilePdf, FileDoc, YoutubeLogo, Question } from "@phosphor-icons/react";
import { MyDialog } from "@/components/design-system/dialog";
import { AddVideoDialog } from "./add-video-dialog";
import { AddDocDialog } from "./add-doc-dialog";
import { AddPdfDialog } from "./add-pdf-dialog";
import { useRouter } from "@tanstack/react-router";
import { useSlides } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides";
import { formatHTMLString } from "../slide-material";
import { useContentStore } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/chapter-sidebar-store";
import { useDialogStore } from "@/routes/study-library/courses/-stores/slide-add-dialogs-store";
import AddQuestionDialog from "./add-question-dialog";
import { File } from "phosphor-react";
import { useForm } from "react-hook-form";
import { assignmentFormSchema, AssignmentFormType } from "../../-form-schemas/assignmentFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";

export const ChapterSidebarAddButton = () => {
    const form = useForm<AssignmentFormType>({
        resolver: zodResolver(assignmentFormSchema),
        defaultValues: {
            task: "",
            taskDescription: "",
            startDate: "",
            endDate: "",
            reattemptCount: "0",
            uploaded_question_paper: null,
            adaptive_marking_for_each_question: [],
        },
    });
    const { open } = useSidebar();
    const route = useRouter();
    const { chapterId } = route.state.location.search;
    const { addUpdateDocumentSlide } = useSlides(chapterId || "");
    const { setActiveItem, getSlideById, setItems, items } = useContentStore();

    // Use the Zustand store instead of useState
    const {
        isPdfDialogOpen,
        isDocUploadDialogOpen,
        isVideoDialogOpen,
        isQuestionDialogOpen,
        openPdfDialog,
        closePdfDialog,
        openDocUploadDialog,
        closeDocUploadDialog,
        openVideoDialog,
        closeVideoDialog,
        openQuestionDialog,
        closeQuestionDialog,
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
        {
            label: "Question",
            value: "question",
            icon: <Question className="size-4" />,
        },
        {
            label: "Assignment",
            value: "assignment",
            icon: <File className="size-4" />,
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
                        title: "New Doc",
                        image_file_id: "",
                        description: "",
                        slide_order: null,
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
            case "question":
                openQuestionDialog(); // Use store action instead of setState
                break;
            case "assignment":
                setItems([
                    {
                        slide_title: null,
                        document_id: null,
                        document_title: `Assignment ${items.length + 1}`,
                        document_type: "",
                        slide_description: null,
                        document_cover_file_id: null,
                        video_description: null,
                        document_data: JSON.stringify(form.getValues()),
                        video_id: null,
                        video_title: null,
                        video_url: null,
                        slide_id: String(items.length + 1),
                        source_type: "ASSIGNMENT",
                        status: "DRAFT",
                        published_data: "",
                        published_url: "",
                        last_sync_date: null,
                    },
                    ...items,
                ]);
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
                dialogWidth="min-w-[400px] w-auto"
                open={isPdfDialogOpen}
                onOpenChange={closePdfDialog} // Pass the action function directly
            >
                <AddPdfDialog openState={(open) => !open && closePdfDialog()} />
            </MyDialog>

            {/* Doc Upload Dialog */}
            <MyDialog
                trigger={<></>}
                heading="Upload Document"
                dialogWidth="min-w-[400px] w-auto"
                open={isDocUploadDialogOpen}
                onOpenChange={closeDocUploadDialog} // Pass the action function directly
            >
                <AddDocDialog openState={(open) => !open && closeDocUploadDialog()} />
            </MyDialog>

            {/* Video Upload Dialog */}
            <MyDialog
                trigger={<></>}
                heading="Upload Video"
                dialogWidth="min-w-[400px]"
                open={isVideoDialogOpen}
                onOpenChange={closeVideoDialog} // Pass the action function directly
            >
                <AddVideoDialog openState={(open) => !open && closeVideoDialog()} />
            </MyDialog>

            {/* Question Upload Dialog */}
            <MyDialog
                trigger={<></>}
                heading="Upload Question"
                dialogWidth="min-w-[500px]"
                open={isQuestionDialogOpen}
                onOpenChange={closeQuestionDialog} // Pass the action function directly
            >
                <AddQuestionDialog openState={(open) => !open && closeQuestionDialog()} />
            </MyDialog>
        </>
    );
};
