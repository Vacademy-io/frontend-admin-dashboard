/* eslint-disable */
// @ts-nocheck
import { create } from 'zustand';
import isEqual from 'lodash.isequal';

import type {
    AppState,
    PartialAppState, // Use PartialAppState for internal state if not all fields are manage
    ExcalidrawSlideData, // To type the 'slide' prop for SlideEditor
} from '../utils/types'; // Assuming types.ts is in the same directory or adjust path

import type {
    AppState,
    BinaryFiles,
    Collaborator,
    SocketId,
    LibraryItems,
} from '@excalidraw/excalidraw/types';

// Assuming types.ts is correctly set up and imported
import type {
    Slide,
    QuizSlideData,
    FeedbackSlideData,
    PartialAppState,
    QuestionFormData,
} from '@/components/common/slides/utils/types'; // ADJUST PATH TO YOUR types.ts
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

import { SlideTypeEnum } from '@/components/common/slides/utils/types'; // ADJUST PATH TO YOUR types.ts

import { defaultSlides as initialDefaultSlides } from '@/components/common/slides/constant/defaultSlides'; // ADJUST PATH
import { createNewSlide as createNewSlideUtil } from '@/components/common/slides/utils/util'; // ADJUST PATH

// Props from AppState that are controlled by the Excalidraw component state
// and should be persisted if they change.
const CONTROLLED_APPSTATE_PROPS: (keyof PartialAppState)[] = [
    'viewBackgroundColor',
    'zenModeEnabled',
    'theme',
    'gridSize',
    // Add other AppState properties you want to specifically track and save
];

// Helper to serialize a slide for localStorage (converts collaborators Map to Array)
const serializeSlideForStorage = (slide: Slide): any => {
    if (slide.type === SlideTypeEnum.Quiz || slide.type === SlideTypeEnum.Feedback) {
        return slide; // Quiz/Feedback slides don't have Excalidraw appState
    }
    const excalidrawSlide = slide as ExcalidrawSlideData;
    if (excalidrawSlide.appState?.collaborators instanceof Map) {
        return {
            ...excalidrawSlide,
            appState: {
                ...excalidrawSlide.appState,
                collaborators: Array.from(excalidrawSlide.appState.collaborators.entries()),
            },
        };
    }
    return excalidrawSlide;
};

// Helper to deserialize a slide from localStorage (converts collaborators Array to Map)
const deserializeSlideFromStorage = (storedSlide: any): Slide => {
    if (storedSlide.type === SlideTypeEnum.Quiz || storedSlide.type === SlideTypeEnum.Feedback) {
        return storedSlide as Slide; // Type assertion, ensure structure matches
    }
    // For Excalidraw-based slides
    let collaboratorsMap = new Map<ExcalidrawSocketId, ExcalidrawCollaborator>();
    if (storedSlide.appState?.collaborators) {
        if (Array.isArray(storedSlide.appState.collaborators)) {
            try {
                // Attempt to create Map from array of entries
                collaboratorsMap = new Map(
                    storedSlide.appState.collaborators as [
                        ExcalidrawSocketId,
                        ExcalidrawCollaborator,
                    ][]
                );
            } catch (e) {
                // console.warn("Could not parse collaborators array into Map, defaulting to empty Map.", e);
                collaboratorsMap = new Map<ExcalidrawSocketId, ExcalidrawCollaborator>();
            }
        } else if (
            typeof storedSlide.appState.collaborators === 'object' &&
            Object.keys(storedSlide.appState.collaborators).length === 0
        ) {
            // Handle case where it was an empty Map serialized to {}
            collaboratorsMap = new Map<ExcalidrawSocketId, ExcalidrawCollaborator>();
        }
    }
    return {
        ...storedSlide,
        appState: {
            ...(storedSlide.appState || {}),
            collaborators: collaboratorsMap,
        },
    } as Slide; // Type assertion
};

