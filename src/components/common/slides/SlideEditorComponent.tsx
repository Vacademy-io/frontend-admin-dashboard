/* eslint-disable */
// @ts-nocheck
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { SlideEditor } from './SlideEditor';
import { Button } from '@/components/ui/button';
import { ListStart, Save, Loader2, PlaySquare, Tv2, PlusCircle } from 'lucide-react';
import SlideList from './SlideList';
import { QuizSlide } from './slidesTypes/QuizSlides'; // Ensure path is correct
import { useSlideStore } from '@/stores/Slides/useSlideStore'; // Assumed path
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { useRouter } from '@tanstack/react-router'; // Or your router import
import { useGetSinglePresentation } from './hooks/useGetSinglePresntation'; // Assumed path
import { toast } from 'sonner';
import { IoArrowBackSharp } from 'react-icons/io5';

import { PresentationView } from './PresentationView';
import { SessionOptionsModal, type SessionOptions } from './components/SessionOptionModel'; // Assumed path
import { WaitingRoom } from './components/SessionWaitingRoom'; // Assumed path

import type {
    Slide as AppSlide,
    ExcalidrawSlideData,
    QuizSlideData,
    FeedbackSlideData,
    AppState as ExcalidrawAppState,
    ExcalidrawElement,
    ExcalidrawBinaryFiles,
    QuestionFormData,
} from './types';
import { SlideTypeEnum } from '././utils/types';

const CREATE_SESSION_API_URL = 'http://localhost:8073/community-service/engage/admin/create';
const START_SESSION_API_URL = 'http://localhost:8073/community-service/engage/admin/start';

interface SlideRendererProps {
    currentSlideId: string;
    editMode: boolean; // In editor, this will be true. In PresentationView, SlideEditor gets editMode=false
}

const SlideRenderer: React.FC<SlideRendererProps> = ({ currentSlideId, editMode }) => {
    const getSlide = useSlideStore((state) => state.getSlide);
    const updateSlide = useSlideStore((state) => state.updateSlide); // Assuming updateSlide exists and handles types

    const slide = getSlide(currentSlideId);

    if (!slide) {
        return (
            <div className="flex h-full items-center justify-center text-lg text-red-500">
                Slide data not found.
            </div>
        );
    }

    // Memoize based on slide content relevant to the specific type
    const slideEditorKey = `${slide.id}-${(slide as ExcalidrawSlideData).elements?.length}-${(slide as ExcalidrawSlideData).appState?.zenModeEnabled}`;
    const quizSlideKey = `${slide.id}-${(slide as QuizSlideData).elements?.questionName}`;

    switch (slide.type) {
        case SlideTypeEnum.Quiz:
        case SlideTypeEnum.Feedback:
            const quizOrFeedbackSlide = slide as QuizSlideData | FeedbackSlideData; // Type assertion
            return (
                <QuizSlide
                    // Pass only necessary, memoizable props to QuizSlide
                    formdata={quizOrFeedbackSlide.elements}
                    className={'flex h-full flex-col rounded-lg bg-white p-4 shadow-inner sm:p-6'} // Improved styling
                    questionType={slide.type as SlideTypeEnum.Quiz | SlideTypeEnum.Feedback} // More specific type
                    currentSlideId={currentSlideId}
                    key={quizSlideKey} // Key for re-render on specific data change
                    isPresentationMode={!editMode} // This component seems to be used in editor too
                />
            );

        case SlideTypeEnum.Title:
        case SlideTypeEnum.Text:
        case SlideTypeEnum.Blank:
        case SlideTypeEnum.Excalidraw:
            const excalidrawSlide = slide as ExcalidrawSlideData; // Type assertion
            return (
                <SlideEditor
                    editMode={editMode}
                    slide={excalidrawSlide}
                    onSlideChange={(
                        elements: readonly ExcalidrawElement[],
                        appState: ExcalidrawAppState,
                        files: ExcalidrawBinaryFiles
                    ) => {
                        // Ensure updateSlide in your store can handle these parameters
                        // It's often better to pass an object of changes:
                        // updateSlide(currentSlideId, { elements, appState, files });
                        // For now, matching your existing pattern:
                        updateSlide(currentSlideId, elements, appState, files);
                    }}
                    key={slideEditorKey} // Key for re-render on specific data change
                />
            );
        default:
            // Fallback for unknown slide types
            return (
                <div className="flex h-full items-center justify-center bg-gray-100 p-4 text-gray-600">
                    Unsupported slide type: {slide.type || 'Unknown'}. Please check slide data.
                </div>
            );
    }
};

