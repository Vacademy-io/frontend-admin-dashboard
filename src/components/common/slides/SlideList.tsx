// SlideList.tsx (Updated)
/* eslint-disable */
// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ExportIcon, ImportIcon } from './Icons'; // Assuming these are well-styled
import { SlideTypeSheet } from './slideTypeSheet';
import {
    GripVertical,
    Presentation, // QrCode, Youtube, Link2, FileQuestion, MessageSquare, removed as not used in preview
    Trash2,
} from 'lucide-react';
import type { Slide } from './types';
import type { SlideType } from './constant/slideType';
import { SlideType as SlideTypeEnum } from './constant/slideType';
import { ScrollArea } from '@/components/ui/scroll-area';
import { exportToSvg } from '@excalidraw/excalidraw';
import { QuzizIcon, feedbackIcon } from '@/svgs'; // Assuming these are paths to SVGs/images

interface SlideListProps {
    slides: Slide[];
    currentSlide: string | undefined;
    onSlideChange: (id: string) => void;
    onAddSlide: (type: SlideType) => void;
    onMoveSlideUp: () => void; // Kept for interface completeness, though DND handles reorder
    onMoveSlideDown: () => void; // Kept for interface completeness
    onDeleteSlide: (id: string) => void; // Corrected: should take id
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onReorderSlides: (newSlides: Slide[]) => void;
}

interface PreviewProps {
    slide: Slide;
}

function stripHtml(html: string) {
    if (typeof document === 'undefined') return html; // Guard for SSR or non-browser environments
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}

