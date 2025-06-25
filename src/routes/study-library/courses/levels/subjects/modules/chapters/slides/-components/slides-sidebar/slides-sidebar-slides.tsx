import { Sortable, SortableDragHandle, SortableItem } from '@/components/ui/sortable';
import { truncateString } from '@/lib/reusable/truncateString';
import { useContentStore } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
import { DotsSixVertical, FileDoc, FilePdf, PlayCircle } from '@phosphor-icons/react';
import { ReactNode, useEffect } from 'react';
import {
    Slide,
    slideOrderPayloadType,
    useSlides,
} from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { useRouter } from '@tanstack/react-router';
import { useFieldArray, useForm } from 'react-hook-form';
import { CheckCircle, File, Question } from 'phosphor-react';
import { useSaveDraft } from '../../-context/saveDraftContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FormValues {
    slides: Slide[];
}

export const getIcon = (
    source_type: string,
    document_slide_type: string | undefined,
    size?: string
): ReactNode => {
    const sizeClass = `size-${size ? size : '5'}`;
    const iconClass = `${sizeClass} transition-all duration-200 ease-in-out group-hover:scale-105`;
    
    if (source_type === 'ASSIGNMENT') {
        return <File className={`${iconClass} text-blue-500`} />;
    }
    
    const type =
        source_type === 'QUESTION'
            ? 'QUESTION'
            : source_type === 'VIDEO'
              ? 'VIDEO'
              : source_type === 'DOCUMENT' && document_slide_type;
              
    switch (type) {
        case 'PDF':
            return <FilePdf className={`${iconClass} text-red-500`} />;
        case 'VIDEO':
            return <PlayCircle className={`${iconClass} text-green-500`} />;
        case 'DOC':
        case 'DOCX':
            return <FileDoc className={`${iconClass} text-blue-600`} />;
        case 'QUESTION':
            return <Question className={`${iconClass} text-purple-500`} />;
        default:
            return <></>;
    }
};

