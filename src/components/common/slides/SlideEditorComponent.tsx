// SlidesEditor.tsx
/* eslint-disable */
// @ts-nocheck
'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { SlideEditor } from './SlideEditor';
import { Button } from '@/components/ui/button';
import { ListStart, Settings, FileDown, Save, Loader2 } from 'lucide-react';
import SlideList from './SlideList';
import { SlideType } from './constant/slideType';
import { QuizeSlide } from './slidesTypes/QuizSlides';
import { useSlideStore } from '@/stores/Slides/useSlideStore';
import { ADD_PRESENTATION, EDIT_PRESENTATION } from '@/constants/urls';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { TokenKey } from '@/constants/auth/tokens';
import { StatusCode, UploadFileInS3V2 } from '@/services/upload_file';
import { useRouter } from '@tanstack/react-router';
import { useGetSinglePresentation } from './hooks/useGetSinglePresntation';
import { isNullOrEmptyOrUndefined } from '@/lib/utils';
import { toast } from 'sonner';
import { IoArrowBackSharp } from 'react-icons/io5';
import html2canvas from 'html2canvas';
import { filterSlidesByIdType } from './utils/util';

// Import the new presentation components
import { PresentationView } from './PresentationView';
// ExcalidrawViewer is used by PresentationView, so direct import here might not be needed
// unless used elsewhere.

const SlideRenderer = ({
    type,
    currentSlideId,
    editMode,
}: {
    type: SlideType;
    currentSlideId: string;
    editMode: boolean;
}) => {
    const getSlide = useSlideStore((state) => state.getSlide);
    const updateSlide = useSlideStore((state) => state.updateSlide);
    const slide = getSlide(currentSlideId);

    if (!slide) return null;

    switch (type) {
        case SlideType.Quiz:
        case SlideType.Feedback:
            // Pass editMode to QuizeSlide if it needs to behave differently in editor vs. preview in editor
            return (
                <QuizeSlide
                    formdata={slide.elements}
                    className={'flex flex-col'}
                    questionType={type}
                    currentSlideId={currentSlideId}
                    key={currentSlideId}
                    isPresentationMode={!editMode}
                />
            );
        default:
            return (
                <SlideEditor
                    editMode={editMode} // True when in editor, false if a "preview within editor" state existed
                    slide={slide}
                    onSlideChange={(elements, appState, files) =>
                        updateSlide(currentSlideId, elements, appState, files)
                    }
                    key={currentSlideId}
                />
            );
    }
};

