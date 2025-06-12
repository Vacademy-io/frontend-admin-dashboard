/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { useSlideStore } from '@/stores/Slides/useSlideStore';
import type { RecommendationBatch, Slide as AppSlide, QuizSlideData, FeedbackSlideData, ExcalidrawSlideData } from '@/stores/Slides/useSlideStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SlideEditor } from '../SlideEditor';
import { QuizSlide } from '../slidesTypes/QuizSlides';
import { SlideTypeEnum } from '../utils/types';
import { Wand2, Sparkles, X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';


// --- A self-contained renderer that takes slide data directly ---
const DirectSlideRenderer = ({ slide }: { slide: AppSlide }) => {
    if (!slide) return null;

    switch (slide.type) {
        case SlideTypeEnum.Quiz:
        case SlideTypeEnum.Feedback:
            const quizOrFeedbackSlide = slide as QuizSlideData | FeedbackSlideData;
            return (
                <QuizSlide
                    formdata={quizOrFeedbackSlide.elements}
                    className={'flex h-full flex-col rounded-lg bg-white p-4 shadow-inner sm:p-6'}
                    questionType={slide.type}
                    currentSlideId={slide.id}
                    key={slide.id}
                    isPresentationMode={true} // Non-interactive preview
                />
            );
        default:
            const excalidrawSlide = slide as ExcalidrawSlideData;
            return (
                <SlideEditor
                    editMode={false} // Non-interactive preview
                    slide={excalidrawSlide}
                    onSlideChange={() => {}} // No-op for preview
                />
            );
    }
};


// --- Re-usable Slide Preview (Now using DirectSlideRenderer) ---
const SlidePreview = ({ slide }: { slide: AppSlide }) => (
    <div className="w-full aspect-[16/9] bg-white rounded-md border border-slate-300 overflow-hidden shadow-sm pointer-events-none">
        <div className="transform scale-[0.3] origin-top-left w-[333.33%] h-[333.33%]">
             <DirectSlideRenderer slide={slide} />
        </div>
    </div>
);


// --- Main Overlay Component ---
interface RecommendationOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onAddSlide: (slide: AppSlide) => void;
}

export const RecommendationOverlay: React.FC<RecommendationOverlayProps> = ({ isOpen, onClose, onAddSlide }) => {
    const { recommendationBatches, removeRecommendation } = useSlideStore(state => ({
        recommendationBatches: state.recommendationBatches,
        removeRecommendation: state.removeRecommendation,
    }));

    const [currentIndex, setCurrentIndex] = useState(0);

    // Flatten the batches into a single array for easier navigation, while keeping the timestamp
    const allRecommendations = useMemo(() => {
        return recommendationBatches.flatMap(batch => 
            batch.slides.map(slide => ({ ...slide, timestamp: batch.timestamp }))
        );
    }, [recommendationBatches]);

    const currentSlide = allRecommendations[currentIndex];

    // Reset index when modal is closed or the list of recommendations changes
    useEffect(() => {
        if (!isOpen) {
            // Delay reset to allow closing animation
            setTimeout(() => setCurrentIndex(0), 300);
        }
    }, [isOpen]);

    // Effect to handle the current index if a slide is removed (e.g., added to presentation)
     useEffect(() => {
        if (allRecommendations.length > 0 && currentIndex >= allRecommendations.length) {
            setCurrentIndex(allRecommendations.length - 1);
        }
    }, [allRecommendations.length, currentIndex]);


    const handleAddClick = () => {
        if (!currentSlide) return;
        onAddSlide(currentSlide);
        // The state update from useSlideStore will trigger a re-render and the useEffect above
        // will adjust the index if necessary.
        removeRecommendation(currentSlide.timestamp, currentSlide.id);
    };

    const goToNext = () => {
        if (currentIndex < allRecommendations.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[60vw] max-w-none h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b shrink-0">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="text-orange-500" /> AI Slide Recommendations
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-grow bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
                    {allRecommendations.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-slate-500">No recommendations available at the moment.</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-full h-full p-8 gap-4">
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full shrink-0" onClick={goToPrev} disabled={currentIndex === 0}>
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                            
                            <div className="flex-grow flex flex-col items-center justify-center h-full w-full max-w-4xl">
                                <div className="w-full flex-grow relative flex items-center justify-center">
                                    <SlidePreview slide={currentSlide} />
                                </div>
                                <div className="w-full pt-4 text-center shrink-0">
                                    {currentSlide.name && (
                                        <p className="text-lg font-semibold text-slate-800 truncate" title={currentSlide.name}>
                                            {currentSlide.name}
                                        </p>
                                    )}
                                    <p className="text-sm text-slate-500">
                                        Recommendation {currentIndex + 1} of {allRecommendations.length} (from {currentSlide.timestamp})
                                    </p>
                                </div>
                            </div>
                            
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full shrink-0" onClick={goToNext} disabled={currentIndex >= allRecommendations.length - 1}>
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </div>
                    )}
                </div>
                {currentSlide && (
                     <div className="p-4 border-t bg-white flex justify-center shrink-0">
                        <Button 
                            className="w-1/2" 
                            size="lg"
                            onClick={handleAddClick}
                        >
                            <Plus className="mr-2 size-5" /> Add After Current Slide
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};


// --- Toast Notification Component ---
interface RecommendationToastProps {
  onShowRecommendations: () => void;
}

export const RecommendationToast: React.FC<RecommendationToastProps> = ({ onShowRecommendations }) => {
    const [isVisible, setIsVisible] = useState(false);
    const recommendationBatches = useSlideStore(state => state.recommendationBatches);

    useEffect(() => {
        if (recommendationBatches.length > 0) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [recommendationBatches]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-24 right-5 z-[2000] animate-in slide-in-from-right-10 duration-500">
            <div className="p-4 bg-white rounded-lg shadow-2xl border border-slate-200 flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-full">
                    <Wand2 className="size-6 text-purple-600" />
                </div>
                <div>
                    <p className="font-semibold text-slate-800">New AI Recommendations</p>
                    <p className="text-sm text-slate-500">Suggestions are ready for you.</p>
                </div>
                <Button size="sm" onClick={onShowRecommendations}>Check</Button>
                <Button variant="ghost" size="icon" className="size-7 absolute -top-2 -right-2 bg-white rounded-full" onClick={() => setIsVisible(false)}>
                    <X className="size-4" />
                </Button>
            </div>
        </div>
    );
}; 