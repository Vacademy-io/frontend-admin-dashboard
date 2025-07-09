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
    Code,
    BookOpen,
} from '@phosphor-icons/react';
import { MyDialog } from '@/components/design-system/dialog';
import { AddVideoDialog } from './add-video-dialog';
import { AddVideoFileDialog } from './add-video-file-dialog';
import { AddDocDialog } from './add-doc-dialog';
import { AddPdfDialog } from './add-pdf-dialog';
import { useRouter } from '@tanstack/react-router';
import { useSlidesMutations } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-hooks/use-slides';
import { useContentStore } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
import { useDialogStore } from '@/routes/study-library/courses/-stores/slide-add-dialogs-store';
import AddQuestionDialog from './add-question-dialog';
import { File, GameController } from 'phosphor-react';
import { formatHTMLString } from '../slide-operations/formatHtmlString';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { generateUniqueDocumentSlideTitle } from '../../-helper/slide-naming-utils';
import { toast } from 'sonner';
import { createAssignmentSlidePayload } from '../yoopta-editor-customizations/createAssignmentSlidePayload';
import { createPresentationSlidePayload } from '../create-presentation-slide';

// Simple utility function for setting first slide as active (used as fallback)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setFirstSlideAsActive = (setActiveItem: (slide: any) => void, items: any[]) => {
    if (items && items.length > 0) {
        setActiveItem(items[0]);
    }
};

