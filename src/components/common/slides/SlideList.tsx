/* eslint-disable */
// @ts-nocheck
'use client';

import React, { useState, useEffect, memo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { exportToSvg } from '@excalidraw/excalidraw'; // Ensure correct import
import { GripVertical, Presentation, Trash2, ImageOff, AlertTriangle } from 'lucide-react'; // Added ImageOff, AlertTriangle
import { ExportIcon, ImportIcon } from './Icons'; // Assuming these are well-styled
import { SlideTypeSheet } from './slideTypeSheet';
import type {
    Slide as AppSlide,
    ExcalidrawSlideData,
    QuizSlideData,
    FeedbackSlideData,
    PartialAppState,
    ExcalidrawBinaryFiles,
} from './types'; // Using refined Slide type
import { SlideTypeEnum } from '././utils/types'; // Using enum from types.ts
import { QuzizIcon, feedbackIcon } from '@/svgs'; // Assuming these are paths to SVGs/images

interface SlideListProps {
    slides: AppSlide[];
    currentSlideId: string | undefined;
    onSlideChange: (id: string) => void;
    onAddSlide: (type: SlideTypeEnum) => void; // Use SlideTypeEnum
    onDeleteSlide: (id: string) => void;
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onReorderSlides: (newSlides: AppSlide[]) => void;
    // onMoveSlideUp and onMoveSlideDown are not directly used if DND is primary
}

interface PreviewProps {
    slide: AppSlide; // Use the main Slide union type
}

function stripHtml(html: string): string {
    if (typeof document === 'undefined') return html;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}

const SlideTypePreview = memo(({ slide }: PreviewProps) => {
    const [svg, setSvg] = useState<string | null>(null);
    const [previewError, setPreviewError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setPreviewError(false);
        setSvg(null); // Reset SVG on slide change

        const generateThumbnail = async () => {
            if (slide.type === SlideTypeEnum.Quiz || slide.type === SlideTypeEnum.Feedback) {
                // No SVG for Quiz/Feedback, handled by specific cases
                return;
            }

            // Handle Excalidraw-based slides
            const excalidrawSlide = slide as ExcalidrawSlideData; // Type assertion
            if (!excalidrawSlide.elements || excalidrawSlide.elements.length === 0) {
                if (isMounted) setSvg(null); // Will show placeholder for blank Excalidraw
                return;
            }

            try {
                const appStateForExport: PartialAppState & {
                    exportWithDarkMode: boolean;
                    viewBackgroundColor: string;
                    theme: string;
                    exportEmbedScene: boolean;
                } = {
                    ...(excalidrawSlide.appState || {}),
                    exportEmbedScene: true,
                    exportWithDarkMode: false,
                    viewBackgroundColor: excalidrawSlide.appState?.viewBackgroundColor || '#FFFFFF',
                    theme: 'light',
                };

                const svgElement = await exportToSvg({
                    elements: excalidrawSlide.elements,
                    appState: appStateForExport,
                    files: excalidrawSlide.files || null,
                });

                svgElement.setAttribute('width', '100%');
                svgElement.setAttribute('height', '100%');

                const serializer = new XMLSerializer();
                let svgStr = serializer.serializeToString(svgElement);
                if (!svgStr.includes('xmlns="http://www.w3.org/2000/svg"')) {
                    svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
                }
                const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`;
                if (isMounted) setSvg(dataUrl);
            } catch (error) {
                console.error('Error generating Excalidraw thumbnail for slide:', slide.id, error);
                if (isMounted) {
                    setSvg(null);
                    setPreviewError(true);
                }
            }
        };

        generateThumbnail();

        return () => {
            isMounted = false;
        };
    }, [slide]); // Regenerate if slide content or type changes

    const commonPreviewContainerClass =
        'h-20 w-full rounded-md flex flex-col items-center justify-center p-1 text-xs overflow-hidden';
    const commonImageContainerClass =
        'h-full w-full rounded-md bg-white overflow-hidden border flex items-center justify-center';
    const commonTitleClass = 'text-xs text-center font-medium truncate w-full px-1 py-0.5';
    const placeholderIconClass = 'mb-1 h-6 w-6 text-gray-400';

    const renderPlaceholder = (text: string, icon?: React.ReactNode) => (
        <div className={cn(commonPreviewContainerClass, 'border border-gray-200 bg-gray-50')}>
            {icon || <Presentation className={placeholderIconClass} />}
            <div className="text-center text-gray-500">{text}</div>
        </div>
    );

    if (
        previewError &&
        slide.type !== SlideTypeEnum.Quiz &&
        slide.type !== SlideTypeEnum.Feedback
    ) {
        return renderPlaceholder(
            'Preview Error',
            <AlertTriangle className={cn(placeholderIconClass, 'text-red-400')} />
        );
    }

    switch (slide.type) {
        case SlideTypeEnum.Quiz: {
            const quizSlide = slide as QuizSlideData;
            return (
                <div
                    className={cn(
                        commonPreviewContainerClass,
                        'border border-orange-200 bg-orange-50'
                    )}
                >
                    {quizSlide.elements?.questionName && (
                        <div className={cn(commonTitleClass, 'text-orange-700')}>
                            {stripHtml(quizSlide.elements.questionName)}
                        </div>
                    )}
                    <div className={cn(commonImageContainerClass, 'border-orange-100')}>
                        <img
                            src={QuzizIcon as string} // Assuming QuzizIcon is a string path or data URL
                            alt="Quiz slide"
                            className="pointer-events-none max-h-[45%] max-w-[45%] object-contain"
                        />
                    </div>
                </div>
            );
        }
        case SlideTypeEnum.Feedback: {
            const feedbackSlide = slide as FeedbackSlideData;
            return (
                <div className={cn(commonPreviewContainerClass, 'border border-sky-200 bg-sky-50')}>
                    {feedbackSlide.elements?.questionName && (
                        <div className={cn(commonTitleClass, 'text-sky-700')}>
                            {stripHtml(feedbackSlide.elements.questionName)}
                        </div>
                    )}
                    <div className={cn(commonImageContainerClass, 'border-sky-100')}>
                        <img
                            src={feedbackIcon as string} // Assuming feedbackIcon is a string path or data URL
                            alt="Feedback slide"
                            className="pointer-events-none max-h-[45%] max-w-[45%] object-contain"
                        />
                    </div>
                </div>
            );
        }
        // Default handles Excalidraw-based slides
        default: {
            const excalidrawSlide = slide as ExcalidrawSlideData;
            if (svg) {
                return (
                    <div className={cn(commonImageContainerClass, 'h-20 border-gray-200')}>
                        <img
                            src={svg}
                            alt="Slide thumbnail"
                            className="pointer-events-none h-full w-full bg-white object-contain"
                            onError={() => {
                                if (isMounted) {
                                    setSvg(null);
                                    setPreviewError(true);
                                }
                            }} // isMounted check might be needed if component unmounts fast
                        />
                    </div>
                );
            }
            if (!excalidrawSlide.elements || excalidrawSlide.elements.length === 0) {
                return renderPlaceholder(
                    slide.type === SlideTypeEnum.Title
                        ? 'Title (Empty)'
                        : slide.type === SlideTypeEnum.Text
                          ? 'Text (Empty)'
                          : 'Blank Slide',
                    <ImageOff className={placeholderIconClass} />
                );
            }
            // If SVG is null but elements exist, it might be loading or a non-visual error
            return renderPlaceholder(
                slide.type === SlideTypeEnum.Title
                    ? 'Title Slide'
                    : slide.type === SlideTypeEnum.Text
                      ? 'Text Slide'
                      : 'Drawing'
            );
        }
    }
});
SlideTypePreview.displayName = 'SlideTypePreview';

const SlideList = ({
    slides,
    currentSlideId,
    onSlideChange,
    onAddSlide,
    onDeleteSlide,
    onExport,
    onImport,
    onReorderSlides,
}: SlideListProps) => {
    const [isTypeSheetOpen, setIsTypeSheetOpen] = useState(false);

    const handleSelectSlideType = (type: SlideTypeEnum) => {
        onAddSlide(type);
        setIsTypeSheetOpen(false);
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination || result.source.index === result.destination.index) return;

        const reordered = Array.from(slides);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);
        onReorderSlides(reordered);
    };

    return (
        <>
            <div className="flex h-full w-60 flex-col bg-white p-3 shadow-sm">
                <div className="pb-2 pt-1">
                    <Button
                        onClick={() => setIsTypeSheetOpen(true)}
                        className="w-full gap-2 bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-600 focus-visible:ring-orange-400"
                    >
                        <span className="mr-0.5 text-lg font-semibold leading-none">+</span> Add
                        Slide
                    </Button>
                </div>
                <Separator className="my-3 bg-gray-200" />
                <div className="mb-2 flex items-center justify-between px-1">
                    <h2 className="text-base font-semibold text-gray-700">Slides</h2>
                    <div className="flex gap-1">
                        <button
                            className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            onClick={onExport}
                            title="Export Presentation"
                        >
                            <ExportIcon width={18} height={18} />
                        </button>
                        <label className="cursor-pointer rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                            <ImportIcon width={18} height={18} />
                            <input
                                type="file"
                                onChange={onImport}
                                className="sr-only"
                                accept=".excalidraw,application/json"
                            />
                        </label>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="scrollbar-thin scrollbar-thumb-slate-300 h-full rounded-md pr-1.5">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="slides">
                                {(provided) => (
                                    <ul
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="space-y-2 p-0.5"
                                    >
                                        {slides.map((slide, index) => (
                                            <Draggable
                                                key={slide.id}
                                                draggableId={slide.id}
                                                index={index}
                                            >
                                                {(providedDraggable, snapshot) => (
                                                    <li
                                                        ref={providedDraggable.innerRef}
                                                        {...providedDraggable.draggableProps}
                                                        className={cn(
                                                            'group relative cursor-pointer rounded-lg border-2 transition-all duration-150 ease-in-out',
                                                            snapshot.isDragging
                                                                ? 'z-10 border-orange-400 bg-white shadow-xl ring-2 ring-orange-300'
                                                                : 'bg-white hover:border-gray-300 hover:shadow-sm',
                                                            slide.id === currentSlideId
                                                                ? 'border-orange-500 shadow-md ring-2 ring-orange-500/70'
                                                                : 'border-gray-200'
                                                        )}
                                                        onClick={() => onSlideChange(slide.id)}
                                                    >
                                                        <SlideTypePreview slide={slide} />
                                                        <div className="flex items-center justify-between rounded-b-md border-t border-gray-200 bg-gray-50/80 px-1.5 py-1">
                                                            <div
                                                                {...providedDraggable.dragHandleProps}
                                                                className="cursor-grab rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 active:cursor-grabbing"
                                                            >
                                                                <GripVertical className="h-4 w-4" />
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-500">
                                                                {index + 1}
                                                            </span>
                                                            <button
                                                                className="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-red-100 hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDeleteSlide(slide.id);
                                                                }}
                                                                title="Delete slide"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </ul>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </ScrollArea>
                </div>
            </div>

            <SlideTypeSheet
                open={isTypeSheetOpen}
                onOpenChange={setIsTypeSheetOpen}
                onSelectType={handleSelectSlideType} // Expects SlideTypeEnum
            />
        </>
    );
};

export default memo(SlideList);
