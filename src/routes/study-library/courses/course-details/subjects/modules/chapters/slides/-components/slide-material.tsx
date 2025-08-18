/* eslint-disable */
import YooptaEditor, { createYooptaEditor } from '@yoopta/editor';
import { useEffect, useMemo, useRef, useCallback, type ChangeEvent } from 'react';
import '../excalidraw-z-index-fix.css';
import { MyButton } from '@/components/design-system/button';
import PDFViewer from './pdf-viewer';
import { ActivityStatsSidebar } from './stats-dialog/activity-sidebar';
import { useContentStore } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
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
    Slide,
    useSlidesMutations,
} from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-hooks/use-slides';
import { toast } from 'sonner';
import { Check, DownloadSimple, PencilSimpleLine, Trash } from 'phosphor-react';
import { AlertCircle } from 'lucide-react';
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
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import DoubtResolutionSidebar from './doubt-resolution/doubtResolutionSidebar';
import { ChatCircleDots } from '@phosphor-icons/react';
import { useSidebar } from '@/components/ui/sidebar';
import { JupyterNotebookSlide } from './jupyter-notebook-slide';
import { ScratchProjectSlide } from './scratch-project-slide';
import { CodeEditorSlide } from './code-editor-slide';
import { SplitScreenSlide } from './split-screen-slide';
import { getTokenFromCookie, getTokenDecodedData } from '@/lib/auth/sessionUtility';
import { UploadFileInS3 } from '@/services/upload_file';
import { TokenKey } from '@/constants/auth/tokens';
import QuizPreview from './QuizPreview';
import { createQuizSlidePayload } from './quiz/utils/api-helpers';

// Inside your component
// this toggles the DoubtResolutionSidebar
// Declare INSTITUTE_ID here or import it from a config file
const INSTITUTE_ID = 'your-institute-id'; // Replace with your actual institute ID