export const ChapterSidebarAddButton = () => {
    const { open } = useSidebar();
    const route = useRouter();
    const { getPackageSessionId } = useInstituteDetailsStore();
    const { courseId, levelId, chapterId, moduleId, subjectId, sessionId } =
        route.state.location.search;
    const { addUpdateDocumentSlide, updateSlideOrder, updateAssignmentOrder } = useSlidesMutations(
        chapterId || '',
        moduleId || '',
        subjectId || '',
        getPackageSessionId({
            courseId: courseId || '',
            levelId: levelId || '',
            sessionId: sessionId || '',
        }) || ''
    );

    const { items } = useContentStore();

    // Use the Zustand store instead of useState
    const {
        isPdfDialogOpen,
        isDocUploadDialogOpen,
        isVideoDialogOpen,
        isVideoFileDialogOpen,
        isQuestionDialogOpen,

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
    } = useDialogStore();

    // Function to reorder slides after adding a new one at the top
    const reorderSlidesAfterNewSlide = async (newSlideId: string) => {
        try {
            // Get current slides and reorder them
            const currentSlides = items || [];
            const newSlide = currentSlides.find((slide) => slide.id === newSlideId);

            if (!newSlide) return;

            // Create new order: new slide at top (order 0), then existing slides
            const reorderedSlides = [
                { slide_id: newSlideId, slide_order: 0 },
                ...currentSlides
                    .filter((slide) => slide.id !== newSlideId)
                    .map((slide, index) => ({
                        slide_id: slide.id,
                        slide_order: index + 1,
                    })),
            ];

            // Update slide order in backend
            await updateSlideOrder({
                chapterId: chapterId || '',
                slideOrderPayload: reorderedSlides,
            });
        } catch (error) {
            console.error('Error reordering slides:', error);
            toast.error('Slide created but reordering failed');
        }
    };

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
        {
            label: 'Jupyter Notebook',
            value: 'jupyter-notebook',
            icon: <BookOpen className="size-4 text-violet-500" />,
            description: 'Interactive coding notebooks',
        },
        {
            label: 'Scratch Project',
            value: 'scratch-project',
            icon: <GameController className="size-4 text-yellow-500" />,
            description: 'Visual programming blocks',
        },
        {
            label: 'Code Editor',
            value: 'code-editor',
            icon: <Code className="size-4 text-green-500" />,
            description: 'Interactive code environment',
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
                    const uniqueTitle = generateUniqueDocumentSlideTitle(items || [], 'DOC');
                    const response = await addUpdateDocumentSlide({
                        id: slideId,
                        title: uniqueTitle,
                        image_file_id: '',
                        description: '',
                        slide_order: 0, // Always insert at top
                        document_slide: {
                            id: crypto.randomUUID(),
                            type: 'DOC',
                            data: documentData,
                            title: uniqueTitle,
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
                        // Reorder slides and set as active
                        await reorderSlidesAfterNewSlide(slideId);
                    }
                } catch (err) {
                    console.error('Error creating new doc:', err);
                    toast.error('Failed to create new document');
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
            case 'assignment': {
                try {
                    const payload = createAssignmentSlidePayload(items || []);
                    const response = await updateAssignmentOrder(payload);

                    if (response) {
                        await reorderSlidesAfterNewSlide(payload.id || '');
                        toast.success('Assignment created successfully!');
                    } else {
                        throw new Error('Empty response returned from API.');
                    }
                } catch (err) {
                    console.error('❌ Error creating assignment:', err);
                    toast.error(
                        (err as Error)?.message || 'Failed to create assignment. Please try again.'
                    );
                }
                break;
            }

            case 'presentation': {
                console.log('presentation payload text');
                try {
                    // Create a new presentation slide payload
                    const slideTypeObj = {
                        id: crypto.randomUUID(),
                        name: 'Text',
                        slides: null,
                    };
                    const payload = createPresentationSlidePayload(slideTypeObj, items || []);
                    payload.slide_order = 0; // Always insert at top
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

                        // Reorder slides and set as active
                        await reorderSlidesAfterNewSlide(payload?.id || '');
                    }
                } catch (err) {
                    console.error('Error creating new presentation:', err);
                    toast.error('Failed to create new presentation');
                }
                break;
            }
            case 'jupyter-notebook': {
                try {
                    // Create a Jupyter notebook slide as a document with special type
                    const slideId = crypto.randomUUID();
                    const uniqueTitle = generateUniqueDocumentSlideTitle(items || [], 'JUPYTER');
                    const response = await addUpdateDocumentSlide({
                        id: slideId,
                        title: uniqueTitle,
                        image_file_id: '',
                        description: 'Interactive Jupyter notebook environment',
                        slide_order: 0, // Always insert at top
                        document_slide: {
                            id: crypto.randomUUID(),
                            type: 'JUPYTER',
                            data: JSON.stringify({
                                projectName: '',
                                contentUrl: '',
                                contentBranch: 'main',
                                notebookLocation: 'root',
                                activeTab: 'settings',
                                editorType: 'jupyterEditor',
                                timestamp: Date.now(),
                            }),
                            title: uniqueTitle,
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
                        // Reorder slides and set as active
                        await reorderSlidesAfterNewSlide(slideId);
                    }
                } catch (err) {
                    console.error('Error creating Jupyter notebook:', err);
                    toast.error('Failed to create Jupyter notebook');
                }
                break;
            }
            case 'scratch-project': {
                try {
                    // Create a Scratch project slide as a document with special type
                    const slideId = crypto.randomUUID();
                    const uniqueTitle = generateUniqueDocumentSlideTitle(items || [], 'SCRATCH');
                    const response = await addUpdateDocumentSlide({
                        id: slideId,
                        title: uniqueTitle,
                        image_file_id: '',
                        description: 'Interactive Scratch programming environment',
                        slide_order: 0, // Always insert at top
                        document_slide: {
                            id: crypto.randomUUID(),
                            type: 'SCRATCH',
                            data: JSON.stringify({
                                projectId: '',
                                scratchUrl: '',
                                embedType: 'project',
                                autoStart: false,
                                hideControls: false,
                                editorType: 'scratchEditor',
                                timestamp: Date.now(),
                            }),
                            title: uniqueTitle,
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
                        // Reorder slides and set as active
                        await reorderSlidesAfterNewSlide(slideId);
                    }
                } catch (err) {
                    console.error('Error creating Scratch project:', err);
                    toast.error('Failed to create Scratch project');
                }
                break;
            }
            case 'code-editor': {
                try {
                    // Create a code editor slide as a document with special type
                    const slideId = crypto.randomUUID();
                    const uniqueTitle = generateUniqueDocumentSlideTitle(items || [], 'CODE');
                    const response = await addUpdateDocumentSlide({
                        id: slideId,
                        title: uniqueTitle,
                        image_file_id: '',
                        description: 'Interactive code editing environment',
                        slide_order: 0, // Always insert at top
                        document_slide: {
                            id: crypto.randomUUID(),
                            type: 'CODE',
                            data: JSON.stringify({
                                language: 'javascript',
                                theme: 'dark',
                                code: '// Welcome to the code editor\nconsole.log("Hello, World!");',
                                readOnly: false,
                                showLineNumbers: true,
                                fontSize: 14,
                                editorType: 'codeEditor',
                                timestamp: Date.now(),
                            }),
                            title: uniqueTitle,
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
                        // Reorder slides and set as active
                        await reorderSlidesAfterNewSlide(slideId);
                    }
                } catch (err) {
                    console.error('Error creating code editor:', err);
                    toast.error('Failed to create code editor');
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
                        group relative h-9 w-full
                        overflow-hidden border-0 bg-gradient-to-r
                        from-primary-400 to-primary-400
                        shadow-md shadow-primary-500/20
                        transition-all duration-300 ease-in-out
                        hover:scale-[1.01] hover:from-primary-400
                        hover:to-primary-400 hover:shadow-lg
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
        </div>
    );
};
