import { Dispatch, SetStateAction, RefObject } from 'react';
import { toast } from 'sonner';
import {
    DocumentSlidePayload,
    Slide,
    VideoSlidePayload,
    QuizSlidePayload,
} from '../../-hooks/use-slides';
import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { SlideQuestionsDataInterface } from '@/types/study-library/study-library-slides-type';
import {
    converDataToAssignmentFormat,
    converDataToVideoFormat,
    convertToQuestionBackendSlideFormat,
} from '../../-helper/helper';
import { YTPlayer } from '../youtube-player';
import { createQuizSlidePayload } from '../quiz/utils/api-helpers';

type SlideResponse = {
    id: string;

    title: string;
    description: string;
    status: string;
};

export const handleUnpublishSlide = async (
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
    addUpdateQuizSlide: UseMutateAsyncFunction<SlideResponse, Error, QuizSlidePayload, unknown>,
    SaveDraft: (activeItem: Slide) => Promise<void>,
    playerRef?: RefObject<YTPlayer> // Optional: in case needed for recalculating duration
) => {
    const status = 'DRAFT';

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
            toast.success('Slide unpublished successfully!');
            setIsOpen(false);
        } catch {
            toast.error('Error unpublishing question slide');
        }
        return;
    }

    if (activeItem?.source_type === 'DOCUMENT') {
        if (activeItem.document_slide?.type === 'DOC') {
            await SaveDraft(activeItem);
        }

        // For unpublishing, preserve the data from published_data if it exists, then fallback to data
        // This ensures we don't lose content when unpublishing published slides
        const draftData =
            activeItem.document_slide?.published_data || activeItem.document_slide?.data;

        try {
            await addUpdateDocumentSlide({
                id: activeItem.id || '',
                title: activeItem.title || '',
                image_file_id: activeItem.image_file_id || '',
                description: activeItem.description || '',
                slide_order: 0,
                document_slide: {
                    id: activeItem.document_slide?.id || '',
                    type: activeItem.document_slide?.type || '',
                    data: draftData || null, // Move published_data back to data field
                    title: activeItem.document_slide?.title || '',
                    cover_file_id: activeItem.document_slide?.cover_file_id || '',
                    total_pages: activeItem.document_slide?.total_pages || 0,
                    published_data: null, // Clear published_data since we're unpublishing
                    published_document_total_pages: 1,
                },
                status,
                new_slide: false,
                notify,
            });

            toast.success(`Slide unpublished successfully!`);
            setIsOpen(false);
        } catch {
            toast.error(`Error in unpublishing the slide`);
        }
        return;
    }

    if (activeItem?.source_type === 'VIDEO') {
        if (!activeItem.video_slide) {
            toast.error('Video slide data is missing.');
            return;
        }

        let durationInMillis = 0;
        const currentStatus = activeItem.status;

        if (playerRef?.current?.getDuration) {
            try {
                const seconds = playerRef.current.getDuration();
                durationInMillis = Math.round(seconds * 1000);
            } catch {
                // fallback below
                durationInMillis =
                    currentStatus === 'UNSYNC'
                        ? activeItem.video_slide.video_length_in_millis || 0
                        : activeItem.video_slide.published_video_length_in_millis || 0;
            }
        } else {
            durationInMillis =
                currentStatus === 'UNSYNC'
                    ? activeItem.video_slide.video_length_in_millis || 0
                    : activeItem.video_slide.published_video_length_in_millis || 0;
        }

        const convertedData = converDataToVideoFormat({
            activeItem: {
                ...activeItem,
                video_slide: {
                    ...activeItem.video_slide,
                    video_length_in_millis: durationInMillis,
                    published_video_length_in_millis: 0,
                },
            },
            status,
            notify,
            newSlide: false,
        });

        try {
            await addUpdateVideoSlide(convertedData);
            toast.success(`Slide unpublished successfully!`);
            setIsOpen(false);
        } catch {
            toast.error(`Error in unpublishing the slide`);
        }
        return;
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
            toast.success(`Slide unpublished successfully!`);
            setIsOpen(false);
        } catch {
            toast.error(`Error in unpublishing the slide`);
        }
    }

    if (activeItem?.source_type === 'QUIZ') {
        try {
            // Use the createQuizSlidePayload function to properly transform the data
            const payload = createQuizSlidePayload(activeItem.quiz_slide?.questions || [], {
                ...activeItem,
                status: 'DRAFT', // Override status to DRAFT
            });

            // Call the API to unpublish the quiz slide
            await addUpdateQuizSlide(payload);
            toast.success('Quiz unpublished successfully!');
            setIsOpen(false);
        } catch (error) {
            console.error('Error unpublishing quiz slide:', error);
            toast.error('Failed to unpublish quiz');
        }
    }
};