export const SlideMaterial = ({
    setGetCurrentEditorHTMLContent,
    setSaveDraft,
    isLearnerView = false,
    hidePublishButtons = false,
    customSaveFunction,
}: {
    setGetCurrentEditorHTMLContent: (fn: () => string) => void;
    setSaveDraft: (fn: (activeItem: Slide) => Promise<void>) => void;
    isLearnerView?: boolean;
    hidePublishButtons?: boolean;
    customSaveFunction?: (slide: Slide) => Promise<void>;
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
    const getCurrentExcalidrawStateRef = useRef<
        (() => { elements: any[]; appState: any; files: any }) | null
    >(null);
    const isExcalidrawBusyRef = useRef(false); // Track if Excalidraw is performing intensive operations
    const pendingStateUpdateRef = useRef<any>(null); // Store pending state updates
    const stableKeyRef = useRef<string>(''); // Stable key during operations

    const searchParams = router.state.location.search;
    const { courseId, levelId, chapterId, slideId, moduleId, subjectId, sessionId } = searchParams;

    const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
    const [isUnpublishDialogOpen, setIsUnpublishDialogOpen] = useState(false);
    const { getPackageSessionId } = useInstituteDetailsStore();
    const { setOpen: setSidebarOpen } = useSidebar();
    const { addUpdateDocumentSlide, addUpdateQuizSlide } = useSlidesMutations(
        chapterId || '',
        moduleId || '',
        subjectId || '',
        getPackageSessionId({
            courseId: courseId || '',
            levelId: levelId || '',
            sessionId: sessionId || '',
        }) || ''
    );
    const { addUpdateVideoSlide } = useSlidesMutations(
        chapterId || '',
        moduleId || '',
        subjectId || '',
        getPackageSessionId({
            courseId: courseId || '',
            levelId: levelId || '',
            sessionId: sessionId || '',
        }) || ''
    );
    const { updateQuestionOrder } = useSlidesMutations(
        chapterId || '',
        moduleId || '',
        subjectId || '',
        getPackageSessionId({
            courseId: courseId || '',
            levelId: levelId || '',
            sessionId: sessionId || '',
        }) || ''
    );
    const { updateAssignmentOrder } = useSlidesMutations(
        chapterId || '',
        moduleId || '',
        subjectId || '',
        getPackageSessionId({
            courseId: courseId || '',
            levelId: levelId || '',
            sessionId: sessionId || '',
        }) || ''
    );

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

                        // Update placeholder state
                        setShowPlaceholder(currentIsEmpty);
                        setActiveItem({
                            ...activeItem,
                            document_slide: {
                                ...activeItem?.document_slide,
                                id: activeItem?.document_slide?.id || '',
                                type: activeItem?.document_slide?.type || '',
                                title: activeItem?.document_slide?.title || '',
                                cover_file_id: activeItem?.document_slide?.cover_file_id || '',
                                total_pages: activeItem?.document_slide?.total_pages || 0,
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-expect-error
                                published_data: currentContent || null,
                                published_document_total_pages:
                                    activeItem?.document_slide?.published_document_total_pages || 0,
                                data: currentContent,
                            },
                        });
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

        const editorContent = html.deserialize(editor, docData || '');

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
                    return;
                }

                isAutoSavingRef.current = true;

                // Determine the correct status based on current state
                let newStatus = activeItem.status || 'DRAFT';

                // For non-admin users with hidePublishButtons=true, auto-publish presentations
                if (hidePublishButtons) {
                    newStatus = 'PUBLISHED';
                    console.log('🎨 Auto-publishing presentation for non-admin user');
                    // Show toast notification for auto-publish and trigger approval button
                    if (activeItem.status !== 'PUBLISHED') {
                        import('sonner').then(({ toast }) => {
                            toast.success('Presentation auto-published for review');
                        });
                        // Trigger approval button for non-admin users
                        localStorage.setItem('triggerApprovalButton', Date.now().toString());
                    }
                } else if (activeItem.status === 'PUBLISHED') {
                    // If the slide is PUBLISHED and being edited, change status to UNSYNC
                    newStatus = 'UNSYNC';
                }
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
                            data: fileId, // Store S3 file ID in data field
                            title: activeItem.document_slide?.title || '',
                            cover_file_id: '',
                            total_pages: 1,
                            published_data:
                                newStatus === 'PUBLISHED'
                                    ? fileId
                                    : activeItem.document_slide?.published_data || null, // Set published_data for non-admin auto-publish
                            published_document_total_pages: 1,
                        },
                        status: newStatus, // Use the determined status
                        new_slide: false,
                        notify: false,
                    });

                    // Update local activeItem state with the new fileId and status
                    // Only update if Excalidraw is not performing intensive operations
                    if (!isExcalidrawBusyRef.current) {
                        const updatedActiveItem = {
                            ...activeItem,
                            status: newStatus,
                            document_slide: activeItem.document_slide
                                ? {
                                      ...activeItem.document_slide,
                                      data: fileId, // Update local state with new fileId
                                      published_data:
                                          newStatus === 'PUBLISHED'
                                              ? fileId
                                              : activeItem.document_slide.published_data, // Update published_data for auto-publish
                                  }
                                : undefined,
                        };
                        setActiveItem(updatedActiveItem);
                    } else {
                        pendingStateUpdateRef.current = {
                            ...activeItem,
                            status: newStatus,
                            document_slide: activeItem.document_slide
                                ? {
                                      ...activeItem.document_slide,
                                      data: fileId,
                                      published_data:
                                          newStatus === 'PUBLISHED'
                                              ? fileId
                                              : activeItem.document_slide.published_data, // Update published_data for auto-publish
                                  }
                                : undefined,
                        };
                    }
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

        // Check if the slide is deleted
        if (activeItem.status === 'DELETED') {
            setContent(
                <div className="flex h-[500px] flex-col items-center justify-center rounded-lg py-10">
                    <div className="text-center">
                        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
                            <Trash size={24} className="text-red-500" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-slate-600">
                            This slide has been deleted
                        </h3>
                        <p className="text-sm text-slate-400">
                            The slide content is no longer available
                        </p>
                    </div>
                </div>
            );
            return;
        }

        if (activeItem.source_type === 'VIDEO') {
            // Check if this video slide is in split-screen mode
            if (activeItem.splitScreenMode && activeItem.splitScreenData) {
                setContent(
                    <SplitScreenSlide
                        splitScreenData={activeItem.splitScreenData as any}
                        slideType={
                            activeItem.splitScreenType as
                                | 'SPLIT_JUPYTER'
                                | 'SPLIT_SCRATCH'
                                | 'SPLIT_CODE'
                        }
                        isEditable={activeItem.status !== 'PUBLISHED'}
                        currentSlideId={activeItem.id}
                        onDataChange={async (updatedSplitData) => {
                            // Update split-screen data locally and handle title changes
                            const projectName =
                                updatedSplitData.projectName || updatedSplitData.name;
                            const updatedSlide = {
                                ...activeItem,
                                title: projectName || activeItem.title,
                                splitScreenData: updatedSplitData,
                            };
                            setActiveItem(updatedSlide as any);

                            // Auto-save to backend for split-screen video slides
                            try {
                                const splitData = updatedSplitData as any;
                                const originalVideoData = splitData?.originalVideoData || {};

                                // Use the original video slide ID if available, otherwise use the slide ID
                                const originalVideoSlide = (activeItem as any).originalVideoSlide;
                                const videoSlideId =
                                    originalVideoSlide?.id ||
                                    originalVideoData.id ||
                                    activeItem.video_slide?.id ||
                                    crypto.randomUUID();

                                const videoSlidePayload = {
                                    id: activeItem.id,
                                    title: String(projectName || activeItem.title || ''),
                                    description: activeItem.description || '',
                                    image_file_id: activeItem.image_file_id || '',
                                    slide_order: activeItem.slide_order,
                                    video_slide: {
                                        id: videoSlideId,
                                        description:
                                            originalVideoData.description ||
                                            activeItem.description ||
                                            '',
                                        title: String(projectName || activeItem.title || ''),
                                        url: originalVideoData.url || '',
                                        video_length_in_millis:
                                            originalVideoData.video_length_in_millis || 0,
                                        published_url:
                                            originalVideoData.published_url ||
                                            originalVideoData.url ||
                                            '',
                                        published_video_length_in_millis:
                                            originalVideoData.published_video_length_in_millis || 0,
                                        source_type: originalVideoData.source_type || 'VIDEO',
                                        embedded_type: splitData?.splitType || 'SCRATCH',
                                        embedded_data: JSON.stringify(splitData || {}),
                                        questions: (originalVideoData.questions as any) || [],
                                    },
                                    status: activeItem.status,
                                    new_slide: false,
                                    notify: false,
                                };

                                await addUpdateVideoSlide(videoSlidePayload);
                                toast.success('Split screen project saved successfully!');
                            } catch (error) {
                                console.error('Error auto-saving split screen data:', error);
                                toast.error('Failed to save split screen data automatically');
                            }
                        }}
                    />
                );
            } else {
                setContent(<VideoSlidePreview activeItem={activeItem} />);
            }

            return;
        }

        // ✅ Handle ASSIGNMENT slides (check source_type first)
        if (activeItem.source_type === 'ASSIGNMENT') {
            try {
                if (!activeItem.assignment_slide) {
                    console.warn('[Assignment] No assignment_slide data found, showing fallback');
                    setContent(
                        <div className="flex h-[500px] flex-col items-center justify-center rounded-lg py-10">
                            <div className="text-center">
                                <h3 className="mb-2 text-lg font-semibold">Assignment Loading</h3>
                                <p className="text-gray-600">Assignment data is being loaded...</p>
                            </div>
                        </div>
                    );
                    return;
                }

                setContent(<StudyLibraryAssignmentPreview activeItem={activeItem} />);
            } catch (error) {
                console.error('Error rendering assignment preview:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                setContent(
                    <div className="flex h-[500px] flex-col items-center justify-center rounded-lg py-10">
                        <div className="text-center">
                            <h3 className="mb-2 text-lg font-semibold text-red-600">
                                Assignment Error
                            </h3>
                            <p className="text-gray-600">
                                Failed to load assignment: {errorMessage}
                            </p>
                        </div>
                    </div>
                );
            }
            return;
        }

        if (activeItem.source_type === 'DOCUMENT') {
            const documentType = activeItem.document_slide?.type;

            // Reset stableKeyRef when not on a presentation slide
            if (documentType !== 'PRESENTATION') {
                stableKeyRef.current = '';
            }

            if (documentType === 'PRESENTATION') {
                // Get the appropriate fileId based on status and learner view
                const fileId = isLearnerView
                    ? activeItem.document_slide?.published_data
                    : activeItem.status === 'PUBLISHED'
                      ? activeItem.document_slide?.published_data
                      : activeItem.document_slide?.data;
                // Only set a new key if the id changes
                if (!stableKeyRef.current || !stableKeyRef.current.includes(activeItem.id)) {
                    stableKeyRef.current = `slide-editor-${activeItem.id}-${Date.now()}`;
                }

                setContent(
                    <div className="relative z-30 size-full">
                        <SlideEditor
                            key={stableKeyRef.current} // Use stable key during operations
                            slideId={activeItem.id}
                            initialData={{
                                elements: [],
                                files: {},
                                appState: {},
                            }}
                            fileId={fileId || undefined}
                            onChange={handleExcalidrawChange}
                            editable={!isLearnerView && activeItem.status !== 'PUBLISHED'}
                            isSaving={isSaving}
                            onEditorReady={(state) => {
                                getCurrentExcalidrawStateRef.current = state;
                            }}
                            onBusyStateChange={(isBusy) => {
                                const wasBusy = isExcalidrawBusyRef.current;
                                isExcalidrawBusyRef.current = isBusy;

                                // If operation just completed and we have a pending update, apply it
                                if (wasBusy && !isBusy && pendingStateUpdateRef.current) {
                                    const pendingUpdate = pendingStateUpdateRef.current;
                                    setActiveItem(pendingUpdate);
                                    pendingStateUpdateRef.current = null;
                                    // Keep stable key unchanged to prevent component rebuilds
                                }
                            }}
                        />
                    </div>
                );
                return;
            }

            if (documentType === 'PDF') {
                const data = isLearnerView
                    ? activeItem.document_slide?.published_data || null
                    : activeItem.status === 'PUBLISHED'
                      ? activeItem.document_slide?.published_data || null
                      : activeItem.document_slide?.data || '';

                const url = await getPublicUrl(data || '');
                setContent(<PDFViewer pdfUrl={url} />);
                return;
            }

            if (documentType === 'JUPYTER') {
                try {
                    // In learner view, always use published_data, otherwise use existing logic
                    const rawData = isLearnerView
                        ? activeItem.document_slide?.published_data ||
                          activeItem.document_slide?.data
                        : activeItem.status === 'PUBLISHED'
                          ? activeItem.document_slide?.data ||
                            activeItem.document_slide?.published_data
                          : activeItem.document_slide?.data;

                    const notebookData = rawData
                        ? JSON.parse(rawData)
                        : { contentUrl: '', projectName: '' };

                    setContent(
                        <JupyterNotebookSlide
                            notebookData={notebookData}
                            // Allow editing even in PUBLISHED for non-learner
                            isEditable={!isLearnerView}
                            onDataChange={async (updatedNotebookData) => {
                                // Only allow data changes if not in learner view
                                if (isLearnerView) return;

                                // Save the notebook data to backend
                                try {
                                    const wasPublished = activeItem.status === 'PUBLISHED';
                                    const nextStatus = 'PUBLISHED';
                                    await addUpdateDocumentSlide({
                                        id: activeItem.id,
                                        title:
                                            updatedNotebookData.projectName ||
                                            activeItem.title ||
                                            '',
                                        image_file_id: '',
                                        description: activeItem.description || '',
                                        slide_order: null,
                                        document_slide: {
                                            id: activeItem.document_slide?.id || '',
                                            type: 'JUPYTER',
                                            data: JSON.stringify(updatedNotebookData),
                                            title:
                                                updatedNotebookData.projectName ||
                                                activeItem.document_slide?.title ||
                                                '',
                                            cover_file_id: '',
                                            total_pages: 1,
                                            published_data: JSON.stringify(updatedNotebookData),
                                            published_document_total_pages: 1,
                                        },
                                        status: nextStatus,
                                        new_slide: false,
                                        notify: false,
                                    });

                                    // Update activeItem with new title and data
                                    const updatedActiveItem = {
                                        ...activeItem,
                                        status: nextStatus,
                                        title: updatedNotebookData.projectName || activeItem.title,
                                        document_slide: activeItem.document_slide
                                            ? {
                                                  ...activeItem.document_slide,
                                                  title:
                                                      updatedNotebookData.projectName ||
                                                      activeItem.document_slide.title,
                                                  data: JSON.stringify(updatedNotebookData),
                                              }
                                            : undefined,
                                    };
                                    setActiveItem(updatedActiveItem);

                                    // On first configure, trigger approval UI and toast
                                    if (!wasPublished) {
                                        localStorage.setItem(
                                            'triggerApprovalButton',
                                            Date.now().toString()
                                        );
                                        toast.success('Slide auto-published for review');
                                    }

                                    // Re-render with updated data
                                    setContent(
                                        <JupyterNotebookSlide
                                            notebookData={updatedNotebookData}
                                            // Allow editing even in PUBLISHED for non-learner
                                            isEditable={!isLearnerView}
                                            onDataChange={(newNotebookData) => {
                                                // Handle further updates recursively
                                                const recursiveUpdate = async () => {
                                                    const nestedNextStatus = 'PUBLISHED';
                                                    await addUpdateDocumentSlide({
                                                        id: activeItem.id,
                                                        title:
                                                            newNotebookData.projectName ||
                                                            activeItem.title ||
                                                            '',
                                                        image_file_id: '',
                                                        description: activeItem.description || '',
                                                        slide_order: null,
                                                        document_slide: {
                                                            id: activeItem.document_slide?.id || '',
                                                            type: 'JUPYTER',
                                                            data: JSON.stringify(newNotebookData),
                                                            title:
                                                                newNotebookData.projectName ||
                                                                activeItem.document_slide?.title ||
                                                                '',
                                                            cover_file_id: '',
                                                            total_pages: 1,
                                                            published_data:
                                                                JSON.stringify(newNotebookData),
                                                            published_document_total_pages: 1,
                                                        },
                                                        status: nestedNextStatus,
                                                        new_slide: false,
                                                        notify: false,
                                                    });

                                                    // Update activeItem again
                                                    setActiveItem({
                                                        ...activeItem,
                                                        status: nestedNextStatus,
                                                        title:
                                                            newNotebookData.projectName ||
                                                            activeItem.title,
                                                        document_slide: activeItem.document_slide
                                                            ? {
                                                                  ...activeItem.document_slide,
                                                                  title:
                                                                      newNotebookData.projectName ||
                                                                      activeItem.document_slide
                                                                          .title,
                                                                  data: JSON.stringify(
                                                                      newNotebookData
                                                                  ),
                                                              }
                                                            : undefined,
                                                    });
                                                };
                                                recursiveUpdate();
                                            }}
                                        />
                                    );
                                } catch (error) {
                                    console.error('Error saving Jupyter notebook data:', error);
                                    toast.error('Failed to save notebook changes');
                                }
                            }}
                        />
                    );
                } catch (error) {
                    console.error('Error loading Jupyter notebook:', error);
                    setContent(<div>Error loading Jupyter notebook</div>);
                }
                return;
            }

            if (documentType === 'SCRATCH') {
                try {
                    // Fallback: first check data field, then published_data for published slides
                    const rawData =
                        activeItem.status === 'PUBLISHED'
                            ? activeItem.document_slide?.data ||
                              activeItem.document_slide?.published_data
                            : activeItem.document_slide?.data;

                    const scratchData = rawData
                        ? JSON.parse(rawData)
                        : { projectId: '', projectName: '', scratchUrl: '', timestamp: Date.now() };

                    setContent(
                        <ScratchProjectSlide
                            scratchData={scratchData}
                            // Allow editing even in PUBLISHED when non-admin flow hides publish buttons
                            isEditable={!isLearnerView && (hidePublishButtons || true)}
                            onDataChange={async (updatedScratchData) => {
                                // Save the scratch data to backend
                                try {
                                    const wasPublished = activeItem.status === 'PUBLISHED';
                                    const nextStatus = 'PUBLISHED';
                                    await addUpdateDocumentSlide({
                                        id: activeItem.id,
                                        title:
                                            updatedScratchData.projectName ||
                                            activeItem.title ||
                                            '',
                                        image_file_id: '',
                                        description: activeItem.description || '',
                                        slide_order: null,
                                        document_slide: {
                                            id: activeItem.document_slide?.id || '',
                                            type: 'SCRATCH',
                                            data: JSON.stringify(updatedScratchData),
                                            title:
                                                updatedScratchData.projectName ||
                                                activeItem.document_slide?.title ||
                                                '',
                                            cover_file_id: '',
                                            total_pages: 1,
                                            published_data: JSON.stringify(updatedScratchData),
                                            published_document_total_pages: 1,
                                        },
                                        status: nextStatus,
                                        new_slide: false,
                                        notify: false,
                                    });

                                    // Update activeItem with new title and data
                                    const updatedActiveItem = {
                                        ...activeItem,
                                        status: nextStatus,
                                        title: updatedScratchData.projectName || activeItem.title,
                                        document_slide: activeItem.document_slide
                                            ? {
                                                  ...activeItem.document_slide,
                                                  title:
                                                      updatedScratchData.projectName ||
                                                      activeItem.document_slide.title,
                                                  data: JSON.stringify(updatedScratchData),
                                              }
                                            : undefined,
                                    };
                                    setActiveItem(updatedActiveItem);

                                    // On first configure, trigger approval UI and toast
                                    if (!wasPublished) {
                                        localStorage.setItem(
                                            'triggerApprovalButton',
                                            Date.now().toString()
                                        );
                                        toast.success('Slide auto-published for review');
                                    }

                                    // Re-render with updated data
                                    setContent(
                                        <ScratchProjectSlide
                                            scratchData={updatedScratchData}
                                            slideId={activeItem.id}
                                            // Allow editing even in PUBLISHED for non-learner
                                            isEditable={!isLearnerView}
                                            onDataChange={(newScratchData) => {
                                                // Handle further updates recursively
                                                const recursiveUpdate = async () => {
                                                    const nestedNextStatus = 'PUBLISHED';
                                                    await addUpdateDocumentSlide({
                                                        id: activeItem.id,
                                                        title:
                                                            newScratchData.projectName ||
                                                            activeItem.title ||
                                                            '',
                                                        image_file_id: '',
                                                        description: activeItem.description || '',
                                                        slide_order: null,
                                                        document_slide: {
                                                            id: activeItem.document_slide?.id || '',
                                                            type: 'SCRATCH',
                                                            data: JSON.stringify(newScratchData),
                                                            title:
                                                                newScratchData.projectName ||
                                                                activeItem.document_slide?.title ||
                                                                '',
                                                            cover_file_id: '',
                                                            total_pages: 1,
                                                            published_data:
                                                                JSON.stringify(newScratchData),
                                                            published_document_total_pages: 1,
                                                        },
                                                        status: nestedNextStatus,
                                                        new_slide: false,
                                                        notify: false,
                                                    });

                                                    // Update activeItem again
                                                    setActiveItem({
                                                        ...activeItem,
                                                        status: nestedNextStatus,
                                                        title:
                                                            newScratchData.projectName ||
                                                            activeItem.title,
                                                        document_slide: activeItem.document_slide
                                                            ? {
                                                                  ...activeItem.document_slide,
                                                                  title:
                                                                      newScratchData.projectName ||
                                                                      activeItem.document_slide
                                                                          .title,
                                                                  data: JSON.stringify(
                                                                      newScratchData
                                                                  ),
                                                              }
                                                            : undefined,
                                                    });
                                                };
                                                recursiveUpdate();
                                            }}
                                        />
                                    );
                                } catch (error) {
                                    console.error('Error saving Scratch project data:', error);
                                    toast.error('Failed to save Scratch project changes');
                                }
                            }}
                        />
                    );
                } catch (error) {
                    console.error('Error loading Scratch project:', error);
                    setContent(<div>Error loading Scratch project</div>);
                }
                return;
            }

            if (documentType === 'CODE') {
                try {
                    // Fallback: first check data field, then published_data for published slides
                    const rawData =
                        activeItem.status === 'PUBLISHED'
                            ? activeItem.document_slide?.data ||
                              activeItem.document_slide?.published_data
                            : activeItem.document_slide?.data;

                    const codeData = rawData
                        ? JSON.parse(rawData)
                        : { language: 'python', code: '', theme: 'light' };

                    setContent(
                        <CodeEditorSlide
                            key={`code-editor-${activeItem.id}`}
                            codeData={codeData}
                            // Allow editing even in PUBLISHED when non-admin flow hides publish buttons
                            isEditable={!isLearnerView && (hidePublishButtons || true)}
                            onDataChange={async (updatedCodeData) => {
                                // Update the slide data when user changes code
                                try {
                                    await addUpdateDocumentSlide({
                                        id: activeItem.id,
                                        title: activeItem.title || '',
                                        image_file_id: '',
                                        description: activeItem.description || '',
                                        slide_order: null,
                                        document_slide: {
                                            id: activeItem.document_slide?.id || '',
                                            type: 'CODE',
                                            data: JSON.stringify(updatedCodeData),
                                            title: activeItem.document_slide?.title || '',
                                            cover_file_id: '',
                                            total_pages: 1,
                                            published_data:
                                                hidePublishButtons ||
                                                activeItem.status === 'PUBLISHED'
                                                    ? JSON.stringify(updatedCodeData)
                                                    : null,
                                            published_document_total_pages: 1,
                                        },
                                        status: activeItem.status,
                                        new_slide: false,
                                        notify: false,
                                    });

                                    // Update the activeItem data to reflect the changes in local state
                                    setActiveItem({
                                        ...activeItem,
                                        document_slide: activeItem.document_slide
                                            ? {
                                                  ...activeItem.document_slide,
                                                  data: JSON.stringify(updatedCodeData),
                                              }
                                            : undefined,
                                    });
                                } catch (error) {
                                    console.error('Error saving code editor data:', error);
                                    toast.error('Failed to save code changes');
                                }
                            }}
                        />
                    );
                } catch (error) {
                    console.error('Error loading Code editor:', error);
                    setContent(<div>Error loading Code editor</div>);
                }
                return;
            }

            // Handle split-screen slides
            if (documentType?.startsWith('SPLIT_')) {
                try {
                    // Fallback: first check data field, then published_data for published slides
                    const rawData =
                        activeItem.status === 'PUBLISHED'
                            ? activeItem.document_slide?.data ||
                              activeItem.document_slide?.published_data
                            : activeItem.document_slide?.data;

                    const splitScreenData = rawData
                        ? JSON.parse(rawData)
                        : { splitScreen: true, videoSlideId: '', timestamp: Date.now() };

                    // Use regular import since it's already imported at the top
                    setContent(
                        <SplitScreenSlide
                            splitScreenData={splitScreenData}
                            slideType={
                                documentType as 'SPLIT_JUPYTER' | 'SPLIT_SCRATCH' | 'SPLIT_CODE'
                            }
                            isEditable={activeItem.status !== 'PUBLISHED'}
                            currentSlideId={activeItem.id}
                            onDataChange={async (updatedSplitData) => {
                                try {
                                    await addUpdateDocumentSlide({
                                        id: activeItem.id,
                                        title: activeItem.title || '',
                                        image_file_id: '',
                                        description: activeItem.description || '',
                                        slide_order: null,
                                        document_slide: {
                                            id:
                                                activeItem.document_slide?.id ||
                                                crypto.randomUUID(),
                                            type: documentType,
                                            data: JSON.stringify(updatedSplitData),
                                            title: activeItem.document_slide?.title || '',
                                            cover_file_id: '',
                                            total_pages: 1,
                                            published_data: null,
                                            published_document_total_pages: 1,
                                        },
                                        status: activeItem.status,
                                        new_slide: false,
                                        notify: false,
                                    });

                                    // Update active item
                                    setActiveItem({
                                        ...activeItem,
                                        document_slide: activeItem.document_slide
                                            ? {
                                                  ...activeItem.document_slide,
                                                  data: JSON.stringify(updatedSplitData),
                                              }
                                            : undefined,
                                    });
                                } catch (error) {
                                    console.error('Error saving split screen data:', error);
                                    toast.error('Failed to save split screen data');
                                }
                            }}
                        />
                    );
                } catch (error) {
                    console.error('Error parsing split screen data:', error);
                    // Show error message with option to retry
                    setContent(
                        <div className="flex h-full items-center justify-center p-6">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
                                    <AlertCircle className="size-8 text-red-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">
                                    Split Screen Loading Error
                                </h3>
                                <p className="mb-4 text-gray-600">
                                    Failed to load the split screen component. This is usually a
                                    temporary issue.
                                </p>
                                <MyButton
                                    buttonType="primary"
                                    scale="medium"
                                    onClick={() => loadContent()}
                                    className="mr-2"
                                >
                                    Retry
                                </MyButton>
                                <MyButton
                                    buttonType="secondary"
                                    scale="medium"
                                    onClick={() =>
                                        setContent(
                                            <div className="flex h-[400px] items-center justify-center text-gray-500">
                                                Split screen component unavailable
                                            </div>
                                        )
                                    }
                                >
                                    Show Fallback
                                </MyButton>
                            </div>
                        </div>
                    );
                }
                return;
            }

            // 🔁 Then handle DOC
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

        if (
            activeItem.source_type?.toUpperCase() === 'QUIZ' ||
            activeItem.id?.startsWith('quiz-')
        ) {
            try {
                // For question slides, we don't need to parse data as it's already structured
                setContent(
                    <QuizPreview
                        activeItem={activeItem}
                        routeParams={{
                            chapterId,
                            moduleId,
                            subjectId,
                            sessionId,
                        }}
                    />
                );
            } catch (error) {
                console.error('Error loading quiz questions:', error);
                setContent(<div>Error loading quiz questions</div>);
            }
            return;
        }

        if (activeItem.source_type?.toUpperCase() === 'QUESTION') {
            setContent(<StudyLibraryQuestionsPreview activeItem={activeItem} />);
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
            // Determine the correct status based on slide type and current state
            let status: string;
            if (
                slide?.source_type === 'DOCUMENT' &&
                slide?.document_slide?.type === 'PRESENTATION'
            ) {
                // For presentations, use the same logic as auto-save
                status = slide?.status || 'DRAFT';
                if (slide?.status === 'PUBLISHED') {
                    status = 'UNSYNC';
                }
            } else {
                // For other slide types, use the original logic
                status = slide
                    ? slide.status == 'PUBLISHED'
                        ? 'UNSYNC'
                        : slide.status == 'UNSYNC'
                          ? 'UNSYNC'
                          : 'DRAFT'
                    : 'DRAFT';
            }

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

            if (activeItem?.source_type == 'VIDEO' && activeItem?.splitScreenMode) {
                const splitData = activeItem.splitScreenData as any;
                const projectName = splitData?.projectName || splitData?.name || activeItem.title;
                const originalVideoData = splitData?.originalVideoData || {};

                // Use the original video slide ID if available, otherwise use the slide ID
                const originalVideoSlide = (activeItem as any).originalVideoSlide;
                const videoSlideId =
                    originalVideoSlide?.id ||
                    originalVideoData.id ||
                    activeItem.video_slide?.id ||
                    crypto.randomUUID();

                const videoSlidePayload = {
                    id: activeItem.id,
                    title: projectName || activeItem.title || '',
                    description: activeItem.description || '',
                    image_file_id: activeItem.image_file_id || '',
                    slide_order: activeItem.slide_order,
                    video_slide: {
                        id: videoSlideId,
                        description: originalVideoData.description || activeItem.description || '',
                        title: projectName || activeItem.title || '',
                        url: originalVideoData.url || '',
                        video_length_in_millis: originalVideoData.video_length_in_millis || 0,
                        published_url:
                            originalVideoData.published_url || originalVideoData.url || '',
                        published_video_length_in_millis:
                            originalVideoData.published_video_length_in_millis || 0,
                        source_type: originalVideoData.source_type || 'VIDEO',
                        embedded_type: splitData?.splitType || 'JUPYTER',
                        embedded_data: JSON.stringify(splitData || {}),
                        questions: (originalVideoData.questions as any) || [],
                    },
                    status: status,
                    new_slide: false,
                    notify: false,
                };
                try {
                    await addUpdateVideoSlide(videoSlidePayload);
                    toast.success(`Split screen slide saved successfully!`);

                    // Update the local state to reflect saved changes and clear the new split screen flag
                    const updatedSlide = {
                        ...activeItem,
                        ...(projectName &&
                            projectName !== activeItem.title && { title: projectName }),
                        isNewSplitScreen: false, // Clear the flag after first save
                    };
                    setActiveItem(updatedSlide);
                } catch (error) {
                    console.error('Error saving split screen slide:', error);
                    console.error('Payload that failed:', videoSlidePayload);
                    toast.error(`Error saving split screen slide: ${error}`);
                }
            } else if (activeItem?.source_type == 'VIDEO') {
                // Handle regular video slides (non-split screen)
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
                    toast.error(`Error in saving the slide`);
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

            if (activeItem?.source_type === 'QUIZ') {
                try {
                    // Use the createQuizSlidePayload function to properly transform the data
                    const payload = createQuizSlidePayload(activeItem.quiz_slide?.questions || [], {
                        ...activeItem,
                        status: status, // Use the determined status
                    });

                    await addUpdateQuizSlide(payload);
                    toast.success(`Quiz saved in draft successfully!`);
                } catch (error) {
                    console.error('Error saving quiz slide:', error);
                    toast.error('Error saving quiz slide');
                }
                return;
            }

            if (
                activeItem?.source_type == 'DOCUMENT' &&
                activeItem?.document_slide?.type == 'PRESENTATION'
            ) {
                try {
                    // For non-admin users, use custom save function if available
                    if (customSaveFunction && slide) {
                        console.log('🎨 Using custom save function for presentation');
                        await customSaveFunction(slide);
                        return;
                    }

                    // For presentations, use the same status logic as auto-save
                    let presentationStatus = slide?.status || 'DRAFT';

                    // If the slide is PUBLISHED and being edited, change status to UNSYNC
                    if (slide?.status === 'PUBLISHED') {
                        presentationStatus = 'UNSYNC';
                    }
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
                            published_document_total_pages: 1,
                        },
                        status: presentationStatus, // Use the correct status logic
                        new_slide: false,
                        notify: false,
                    });
                    // Update local activeItem state with the new status
                    if (slide?.id === activeItem?.id) {
                        const updatedActiveItem = {
                            ...activeItem,
                            status: presentationStatus as any,
                        };
                        setActiveItem(updatedActiveItem);
                    }

                    const successMessage =
                        slide?.status === 'PUBLISHED'
                            ? 'Presentation saved as draft (unsync from published version)!'
                            : 'Presentation saved successfully!';
                    toast.success(successMessage);
                } catch {
                    toast.error('Error saving presentation');
                }
                return;
            }

            // Handle CODE, JUPYTER, SCRATCH, and SPLIT slides
            if (
                activeItem?.source_type == 'DOCUMENT' &&
                (activeItem?.document_slide?.type == 'CODE' ||
                    activeItem?.document_slide?.type == 'JUPYTER' ||
                    activeItem?.document_slide?.type == 'SCRATCH' ||
                    activeItem?.document_slide?.type?.startsWith('SPLIT_'))
            ) {
                try {
                    // For these slide types, ensure the latest data is saved to backend
                    // Use fallback: first check data field, then published_data for published slides
                    const rawData =
                        activeItem.status === 'PUBLISHED'
                            ? activeItem.document_slide?.data ||
                              activeItem.document_slide?.published_data
                            : activeItem.document_slide?.data;

                    await addUpdateDocumentSlide({
                        id: slide?.id || '',
                        title: slide?.title || '',
                        image_file_id: '',
                        description: slide?.description || '',
                        slide_order: null,
                        document_slide: {
                            id: slide?.document_slide?.id || '',
                            type: activeItem.document_slide.type,
                            data: rawData || '{}', // Use the fallback data
                            title: slide?.document_slide?.title || '',
                            cover_file_id: '',
                            total_pages: 1,
                            published_data: activeItem.status === 'PUBLISHED' ? rawData : null,
                            published_document_total_pages: 1,
                        },
                        status: status,
                        new_slide: false,
                        notify: false,
                    });

                    const slideTypeName =
                        activeItem.document_slide.type === 'CODE'
                            ? 'Code Editor'
                            : activeItem.document_slide.type === 'JUPYTER'
                              ? 'Jupyter Notebook'
                              : activeItem.document_slide.type === 'SCRATCH'
                                ? 'Scratch Project'
                                : activeItem.document_slide.type?.startsWith('SPLIT_')
                                  ? `Split Screen ${activeItem.document_slide.type.replace('SPLIT_', '')}`
                                  : 'Interactive Slide';
                    toast.success(`${slideTypeName} saved successfully!`);
                } catch (error) {
                    console.error(`Error saving ${activeItem.document_slide.type} slide:`, error);
                    toast.error(
                        `Error saving ${activeItem.document_slide.type.toLowerCase()} slide`
                    );
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
                        published_document_total_pages: 1,
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
            // Step 1: Get current state from Excalidraw editor
            if (!getCurrentExcalidrawStateRef.current) {
                toast.error('Editor not ready. Please try again.');
                return;
            }

            const currentState = getCurrentExcalidrawStateRef.current();

            if (!currentState.elements || currentState.elements.length === 0) {
                toast.error('No content to publish. Please add some content first.');
                return;
            }

            // Step 2: Prepare Excalidraw data for S3 upload
            const excalidrawData = {
                isExcalidraw: true,
                elements: currentState.elements,
                files: currentState.files || {},
                appState: currentState.appState || {},
                lastModified: Date.now(),
            };

            // Step 3: Upload current state to S3
            const jsonBlob = new Blob([JSON.stringify(excalidrawData)], {
                type: 'application/json',
            });
            const fileName = `excalidraw_${activeItem.id}_published_${Date.now()}.json`;
            const jsonFile = new File([jsonBlob], fileName, {
                type: 'application/json',
            });

            // Get user and institute info for S3 upload
            const accessToken = getTokenFromCookie(TokenKey.accessToken);
            const tokenData = getTokenDecodedData(accessToken);
            const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];
            const USER_ID = tokenData?.sub;

            const publishedFileId = await UploadFileInS3(
                jsonFile,
                () => {}, // No progress callback needed
                USER_ID || '',
                INSTITUTE_ID,
                'ADMIN',
                true // public URL
            );

            if (!publishedFileId) {
                toast.error('Failed to upload presentation data');
                return;
            }

            // Step 4: Update slide with both data and published_data set to the new file_id
            await addUpdateDocumentSlide({
                id: activeItem.id,
                title: activeItem.title || '',
                image_file_id: '',
                description: activeItem.description || '',
                slide_order: null,
                document_slide: {
                    id: activeItem.document_slide?.id || '',
                    type: 'PRESENTATION',
                    data: publishedFileId, // Set data to new file_id
                    title: activeItem.document_slide?.title || '',
                    cover_file_id: '',
                    total_pages: 1,
                    published_data: publishedFileId, // Set published_data to same file_id
                    published_document_total_pages: 1,
                },
                status: 'PUBLISHED',
                new_slide: false,
                notify: false,
            });

            // Update local activeItem state with the new published data
            const updatedActiveItem = {
                ...activeItem,
                status: 'PUBLISHED' as any,
                document_slide: activeItem.document_slide
                    ? {
                          ...activeItem.document_slide,
                          data: publishedFileId,
                          published_data: publishedFileId,
                      }
                    : undefined,
            };
            setActiveItem(updatedActiveItem);

            toast.success('Presentation published successfully!');
        } catch (error) {
            console.error('Error publishing presentation:', error);
            toast.error('Failed to publish presentation');
        }
    };

    const handleSaveDraftClick = async () => {
        try {
            // Use custom save function if provided (for non-admin users)
            if (customSaveFunction && activeItem) {
                console.log('🔄 Using custom save function for non-admin');
                await customSaveFunction(activeItem);
                return; // Don't show additional toast as custom function handles it
            }

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
        if (items && items.length === 0 && slideId === undefined) {
            setActiveItem(null);
            return;
        }

        if (items && items.length > 0) {
            // Check if current active slide still exists in items
            const activeSlideStillExists =
                activeItem && items.find((slide) => slide.id === activeItem.id);

            if (activeSlideStillExists) {
                // Active slide still exists, keep it selected

                return;
            }

            // Priority 1: Use slideId from URL if available
            if (slideId) {
                const targetSlide = items.find((slide) => slide.id === slideId);
                if (targetSlide) {
                    setActiveItem(targetSlide);
                    return;
                }
            }

            // Priority 2: Always set first available slide as active
            // This handles both new slide creation and slide deletion scenarios
            const firstSlide = items[0];

            setActiveItem(firstSlide || null);
        }
    }, [items, slideId]);

    useEffect(() => {
        setHeading(activeItem?.title || '');
        // Only reload content if the slide ID, source type, or document type changes
        // Ignore changes to data field to prevent infinite loops from auto-save
        loadContent();
    }, [
        activeItem?.id,
        activeItem?.source_type,
        activeItem?.document_slide?.type,
        activeItem?.status,
        items,
    ]); // Prevent reload on auto-save data changes

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
                <div className="sticky top-0 z-50 -m-8 flex items-center justify-between gap-4 border-b border-neutral-200 bg-white/80 px-6 py-3 shadow-sm backdrop-blur-sm">
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
                                            addUpdateDocumentSlide,
                                            addUpdateQuizSlide, // <-- pass this for QUIZ support
                                            updateAssignmentOrder, // <-- pass for ASSIGNMENT
                                            updateQuestionOrder // <-- pass for QUESTION
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
                                {!isLearnerView && (
                                    <PencilSimpleLine
                                        className="cursor-pointer hover:text-primary-500"
                                        onClick={() => setIsEditing(true)}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {!isLearnerView && (
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

                                {(!hidePublishButtons || // Show for admin users OR
                                    (hidePublishButtons && // Show for non-admin users if it's an editable slide type
                                        (activeItem?.document_slide?.type === 'DOC' ||
                                            activeItem?.document_slide?.type === 'PDF' ||
                                            activeItem?.document_slide?.type === 'PRESENTATION' ||
                                            activeItem?.document_slide?.type === 'CODE' ||
                                            activeItem?.document_slide?.type === 'JUPYTER' ||
                                            activeItem?.document_slide?.type === 'SCRATCH' ||
                                            activeItem?.source_type === 'QUESTION' ||
                                            activeItem?.source_type === 'ASSIGNMENT' ||
                                            activeItem?.source_type === 'QUIZ' ||
                                            activeItem?.source_type === 'DOCUMENT' ||
                                            activeItem?.source_type === 'VIDEO')) || // Include ALL video slides for non-admin
                                    (!hidePublishButtons &&
                                        activeItem?.source_type === 'VIDEO' &&
                                        activeItem?.splitScreenMode)) && ( // Keep split-screen condition for admin
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
                                        ) : hidePublishButtons ? (
                                            'Save Changes'
                                        ) : (
                                            'Save Draft'
                                        )}
                                    </MyButton>
                                )}

                                {/* Single Publish/Unpublish Button - Hidden for non-admin users */}
                                {!hidePublishButtons &&
                                    (activeItem.status === 'PUBLISHED' ? (
                                        <MyButton
                                            buttonType="secondary"
                                            scale="medium"
                                            layoutVariant="default"
                                            onClick={() => setIsUnpublishDialogOpen(true)}
                                        >
                                            Unpublish
                                        </MyButton>
                                    ) : (
                                        <MyButton
                                            buttonType="primary"
                                            scale="medium"
                                            layoutVariant="default"
                                            onClick={() => setIsPublishDialogOpen(true)}
                                        >
                                            Publish
                                        </MyButton>
                                    ))}

                                {/* Keep dialogs but make them conditional */}
                                {isUnpublishDialogOpen && (
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
                                                addUpdateQuizSlide,
                                                SaveDraft,
                                                playerRef
                                            )
                                        }
                                    />
                                )}

                                {isPublishDialogOpen && (
                                    <PublishDialog
                                        isOpen={isPublishDialogOpen}
                                        setIsOpen={setIsPublishDialogOpen}
                                        handlePublishUnpublishSlide={() => {
                                            if (
                                                activeItem?.document_slide?.type === 'PRESENTATION'
                                            ) {
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
                                                    addUpdateQuizSlide,
                                                    SaveDraft,
                                                    playerRef
                                                );
                                            }
                                        }}
                                    />
                                )}
                            </div>

                            {/* ✅ Doubt Icon Trigger */}
                            <MyButton
                                layoutVariant="icon"
                                buttonType="secondary"
                                title="Open Doubt Resolution Sidebar"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <ChatCircleDots className="size-5" />
                            </MyButton>
                            {/* Slides Menu Option */}
                            <SlidesMenuOption />
                        </div>
                    )}
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
