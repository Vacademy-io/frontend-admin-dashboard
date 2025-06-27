import { Slide } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
import { Dispatch, SetStateAction, RefObject } from 'react';
import { toast } from 'sonner';
import { UseMutateAsyncFunction } from '@tanstack/react-query';
import {
    DocumentSlidePayload,
    VideoSlidePayload,
} from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
import { SlideQuestionsDataInterface } from '@/types/study-library/study-library-slides-type';
import {
    converDataToAssignmentFormat,
    converDataToVideoFormat,
    convertToQuestionBackendSlideFormat,
} from '../../-helper/helper';

type SlideResponse = {
    id: string;
    title: string;
    description: string;
    status: string;
};

export interface YTPlayer {
    getDuration(): number;
}

export const handlePublishSlide = async (
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    notify: boolean,
    activeItem: Slide,
    addUpdateDocumentSlide: UseMutateAsyncFunction<
        SlideResponse,
        Error,
        DocumentSlidePayload,
        unknown
    >,
    addUpdateVideoSlide: UseMutateAsyncFunction<SlideResponse, Error, VideoSlidePayload, unknown>,
    updateQuestionOrder: UseMutateAsyncFunction<
        SlideResponse,
        Error,
        SlideQuestionsDataInterface,
        unknown
    >,
    updateAssignmentOrder: UseMutateAsyncFunction<
        SlideResponse,
        Error,
        SlideQuestionsDataInterface,
        unknown
    >,
    SaveDraft: (activeItem: Slide) => Promise<void>,
    playerRef?: RefObject<YTPlayer> // Optional YouTube player ref
) => {
    const status = 'PUBLISHED';

    if (activeItem?.source_type === 'QUESTION') {
        const convertedData = convertToQuestionBackendSlideFormat({
            activeItem,
            status,
            notify,
            newSlide: false,
        });
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            await updateQuestionOrder(convertedData!);
        } catch {
            toast.error('Error saving slide');
        }
        return;
    }

    if (activeItem?.source_type === 'DOCUMENT') {
        if (activeItem?.document_slide?.type === 'DOC') await SaveDraft(activeItem);
        const publishedData = activeItem.document_slide?.data;
        try {
            await addUpdateDocumentSlide({
                id: activeItem?.id || '',
                title: activeItem.title || '',
                image_file_id: activeItem?.image_file_id || '',
                description: activeItem?.description || '',
                slide_order: 0,
                document_slide: {
                    id: activeItem?.document_slide?.id || '',
                    type: activeItem?.document_slide?.type || '',
                    data: null,
                    title: activeItem?.document_slide?.title || '',
                    cover_file_id: activeItem?.document_slide?.cover_file_id || '',
                    total_pages: activeItem?.document_slide?.total_pages || 0,
                    published_data: publishedData || null,
                    published_document_total_pages: activeItem?.document_slide?.total_pages || 0,
                },
                status: status,
                new_slide: false,
                notify: notify,
            });
            toast.success(`Slide published successfully!`);
            setIsOpen(false);
        } catch {
            toast.error(`Error in publishing the slide`);
        }
    }

    if (activeItem?.source_type === 'VIDEO') {
        if (!activeItem.video_slide) {
            toast.error('Video slide data is missing.');
            return;
        }

        // Use playerRef to get latest duration if available
        let durationInMillis = 0;
        if (playerRef?.current?.getDuration) {
            const durationInSec = playerRef.current.getDuration();
            durationInMillis = Math.round(durationInSec * 1000);
        } else {
            durationInMillis =
                activeItem.video_slide.video_length_in_millis ||
                activeItem.video_slide.published_video_length_in_millis ||
                0;
        }

        const convertedData = converDataToVideoFormat({
            activeItem: {
                ...activeItem,
                video_slide: {
                    ...activeItem.video_slide,
                    video_length_in_millis: durationInMillis,
                    published_video_length_in_millis: durationInMillis,
                },
            },
            status,
            notify,
            newSlide: false,
        });

        try {
            await addUpdateVideoSlide(convertedData);
            toast.success(`Slide published successfully!`);
            setIsOpen(false);
        } catch {
            toast.error(`Error in publishing the slide`);
        }
    }

    if (activeItem?.source_type === 'ASSIGNMENT') {
        const convertedData = converDataToAssignmentFormat({
            activeItem,
            status,
            notify,
            newSlide: false,
        });
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            await updateAssignmentOrder(convertedData!);
            toast.success(`Slide published successfully!`);
            setIsOpen(false);
        } catch {
            toast.error(`Error in publishing the slide`);
        }
    }
};