// Enhanced Slide Item Component
const SlideItem = ({ 
    slide, 
    index, 
    isActive, 
    onClick 
}: { 
    slide: Slide; 
    index: number; 
    isActive: boolean; 
    onClick: () => void;
}) => {
    const getSlideTitle = () => {
        return (slide.source_type === 'DOCUMENT' && slide.document_slide?.title) ||
               (slide.source_type === 'VIDEO' && slide.video_slide?.title) ||
               (slide.source_type === 'QUESTION' && slide?.title) ||
               (slide.source_type === 'ASSIGNMENT' && slide?.title) ||
               'Untitled';
    };

    const getStatusBadge = () => {
        const status = slide.status;
        if (status === 'DRAFT') {
            return (
                <div className="inline-flex items-center px-1 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-600 rounded-full border border-yellow-200">
                    D
                </div>
            );
        }
        if (status === 'PUBLISHED') {
            return (
                <CheckCircle
                    weight="fill"
                    className="text-green-500 transition-transform duration-200 group-hover:scale-110"
                    size={14}
                />
            );
        }
        if (status === 'UNSYNC') {
            return (
                <div className="inline-flex items-center px-1 py-0.5 text-xs font-medium bg-orange-50 text-orange-600 rounded-full border border-orange-200">
                    U
                </div>
            );
        }
        return null;
    };

    return (
        <SortableItem value={slide.id} asChild className="cursor-pointer group">
            <div 
                className="w-full transform transition-all duration-300 ease-in-out hover:scale-[1.01] animate-in fade-in slide-in-from-left-2" 
                onClick={onClick}
            >
                <div
                    className={`
                        flex w-full items-center gap-2.5 rounded-lg px-3 py-2
                        transition-all duration-300 ease-in-out
                        border backdrop-blur-sm
                        ${isActive
                            ? 'border-primary-300 bg-primary-50/80 text-primary-600 shadow-md shadow-primary-100/50'
                            : 'border-neutral-100 bg-white/60 text-neutral-600 hover:border-primary-200 hover:bg-primary-25 hover:text-primary-500 hover:shadow-sm'
                        }
                        group-hover:shadow-md
                    `}
                >
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="w-full">
                                <div className="flex flex-1 items-center gap-2.5">
                                    {/* Slide Number with enhanced styling */}
                                    <div className={`
                                        flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold
                                        transition-all duration-200 ease-in-out group-hover:scale-105
                                        ${isActive 
                                            ? 'bg-primary-500 text-white shadow-sm' 
                                            : 'bg-neutral-100 text-neutral-500 group-hover:bg-primary-100 group-hover:text-primary-600'
                                        }
                                    `}>
                                        {index + 1}
                                    </div>
                                    
                                    {/* Icon with enhanced styling */}
                                    <div className="flex-shrink-0">
                                        {getIcon(slide.source_type, slide.document_slide?.type, '4')}
                                    </div>
                                    
                                    {/* Content area */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate leading-tight">
                                            {truncateString(getSlideTitle(), 18)}
                                        </p>
                                        <p className="text-xs text-neutral-400 capitalize mt-0.5 leading-tight">
                                            {slide.source_type.toLowerCase().replace('_', ' ')}
                                        </p>
                                    </div>
                                    
                                    {/* Status indicator */}
                                    <div className="flex-shrink-0">
                                        {getStatusBadge()}
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent 
                                className="border border-neutral-300 bg-white/95 backdrop-blur-sm text-neutral-700 shadow-lg max-w-xs"
                                side="right"
                            >
                                <div className="space-y-1">
                                    <p className="font-medium">{getSlideTitle()}</p>
                                    <p className="text-xs text-neutral-500 capitalize">
                                        {slide.source_type.toLowerCase().replace('_', ' ')} • {slide.status.toLowerCase()}
                                    </p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    {/* Drag handle with enhanced styling */}
                    <div className="drag-handle-container opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <SortableDragHandle
                            variant="ghost"
                            size="icon"
                            className="cursor-grab hover:bg-neutral-100 active:cursor-grabbing h-6 w-6 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            <DotsSixVertical className="size-3 shrink-0 text-neutral-400" />
                        </SortableDragHandle>
                    </div>
                </div>
            </div>
        </SortableItem>
    );
};

export const ChapterSidebarSlides = ({
    handleSlideOrderChange,
}: {
    handleSlideOrderChange: (slideOrderPayload: slideOrderPayloadType) => void;
}) => {
    const { setItems, activeItem, setActiveItem, items } = useContentStore();
    const router = useRouter();
    const { chapterId, slideId } = router.state.location.search;
    const { slides, isLoading, refetch } = useSlides(chapterId || '');
    const { getCurrentEditorHTMLContent, saveDraft } = useSaveDraft();

    useEffect(() => {
        refetch();
    }, []);

    const handleSlideClick = async (slide: Slide) => {
        // Check if we need to save the current slide before switching
        if (
            activeItem &&
            activeItem.source_type === 'DOCUMENT' &&
            activeItem.document_slide?.type === 'DOC'
        ) {
            const currentContent = getCurrentEditorHTMLContent();
            if (currentContent) {
                if (
                    (activeItem.status === 'UNSYNC' || activeItem.status === 'DRAFT') &&
                    activeItem.document_slide.data !== currentContent
                ) {
                    await saveDraft(activeItem);
                } else if (
                    activeItem.status === 'PUBLISHED' &&
                    activeItem.document_slide.published_data !== currentContent
                ) {
                    await saveDraft(activeItem);
                }
            }
        }

        // Now set the new active item
        setActiveItem(slide);
    };

    const form = useForm<FormValues>({
        defaultValues: {
            slides: items || [],
        },
    });

    const { move } = useFieldArray({
        control: form.control,
        name: 'slides',
    });

    const handleMove = ({ activeIndex, overIndex }: { activeIndex: number; overIndex: number }) => {
        move(activeIndex, overIndex);

        // Create order payload after move
        const updatedFields = form.getValues('slides');

        // Create order payload with the updated order
        const orderPayload = updatedFields.map((slide, index) => ({
            slide_id: slide.id,
            slide_order: index + 1,
        }));

        // Call the handler to update the order through API
        handleSlideOrderChange(orderPayload);
    };

    useEffect(() => {
        form.setValue('slides', items || []);
    }, [items]);

    useEffect(() => {
        if (slides?.length) {
            form.reset({ slides });
            setItems(slides as Slide[]);

            if (slideId) {
                const targetSlide = slides.find((item) => item.id === slideId) as Slide | undefined;
                if (targetSlide) {
                    setActiveItem(targetSlide);
                    return;
                }
            }

            setActiveItem(slides[0] as Slide);
        } else {
            if (slideId == undefined) {
                setActiveItem(null);
            } else {
                setActiveItem({
                    id: slideId,
                    source_id: '',
                    source_type: '',
                    title: '',
                    image_file_id: '',
                    description: '',
                    status: '',
                    slide_order: 0,
                    video_slide: null,
                    document_slide: null,
                    question_slide: null,
                    assignment_slide: null,
                    is_loaded: false,
                    new_slide: false,
                });
            }
        }
    }, [slides]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-6 animate-in fade-in duration-500">
                <DashboardLoader />
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-3 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3 animate-pulse">
                    <File className="w-6 h-6 text-neutral-400" />
                </div>
                <h3 className="text-base font-medium text-neutral-600 mb-1">No slides yet</h3>
                <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                    Add your first slide to get started
                </p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Sortable value={items} onMove={handleMove} fast={false}>
                <div className="flex w-full flex-col gap-1.5 text-neutral-600 px-1">
                    {items.map((slide, index) => (
                        <SlideItem
                            key={slide.id}
                            slide={slide}
                            index={index}
                            isActive={slide.id === activeItem?.id}
                            onClick={() => handleSlideClick(slide)}
                        />
                    ))}
                </div>
            </Sortable>
        </div>
    );
};
