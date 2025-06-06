/* eslint-disable */
// @ts-nocheck
import React, { useMemo } from 'react';
import debounce from 'lodash.debounce';
import { SlideEditor } from './SlideEditor';
import { QuizSlide } from './slidesTypes/QuizSlides';
import { useSlideStore } from '@/stores/Slides/useSlideStore';
import type {
    Slide as AppSlide,
    ExcalidrawSlideData,
    QuizSlideData,
    FeedbackSlideData,
    AppState as ExcalidrawAppState,
    ExcalidrawElement,
    ExcalidrawBinaryFiles,
} from './utils/types';
import { SlideTypeEnum } from './utils/types';

interface SlideRendererProps {
    currentSlideId: string;
    editMode: boolean;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({ currentSlideId, editMode }) => {
    const getSlide = useSlideStore((state) => state.getSlide);
    const rawUpdateSlide = useSlideStore((state) => state.updateSlide);

    const debouncedUpdateSlide = useMemo(
        () =>
            debounce(
                (
                    id: string,
                    elements: readonly ExcalidrawElement[],
                    appState: ExcalidrawAppState,
                    files: ExcalidrawBinaryFiles
                ) => {
                    if (id) {
                        rawUpdateSlide(id, elements, appState, files);
                    }
                },
                2000
            ),
        [rawUpdateSlide]
    );
    const slide = getSlide(currentSlideId);

    if (!slide) {
        return (
            <div className="flex h-full items-center justify-center text-lg text-red-500">
                Slide data not found.
            </div>
        );
    }
    console.log('[SlideRenderer] Current slide object (for Quiz/Feedback check):', JSON.parse(JSON.stringify(slide)));

    const slideEditorKey = `${slide.id}-${(slide as ExcalidrawSlideData).elements?.length}-${(slide as ExcalidrawSlideData).appState?.zenModeEnabled}`;
    const quizSlideKey = `${slide.id}-${(slide as QuizSlideData).elements?.questionName}`;

    switch (slide.type) {
        case SlideTypeEnum.Quiz:
        case SlideTypeEnum.Feedback:
            const quizOrFeedbackSlide = slide as QuizSlideData | FeedbackSlideData;
            // console.log('[SlideRenderer] Rendering Quiz/Feedback. Elements being passed as formdata:', JSON.parse(JSON.stringify(quizOrFeedbackSlide.elements)));
            return (
                <QuizSlide
                    formdata={quizOrFeedbackSlide.elements}
                    className={'flex h-full flex-col rounded-lg bg-white p-4 shadow-inner sm:p-6'}
                    questionType={slide.type as SlideTypeEnum.Quiz | SlideTypeEnum.Feedback}
                    currentSlideId={currentSlideId}
                    key={quizSlideKey}
                    isPresentationMode={!editMode} // This prop controls if QuizSlide is in view or edit mode
                />
            );
        default:
            const excalidrawSlide = slide as ExcalidrawSlideData;
            return (
                <SlideEditor
                    editMode={editMode} // This will be false in presentation view
                    slide={excalidrawSlide}
                    onSlideChange={(
                        elements: readonly ExcalidrawElement[],
                        appState: ExcalidrawAppState,
                        files: ExcalidrawBinaryFiles
                    ) => {
                        if (currentSlideId && editMode) { // Only update store if in editMode
                            debouncedUpdateSlide(currentSlideId, elements, appState, files);
                        }
                    }}
                    key={slideEditorKey}
                />
            );
    }
}; 