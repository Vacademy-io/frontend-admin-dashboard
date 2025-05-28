/* eslint-disable */
// @ts-nocheck
import { create } from 'zustand';
import isEqual from 'lodash.isequal';
import { toast } from 'sonner'; // Assuming toast is imported for notifications

// Assuming types.ts is correctly set up and imported
// Adjust paths as per your project structure
import type {
    Slide,
    ExcalidrawSlideData,
    QuizSlideData,
    FeedbackSlideData,
    AppState as ExcalidrawAppState, // Full AppState from Excalidraw
    PartialAppState, // Partial AppState for internal state/initial data
    ExcalidrawBinaryFiles,
    QuestionFormData,
    ExcalidrawElement, // Ensure this is imported for elements type
    ExcalidrawSocketId, // For collaborator keys
    ExcalidrawCollaborator, // For collaborator values
} from '@/components/common/slides/utils/types';

import { SlideTypeEnum } from '@/components/common/slides/utils/types';
import { defaultSlides as initialDefaultSlides } from '@/components/common/slides/constant/defaultSlides';
import { createNewSlide as createNewSlideUtil } from '@/components/common/slides/utils/util';

// Props from AppState that are controlled by the Excalidraw component state
// and should be persisted if they change.
// Props from AppState that are controlled by Excalidraw and should be persisted
// if they change, to maintain the slide's specific drawing context.
// Adjust this list based on which AppState properties you truly want to save and restore per slide.
const CONTROLLED_APPSTATE_PROPS: (keyof PartialAppState)[] = [
    // View related
    'viewBackgroundColor',
    'theme', // 'light' | 'dark'
    'gridSize',
    'zenModeEnabled',

    // Current item styling (tool options for next shape)
    'currentItemStrokeColor',
    'currentItemBackgroundColor', // Relevant for shapes with fill
    'currentItemFillStyle', // e.g., 'hachure', 'cross-hatch', 'solid'
    'currentItemStrokeWidth',
    'currentItemStrokeStyle', // e.g., 'solid', 'dashed', 'dotted'
    'currentItemRoughness', // 0, 1, 2 (level of "sketchiness")
    'currentItemOpacity', // 0-100
    'currentItemFontFamily', // Font family_id (number)
    'currentItemFontSize', // Font size (number)
    'currentItemTextAlign', // 'left', 'center', 'right'
    'currentItemStartArrowhead', // Arrowhead type string or null
    'currentItemEndArrowhead', // Arrowhead type string or null
    'currentItemRoundness', // 'round' | 'sharp' (for linear elements or rectangle radius)

    // Potentially others, like 'name' if you name your Excalidraw scenes per slide
    // 'name',

    // Be cautious about adding highly transient states like 'activeTool',
    // 'editingElement', etc., unless you have a specific reason to restore them.
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
                collaboratorsMap = new Map(
                    storedSlide.appState.collaborators as [
                        ExcalidrawSocketId,
                        ExcalidrawCollaborator,
                    ][]
                );
            } catch (e) {
                console.warn(
                    'Could not parse collaborators array into Map, defaulting to empty Map.',
                    e
                );
                collaboratorsMap = new Map<ExcalidrawSocketId, ExcalidrawCollaborator>();
            }
        } else if (
            typeof storedSlide.appState.collaborators === 'object' &&
            Object.keys(storedSlide.appState.collaborators).length === 0
        ) {
            collaboratorsMap = new Map<ExcalidrawSocketId, ExcalidrawCollaborator>();
        }
    }
    return {
        ...storedSlide,
        appState: {
            ...(storedSlide.appState || {}), // Ensure appState object exists
            collaborators: collaboratorsMap,
        },
    } as ExcalidrawSlideData; // More specific assertion for Excalidraw-based slides
};

