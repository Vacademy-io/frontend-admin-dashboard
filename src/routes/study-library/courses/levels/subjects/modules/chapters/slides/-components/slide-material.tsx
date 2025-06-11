import type React from 'react';
import YooptaEditor, { createYooptaEditor } from '@yoopta/editor';
import { useEffect, useMemo, useRef } from 'react';
import { MyButton } from '@/components/design-system/button';
import PDFViewer from './pdf-viewer';
import { ActivityStatsSidebar } from './stats-dialog/activity-sidebar';
import { useContentStore } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
import { EmptySlideMaterial } from '@/assets/svgs';
import { useState } from 'react';
import { html } from '@yoopta/exports';
import { SlidesMenuOption } from './slides-menu-options/slides-menu-option';
import { plugins, TOOLS, MARKS } from '@/constants/study-library/yoopta-editor-plugins-tools';
import { useRouter } from '@tanstack/react-router';
import { getPublicUrl, UploadFileInS3 } from '@/services/upload_file';
import { PublishDialog } from './publish-slide-dialog';
import { UnpublishDialog } from './unpublish-slide-dialog';
import {
    type Slide,
    useSlides,
} from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
import { toast } from 'sonner';
import { Check, DownloadSimple, PencilSimpleLine, ChatText } from 'phosphor-react';
import {
    converDataToAssignmentFormat,
    converDataToVideoFormat,
    convertHtmlToPdf,
    convertToQuestionBackendSlideFormat,
} from '../-helper/helper';
import { StudyLibraryQuestionsPreview } from './questions-preview';
import StudyLibraryAssignmentPreview from './assignment-preview';
import VideoSlidePreview from './video-slide-preview';
import { handlePublishSlide } from './slide-operations/handlePublishSlide';
import { handleUnpublishSlide } from './slide-operations/handleUnpublishSlide';
import { updateHeading } from './slide-operations/updateSlideHeading';
import { formatHTMLString } from './slide-operations/formatHtmlString';
import { handleConvertAndUpload } from './slide-operations/handleConvertUpload';
import SlideEditor from './SlideEditor';
import type { JSX } from 'react/jsx-runtime';
import { useSidebar } from '@/components/ui/sidebar';

// Declare INSTITUTE_ID here or import it from a config file
const INSTITUTE_ID = 'your-institute-id'; // Replace with your actual institute ID

