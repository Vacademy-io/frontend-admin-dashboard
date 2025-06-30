import {
    ClipboardText,
    DotsSixVertical,
    FileDoc,
    FilePdf,
    PlayCircle,
    Question,
    File,
    CheckCircle,
} from '@phosphor-icons/react';
import { Sortable, SortableDragHandle, SortableItem } from '@/components/ui/sortable';
import { truncateString } from '@/lib/reusable/truncateString';
import { useContentStore } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
import { useSlides, Slide, slideOrderPayloadType } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { useRouter } from '@tanstack/react-router';
import { useFieldArray, useForm } from 'react-hook-form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEffect } from 'react';
import { useSaveDraft } from '../../-context/saveDraftContext';

interface FormValues {
    slides: Slide[];
}

export const getIcon = (
    source_type: string,
    document_slide_type: string | undefined,
    size?: string
) => {
    const sizeClass = `size-${size || '5'}`;
    const iconClass = `${sizeClass} transition-all duration-200 ease-in-out group-hover:scale-105`;

    switch (source_type) {
        case 'ASSIGNMENT':
            return <ClipboardText className={`${iconClass} text-sky-600`} weight="duotone" />;
        case 'QUESTION':
            return <Question className={`${iconClass} text-purple-500`} />;
        case 'VIDEO':
            return <PlayCircle className={`${iconClass} text-green-500`} />;
        case 'DOCUMENT':
            if (document_slide_type === 'PDF') {
                return <FilePdf className={`${iconClass} text-red-500`} />;
            }
            if (document_slide_type === 'DOC' || document_slide_type === 'DOCX') {
                return <FileDoc className={`${iconClass} text-blue-600`} />;
            }
            return <File className={`${iconClass} text-neutral-400`} />;
        default:
            return <File className={`${iconClass} text-neutral-400`} />;
    }
};

const SlideItem = ({
    slide,
    index,
    isActive,
    onClick,
}: {
    slide: Slide;
    index: number;
    isActive: boolean;
    onClick: () => void;
}) => {
    const getSlideTitle = () =>
        slide?.title ||
        slide.document_slide?.title ||
        slide.video_slide?.title ||
        'Untitled';

    const getStatusBadge = () => {
        switch (slide.status) {
            case 'DRAFT':
                return (
                    <div className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-1 py-0.5 text-xs font-medium text-yellow-600">
                        D
                    </div>
                );
            case 'PUBLISHED':
                return <CheckCircle weight="fill" className="text-green-500" size={14} />;
            case 'UNSYNC':
                return (
                    <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-1 py-0.5 text-xs font-medium text-orange-600">
                        U
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <SortableItem value={slide.id} asChild className="group cursor-pointer">
            <div
                className="w-full transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-left-2 hover:scale-[1.01]"
                onClick={onClick}
            >
                <div
                    className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 backdrop-blur-sm transition-all
                        duration-300 ease-in-out ${
                            isActive
                                ? 'text-primary-600 border-primary-300 bg-primary-50/80 shadow-md shadow-primary-100/50'
                                : 'hover:bg-primary-25 border-neutral-100 bg-white/60 text-neutral-600 hover:border-primary-200 hover:text-primary-500 hover:shadow-sm'
                        } group-hover:shadow-md`}
                >
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="w-full">
                                <div className="flex flex-1 items-center gap-2.5">
                                    <div
                                        className={`flex size-6 items-center justify-center rounded-md text-xs font-bold transition-all duration-200 group-hover:scale-105 ${
                                            isActive
                                                ? 'bg-primary-500 text-white'
                                                : 'group-hover:text-primary-600 bg-neutral-100 text-neutral-500 group-hover:bg-primary-100'
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div className="shrink-0">
                                        {getIcon(slide.source_type, slide.document_slide?.type, '4')}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {truncateString(getSlideTitle(), 18)}
                                        </p>
                                        <p className="mt-0.5 text-xs capitalize text-neutral-400">
                                            {slide.source_type.toLowerCase().replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div className="shrink-0">{getStatusBadge()}</div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent
                                className="max-w-xs border border-neutral-300 bg-white/95 text-neutral-700 shadow-lg backdrop-blur-sm"
                                side="right"
                            >
                                <div className="space-y-1">
                                    <p className="font-medium">{getSlideTitle()}</p>
                                    <p className="text-xs text-neutral-500 capitalize">
                                        {slide.source_type.toLowerCase().replace('_', ' ')} •{' '}
                                        {slide.status.toLowerCase()}
                                    </p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <div className="drag-handle-container opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <SortableDragHandle
                            variant="ghost"
                            size="icon"
                            className="size-6 cursor-grab rounded-md transition-all hover:bg-neutral-100 active:cursor-grabbing"
                        >
                            <DotsSixVertical className="size-3 text-neutral-400" />
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

    const form = useForm<FormValues>({ defaultValues: { slides: items || [] } });
    const { move } = useFieldArray({ control: form.control, name: 'slides' });

    useEffect(() => {
        refetch();
    }, []);

    const handleSlideClick = async (slide: Slide) => {
        if (
            activeItem?.source_type === 'DOCUMENT' &&
            activeItem.document_slide?.type === 'DOC'
        ) {
            const currentContent = getCurrentEditorHTMLContent();
            if (
                currentContent &&
                ((activeItem.status === 'DRAFT' || activeItem.status === 'UNSYNC') &&
                    activeItem.document_slide.data !== currentContent)
            ) {
                await saveDraft(activeItem);
            } else if (
                activeItem.status === 'PUBLISHED' &&
                activeItem.document_slide.published_data !== currentContent
            ) {
                await saveDraft(activeItem);
            }
        }
        setActiveItem(slide);
    };

    const handleMove = ({ activeIndex, overIndex }: { activeIndex: number; overIndex: number }) => {
        move(activeIndex, overIndex);
        const updatedSlides = form.getValues('slides');
        const payload = updatedSlides.map((s, i) => ({
            slide_id: s.id,
            slide_order: i + 1,
        }));
        handleSlideOrderChange(payload);
    };

    useEffect(() => {
        form.setValue('slides', items || []);
    }, [items]);

    useEffect(() => {
        if (slides?.length) {
            const validSlides = slides.filter((s): s is Slide => 'source_type' in s && 'id' in s);
            form.reset({ slides: validSlides });
            setItems(validSlides);
            const target = slideId ? validSlides.find((s) => s.id === slideId) : validSlides[0];
            setActiveItem(target || null);
        } else {
            setActiveItem(slideId
                ? {
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
                  }
                : null);
        }
    }, [slides]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-6">
                <DashboardLoader />
            </div>
        );
    }

    if (!items?.length) {
        return (
            <div className="flex flex-col items-center justify-center px-3 py-8 text-center">
                <div className="mb-3 flex size-12 animate-pulse items-center justify-center rounded-full bg-neutral-100">
                    <File className="size-6 text-neutral-400" />
                </div>
                <h3 className="mb-1 text-base font-medium text-neutral-600">No slides yet</h3>
                <p className="max-w-xs text-xs leading-relaxed text-neutral-400">
                    Add your first slide to get started
                </p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <Sortable value={items} onMove={handleMove} fast={false}>
                <div className="flex w-full flex-col gap-1.5 px-1 text-neutral-600">
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