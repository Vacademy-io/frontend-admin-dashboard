'use client';

import { MyButton } from '@/components/design-system/button';
import { MyDropdown } from '@/components/design-system/dropdown';
import { useSidebar } from '@/components/ui/sidebar';
import {
    Plus,
    FilePdf,
    FileDoc,
    YoutubeLogo,
    Question,
    PresentationChart,
} from '@phosphor-icons/react';
import { MyDialog } from '@/components/design-system/dialog';
import { AddVideoDialog } from './add-video-dialog';
import { AddVideoFileDialog } from './add-video-file-dialog';
import { AddDocDialog } from './add-doc-dialog';
import { AddPdfDialog } from './add-pdf-dialog';
import { useRouter } from '@tanstack/react-router';
import { useSlides } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
import { useContentStore } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
import { useDialogStore } from '@/routes/study-library/courses/-stores/slide-add-dialogs-store';
import AddQuestionDialog from './add-question-dialog';
import { File } from 'phosphor-react';
import { formatHTMLString } from '../slide-operations/formatHtmlString';
import AddAssignmentDialog from './add-assignment-dialog';
import { createPresentationSlidePayload } from '../create-presentation-slide';

export const ChapterSidebarAddButton = () => {
    const { open } = useSidebar();
    const route = useRouter();
    const { chapterId } = route.state.location.search;
    const { addUpdateDocumentSlide } = useSlides(chapterId || '');
    const { setActiveItem, getSlideById } = useContentStore();

    // Use the Zustand store instead of useState
    const {
        isPdfDialogOpen,
        isDocUploadDialogOpen,
        isVideoDialogOpen,
        isVideoFileDialogOpen,
        isQuestionDialogOpen,
        isAssignmentDialogOpen,
        openPdfDialog,
        closePdfDialog,
        openDocUploadDialog,
        closeDocUploadDialog,
        openVideoDialog,
        closeVideoDialog,
        openVideoFileDialog,
        closeVideoFileDialog,
        openQuestionDialog,
        closeQuestionDialog,
        openAssignmentDialog,
        closeAssignmentDialog,
    } = useDialogStore();

    const dropdownList = [
        {
            label: 'PDF Document',
            value: 'pdf',
            icon: <FilePdf className="size-4 text-red-500" />,
            description: 'Upload PDF files',
        },
        {
            label: 'Document',
            value: 'doc',
            icon: <FileDoc className="size-4 text-blue-600" />,
            description: 'Word documents & more',
            subItems: [
                {
                    label: 'Upload from device',
                    value: 'upload-doc',
                    description: 'Upload existing document',
                },
                {
                    label: 'Create new document',
                    value: 'create-doc',
                    description: 'Start with blank document',
                },
            ],
        },
        {
            label: 'Video',
            value: 'video',
            icon: <YoutubeLogo className="size-4 text-green-500" />,
            description: 'Video content',
            subItems: [
                {
                    label: 'Upload video file',
                    value: 'upload-video',
                    description: 'Upload from device',
                },
                {
                    label: 'YouTube video',
                    value: 'youtube-video',
                    description: 'Add YouTube link',
                },
            ],
        },
        {
            label: 'Question',
            value: 'question',
            icon: <Question className="size-4 text-purple-500" />,
            description: 'Interactive questions',
        },
        {
            label: 'Assignment',
            value: 'assignment',
            icon: <File className="size-4 text-blue-500" />,
            description: 'Student assignments',
        },
        {
            label: 'Presentation',
            value: 'presentation',
            icon: <PresentationChart className="size-4 text-orange-500" />,
            description: 'Interactive presentations',
        },
    ];

    const handleSelect = async (value: string) => {
        switch (value) {
            case 'pdf':
                openPdfDialog();
                break;
            case 'upload-doc':
                openDocUploadDialog();
                break;
            case 'create-doc': {
                try {
                    const documentData = formatHTMLString('');
                    const slideId = crypto.randomUUID();
                    const response = await addUpdateDocumentSlide({
                        id: slideId,
                        title: 'New Doc',
                        image_file_id: '',
                        description: '',
                        slide_order: 0,
                        document_slide: {
                            id: crypto.randomUUID(),
                            type: 'DOC',
                            data: documentData,
                            title: 'New Doc',
                            cover_file_id: '',
                            total_pages: 1,
                            published_data: null,
                            published_document_total_pages: 0,
                        },
                        status: 'DRAFT',
                        new_slide: true,
                        notify: false,
                    });

                    if (response) {
                        setTimeout(() => {
                            setActiveItem(getSlideById(slideId));
                        }, 500);
                    }
                } catch (err) {
                    console.error('Error creating new doc:', err);
                }
                break;
            }
            case 'youtube-video':
                openVideoDialog();
                break;
            case 'upload-video':
                openVideoFileDialog(); // Open the new video file upload dialog
                break;
            case 'question':
                openQuestionDialog();
                break;
            case 'assignment':
                openAssignmentDialog();
                break;
            case 'presentation': {
                console.log('presentation payload text');
                try {
                    // Create a new presentation slide payload
                    const slideTypeObj = {
                        id: crypto.randomUUID(),
                        name: 'Text',
                        slides: null,
                    };
                    const payload = createPresentationSlidePayload(slideTypeObj);
                    console.log('payload', payload);
                    const response = await addUpdateDocumentSlide(payload);

                    if (response) {
                        // Initialize empty Excalidraw data in localStorage
                        const excalidrawData = {
                            isExcalidraw: true,
                            elements: [],
                            files: {},
                            appState: {
                                viewBackgroundColor: '#ffffff',
                                gridSize: null,
                            },
                            lastModified: Date.now(),
                        };
                        localStorage.setItem(
                            `excalidraw_${payload.id}`,
                            JSON.stringify(excalidrawData)
                        );

                        // Set the active item after a short delay to ensure the slide is created
                        setTimeout(() => {
                            if (payload.id) {
                                setActiveItem(getSlideById(payload.id));
                            }
                        }, 500);
                    }
                } catch (err) {
                    console.error('Error creating new presentation:', err);
                }
                break;
            }
        }
    };

    return (
        <div className="w-full px-1 duration-500 animate-in fade-in slide-in-from-top-2">
            <MyDropdown dropdownList={dropdownList} onSelect={handleSelect}>
                <MyButton
                    buttonType="primary"
                    scale="medium"
                    className={`
                        to-primary-600 hover:from-primary-600 hover:to-primary-700 group
                        relative h-9 w-full
                        overflow-hidden border-0
                        bg-gradient-to-r from-primary-500
                        shadow-md shadow-primary-500/20 transition-all
                        duration-300 ease-in-out
                        hover:scale-[1.01] hover:shadow-lg
                        hover:shadow-primary-500/25 active:scale-[0.99]
                        ${open ? 'px-3' : 'px-2.5'}
                    `}
                    id="add-slides"
                >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 ease-out group-hover:translate-x-full" />

                    <div className="relative z-10 flex items-center justify-center gap-1.5">
                        <Plus
                            className={`
                            transition-all duration-300 ease-in-out
                            group-hover:rotate-90 group-hover:scale-110
                            ${open ? 'size-4' : 'size-3.5'}
                        `}
                        />
                        {open && (
                            <span className="text-sm font-medium tracking-wide duration-300 animate-in slide-in-from-left-2">
                                Add Slide
                            </span>
                        )}
                    </div>
                </MyButton>
            </MyDropdown>

            {/* Enhanced Dialog Components with consistent styling */}
            <MyDialog
                trigger={<></>}
                heading="Upload PDF Document"
                dialogWidth="min-w-[400px] w-auto"
                open={isPdfDialogOpen}
                onOpenChange={closePdfDialog}
            >
                <div className="duration-300 animate-in fade-in slide-in-from-bottom-4">
                    <AddPdfDialog openState={(open) => !open && closePdfDialog()} />
                </div>
            </MyDialog>

            <MyDialog
                trigger={<></>}
                heading="Upload Document"
                dialogWidth="min-w-[400px] w-auto"
                open={isDocUploadDialogOpen}
                onOpenChange={closeDocUploadDialog}
            >
                <div className="duration-300 animate-in fade-in slide-in-from-bottom-4">
                    <AddDocDialog openState={(open) => !open && closeDocUploadDialog()} />
                </div>
            </MyDialog>

            <MyDialog
                trigger={<></>}
                heading="Add YouTube Video"
                dialogWidth="min-w-[400px]"
                open={isVideoDialogOpen}
                onOpenChange={closeVideoDialog}
            >
                <div className="duration-300 animate-in fade-in slide-in-from-bottom-4">
                    <AddVideoDialog openState={(open) => !open && closeVideoDialog()} />
                </div>
            </MyDialog>

            <MyDialog
                trigger={<></>}
                heading="Upload Video File"
                dialogWidth="min-w-[400px]"
                open={isVideoFileDialogOpen}
                onOpenChange={closeVideoFileDialog}
            >
                <div className="duration-300 animate-in fade-in slide-in-from-bottom-4">
                    <AddVideoFileDialog openState={(open) => !open && closeVideoFileDialog()} />
                </div>
            </MyDialog>

            <MyDialog
                trigger={<></>}
                heading="Create Question"
                dialogWidth="min-w-[500px]"
                open={isQuestionDialogOpen}
                onOpenChange={closeQuestionDialog}
            >
                <div className="duration-300 animate-in fade-in slide-in-from-bottom-4">
                    <AddQuestionDialog openState={(open) => !open && closeQuestionDialog()} />
                </div>
            </MyDialog>

            <MyDialog
                trigger={<></>}
                heading="Create Assignment"
                dialogWidth="min-w-[500px]"
                open={isAssignmentDialogOpen}
                onOpenChange={closeAssignmentDialog}
            >
                <div className="duration-300 animate-in fade-in slide-in-from-bottom-4">
                    <AddAssignmentDialog openState={(open) => !open && closeAssignmentDialog()} />
                </div>
            </MyDialog>
        </div>
    );
};
