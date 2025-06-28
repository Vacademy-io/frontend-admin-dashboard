import type React from 'react';
import YooptaEditor, { createYooptaEditor } from '@yoopta/editor';
import { useEffect, useMemo, useRef, useCallback, type ChangeEvent } from 'react';
import '../excalidraw-z-index-fix.css';
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
import { getPublicUrl } from '@/services/upload_file';
import { PublishDialog } from './publish-slide-dialog';
import { UnpublishDialog } from './unpublish-slide-dialog';
import {
    type Slide,
    useSlides,
} from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
import { toast } from 'sonner';
import { Check, DownloadSimple, PencilSimpleLine } from 'phosphor-react';
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
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import DoubtResolutionSidebar from './doubt-resolution/doubtResolutionSidebar';
import { ChatCircleDots } from '@phosphor-icons/react';
import { useSidebar } from '@/components/ui/sidebar';

// Inside your component
// this toggles the DoubtResolutionSidebar

export const SlideMaterial = ({
    setGetCurrentEditorHTMLContent,
    setSaveDraft,
}: {
    setGetCurrentEditorHTMLContent: (fn: () => string) => void;
    setSaveDraft: (fn: (activeItem: Slide) => Promise<void>) => void;
}) => {
    const { items, activeItem, setActiveItem } = useContentStore();
    const editor = useMemo(() => createYooptaEditor(), []);
    const selectionRef = useRef<HTMLDivElement | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [slideTitle, setSlideTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [heading, setHeading] = useState(slideTitle);
    const router = useRouter();
    const [content, setContent] = useState<JSX.Element | null>(null);
    const isAutoSavingRef = useRef(false);

    const { chapterId, slideId } = router.state.location.search;
    const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
    const [isUnpublishDialogOpen, setIsUnpublishDialogOpen] = useState(false);
    const { addUpdateDocumentSlide } = useSlides(chapterId || '');
    const { addUpdateVideoSlide } = useSlides(chapterId || '');
    const { updateQuestionOrder } = useSlides(chapterId || '');
    const { updateAssignmentOrder } = useSlides(chapterId || '');
    const { setOpen } = useSidebar();

    const handleHeadingChange = (e: ChangeEvent<HTMLInputElement>) => {
        setHeading(e.target.value);
    };

    // Component to manage editor with placeholder
    const EditorWithPlaceholder = ({ initialIsEmpty }: { initialIsEmpty: boolean }) => {
        const [showPlaceholder, setShowPlaceholder] = useState(initialIsEmpty);

        useEffect(() => {
            setShowPlaceholder(initialIsEmpty);
        }, [initialIsEmpty]);

        // Function to check if content is empty with better detection
        const checkIsEmpty = (data: string | null) => {
            if (!data) return true;

            // Remove HTML tags and normalize whitespace
            const textContent = data
                .replace(/<[^>]*>/g, '') // Remove all HTML tags
                .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();

            // Also check for common empty content patterns
            const isEmpty =
                textContent === '' ||
                textContent.length === 0 ||
                data.trim() === '<html><head></head><body><div></div></body></html>' ||
                data.trim() === '<div></div>' ||
                data.trim() === '<p></p>' ||
                data.trim() === '<br>' ||
                data.trim() === '<br/>' ||
                /^<p><br><\/p>$/.test(data.trim()) ||
                /^<div><br><\/div>$/.test(data.trim());

            return isEmpty;
        };

        return (
            <div className="relative w-full">
                {showPlaceholder && (
                    <div
                        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-gray-400"
                        style={{ top: '20px' }}
                    >
                        <span className="text-lg">Click to start writing here...</span>
                    </div>
                )}
                <YooptaEditor
                    editor={editor}
                    plugins={plugins}
                    tools={TOOLS}
                    marks={MARKS}
                    value={editor.children}
                    selectionBoxRoot={selectionRef}
                    autoFocus={true}
                    onChange={() => {
                        // Get current editor content and check if it's empty
                        const currentContent = html.serialize(editor, editor.children);
                        const currentIsEmpty = checkIsEmpty(currentContent);
                        console.log('[Slide Material] onChange - currentIsEmpty:', currentIsEmpty);
                        console.log('[Slide Material] onChange - currentContent:', currentContent);

                        // Update placeholder state
                        setShowPlaceholder(currentIsEmpty);
                    }}
                    className="size-full"
                    style={{ width: '100%', height: '100%', minHeight: '200px' }}
                />
            </div>
        );
    };

    const setEditorContent = () => {
        const docData =
            activeItem?.status == 'PUBLISHED'
                ? activeItem.document_slide?.published_data || null
                : activeItem?.document_slide?.data || null;

        console.log('[Slide Material] Raw docData:', docData);
        console.log('[Slide Material] activeItem status:', activeItem?.status);
        console.log('[Slide Material] published_data:', activeItem?.document_slide?.published_data);
        console.log('[Slide Material] data:', activeItem?.document_slide?.data);

        const editorContent = html.deserialize(editor, docData || '');
        console.log('[Slide Material] Deserialized editorContent:', editorContent);

        editor.setEditorValue(editorContent);

        // Function to check if content is empty with better detection
        const checkIsEmpty = (data: string | null) => {
            if (!data) return true;

            // Remove HTML tags and normalize whitespace
            const textContent = data
                .replace(/<[^>]*>/g, '') // Remove all HTML tags
                .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();

            // Also check for common empty content patterns
            const isEmpty =
                textContent === '' ||
                textContent.length === 0 ||
                data.trim() === '<html><head></head><body><div></div></body></html>' ||
                data.trim() === '<div></div>' ||
                data.trim() === '<p></p>' ||
                data.trim() === '<br>' ||
                data.trim() === '<br/>';

            return isEmpty;
        };

        // Check if content is empty - handle HTML structure
        const isEmpty = checkIsEmpty(docData);

        console.log('[Slide Material] isEmpty check:', isEmpty);
        console.log('[Slide Material] docData after trim:', docData?.trim());
        console.log(
            '[Slide Material] Text content after HTML removal:',
            docData
                ? docData
                      .replace(/<[^>]*>/g, '')
                      .replace(/\s+/g, '')
                      .trim()
                : 'null'
        );

        setContent(<EditorWithPlaceholder initialIsEmpty={isEmpty} />);
        editor.focus();
    };

    const getCurrentEditorHTMLContent: () => string = () => {
        const data = editor.getEditorValue();
        const htmlString = html.serialize(editor, data);
        const formattedHtmlString = formatHTMLString(htmlString);
        return formattedHtmlString;
    };

    // Handle Excalidraw onChange for auto-save - debounced database update only
    const handleExcalidrawChange = useCallback(
        async (elements: any[], appState: any, files: any, fileId?: string) => {
            if (!activeItem || activeItem.document_slide?.type !== 'PRESENTATION') return;

            // Only update database if we have a new fileId from auto-save
            if (fileId && fileId !== activeItem.document_slide?.data) {
                // Prevent infinite loops by tracking auto-save state
                if (isAutoSavingRef.current) {
                    console.log('Auto-save already in progress, skipping...');
                    return;
                }

                isAutoSavingRef.current = true;

                // For presentations, keep the current status (don't change PUBLISHED to DRAFT/UNSYNC)
                const currentStatus = activeItem.status || 'DRAFT';

                try {
                    await addUpdateDocumentSlide({
                        id: activeItem.id,
                        title: activeItem.title || '',
                        image_file_id: '',
                        description: activeItem.description || '',
                        slide_order: null,
                        document_slide: {
                            id: activeItem.document_slide?.id || '',
                            type: 'PRESENTATION',
                            data: fileId, // Store S3 file ID
                            title: activeItem.document_slide?.title || '',
                            cover_file_id: '',
                            total_pages: 1,
                            published_data: activeItem.document_slide?.published_data || null,
                            published_document_total_pages: 0,
                        },
                        status: currentStatus, // Keep existing status (PUBLISHED stays PUBLISHED)
                        new_slide: false,
                        notify: false,
                    });
                    console.log('Excalidraw auto-saved with fileId:', fileId);
                } catch (error) {
                    console.error('Error auto-saving Excalidraw:', error);
                } finally {
                    // Reset the flag after a short delay to allow for UI updates
                    setTimeout(() => {
                        isAutoSavingRef.current = false;
                    }, 1000);
                }
            }
        },
        [activeItem, addUpdateDocumentSlide]
    );
    interface YTPlayer {
        destroy(): void;
        getCurrentTime(): number;
        getDuration(): number;
        seekTo(seconds: number, allowSeekAhead: boolean): void;
        getPlayerState(): number;
    }

    const playerRef = useRef<YTPlayer | null>(null);

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
                // Get the appropriate fileId based on status
                const fileId =
                    activeItem.status === 'PUBLISHED'
                        ? activeItem.document_slide?.published_data
                        : activeItem.document_slide?.data;

                setContent(
                    <div className="relative z-30 size-full">
                        <SlideEditor
                            key={`slide-editor-${activeItem.id}-${activeItem.status}`}
                            slideId={activeItem.id}
                            initialData={{
                                elements: [],
                                files: {},
                                appState: {},
                            }}
                            fileId={fileId || undefined}
                            onChange={handleExcalidrawChange}
                            editable={activeItem.status !== 'PUBLISHED'}
                            isSaving={isSaving}
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
        setIsSaving(true);
        try {
            const slide = slideToSave ? slideToSave : activeItem;
            // For presentations, preserve the current status (PUBLISHED stays PUBLISHED)
            // For other slide types, use the original logic
            const status = slide?.source_type === 'DOCUMENT' && slide?.document_slide?.type === 'PRESENTATION'
                ? slide?.status || 'DRAFT' // Keep current status for presentations
                : slide
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

            if (
                activeItem?.source_type == 'DOCUMENT' &&
                activeItem?.document_slide?.type == 'PRESENTATION'
            ) {
                try {
                    // For presentations, keep the current status (don't change PUBLISHED to DRAFT)
                    const presentationStatus = slide?.status || 'DRAFT';

                    await addUpdateDocumentSlide({
                        id: slide?.id || '',
                        title: slide?.title || '',
                        image_file_id: '',
                        description: slide?.description || '',
                        slide_order: null,
                        document_slide: {
                            id: slide?.document_slide?.id || '',
                            type: 'PRESENTATION',
                            data: slide?.document_slide?.data || null, // Keep existing S3 file ID
                            title: slide?.document_slide?.title || '',
                            cover_file_id: '',
                            total_pages: 1,
                            published_data: slide?.document_slide?.published_data || null,
                            published_document_total_pages: 0,
                        },
                        status: presentationStatus, // Keep existing status (PUBLISHED stays PUBLISHED)
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
                        published_document_total_pages: 0,
                    },
                    status: status,
                    new_slide: false,
                    notify: false,
                });
                toast.success(`slide saved in draft successfully!`);
            } catch {
                toast.error(`Error in saving the slide`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Custom publish function for Excalidraw presentations
    const publishExcalidrawPresentation = async () => {
        if (!activeItem || activeItem.document_slide?.type !== 'PRESENTATION') return;

        try {
            // For publish, copy the current data file_id to published_data
            const currentDataFileId = activeItem.document_slide?.data;

            if (!currentDataFileId) {
                toast.error('No presentation data to publish');
                return;
            }

            // Update slide with published_data
            await addUpdateDocumentSlide({
                id: activeItem.id,
                title: activeItem.title || '',
                image_file_id: '',
                description: activeItem.description || '',
                slide_order: null,
                document_slide: {
                    id: activeItem.document_slide?.id || '',
                    type: 'PRESENTATION',
                    data: currentDataFileId, // Keep current data
                    title: activeItem.document_slide?.title || '',
                    cover_file_id: '',
                    total_pages: 1,
                    published_data: currentDataFileId, // Copy data to published_data
                    published_document_total_pages: 0,
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

    useEffect(() => {
        setSlideTitle(
            (activeItem?.source_type === 'DOCUMENT' && activeItem?.document_slide?.title) ||
                (activeItem?.source_type === 'VIDEO' && activeItem?.video_slide?.title) ||
                ''
        );
    }, [activeItem]);

    useEffect(() => {
        if (items && items.length == 0 && slideId == undefined) {
            setActiveItem(null);
        } else {
            setActiveItem(items.find((slide) => slide.id == slideId) || items[0] || null);
        }
    }, [items]);

    useEffect(() => {
        setHeading(activeItem?.title || '');
        // Only reload content if the slide ID, source type, or document type changes
        // Ignore changes to data field to prevent infinite loops from auto-save
        loadContent();
    }, [activeItem?.id, activeItem?.source_type, activeItem?.document_slide?.type, activeItem?.status, items]); // Prevent reload on auto-save data changes

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
        <div
            className="flex w-full flex-1 flex-col transition-all duration-300 ease-in-out"
            ref={selectionRef}
        >
            {activeItem && (
                <div className="relative z-10 -m-8 flex items-center justify-between gap-4 border-b border-neutral-200 bg-white/80 px-6 py-3 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <div className="flex items-center justify-center gap-2 duration-200 animate-in fade-in">
                                <input
                                    type="text"
                                    value={heading}
                                    onChange={handleHeadingChange}
                                    className="w-fit border-b border-neutral-300 bg-transparent text-lg font-semibold text-neutral-700 transition-colors duration-200 focus:border-primary-500 focus:outline-none"
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
                            {activeItem.source_type === 'DOCUMENT' &&
                                activeItem?.document_slide?.type === 'DOC' && (
                                    <MyButton
                                        layoutVariant="icon"
                                        onClick={async () => {
                                            await SaveDraft(activeItem);
                                            if (activeItem.status === 'PUBLISHED') {
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

                            {(activeItem?.document_slide?.type === 'DOC' ||
                                activeItem?.document_slide?.type === 'PRESENTATION' ||
                                activeItem?.source_type === 'QUESTION' ||
                                activeItem?.source_type === 'ASSIGNMENT') && (
                                <MyButton
                                    buttonType="secondary"
                                    scale="medium"
                                    layoutVariant="default"
                                    onClick={handleSaveDraftClick}
                                    disabled={isSaving}
                                    className={cn(isSaving && 'pointer-events-none')}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin text-primary-500 " />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Draft'
                                    )}
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
                                        SaveDraft,
                                        playerRef
                                    )
                                }
                            />

                            <PublishDialog
                                isOpen={isPublishDialogOpen}
                                setIsOpen={setIsPublishDialogOpen}
                                handlePublishUnpublishSlide={() => {
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
                                            SaveDraft,
                                            playerRef
                                        );
                                    }
                                }}
                            />
                        </div>

                        {/* ✅ Doubt Icon Trigger */}
                        <MyButton
                            layoutVariant="icon"
                            buttonType="secondary"
                            onClick={() => setOpen(true)}
                            title="Open Doubt Resolution Sidebar"
                        >
                            <ChatCircleDots size={26} className="text-primary-600" />
                        </MyButton>

                        {/* Slides Menu Dropdown */}
                        <SlidesMenuOption />
                    </div>
                </div>
            )}

            <div
                className={`mx-auto mt-14 ${
                    activeItem?.document_slide?.type === 'PDF' ? 'h-[calc(100vh-200px)]' : 'h-full'
                } relative z-20 w-full overflow-hidden`}
            >
                {content}
            </div>

            {/* ✅ Doubt Sidebar Always Mounted */}
            <DoubtResolutionSidebar />
        </div>
    );
};