export default function SlidesEditorComponent({
    metaData,
    presentationId,
    isEdit,
}: {
    metaData: { title: string; description: string };
    presentationId: string;
    isEdit: boolean;
}) {
    const {
        slides,
        currentSlideId,
        editMode, // This now controls editor vs. presentation mode
        setCurrentSlideId,
        setEditMode,
        addSlide,
        moveSlideUp,
        moveSlideDown,
        deleteSlide,
        getSlide,
        setSlides,
    } = useSlideStore();

    const router = useRouter();
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const {
        isLoading,
        isError,
        data: presentation,
        isRefetching,
    } = useGetSinglePresentation({ presentationId: presentationId, setSlides, setCurrentSlideId });

    const changeCurrentSlide = (id: string) => {
        setCurrentSlideId(id);
    };

    // This function will toggle between editor and presentation view
    const togglePresentationMode = () => {
        if (slides && slides.length > 0) {
            // Only enter presentation if there are slides
            setEditMode(!editMode);
        } else {
            toast.info('Add some slides to start a presentation.');
        }
    };

    const handleExitPresentation = () => {
        setEditMode(true); // Set back to edit mode
    };

    const slideIndex = slides?.findIndex((s) => s.id === currentSlideId);
    const isFirstSlide = slideIndex === 0;
    const isLastSlide = slideIndex === slides?.length - 1;

    // goToNextSlide and goToPreviousSlide are for the editor, Reveal.js has its own controls

    const exportFile = () => {
        /* ... existing code ... */
    };
    const importFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        /* ... existing code ... */
    };
    const takeScreenshot = async () => {
        /* ... existing code ... */
    };
    const savePresentation = async () => {
        /* ... existing code ... */
    };

    if (isLoading || isRefetching) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
                <Loader2 className="size-10 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!isLoading && (!slides || slides.length === 0) && editMode) {
        // Added editMode condition to allow presentation view to show its own "no slides" message
        return (
            <div className="flex h-screen flex-col items-center justify-center">
                <p className="mb-4">Loading slides or no slides to present...</p>
                <Button onClick={() => addSlide(SlideType.Title)}>Add Title Slide</Button>
                {/* You might want a button to exit or go back if stuck here */}
            </div>
        );
    }

    if (!editMode) {
        // The check for slides.length > 0 will be handled by PresentationView itself
        let modifiedSlides = [...slides]; // Create a mutable copy
        if (modifiedSlides.length > 0) {
            const firstSlide = { ...modifiedSlides[0] }; // Shallow copy first slide
            if (firstSlide.type !== SlideType.Quiz && firstSlide.type !== SlideType.Feedback) {
                // Assuming it's an Excalidraw type
                firstSlide.elements = [
                    {
                        type: 'text',
                        x: 50,
                        y: 50,
                        width: 400,
                        height: 100,
                        angle: 0,
                        strokeColor: '#ff0000', // Bright red text
                        backgroundColor: 'transparent',
                        fillStyle: 'hachure',
                        strokeWidth: 1,
                        strokeStyle: 'solid',
                        roughness: 1,
                        opacity: 100,
                        groupIds: [],
                        frameId: null,
                        roundness: null,
                        seed: Date.now(),
                        version: 1,
                        versionNonce: Date.now(),
                        isDeleted: false,
                        boundElements: null,
                        updated: Date.now(),
                        link: null,
                        locked: false,
                        text: 'IS SLIDE 0 VISIBLE NOW?',
                        fontSize: 36,
                        fontFamily: 1,
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        baseline: 8,
                        originalText: 'IS SLIDE 0 VISIBLE NOW?',
                        lineHeight: 1.25 as any, // Cast if type complains
                        autoResize: true,
                        id: 'test-visibility-element',
                    },
                ];
                firstSlide.appState = { ...firstSlide.appState, viewBackgroundColor: '#FFFFFF' };
            }
            modifiedSlides[0] = firstSlide;
        }

        return (
            <PresentationView
                slides={slides} // Use the 'slides' from useSlideStore
                onExit={handleExitPresentation}
            />
        );
    }

    // Otherwise, show the editor interface
    return (
        <div className="flex h-screen w-full bg-gray-50">
            <div className="flex size-full flex-col">
                <div className="sticky top-0 z-20 mb-2 flex min-h-fit items-center justify-between border-b border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-3">
                        <IoArrowBackSharp
                            size={28}
                            className="cursor-pointer text-gray-600 hover:text-gray-800"
                            onClick={() => router.navigate({ to: '/study-library/present' })}
                        />
                        <Button
                            onClick={savePresentation}
                            disabled={isSaving}
                            className="gap-2 bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600"
                        >
                            <Save className="size-4" />
                            {isSaving
                                ? 'Saving...'
                                : isEdit
                                  ? 'Save Presentation'
                                  : 'Add Presentation'}
                        </Button>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            onClick={togglePresentationMode} // Changed from toggleEditMode
                            disabled={slides.length === 0 && editMode} // Disable if no slides and in edit mode
                            className="gap-2 border border-orange-500 bg-white px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                        >
                            <ListStart className="size-4" />
                            {/* Text should be "Start Presentation" when in edit mode */}
                            {/* When !editMode, this button isn't visible as PresentationView takes over */}
                            {'Start Presentation'}
                        </Button>
                    </div>
                </div>

                <div
                    className="slide-container flex flex-1 bg-gray-100"
                    style={{ position: 'relative' }}
                >
                    {currentSlideId && ( // Only show slide list if there's a current slide (implies slides exist)
                        <div
                            className={`slide-list-wrapper border-r border-gray-200 bg-white`}
                            style={{ height: '100%' }}
                        >
                            <SlideList
                                slides={slides}
                                currentSlide={currentSlideId}
                                onSlideChange={changeCurrentSlide}
                                onAddSlide={addSlide}
                                onMoveSlideUp={() => moveSlideUp(currentSlideId)} // Corrected
                                onMoveSlideDown={() => moveSlideDown(currentSlideId)} // Corrected
                                onDeleteSlide={() => deleteSlide(currentSlideId)}
                                onExport={exportFile}
                                onImport={importFile}
                                onReorderSlides={(reorderedSlides) => {
                                    setSlides(reorderedSlides);
                                }}
                            />
                        </div>
                    )}
                    <div className="flex flex-1 flex-col bg-gray-50 p-1">
                        <div className="relative z-20 flex-1 rounded-md border border-gray-300 bg-white pt-14">
                            {/* The overlay for "not editing" is now implicitly handled by switching to PresentationView */}
                            {/* {!editMode && ( <div className="absolute inset-0 z-10 rounded-md bg-black/30" /> )} */}

                            {!isLoading && currentSlideId && (
                                <SlideRenderer
                                    currentSlideId={currentSlideId}
                                    type={getSlide(currentSlideId)?.type || SlideType.Title}
                                    editMode={editMode} // This is true here because we are in the editor view
                                    key={currentSlideId}
                                />
                            )}
                            {/* Placeholder if no slides or no current slide */}
                            {!isLoading &&
                                !currentSlideId &&
                                slides?.length > 0 &&
                                setCurrentSlideId(slides[0].id)}
                            {!isLoading && (!slides || slides.length === 0) && (
                                <div className="flex h-full items-center justify-center text-gray-500">
                                    <p>Add a slide to get started!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
