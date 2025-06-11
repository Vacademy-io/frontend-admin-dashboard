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
import { GripVertical, Presentation, Trash2, ImageOff, AlertTriangle, FileUp } from 'lucide-react'; // Added ImageOff, AlertTriangle, FileUp
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
    onAiGenerateClick: () => void;
    onPptImportClick: () => void;
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
    let isMounted = true; 

    useEffect(() => {
        isMounted = true;
        setPreviewError(false);
        setSvg(null);

        const generateThumbnail = async () => {
            if (slide.type === SlideTypeEnum.Quiz || slide.type === SlideTypeEnum.Feedback) {
                return; // No SVG generation for Quiz/Feedback
            }
            const excalidrawSlide = slide as ExcalidrawSlideData;
            if (!excalidrawSlide.elements || excalidrawSlide.elements.length === 0) {
                if (isMounted) setSvg(null);
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
    }, [slide]);

    const commonPreviewContainerClass =
        'h-full w-full rounded-md flex flex-col items-center justify-center p-1 text-xs overflow-hidden';
    const commonImageContainerClass =
        'h-full w-full rounded-md bg-white overflow-hidden border flex items-center justify-center';
    const commonTitleClass = 'text-sm text-center font-medium truncate w-full px-1 py-0.5';
    const placeholderIconClass = 'mb-1 h-6 w-6 text-gray-400';

    const renderPlaceholder = (text: string, icon?: React.ReactNode) => (
        <div className={cn(commonPreviewContainerClass, 'border border-gray-200 bg-gray-50')}>
            {icon || <Presentation className={placeholderIconClass} />}
            <div className="text-center text-gray-500">{text}</div>
        </div>
    );

    if (previewError && slide.type !== SlideTypeEnum.Quiz && slide.type !== SlideTypeEnum.Feedback) {
        return renderPlaceholder('Preview Error', <AlertTriangle className={cn(placeholderIconClass, 'text-red-400')} />);
    }

    switch (slide.type) {
        case SlideTypeEnum.Quiz: {
            const quizSlide = slide as QuizSlideData;
            return (
                <div className={cn(commonPreviewContainerClass, 'border border-orange-200 bg-orange-50 justify-center')}>
                    {quizSlide.elements?.questionName ? (
                        <div className={cn(commonTitleClass, 'text-orange-700 break-words whitespace-normal line-clamp-3')}>
                            {stripHtml(quizSlide.elements.questionName)}
                        </div>
                    ) : (
                        <div className={cn(commonTitleClass, 'text-orange-700 opacity-75')}>
                            Quiz
                        </div>
                    )}
                </div>
            );
        }
        case SlideTypeEnum.Feedback: {
            const feedbackSlide = slide as FeedbackSlideData;
            return (
                <div className={cn(commonPreviewContainerClass, 'border border-sky-200 bg-sky-50 justify-center')}>
                    {feedbackSlide.elements?.questionName ? (
                        <div className={cn(commonTitleClass, 'text-sky-700 break-words whitespace-normal line-clamp-3')}>
                            {stripHtml(feedbackSlide.elements.questionName)}
                        </div>
                    ) : (
                        <div className={cn(commonTitleClass, 'text-sky-700 opacity-75')}>
                            Feedback
                        </div>
                    )}
                </div>
            );
        }
        // Default handles Excalidraw-based slides
        default: {
            const excalidrawSlide = slide as ExcalidrawSlideData;
            if (svg) {
                return (
                    <div className={cn(commonImageContainerClass, 'border-gray-200')}>
                        <img
                            src={svg}
                            alt="Slide thumbnail"
                            className="pointer-events-none h-full w-full bg-white object-contain"
                            onError={() => {
                                if (isMounted) {
                                    setSvg(null);
                                    setPreviewError(true);
                                }
                            }}
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
    onAiGenerateClick,
    onPptImportClick,
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
            <div className="flex h-full w-72 flex-col bg-white p-3 shadow-sm">
                <div className="pb-2 pt-1">
                    <Button
                        onClick={() => setIsTypeSheetOpen(true)}
                        className="w-full gap-2 bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-600 focus-visible:ring-orange-400"
                    >
                        <span className="mr-0.5 text-lg font-semibold leading-none">+</span> Add
                        Slide
                    </Button>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={onAiGenerateClick} className="w-full text-xs">
                            Generate with AI
                        </Button>
                        <Button variant="outline" size="sm" onClick={onPptImportClick} className="w-full text-xs gap-1">
                            <FileUp className="h-3 w-3" />
                            Import PPT
                        </Button>
                    </div>
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
                    <ScrollArea className="scrollbar-thin scrollbar-thumb-slate-300 h-full rounded-md">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="slides">
                                {(provided) => (
                                    <ul
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="space-y-2"
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
                                                            'group relative mb-2 flex flex-col cursor-pointer rounded-lg border bg-white p-1.5 shadow-sm transition-all duration-150 ease-in-out hover:border-orange-400 hover:bg-orange-50/30 hover:shadow-md h-28 overflow-visible',
                                                            {
                                                                'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-500 ring-offset-1':
                                                                    slide.id === currentSlideId,
                                                                'border-slate-200': slide.id !== currentSlideId, 
                                                            }
                                                        )}
                                                        onClick={() => onSlideChange(slide.id)}
                                                    >
                                                        <div className="pointer-events-none flex-1">
                                                            <SlideTypePreview slide={slide} />
                                                        </div>
                                                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between rounded-b-md border-t border-gray-200 bg-gray-50/80 px-1.5 py-1 transition-all duration-150 z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
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
                                                                className="rounded p-1 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
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