const SlideTypePreview = React.memo(({ slide }: PreviewProps) => {
    const [svg, setSvg] = useState<string | null>(null);
    const [previewError, setPreviewError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setPreviewError(false); // Reset error state on slide change

        const generateThumbnail = async () => {
            try {
                if (![SlideTypeEnum.Feedback, SlideTypeEnum.Quiz].includes(slide.type)) {
                    if (!slide.elements || slide.elements.length === 0) {
                        // Handle blank Excalidraw slide specifically
                        if (isMounted) setSvg(null); // Will show placeholder
                        return;
                    }
                    const svgElement = await exportToSvg({
                        elements: slide.elements || [],
                        appState: {
                            ...slide.appState,
                            exportEmbedScene: true,
                            exportWithDarkMode: false,
                            viewBackgroundColor: '#ffffff', // Explicit white background for thumbnail
                            theme: 'light', // Ensure light theme for export
                        },
                        files: slide.files || null,
                    });

                    svgElement.setAttribute('width', '100%');
                    svgElement.setAttribute('height', '100%'); // Fill height of container

                    const serializer = new XMLSerializer();
                    let svgStr = serializer.serializeToString(svgElement);

                    if (!svgStr.includes('xmlns="http://www.w3.org/2000/svg"')) {
                        svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
                    }

                    const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`;
                    if (isMounted) setSvg(dataUrl);
                }
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
    }, [slide]); // Regenerate if slide content changes

    const commonPreviewContainerClass =
        'h-20 w-full rounded-md flex flex-col items-center justify-center p-1 text-xs overflow-hidden';
    const commonImageContainerClass =
        'h-full w-full rounded-md bg-white overflow-hidden border flex items-center justify-center';
    const commonTitleClass = 'text-xs text-center font-medium truncate w-full px-1 py-0.5';

    if (previewError && ![SlideTypeEnum.Feedback, SlideTypeEnum.Quiz].includes(slide.type)) {
        return (
            <div className={cn(commonPreviewContainerClass, 'bg-gray-100')}>
                <Presentation className="mb-1 h-6 w-6 text-gray-400" />
                <div className="text-gray-500">Preview Error</div>
            </div>
        );
    }

    switch (slide.type) {
        case SlideTypeEnum.Quiz:
            return (
                <div
                    className={cn(
                        commonPreviewContainerClass,
                        'border border-orange-200 bg-orange-50'
                    )}
                >
                    {slide.elements?.questionName && (
                        <div className={cn(commonTitleClass, 'text-orange-700')}>
                            {stripHtml(slide.elements.questionName)}
                        </div>
                    )}
                    <div className={cn(commonImageContainerClass, 'border-orange-100')}>
                        <img
                            src={QuzizIcon} // Ensure QuzizIcon is a valid path or data URL
                            alt="Quiz slide type"
                            className="pointer-events-none max-h-[50%] max-w-[50%] object-contain"
                            onError={() => {
                                if (svg !== null) setSvg(null);
                                setPreviewError(true);
                            }} // Basic error handling for image load
                        />
                    </div>
                </div>
            );
        case SlideTypeEnum.Feedback:
            return (
                <div className={cn(commonPreviewContainerClass, 'border border-sky-200 bg-sky-50')}>
                    {slide.elements?.questionName && (
                        <div className={cn(commonTitleClass, 'text-sky-700')}>
                            {stripHtml(slide.elements.questionName)}
                        </div>
                    )}
                    <div className={cn(commonImageContainerClass, 'border-sky-100')}>
                        <img
                            src={feedbackIcon} // Ensure feedbackIcon is a valid path or data URL
                            alt="Feedback slide type"
                            className="pointer-events-none max-h-[50%] max-w-[50%] object-contain"
                            onError={() => {
                                if (svg !== null) setSvg(null);
                                setPreviewError(true);
                            }}
                        />
                    </div>
                </div>
            );
        default: // Excalidraw based slides (Title, Text, Blank etc.)
            return svg ? (
                <div className={cn(commonImageContainerClass, 'h-20 border-gray-200')}>
                    {' '}
                    {/* Fixed height for consistency */}
                    <img
                        src={svg}
                        alt="Slide thumbnail"
                        className="pointer-events-none h-full w-full bg-white object-contain"
                        onError={() => {
                            if (svg !== null) setSvg(null);
                            setPreviewError(true);
                        }}
                    />
                </div>
            ) : (
                <div
                    className={cn(
                        commonPreviewContainerClass,
                        'border border-gray-200 bg-gray-100'
                    )}
                >
                    <Presentation className="mb-1 h-6 w-6 text-gray-400" />
                    <div className="text-gray-500">
                        {slide.type === SlideTypeEnum.Title
                            ? 'Title Slide'
                            : slide.type === SlideTypeEnum.Text
                              ? 'Text Slide'
                              : !slide.elements || slide.elements.length === 0
                                ? 'Blank Slide'
                                : 'Generic Slide'}
                    </div>
                </div>
            );
    }
});

SlideTypePreview.displayName = 'SlideTypePreview';

const SlideList = ({
    slides,
    currentSlide,
    onSlideChange,
    onAddSlide,
    // onMoveSlideUp, // Not directly used by UI if DND is primary
    // onMoveSlideDown, // Not directly used by UI
    onDeleteSlide,
    onExport,
    onImport,
    onReorderSlides,
}: SlideListProps) => {
    const [isTypeSheetOpen, setIsTypeSheetOpen] = useState(false);

    const handleSelectSlideType = (type: SlideType) => {
        onAddSlide(type);
        setIsTypeSheetOpen(false);
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const reordered = Array.from(slides);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);

        onReorderSlides(reordered);
        // localStorage.setItem("slides", JSON.stringify(reordered)) // Consider if this side-effect is desired here or in the store
    };

    return (
        <>
            <div className="flex h-full w-64 flex-col bg-white p-3">
                {' '}
                {/* Ensure full height for internal scrolling */}
                <div className="pb-1 pt-2">
                    {' '}
                    {/* Adjusted padding */}
                    <Button
                        onClick={() => setIsTypeSheetOpen(true)}
                        className="w-full gap-2 bg-orange-500 py-2 text-sm text-white hover:bg-orange-600"
                    >
                        <span className="mr-1 text-base">+</span> Add Slide
                    </Button>
                </div>
                <Separator className="my-3 bg-gray-200" />
                <div className="mb-2 flex items-center justify-between px-1">
                    {' '}
                    {/* Adjusted padding */}
                    <h2 className="text-base font-semibold text-gray-800">Slides</h2>
                    <div className="flex gap-1.5">
                        {' '}
                        {/* Adjusted gap */}
                        <button
                            className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            onClick={onExport}
                            title="Export Presentation"
                        >
                            <ExportIcon width={17} height={17} />
                        </button>
                        <label className="cursor-pointer rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                            <ImportIcon width={17} height={17} />
                            <input
                                type="file"
                                onChange={onImport}
                                className="sr-only"
                                accept=".excalidraw,application/json" // .edslides was not standard, excalidraw is more common for content
                            />
                        </label>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    {' '}
                    {/* This div will allow ScrollArea to take up remaining space */}
                    <ScrollArea className="h-full rounded-md pr-1">
                        {' '}
                        {/* pr-1 to give scrollbar some space */}
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="slides">
                                {(provided) => (
                                    <ul
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="space-y-2.5 p-1" // Adjusted spacing and padding
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
                                                            'group relative cursor-pointer rounded-lg border transition-all',
                                                            snapshot.isDragging
                                                                ? 'z-10 border-orange-400 bg-white shadow-lg ring-2 ring-orange-400' // Ensure bg is white when dragging
                                                                : 'bg-white hover:border-gray-300 hover:shadow-md',
                                                            slide.id === currentSlide
                                                                ? 'border-orange-500 ring-2 ring-orange-500' // More prominent selection
                                                                : 'border-gray-200'
                                                        )}
                                                        onClick={() => onSlideChange(slide.id)}
                                                    >
                                                        <SlideTypePreview slide={slide} />
                                                        <div className="flex items-center justify-between rounded-b-lg border-t border-gray-200 bg-gray-50 px-2 py-1.5">
                                                            <div
                                                                {...providedDraggable.dragHandleProps}
                                                                className="cursor-grab rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                                                            >
                                                                <GripVertical className="h-4 w-4" />
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-600">
                                                                {index + 1}
                                                            </span>
                                                            <button
                                                                className="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-red-100 hover:text-red-600 group-hover:opacity-100"
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevent slide selection
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
                onSelectType={handleSelectSlideType}
            />
        </>
    );
};

export default React.memo(SlideList);