export default function SlidesEditorComponent({
    metaData,
    presentationId,
    isEdit, // Indicates if we are editing an existing presentation (vs creating new)
}: {
    metaData: { title: string; description: string }; // Title/desc for a new presentation or existing one
    presentationId: string; // ID of the presentation being edited, or potentially a new ID if creating
    isEdit: boolean;
}) {
    const {
        slides,
        currentSlideId,
        editMode, // Global edit mode for the entire editor (vs. presentation view)
        setCurrentSlideId,
        setEditMode,
        addSlide, // (type: SlideTypeEnum) => void
        // moveSlideUp, // Handled by DND in SlideList
        // moveSlideDown, // Handled by DND in SlideList
        deleteSlide, // (id: string) => void
        getSlide,
        setSlides, // (slides: AppSlide[]) => void
        // updateSlide is used by SlideRenderer directly from store
    } = useSlideStore();

    const router = useRouter();
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [showSessionOptionsModal, setShowSessionOptionsModal] = useState<boolean>(false);
    const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);
    const [isStartingSessionInProgress, setIsStartingSessionInProgress] = useState<boolean>(false);
    const [sessionDetails, setSessionDetails] = useState<{
        session_id: string;
        invite_code: string;
        [key: string]: any;
    } | null>(null);
    const [isWaitingForParticipants, setIsWaitingForParticipants] = useState<boolean>(false);

    const {
        isLoading: isLoadingPresentation, // Renamed to avoid conflict
        isRefetching: isRefetchingPresentation, // Renamed
    } = useGetSinglePresentation({ presentationId, setSlides, setCurrentSlideId });

    useEffect(() => {
        // Auto-select first slide if in edit mode, presentation loaded, and no slide selected
        if (
            !isLoadingPresentation &&
            !isRefetchingPresentation &&
            editMode &&
            slides &&
            slides.length > 0 &&
            !currentSlideId
        ) {
            const firstValidSlide = slides.find((s) => s && s.id);
            if (firstValidSlide) {
                setCurrentSlideId(firstValidSlide.id);
            } else if (slides.length > 0) {
                // Fallback if find fails but slides exist (e.g. all slides missing IDs, which is unlikely)
                setCurrentSlideId(slides[0].id);
            }
        }
    }, [
        isLoadingPresentation,
        isRefetchingPresentation,
        editMode,
        slides,
        currentSlideId,
        setCurrentSlideId,
    ]);

    const changeCurrentSlide = (id: string) => {
        setCurrentSlideId(id);
    };

    const handleAddSlide = (type: SlideTypeEnum) => {
        // Add slide logic might need to set it as current if it's the first one
        addSlide(type);
        // Optionally, make the new slide current, the store might handle this
    };

    const handleDeleteCurrentSlide = () => {
        if (currentSlideId) {
            deleteSlide(currentSlideId);
            // Logic to select next/previous slide or clear currentSlideId might be in store or here
        }
    };

    const handleOpenSessionOptions = () => {
        if (slides && slides.length > 0) {
            setShowSessionOptionsModal(true);
        } else {
            toast.error('Add slides before starting a live session.');
        }
    };

    const handleCreateSession = async (options: SessionOptions) => {
        setIsCreatingSession(true);
        try {
            const payload = {
                source: 'PRESENTATION',
                source_id: presentationId, // ID of the presentation
                ...options, // Spread validated options
                default_seconds_for_question: Number(options.default_seconds_for_question),
                student_attempts: Number(options.student_attempts),
            };
            const response = await authenticatedAxiosInstance.post(CREATE_SESSION_API_URL, payload);
            if (response.data && response.data.session_id && response.data.invite_code) {
                setSessionDetails(response.data); // Includes session_id, invite_code, etc.
                setShowSessionOptionsModal(false);
                setIsWaitingForParticipants(true); // Transition to waiting room
                toast.success('Session created! Waiting for participants.');
            } else {
                toast.error(
                    response.data?.message ||
                        'Failed to create session. Invalid response from server.'
                );
            }
        } catch (error: any) {
            console.error('Error creating session:', error);
            toast.error(
                error.response?.data?.message ||
                    'An unexpected error occurred while creating the session.'
            );
        } finally {
            setIsCreatingSession(false);
        }
    };

    const handleStartActualPresentation = async () => {
        if (!sessionDetails || !slides || slides.length === 0) {
            toast.error('Session details or slides are missing. Cannot start presentation.');
            return;
        }
        setIsStartingSessionInProgress(true);
        try {
            // Backend needs to know which slide to start on.
            // 'slide_order' from your Slide type is crucial here.
            // Assuming slides are ordered correctly in the 'slides' array from the store.
            const firstSlide = slides[0];
            const initialSlideOrder =
                typeof firstSlide?.slide_order === 'number' ? firstSlide.slide_order : 0;

            await authenticatedAxiosInstance.post(START_SESSION_API_URL, {
                session_id: sessionDetails.session_id,
                move_to: initialSlideOrder, // Send the logical slide order
            });
            setIsWaitingForParticipants(false);
            setEditMode(false); // Switch to presentation view
            // currentSlideId in store should also be set to slides[0].id for Reveal.js init
            if (slides.length > 0) setCurrentSlideId(slides[0].id);
            toast.success('Presentation started!');
        } catch (error: any) {
            console.error('Error starting presentation:', error);
            toast.error(error.response?.data?.message || 'Failed to start the presentation.');
        } finally {
            setIsStartingSessionInProgress(false);
        }
    };

    const handleExitSessionFlow = () => {
        setEditMode(true); // Back to editor
        setShowSessionOptionsModal(false);
        setIsWaitingForParticipants(false);
        setSessionDetails(null);
        setIsCreatingSession(false);
        setIsStartingSessionInProgress(false);
        toast.info('Exited live session flow.');
    };

    const toggleDirectPresentationPreview = () => {
        if (slides && slides.length > 0) {
            if (sessionDetails) setSessionDetails(null); // Clear live session if just previewing
            setEditMode(!editMode); // Toggle between editor and preview
            // If entering preview, set current slide to the first slide for Reveal.js
            if (!editMode && slides.length > 0) {
                // Means we are about to switch editMode to false
                setCurrentSlideId(slides[0].id);
            }
        } else {
            toast.info('Add some slides to preview the presentation.');
        }
    };

    const savePresentation = async () => {
        setIsSaving(true);
        try {
            // 1. Authentication check
            const accessToken = getTokenFromCookie(TokenKey.accessToken);
            if (!accessToken) {
                toast.error('Please login to save presentations');
                return;
            }

            // 2. Get institute ID
            const tokenData = getTokenDecodedData(accessToken);
            const INSTITUTE_ID = tokenData?.authorities && Object.keys(tokenData.authorities)[0];
            if (!INSTITUTE_ID) {
                toast.error('Organization information missing');
                return;
            }

            // 3. Validate slides data
            if (!slides || slides.length === 0) {
                toast.error('No slides to save');
                return;
            }

            // 4 & 5. Upload and transform slides
            const addedSlides = [];
            for (let index = 0; index < slides.length; index++) {
                const slide = slides[index];
                let fileId;

                try {
                    fileId = await UploadFileInS3V2(
                        slide,
                        () => {},
                        tokenData.sub,
                        'SLIDES',
                        tokenData.sub,
                        true
                    );
                } catch (uploadError) {
                    console.error('Upload failed:', uploadError);
                    toast.error('Failed to upload slides');
                    return;
                }

                const isQuestionSlide = [SlideType.Quiz, SlideType.Feedback].includes(slide.type);

                const baseSlide = {
                    id: slide.id ?? '',
                    presentation_id: '',
                    title: slide?.elements?.questionName || `Slide ${index + 1}`,
                    source_id: fileId,
                    source: isQuestionSlide ? 'question' : 'excalidraw',
                    status: 'PUBLISHED',
                    interaction_status: '',
                    slide_order: index,
                    default_time: 0,
                    content: fileId,
                    added_question: null,
                };

                if (isQuestionSlide) {
                    const question = {
                        preview_id: '1',
                        section_id: null,
                        question_order_in_section: 1,
                        text: {
                            id: null,
                            type: 'HTML',
                            content: slide?.elements?.questionText || 'Question text',
                        },
                        media_id: '',
                        question_response_type: 'multiple_choice',
                        question_type: 'MCQS',
                        access_level: 'public',
                        auto_evaluation_json: JSON.stringify({
                            type: 'MCQS',
                            data: { correctOptionIds: slide?.elements?.correctOptions || [] },
                        }),
                        options_json: null,
                        parsed_evaluation_object: {
                            correct_option: slide?.elements?.correctOptions?.[0] || 1,
                        },
                        evaluation_type: 'auto',
                        explanation_text: {
                            id: null,
                            type: 'HTML',
                            content: '',
                        },
                        parent_rich_text_id: 'prt_001',
                        parent_rich_text: {
                            id: null,
                            type: 'HTML',
                            content: '',
                        },
                        default_question_time_mins: slide?.elements?.timeLimit || 1,
                        options: (slide?.elements?.singleChoiceOptions || []).map(
                            (option, optIndex) => ({
                                id: isEdit ? option.id || '' : '',
                                preview_id: `${optIndex + 1}`,
                                question_id: isEdit ? slide.questionId || '' : '',
                                text: {
                                    id: null,
                                    type: 'HTML',
                                    content: option.text || `Option ${optIndex + 1}`,
                                },
                                media_id: '',
                                option_order: optIndex,
                                explanation_text: {
                                    id: null,
                                    type: 'HTML',
                                    content: '',
                                },
                            })
                        ),
                        errors: [],
                        warnings: [],
                    };
                    baseSlide.added_question = question;
                }

                addedSlides.push(baseSlide);
            }

            // 6. Prepare final payload
            const payload = {
                id: isEdit ? presentationId : '',
                title: metaData?.title || 'New Presentation',
                description: metaData?.description || '',
                cover_file_id: '',
                added_slides: filterSlidesByIdType(addedSlides, true),
                status: 'PUBLISHED',
            };

            if (isEdit) {
                payload.updated_slides = filterSlidesByIdType(addedSlides, false);
                payload.deleted_slides = [];
            }

            // 7. Make API call
            await authenticatedAxiosInstance.post(
                isEdit ? EDIT_PRESENTATION : ADD_PRESENTATION,
                payload,
                {
                    params: { instituteId: INSTITUTE_ID },
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            toast.success(`Presentation ${isEdit ? 'updated' : 'created'} successfully`);
            router.navigate({ to: '/study-library/present' });
            toast.success(`Presentation '${metaData.title}' saved successfully! (Mocked)`);
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error(error.response?.data?.message || 'Failed to save presentation.');
        } finally {
            setIsSaving(false);
        }
    };

    const exportPresentationToFile = () => toast.info('Export function coming soon!');
    const importPresentationFromFile = () => toast.info('Import function coming soon!');

    // --- Render Logic ---
    if (isLoadingPresentation || isRefetchingPresentation) {
        return (
            <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <Loader2 className="size-12 animate-spin text-orange-500" />
                <p className="mt-3 text-lg text-slate-600">Loading Presentation...</p>
            </div>
        );
    }

    if (showSessionOptionsModal) {
        return (
            <SessionOptionsModal
                isOpen={showSessionOptionsModal}
                onClose={() => {
                    setShowSessionOptionsModal(false);
                    if (isCreatingSession) setIsCreatingSession(false);
                }}
                onSubmit={handleCreateSession}
                isCreatingSession={isCreatingSession}
            />
        );
    }

    if (isWaitingForParticipants && sessionDetails) {
        return (
            <WaitingRoom
                sessionDetails={{ ...sessionDetails, title: metaData.title }} // Pass presentation title
                onStartPresentation={handleStartActualPresentation}
                onCancelSession={handleExitSessionFlow}
                isStarting={isStartingSessionInProgress}
            />
        );
    }

    if (!editMode) {
        // Presentation View (Live or Preview)
        const onPresentationExit = sessionDetails
            ? handleExitSessionFlow
            : () => {
                  setEditMode(true); // Back to editor from preview
                  // Restore currentSlideId to what it was in editor, or first slide. The store might handle this.
                  if (slides.length > 0 && !slides.find((s) => s.id === currentSlideId)) {
                      setCurrentSlideId(slides[0].id);
                  }
              };
        return (
            <PresentationView
                slides={slides} // Pass the slides array
                onExit={onPresentationExit}
                liveSessionData={sessionDetails} // Undefined if just previewing
                initialSlideId={currentSlideId || (slides.length > 0 ? slides[0].id : undefined)} // For Reveal.js starting point
            />
        );
    }

    // Editor View (editMode is true, not in modal, not in waiting room)
    if ((!slides || slides.length === 0) && editMode) {
        // Ensure editMode is true here
        return (
            <div className="flex h-screen flex-col">
                <div className="sticky top-0 z-40 flex items-center border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.navigate({ to: '/study-library/present' })}
                        className="text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    >
                        <IoArrowBackSharp size={22} />
                    </Button>
                    <span className="ml-3 text-lg font-semibold text-slate-700">
                        {metaData.title || 'New Presentation'}
                    </span>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 p-6 text-center">
                    <img
                        src="/placeholder-empty-slides.svg"
                        alt="Empty Presentation"
                        className="mx-auto mb-8 h-52 w-52 opacity-70"
                    />
                    <h2 className="mb-3 text-2xl font-semibold text-slate-700">
                        Your Presentation is Empty
                    </h2>
                    <p className="mb-8 max-w-md text-base text-slate-500">
                        Let's bring your ideas to life. Add your first slide to get started!
                    </p>
                    <Button
                        onClick={() => handleAddSlide(SlideTypeEnum.Title)} // Add a title slide by default
                        className="group rounded-lg bg-orange-500 px-8 py-3 text-base font-medium text-white shadow-md transition-all duration-150 ease-in-out hover:bg-orange-600 hover:shadow-lg"
                    >
                        <PlusCircle className="mr-2.5 size-5 group-hover:animate-pulse" />
                        Add First Slide
                    </Button>
                </div>
            </div>
        );
    }

    // Main Editor Layout (editMode is true, and slides exist)
    const currentSlideData = getSlide(currentSlideId || ''); // Ensure currentSlideId is not undefined

    // This logic seems specific to Excalidraw's toolbar.
    // Quiz/Feedback slides might not need this offset if their content starts from the top.
    const needsEditorPadding =
        currentSlideData &&
        (currentSlideData.type === SlideTypeEnum.Title ||
            currentSlideData.type === SlideTypeEnum.Text ||
            currentSlideData.type === SlideTypeEnum.Blank ||
            currentSlideData.type === SlideTypeEnum.Excalidraw);

    return (
        <div className="flex h-screen w-full flex-col bg-slate-100">
            <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:px-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.navigate({ to: '/study-library/present' })}
                        className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    >
                        <IoArrowBackSharp size={20} />
                    </Button>
                    <span className="text-md max-w-[120px] truncate font-semibold text-slate-800 sm:max-w-xs sm:text-lg md:max-w-sm">
                        {metaData.title || 'Untitled Presentation'}
                    </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <Button
                        onClick={savePresentation}
                        disabled={isSaving}
                        size="sm"
                        className="gap-1.5 bg-orange-500 px-3 text-white hover:bg-orange-600 focus-visible:ring-orange-400 sm:gap-2 sm:px-4"
                    >
                        <Save className="size-4" />
                        {isSaving ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : isEdit ? (
                            'Save'
                        ) : (
                            'Create'
                        )}
                    </Button>
                    <Button
                        onClick={toggleDirectPresentationPreview}
                        disabled={!slides || slides.length === 0}
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-blue-500 px-3 text-blue-600 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-400 sm:px-4"
                    >
                        <PlaySquare className="size-4" />
                        Preview
                    </Button>
                    <Button
                        onClick={handleOpenSessionOptions}
                        disabled={!slides || slides.length === 0}
                        size="sm"
                        className="gap-1.5 bg-green-500 px-3 text-white hover:bg-green-600 focus-visible:ring-green-400 sm:px-4"
                    >
                        <Tv2 className="size-4" />
                        Start Live
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <SlideList
                    slides={slides}
                    currentSlideId={currentSlideId}
                    onSlideChange={changeCurrentSlide}
                    onAddSlide={handleAddSlide}
                    onDeleteSlide={handleDeleteCurrentSlide}
                    onExport={exportPresentationToFile}
                    onImport={importPresentationFromFile}
                    onReorderSlides={(reorderedSlides) => setSlides(reorderedSlides)}
                />

                <main className={`flex flex-1 flex-col bg-slate-200 p-2 sm:p-3`}>
                    <div
                        className="relative flex-1 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-inner"
                        // If Excalidraw has its own toolbar, its container (SlideEditor) should handle it.
                        // This padding logic might be for an external toolbar or specific layout need.
                        // For minimalism, SlideEditor should be h-full and manage its content.
                        // style={{ paddingTop: needsEditorPadding ? '0px' : '0' }} // Re-evaluate if this is necessary
                    >
                        {currentSlideId && currentSlideData ? (
                            <SlideRenderer
                                currentSlideId={currentSlideId}
                                editMode={true} // Always true in the editor view for SlideRenderer
                            />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center p-5 text-slate-500">
                                <ListStart size={48} className="mb-4 text-slate-400" />
                                <p className="text-lg font-medium">
                                    {slides && slides.length > 0
                                        ? 'Select a slide to edit'
                                        : 'Your presentation is empty.'}
                                </p>
                                {slides && slides.length === 0 && (
                                    <p className="mt-1 text-sm">
                                        Click "Add Slide" in the left panel to begin.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
