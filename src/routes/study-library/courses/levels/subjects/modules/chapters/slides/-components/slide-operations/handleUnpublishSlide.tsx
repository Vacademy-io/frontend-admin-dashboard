import { Dispatch, SetStateAction, RefObject } from 'react';
import { toast } from 'sonner';
import {
  DocumentSlidePayload,
  Slide,
  VideoSlidePayload,
} from '../../-hooks/use-slides';
import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { SlideQuestionsDataInterface } from '@/types/study-library/study-library-slides-type';
import {
  converDataToAssignmentFormat,
  converDataToVideoFormat,
  convertToQuestionBackendSlideFormat,
} from '../../-helper/helper';
import { YTPlayer } from  '../youtube-player';

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
  addUpdateVideoSlide: UseMutateAsyncFunction<
    SlideResponse,
    Error,
    VideoSlidePayload,
    unknown
  >,
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
    } catch {
      toast.error('Error unpublishing question slide');
    }
    return;
  }

  if (activeItem?.source_type === 'DOCUMENT') {
    if (activeItem.document_slide?.type === 'DOC') {
      await SaveDraft(activeItem);
    }

    const draftData = activeItem.document_slide?.data;

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
          data: draftData || null,
          title: activeItem.document_slide?.title || '',
          cover_file_id: activeItem.document_slide?.cover_file_id || '',
          total_pages: activeItem.document_slide?.total_pages || 0,
          published_data: null,
          published_document_total_pages: 0,
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
};