export const SlideMaterial = ({
    setGetCurrentEditorHTMLContent,
    setSaveDraft,
}: {
    setGetCurrentEditorHTMLContent: (fn: () => string) => void;
    setSaveDraft: (fn: (activeItem: Slide) => Promise<void>) => void;
}) => {
    const { items, activeItem, setActiveItem } = useContentStore();
    const editor = useMemo(() => createYooptaEditor(), []);
    const selectionRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [slideTitle, setSlideTitle] = useState('');

    const [heading, setHeading] = useState(slideTitle);
    const router = useRouter();
    const [content, setContent] = useState<JSX.Element | null>(null);

    const { chapterId, slideId } = router.state.location.search;
    const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
    const [isUnpublishDialogOpen, setIsUnpublishDialogOpen] = useState(false);
    const { addUpdateDocumentSlide } = useSlides(chapterId || '');
    const { addUpdateVideoSlide } = useSlides(chapterId || '');
    const { updateQuestionOrder } = useSlides(chapterId || '');
    const { updateAssignmentOrder } = useSlides(chapterId || '');
    const { open, setOpen } = useSidebar();

    const handleHeadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHeading(e.target.value);
    };



    const setEditorContent = () => {
        const docData =
            activeItem?.status == 'PUBLISHED'
                ? activeItem.document_slide?.published_data || null
                : activeItem?.document_slide?.data || null;
        const editorContent = html.deserialize(editor, docData || '');
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
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        );
        editor.focus();
    };

    const getCurrentEditorHTMLContent: () => string = () => {
        const data = editor.getEditorValue();
        const htmlString = html.serialize(editor, data);
        const formattedHtmlString = formatHTMLString(htmlString);
        return formattedHtmlString;
    };

    // Convert Excalidraw data to HTML for publishing
    const convertExcalidrawToHTML = async (excalidrawData: any): Promise<string> => {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Excalidraw Presentation</title>
                <script src="https://unpkg.com/@excalidraw/excalidraw/dist/excalidraw.production.min.js"></script>
                <style>
                    body { margin: 0; padding: 0; }
                    #excalidraw-container { width: 100vw; height: 100vh; }
                </style>
            </head>
            <body>
                <div id="excalidraw-container"></div>
                <script>
                    const excalidrawData = ${JSON.stringify(excalidrawData)};
                    const container = document.getElementById('excalidraw-container');
                    ExcalidrawLib.Excalidraw({
                        container,
                        initialData: excalidrawData,
                        viewModeEnabled: true
                    });
                </script>
            </body>
            </html>
        `;
        return htmlContent;
    };

    // Get Excalidraw data from localStorage
    const getExcalidrawDataFromLocalStorage = (slideId: string) => {
        try {
            const savedData = localStorage.getItem(`excalidraw_${slideId}`);
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
        return {
            isExcalidraw: true,
            elements: [],
            files: {},
            appState: {},
        };
    };

    const loadContent = async () => {
        if (activeItem == null) {
            setContent(
                <div className="flex h-[500px] flex-col items-center justify-center rounded-lg py-10">
                    <EmptySlideMaterial />
                    <p className="mt-4 text-neutral-500">No study material has been added yet</p>
                </div>
            );
            return;
        }

        if (activeItem.source_type === 'VIDEO') {
            setContent(<VideoSlidePreview activeItem={activeItem} />);
            return;
        }

        if (activeItem.source_type === 'DOCUMENT') {
            const documentType = activeItem.document_slide?.type;

            if (documentType === 'PRESENTATION') {
                // For published presentations, use the published_url to get the HTML file
                if (
                    activeItem.status === 'PUBLISHED' &&
                    activeItem.document_slide?.published_data
                ) {
                    try {
                        const publishedUrl = await getPublicUrl(
                            activeItem.document_slide.published_data
                        );
                        setContent(
                            <div className="size-full">
                                <iframe
                                    src={publishedUrl}
                                    className="size-full border-0"
                                    title="Published Excalidraw Presentation"
                                />
                            </div>
                        );
                        return;
                    } catch (error) {
                        console.error('Error loading published presentation:', error);
                    }
                }

                // For draft presentations, load from localStorage
                const excalidrawData = getExcalidrawDataFromLocalStorage(activeItem.id);

                setContent(
                    <div className="size-full">
                        <SlideEditor
                            slideId={activeItem.id}
                            initialData={{
                                elements: excalidrawData.elements || [],
                                files: excalidrawData.files || {},
                                appState: excalidrawData.appState || {},
                            }}
                            editable={activeItem.status !== 'PUBLISHED'}
                        />
                    </div>
                );
                return;
            }

            if (documentType === 'PDF') {
                const data =
                    activeItem.status === 'PUBLISHED'
                        ? activeItem.document_slide?.published_data || null
                        : activeItem.document_slide?.data || '';

                const url = await getPublicUrl(data || '');
                setContent(<PDFViewer pdfUrl={url} />);
                return;
            }

            if (documentType === 'DOC') {
                try {
                    setTimeout(() => {
                        setEditorContent();
                    }, 300);
                    setEditorContent();
                } catch (error) {
                    console.error('Error preparing document content:', error);
                    setContent(<div>Error loading document content</div>);
                }
                return;
            }
        }

        if (activeItem.source_type === 'QUESTION') {
            setContent(<StudyLibraryQuestionsPreview activeItem={activeItem} />);
            return;
        }

        if (activeItem.source_type === 'ASSIGNMENT') {
            setContent(<StudyLibraryAssignmentPreview activeItem={activeItem} />);
            return;
        }

        // Fallback
        setContent(
            <div className="flex h-[500px] flex-col items-center justify-center rounded-lg py-10">
                <EmptySlideMaterial />
                <p className="mt-4 text-neutral-500">No study material has been added yet</p>
            </div>
        );
    };

    const SaveDraft = async (slideToSave?: Slide | null) => {
        const slide = slideToSave ? slideToSave : activeItem;
        const status = slide
            ? slide.status == 'PUBLISHED'
                ? 'UNSYNC'
                : slide.status == 'UNSYNC'
                  ? 'UNSYNC'
                  : 'DRAFT'
            : 'DRAFT';

        if (activeItem?.source_type == 'ASSIGNMENT') {
            const convertedData = converDataToAssignmentFormat({
                activeItem,
                status,
                notify: false,
                newSlide: false,
            });
            try {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                await updateAssignmentOrder(convertedData!);
                toast.success(`slide saved in draft successfully!`);
            } catch {
                toast.error(`Error in publishing the slide`);
            }
        }

        if (activeItem?.source_type == 'VIDEO') {
            const convertedData = converDataToVideoFormat({
                activeItem,
                status,
                notify: false,
                newSlide: false,
            });
            try {
                await addUpdateVideoSlide(convertedData);
                toast.success(`slide saved in draft successfully!`);
            } catch {
                toast.error(`Error in unpublishing the slide`);
            }
        }

        if (activeItem?.source_type === 'QUESTION') {
            const convertedData = convertToQuestionBackendSlideFormat({
                activeItem,
                status,
                notify: false,
                newSlide: false,
            });
            try {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                await updateQuestionOrder(convertedData!);
                toast.success(`slide saved in draft successfully!`);
            } catch {
                toast.error('error saving slide');
            }
            return;
        }

        // Handle Excalidraw presentations
        if (
            activeItem?.source_type === 'DOCUMENT' &&
            activeItem?.document_slide?.type === 'PRESENTATION'
        ) {
            try {
                // For presentations, we don't save to backend during draft - only localStorage
                // Just update the slide metadata
                await addUpdateDocumentSlide({
                    id: slide?.id || '',
                    title: slide?.title || '',
                    image_file_id: '',
                    description: slide?.description || '',
                    slide_order: null,
                    document_slide: {
                        id: slide?.document_slide?.id || '',
                        type: 'PRESENTATION',
                        data: null, // No data field for presentations
                        title: slide?.document_slide?.title || '',
                        cover_file_id: '',
                        total_pages: 1,
                        published_data: null,
                        published_document_total_pages: 0,
                    },
                    status: status,
                    new_slide: false,
                    notify: false,
                });
                toast.success(`Presentation saved successfully!`);
            } catch {
                toast.error('Error saving presentation');
            }
            return;
        }

        // Handle regular documents
        const currentHtml = getCurrentEditorHTMLContent();
        const { totalPages } = await convertHtmlToPdf(currentHtml);

        try {
            await addUpdateDocumentSlide({
                id: slide?.id || '',
                title: slide?.title || '',
                image_file_id: '',
                description: slide?.description || '',
                slide_order: null,
                document_slide: {
                    id: slide?.document_slide?.id || '',
                    type: 'DOC',
                    data: currentHtml,
                    title: slide?.document_slide?.title || '',
                    cover_file_id: '',
                    total_pages: totalPages,
                    published_data: null,
                    published_document_total_pages:
                        slide?.document_slide?.published_document_total_pages || 0,
                },
                status: status,
                new_slide: false,
                notify: false,
            });
        } catch {
            toast.error('error updating slide');
        }
    };

    // Custom publish function for Excalidraw presentations
    const publishExcalidrawPresentation = async () => {
        if (!activeItem || activeItem.document_slide?.type !== 'PRESENTATION') return;

        try {
            // Get Excalidraw data from localStorage
            const excalidrawData = getExcalidrawDataFromLocalStorage(activeItem.id);

            // Convert to HTML
            const htmlContent = await convertExcalidrawToHTML(excalidrawData);

            // Create HTML file and upload to S3
            const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
            const htmlFile = new File([htmlBlob], `${activeItem.title || 'presentation'}.html`, {
                type: 'text/html',
            });

            const publishedFileId = await UploadFileInS3(
                htmlFile,
                (progress) => {
                    console.log(`Upload progress: ${progress}%`);
                },
                'your-user-id',
                INSTITUTE_ID,
                'ADMIN',
                true
            );

            // Update slide with published_url
            await addUpdateDocumentSlide({
                id: activeItem.id,
                title: activeItem.title || '',
                image_file_id: '',
                description: activeItem.description || '',
                slide_order: null,
                document_slide: {
                    id: activeItem.document_slide?.id || '',
                    type: 'PRESENTATION',
                    data: null, // No data field
                    title: activeItem.document_slide?.title || '',
                    cover_file_id: '',
                    total_pages: 1,
                    published_data: publishedFileId || '',
                    published_document_total_pages: 0,
                    // published_url: publishedFileId, // Store HTML file ID here
                },
                status: 'PUBLISHED',
                new_slide: false,
                notify: false,
            });

            toast.success('Presentation published successfully!');
        } catch (error) {
            console.error('Error publishing presentation:', error);
            toast.error('Failed to publish presentation');
        }
    };

    const handleSaveDraftClick = async () => {
        try {
            await SaveDraft(activeItem);
            toast.success('Slide saved successfully');
        } catch {
            toast.error('error saving document');
        }
    };

    useEffect(()=>{
        setInterval(()=>{
            console.log("edtitor content: ", editor.getEditorValue())
            console.log("html content: ", getCurrentEditorHTMLContent())
        }, 3000)
    }, [])

    useEffect(() => {
        setSlideTitle(
            (activeItem?.source_type === 'DOCUMENT' && activeItem?.document_slide?.title) ||
                (activeItem?.source_type === 'VIDEO' && activeItem?.video_slide?.title) ||
                ''
        );
    }, [activeItem]);

    useEffect(() => {
        if (items.length == 0 && slideId == undefined) {
            setActiveItem(null);
        } else {
            setActiveItem(items.find((slide) => slide.id == slideId) || items[0] || null);
        }
    }, [items]);

    useEffect(() => {
        setHeading(activeItem?.title || '');
        loadContent();
    }, [activeItem, items]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        let previousHtmlString: string | null = null;

        if (activeItem?.document_slide?.type === 'DOC') {
            intervalId = setInterval(() => {
                const data = editor.getEditorValue();
                const htmlString = html.serialize(editor, data);
                const formattedHtmlString = formatHTMLString(htmlString);

                // Only save if the content has changed
                if (formattedHtmlString !== previousHtmlString) {
                    previousHtmlString = formattedHtmlString;
                    SaveDraft(activeItem);
                }
            }, 60000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [activeItem?.document_slide?.type, editor]);

    // Update the refs whenever these functions change
    useEffect(() => {
        setGetCurrentEditorHTMLContent(getCurrentEditorHTMLContent);
        setSaveDraft(SaveDraft);
    }, [editor]);

    return (
        <div className="flex w-full flex-1 flex-col" ref={selectionRef}>
            {activeItem && (
                <div className="-m-8 flex items-center justify-between gap-6 border-b border-neutral-300 px-8 py-4">
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
                                    onClick={() =>
                                        updateHeading(
                                            activeItem,
                                            addUpdateVideoSlide,
                                            SaveDraft,
                                            heading,
                                            setIsEditing,
                                            addUpdateDocumentSlide
                                        )
                                    }
                                    className="cursor-pointer hover:text-primary-500"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <h3 className="text-h3 font-semibold text-neutral-600">
                                    {heading || 'No content selected'}
                                </h3>
                                <PencilSimpleLine
                                    className="cursor-pointer hover:text-primary-500"
                                    onClick={() => setIsEditing(true)}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-6">
                            {activeItem.source_type == 'DOCUMENT' &&
                                activeItem?.document_slide?.type == 'DOC' && (
                                    <MyButton
                                        layoutVariant="icon"
                                        onClick={async () => {
                                            await SaveDraft(activeItem);
                                            if (activeItem.status == 'PUBLISHED') {
                                                await handleConvertAndUpload(
                                                    activeItem.document_slide?.published_data ||
                                                        null
                                                );
                                            } else {
                                                await handleConvertAndUpload(
                                                    activeItem.document_slide?.data || null
                                                );
                                            }
                                        }}
                                    >
                                        <DownloadSimple size={30} />
                                    </MyButton>
                                )}
                            <ActivityStatsSidebar />
                            {(activeItem?.document_slide?.type == 'DOC' ||
                                activeItem?.document_slide?.type == 'PRESENTATION' ||
                                activeItem?.source_type == 'QUESTION' ||
                                activeItem?.source_type == 'ASSIGNMENT') && (
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
                                handlePublishUnpublishSlide={() =>
                                    handleUnpublishSlide(
                                        setIsUnpublishDialogOpen,
                                        false,
                                        activeItem,
                                        addUpdateDocumentSlide,
                                        addUpdateVideoSlide,
                                        updateQuestionOrder,
                                        updateAssignmentOrder,
                                        SaveDraft
                                    )
                                }
                            />
                            <PublishDialog
                                isOpen={isPublishDialogOpen}
                                setIsOpen={setIsPublishDialogOpen}
                                handlePublishUnpublishSlide={() => {
                                    // Custom publish logic for Excalidraw presentations
                                    if (activeItem?.document_slide?.type === 'PRESENTATION') {
                                        publishExcalidrawPresentation();
                                        setIsPublishDialogOpen(false);
                                    } else {
                                        handlePublishSlide(
                                            setIsPublishDialogOpen,
                                            false,
                                            activeItem,
                                            addUpdateDocumentSlide,
                                            addUpdateVideoSlide,
                                            updateQuestionOrder,
                                            updateAssignmentOrder,
                                            SaveDraft
                                        );
                                    }
                                }}
                            />
                        </div>
                        <SlidesMenuOption />
                    </div>
                </div>
            )}
            <div
                className={`mx-auto mt-14 ${
                    activeItem?.document_slide?.type == 'PDF' ? 'h-[calc(100vh-200px)]' : 'h-full'
                } w-full overflow-hidden`}
            >
                {content}
            </div>
        </div>
    );
};