interface SlideStore {
    slides: Slide[];
    currentSlideId: string | undefined;
    editMode: boolean;
    setSlides: (slides: Slide[], skipSave?: boolean) => void;
    setCurrentSlideId: (id: string | undefined) => void;
    setEditMode: (editMode: boolean) => void;
    getSlide: (id: string) => Slide | undefined;
    updateSlide: (
        id: string,
        elements: readonly ExcalidrawElement[],
        appState: ExcalidrawAppState, // Full AppState from Excalidraw
        files: ExcalidrawBinaryFiles
    ) => void;
    addSlide: (type: SlideTypeEnum) => void;
    deleteSlide: (id: string) => void;
    moveSlide: (dragIndex: number, hoverIndex: number) => void;
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
            initialSlides = [];
        }
    }

    if (initialSlides.length === 0) {
        initialSlides = initialDefaultSlides.map(deserializeSlideFromStorage);
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

        updateSlide: (
            id: string,
            incomingElements: readonly ExcalidrawElement[],
            incomingAppState: ExcalidrawAppState, // Full AppState from Excalidraw
            incomingFiles: ExcalidrawBinaryFiles
        ) => {
            console.log('new');
            set((state) => {
                const slideIndex = state.slides.findIndex((s) => s.id === id);
                if (slideIndex === -1) {
                    console.warn(`updateSlide: Slide with id ${id} not found.`);
                    return state;
                }

                const oldSlide = state.slides[slideIndex];
                // Ensure it's an Excalidraw-type slide before proceeding
                if (
                    oldSlide.type !== SlideTypeEnum.Excalidraw &&
                    oldSlide.type !== SlideTypeEnum.Blank &&
                    oldSlide.type !== SlideTypeEnum.Title &&
                    oldSlide.type !== SlideTypeEnum.Text
                ) {
                    console.warn(
                        `updateSlide called for non-Excalidraw slide type: ${oldSlide.type}`
                    );
                    return state;
                }
                const oldExcalidrawSlide = oldSlide as ExcalidrawSlideData;

                let hasMeaningfulChange = false;

                // 1. Compare Elements
                const filteredIncomingElements = incomingElements.filter((e) => !e.isDeleted);
                if (!isEqual(oldExcalidrawSlide.elements, filteredIncomingElements)) {
                    hasMeaningfulChange = true;
                }

                // 2. Handle AppState (Revised AppState Handling)
                const newAppStateForStore: PartialAppState = {};

                // Populate with properties defined in CONTROLLED_APPSTATE_PROPS
                // using their values from the incoming full AppState from Excalidraw.
                for (const key of CONTROLLED_APPSTATE_PROPS) {
                    if (incomingAppState.hasOwnProperty(key)) {
                        // Type assertion needed if PartialAppState keys are more restrictive
                        (newAppStateForStore as any)[key] = incomingAppState[key];
                    }
                }

                // Handle collaborators separately (as it's a Map and needs careful handling for storage/comparison)
                if (incomingAppState.collaborators instanceof Map) {
                    newAppStateForStore.collaborators = incomingAppState.collaborators;
                } else {
                    // Fallback: if collaborators is not a Map (e.g. array or undefined from older state/bad data)
                    // Create a new Map. Excalidraw's onChange should provide a ReadonlyMap.
                    newAppStateForStore.collaborators = new Map(
                        incomingAppState.collaborators || []
                    );
                }

                // Determine if the relevant parts of AppState actually changed
                let appStateActuallyChanged = false;
                const oldStoredAppState = oldExcalidrawSlide.appState || {};

                for (const key of CONTROLLED_APPSTATE_PROPS) {
                    if (!isEqual(oldStoredAppState[key], newAppStateForStore[key])) {
                        appStateActuallyChanged = true;
                        break;
                    }
                }
                // If no change in other controlled props, check collaborators specifically
                if (!appStateActuallyChanged) {
                    if (
                        !isEqual(oldStoredAppState.collaborators, newAppStateForStore.collaborators)
                    ) {
                        appStateActuallyChanged = true;
                    }
                }

                if (appStateActuallyChanged) {
                    hasMeaningfulChange = true;
                }

                // 3. Compare Files
                if (!isEqual(oldExcalidrawSlide.files, incomingFiles)) {
                    hasMeaningfulChange = true;
                }

                // If nothing meaningful changed, return the original state to avoid unnecessary re-renders/saves
                if (!hasMeaningfulChange) {
                    return state;
                }

                const updatedSlide: ExcalidrawSlideData = {
                    ...oldExcalidrawSlide,
                    elements: filteredIncomingElements,
                    appState: newAppStateForStore, // Contains only controlled properties + collaborators
                    files: incomingFiles,
                };

                const newSlidesArray = state.slides.map((s, index) =>
                    index === slideIndex ? updatedSlide : s
                );

                if (typeof window !== 'undefined') {
                    localStorage.setItem(
                        'slides',
                        JSON.stringify(newSlidesArray.map(serializeSlideForStorage)) // Ensure serializeSlideForStorage handles the new appState structure
                    );
                }
                return { slides: newSlidesArray };
            });
        },

        addSlide: (type: SlideTypeEnum) => {
            const newSlideUntyped = createNewSlideUtil(type); // createNewSlideUtil should handle type correctly
            let newSlide: Slide;

            if (type === SlideTypeEnum.Quiz || type === SlideTypeEnum.Feedback) {
                newSlide = { ...newSlideUntyped, type } as QuizSlideData | FeedbackSlideData;
            } else {
                // Ensure Excalidraw-based slides have a minimal valid appState and elements/files
                newSlide = {
                    ...newSlideUntyped,
                    type,
                    elements: newSlideUntyped.elements || [],
                    appState: {
                        ...(newSlideUntyped.appState || {}), // Include any defaults from createNewSlideUtil
                        collaborators: new Map<ExcalidrawSocketId, ExcalidrawCollaborator>(), // Ensure collaborators is a Map
                    },
                    files: newSlideUntyped.files || null, // ExcalidrawBinaryFiles can be null
                } as ExcalidrawSlideData;
            }

            const currentSlides = get().slides;
            const newSlides = [...currentSlides, newSlide];
            get().setSlides(newSlides); // This handles saving to localStorage
            set({ currentSlideId: newSlide.id }); // Set the new slide as current
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
                    // Select the previous slide, or the first slide if the deleted one was the first
                    newCurrentSlideId = newSlides[Math.max(0, slideIndex - 1)].id;
                } else {
                    newCurrentSlideId = undefined; // No slides left
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
            get().setSlides(newSlides, true); // Skip individual save for DND, save after operation
            // Optionally, persist immediately after DND reordering if desired
            // if (typeof window !== 'undefined') {
            //     localStorage.setItem('slides', JSON.stringify(newSlides.map(serializeSlideForStorage)));
            // }
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
                    return state;
                }

                // Assuming elements store the formData for Quiz/Feedback slides
                if (isEqual((oldSlide as QuizSlideData | FeedbackSlideData).elements, formData)) {
                    return state; // No change
                }

                const updatedSlide = {
                    ...oldSlide,
                    elements: formData,
                } as QuizSlideData | FeedbackSlideData;

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
