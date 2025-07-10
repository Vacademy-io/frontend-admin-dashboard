import { Sortable, SortableDragHandle, SortableItem } from '@/components/ui/sortable';
import { truncateString } from '@/lib/reusable/truncateString';
import { useContentStore } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
import { DotsSixVertical, FileDoc, FilePdf, PlayCircle } from '@phosphor-icons/react';
import { ReactNode, useEffect } from 'react';
import {
    Slide,
    slideOrderPayloadType,
    useSlidesQuery,
} from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-hooks/use-slides';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { useRouter } from '@tanstack/react-router';
import { useFieldArray, useForm } from 'react-hook-form';
import {
    BookOpen,
    CheckCircle,
    Code,
    File,
    GameController,
    Question,
    ClipboardText,
} from 'phosphor-react';
import { useSaveDraft } from '../../-context/saveDraftContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FormValues {
    slides: Slide[];
}

const getSlideTypeDisplay = (slide: Slide): string => {
    if (slide.description && slide.description.trim() !== '') {
        return slide.description.toLowerCase();
    }

    if (
        slide.source_type === 'DOCUMENT' &&
        slide.document_slide?.type &&
        slide.document_slide.type !== 'DOC'
    ) {
        return slide.document_slide.type.toLowerCase().replace('_', ' ');
    }

    if (slide.source_type === 'VIDEO' && slide.video_slide?.embedded_type) {
        return `${slide.source_type.toLowerCase().replace('_', ' ')} - ${slide.video_slide.embedded_type.toLowerCase().replace('_', ' ')}`;
    }

    return slide.source_type.toLowerCase().replace('_', ' ');
};

export const getIcon = (
    source_type: string,
    document_slide_type: string | undefined,
    size?: string,
    id?: string // Pass the slide ID if available
): ReactNode => {
    const sizeClass = `size-${size ?? '5'}`;
    const iconClass = `${sizeClass} transition-all duration-200 ease-in-out group-hover:scale-105`;

    const isQuiz = source_type?.toUpperCase() === 'QUIZ' || id?.toLowerCase().startsWith('quiz-');
    console.log(source_type);

    const type = isQuiz
        ? 'QUIZ'
        : source_type?.toUpperCase() === 'QUESTION'
          ? 'QUESTION'
          : source_type?.toUpperCase() === 'VIDEO'
            ? 'VIDEO'
            : source_type?.toUpperCase() === 'DOCUMENT' && document_slide_type?.toUpperCase();

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
        case 'QUIZ':
            return <ClipboardText className={`${iconClass} text-pink-500`} />;
        case 'JUPYTER':
            return <BookOpen className={`${iconClass} text-violet-500`} />;
        case 'SCRATCH':
            return <GameController className={`${iconClass} text-yellow-500`} />;
        case 'CODE':
            return <Code className={`${iconClass} text-green-500`} />;
        case 'PRESENTATION':
            return <FileDoc className={`${iconClass} text-orange-500`} />;
        case 'ASSIGNMENT':
            return <File className="size-4 text-blue-500" />;
        default:
            return <></>;
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
    const getSlideTitle = () => {
        return (
            (slide.source_type === 'DOCUMENT' && slide.document_slide?.title) ||
            (slide.source_type === 'VIDEO' && slide.video_slide?.title) ||
            ((slide.source_type === 'QUESTION' || slide.source_type === 'QUIZ') && slide?.title) ||
            (slide.source_type === 'ASSIGNMENT' && slide?.title) ||
            'Untitled'
        );
    };

    const getStatusBadge = () => {
        const status = slide.status;
        if (status === 'DRAFT') {
            return (
                <div className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-1 py-0.5 text-xs font-medium text-yellow-600">
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
                <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-1 py-0.5 text-xs font-medium text-orange-600">
                    U
                </div>
            );
        }
        return null;
    };

    return (
        <SortableItem value={slide.id} asChild className="group cursor-pointer">
            <div
                className="w-full transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-left-2 hover:scale-[1.01]"
                onClick={onClick}
            >
                <div
                    className={`
                        flex w-full items-center gap-2.5 rounded-lg border px-3
                        py-2 backdrop-blur-sm transition-all
                        duration-300 ease-in-out
                        ${
                            isActive
                                ? 'text-primary-600 border-primary-300 bg-primary-50/80 shadow-md shadow-primary-100/50'
                                : 'hover:bg-primary-25 border-neutral-100 bg-white/60 text-neutral-600 hover:border-primary-200 hover:text-primary-500 hover:shadow-sm'
                        }
                        group-hover:shadow-md
                    `}
                >
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="w-full">
                                <div className="flex flex-1 items-center gap-2.5">
                                    <div
                                        className={`
                                        flex size-6 items-center justify-center rounded-md text-xs font-bold transition-all
                                        duration-200 ease-in-out group-hover:scale-105
                                        ${
                                            isActive
                                                ? 'bg-primary-500 text-white shadow-sm'
                                                : 'group-hover:text-primary-600 bg-neutral-100 text-neutral-500 group-hover:bg-primary-100'
                                        }
                                    `}
                                    >
                                        {index + 1}
                                    </div>

                                    <div className="shrink-0">
                                        {getIcon(
                                            slide.source_type,
                                            slide.document_slide?.type,
                                            '4',
                                            slide.id
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium leading-tight">
                                            {truncateString(getSlideTitle(), 18)}
                                        </p>
                                        <p className="mt-0.5 text-xs capitalize leading-tight text-neutral-400">
                                            {getSlideTypeDisplay(slide)}
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
                                    <p className="text-xs capitalize text-neutral-500">
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
                            className="size-6 cursor-grab rounded-md transition-all duration-200 hover:scale-105 hover:bg-neutral-100 active:scale-95 active:cursor-grabbing"
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

    const { slides, isLoading, refetch } = useSlidesQuery(chapterId || '');

    const { getCurrentEditorHTMLContent, saveDraft } = useSaveDraft();

    useEffect(() => {
        refetch();
    }, []);

    const handleSlideClick = async (slide: Slide) => {
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

        const updatedFields = form.getValues('slides');

        const orderPayload = updatedFields.map((slide, index) => ({
            slide_id: slide.id,
            slide_order: index + 1,
        }));

        handleSlideOrderChange(orderPayload);
    };

    useEffect(() => {
        form.setValue('slides', items || []);
    }, [items]);

    useEffect(() => {
        if (slides?.length) {
            form.reset({ slides });
            setItems(slides as Slide[]);

            const activeSlideStillExists =
                activeItem && slides.find((slide) => slide.id === activeItem.id);

            if (activeSlideStillExists) {
                setActiveItem(activeSlideStillExists as Slide);
                return;
            }

            if (slideId) {
                const targetSlide = slides.find((item) => item.id === slideId) as Slide | undefined;
                if (targetSlide) {
                    setActiveItem(targetSlide);
                    return;
                }
            }

            const firstSlide = slides[0] as Slide;
            setActiveItem(firstSlide);
        } else {
            setItems([]);
            if (slideId === undefined) {
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
    }, [slides, slideId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-6 duration-500 animate-in fade-in">
                <DashboardLoader />
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center px-3 py-8 text-center duration-700 animate-in fade-in slide-in-from-bottom-4">
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
        <div className="duration-500 animate-in fade-in slide-in-from-bottom-2">
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
