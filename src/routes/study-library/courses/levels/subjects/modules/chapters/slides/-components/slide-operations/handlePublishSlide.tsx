import { Slide } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
import { Dispatch, SetStateAction } from 'react';
import { UploadQuestionPaperFormType } from '@/routes/assessment/question-papers/-components/QuestionPaperUpload';
import { toast } from 'sonner';
import { UseMutateAsyncFunction } from '@tanstack/react-query';
import {
    DocumentSlidePayload,
    VideoSlidePayload,
} from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
import { SlideQuestionsDataInterface } from '@/types/study-library/study-library-slides-type';
import { convertToSlideFormat } from '../../-helper/helper';

type SlideResponse = {
    id: string;
    title: string;
    description: string;
    status: string;
};

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
    SaveDraft: (activeItem: Slide) => Promise<void>
) => {
    console.log(updateQuestionOrder);
    const status = 'PUBLISHED';
    if (activeItem?.source_type === 'QUESTION') {
        const questionsData: UploadQuestionPaperFormType = JSON.parse('');
        // need to add my question logic
        const convertedData = convertToSlideFormat(questionsData, status);
        console.log(convertedData);
        try {
            // await updateQuestionOrder(convertedData!);
        } catch {
            toast.error('error saving slide');
        }
        return;
    }
    if (activeItem?.source_type == 'DOCUMENT') {
        if (activeItem?.document_slide?.type == 'DOC') SaveDraft(activeItem);
        const publishedData = activeItem.document_slide?.data;
        try {
            await addUpdateDocumentSlide({
                id: activeItem?.id || '',
                title: activeItem.title || '',
                image_file_id: activeItem?.image_file_id || '',
                description: activeItem?.description || '',
                slide_order: null,
                document_slide: {
                    id: activeItem?.document_slide?.id || '',
                    type: activeItem?.document_slide?.type || '',
                    data: null,
                    title: activeItem?.document_slide?.title || '',
                    cover_file_id: activeItem?.document_slide?.cover_file_id || '',
                    total_pages: 0,
                    published_data: publishedData || null,
                    published_document_total_pages: 0,
                },
                status: status,
                new_slide: false,
                notify: notify,
            });
            toast.success(`slide published successfully!`);
            setIsOpen(false);
        } catch {
            toast.error(`Error in publishing the slide`);
        }
    } else {
        try {
            await addUpdateVideoSlide({
                id: activeItem?.id || '',
                title: activeItem?.title || '',
                description: activeItem?.description || '',
                image_file_id: activeItem?.image_file_id || '',
                slide_order: null,
                video_slide: {
                    id: activeItem?.video_slide?.id || '',
                    description: activeItem?.video_slide?.description || '',
                    url: null,
                    title: activeItem?.video_slide?.title || '',
                    video_length_in_millis: 0,
                    published_url: activeItem?.video_slide?.url || null,
                    published_video_length_in_millis: 0,
                },
                status: status,
                new_slide: false,
                notify: notify,
            });
            toast.success(`slide published successfully!`);
            setIsOpen(false);
        } catch {
            toast.error(`Error in publishing the slide`);
        }
    }
};