interface SlideStore {
    slides: Slide[];
    currentSlideId: string | undefined;
    editMode: boolean;
    setSlides: (slides: Slide[], skipSave?: boolean) => void; // Added skipSave for internal calls
    setCurrentSlideId: (id: string | undefined) => void;
    setEditMode: (editMode: boolean) => void;
    getSlide: (id: string) => Slide | undefined;
    updateSlide: (
        // For Excalidraw-based slides
        id: string,
        elements: readonly ExcalidrawElement[],
        appState: AppState, // Full AppState from Excalidraw
        files: ExcalidrawBinaryFiles
    ) => void;
    addSlide: (type: SlideTypeEnum) => void;
    deleteSlide: (id: string) => void;
    moveSlide: (dragIndex: number, hoverIndex: number) => void; // For DND reordering
    updateQuizFeedbackSlide: (id: string, formData: QuestionFormData) => void;
}

export const useSlideStore = create<SlideStore>((set, get) => {
    let initialSlides: Slide[] = [];
    if (typeof window !== 'undefined') {
        try {
            const savedSlidesString = localStorage.getItem('slides');
            if (savedSlidesString) {
                const parsedSlides = JSON.parse(savedSlidesString);
                if (Array.isArray(parsedSlides) && parsedSlides.length > 0) {
                    initialSlides = parsedSlides.map(deserializeSlideFromStorage);
                }
            }
        } catch (error) {
            console.error('Error parsing slides from localStorage:', error);
            initialSlides = []; // Fallback to empty or default
        }
    }

    if (initialSlides.length === 0) {
        initialSlides = initialDefaultSlides.map(deserializeSlideFromStorage); // Use defaults if LS is empty/invalid
    }

    return {
        slides: initialSlides,
        currentSlideId: initialSlides[0]?.id,
        editMode: true,

        setSlides: (newSlides, skipSave = false) => {
            if (!skipSave && typeof window !== 'undefined') {
                localStorage.setItem(
                    'slides',
                    JSON.stringify(newSlides.map(serializeSlideForStorage))
                );
            }
            set({ slides: newSlides });
        },

        setCurrentSlideId: (currentSlideId) => set({ currentSlideId }),
        setEditMode: (editMode) => set({ editMode }),
        getSlide: (id) => get().slides.find((s) => s.id === id),

        updateSlide: (id, incomingElements, incomingAppState, incomingFiles) => {
            set((state) => {
                const slideIndex = state.slides.findIndex((s) => s.id === id);
                if (slideIndex === -1) return state;

                const oldSlide = state.slides[slideIndex];
                // Ensure it's an Excalidraw slide type before proceeding with Excalidraw-specific updates
                if (
                    oldSlide.type !== SlideTypeEnum.Excalidraw &&
                    oldSlide.type !== SlideTypeEnum.Blank &&
                    oldSlide.type !== SlideTypeEnum.Title &&
                    oldSlide.type !== SlideTypeEnum.Text
                ) {
                    // console.warn(`updateSlide called for non-Excalidraw slide type: ${oldSlide.type}`);
                    return state;
                }
                const oldExcalidrawSlide = oldSlide as ExcalidrawSlideData;

                let hasMeaningfulChange = false;

                const filteredIncomingElements = incomingElements.filter((e) => !e.isDeleted);
                if (!isEqual(oldExcalidrawSlide.elements, filteredIncomingElements)) {
                    hasMeaningfulChange = true;
                }

                const newAppStateForStore: PartialAppState = {
                    ...(oldExcalidrawSlide.appState || {}),
                };
                let appStateChanged = false;

                for (const key of CONTROLLED_APPSTATE_PROPS) {
                    if (incomingAppState.hasOwnProperty(key)) {
                        if (!isEqual(oldExcalidrawSlide.appState?.[key], incomingAppState[key])) {
                            (newAppStateForStore as any)[key] = incomingAppState[key];
                            appStateChanged = true;
                        }
                    }
                }
                // Always update collaborators from the incoming full AppState (it's a ReadonlyMap from Excalidraw)
                if (
                    !isEqual(
                        oldExcalidrawSlide.appState?.collaborators,
                        incomingAppState.collaborators
                    )
                ) {
                    newAppStateForStore.collaborators = incomingAppState.collaborators; // Store the Map directly
                    appStateChanged = true;
                }

                if (appStateChanged) hasMeaningfulChange = true;

                if (!isEqual(oldExcalidrawSlide.files, incomingFiles)) {
                    hasMeaningfulChange = true;
                }

                if (!hasMeaningfulChange) return state;

                const updatedSlide: ExcalidrawSlideData = {
                    ...oldExcalidrawSlide,
                    elements: filteredIncomingElements,
                    appState: newAppStateForStore,
                    files: incomingFiles,
                };

                const newSlidesArray = state.slides.map((s, index) =>
                    index === slideIndex ? updatedSlide : s
                );

                if (typeof window !== 'undefined') {
                    localStorage.setItem(
                        'slides',
                        JSON.stringify(newSlidesArray.map(serializeSlideForStorage))
                    );
                }
                return { slides: newSlidesArray };
            });
        },

        addSlide: (type: SlideTypeEnum) => {
            const newSlideUntyped = createNewSlideUtil(type as any); // createNewSlideUtil might need type update
            // Ensure the new slide is correctly typed and collaborators is a Map for Excalidraw types
            let newSlide: Slide;
            if (type === SlideTypeEnum.Quiz || type === SlideTypeEnum.Feedback) {
                newSlide = { ...newSlideUntyped, type } as QuizSlideData | FeedbackSlideData;
            } else {
                newSlide = {
                    ...newSlideUntyped,
                    type,
                    appState: {
                        ...(newSlideUntyped.appState || {}),
                        collaborators: new Map<ExcalidrawSocketId, ExcalidrawCollaborator>(),
                    },
                    elements: newSlideUntyped.elements || [],
                    files: newSlideUntyped.files || null,
                } as ExcalidrawSlideData;
            }

            const newSlides = [...get().slides, newSlide];
            get().setSlides(newSlides); // This handles saving
            set({ currentSlideId: newSlide.id });
        },

        deleteSlide: (id) => {
            const currentSlides = get().slides;
            if (currentSlides.length <= 1 && currentSlides[0]?.id === id) {
                toast.warn('Cannot delete the last slide. Add another slide first.');
                return;
            }

            const slideIndex = currentSlides.findIndex((s) => s.id === id);
            if (slideIndex === -1) return;

            const newSlides = currentSlides.filter((s) => s.id !== id);
            let newCurrentSlideId = get().currentSlideId;

            if (get().currentSlideId === id) {
                if (newSlides.length > 0) {
                    newCurrentSlideId = newSlides[Math.max(0, slideIndex - 1)].id;
                } else {
                    newCurrentSlideId = undefined;
                }
            }
            get().setSlides(newSlides);
            set({ currentSlideId: newCurrentSlideId });
        },

        moveSlide: (dragIndex: number, hoverIndex: number) => {
            const currentSlides = get().slides;
            const newSlides = Array.from(currentSlides);
            const [draggedItem] = newSlides.splice(dragIndex, 1);
            newSlides.splice(hoverIndex, 0, draggedItem);
            get().setSlides(newSlides, true); // Skip individual save, DND might trigger multiple moves
        },

        updateQuizFeedbackSlide: (id, formData) => {
            set((state) => {
                const slideIndex = state.slides.findIndex((s) => s.id === id);
                if (slideIndex === -1) return state;

                const oldSlide = state.slides[slideIndex];
                if (
                    oldSlide.type !== SlideTypeEnum.Quiz &&
                    oldSlide.type !== SlideTypeEnum.Feedback
                ) {
                    return state; // Not a quiz/feedback slide
                }

                if (isEqual(oldSlide.elements, formData)) return state;

                const updatedSlide = { ...oldSlide, elements: formData };
                const newSlidesArray = state.slides.map((s, index) =>
                    index === slideIndex ? updatedSlide : s
                );

                if (typeof window !== 'undefined') {
                    localStorage.setItem(
                        'slides',
                        JSON.stringify(newSlidesArray.map(serializeSlideForStorage))
                    );
                }
                return { slides: newSlidesArray };
            });
        },
    };
});
