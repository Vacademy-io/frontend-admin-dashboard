// import type { SlideType } from '../constant/slideType';
import { slideType } from '@/routes/manage-students/students-list/-components/students-list/student-side-view/student-learning-progress/chapter-details/topic-details/topic-details';
import type { DocumentSlidePayload, Slide } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
import { generateUniqueDocumentSlideTitle } from '../-helper/slide-naming-utils';
// import { SlideType } from './slide-type-sheet';

/**
 * Creates a payload for a new presentation slide with excalidraw source type
 */
export function createPresentationSlidePayload(
    slideType: slideType,
    allSlides: Slide[] = []
): DocumentSlidePayload {
    // Create a new slide ID
    const slideId = crypto.randomUUID();
    
    // Generate unique title based on existing slides
    const uniqueTitle = generateUniqueDocumentSlideTitle(allSlides, 'PRESENTATION');

    // Create the presentation slide payload
    return {
        id: slideId,
        title: uniqueTitle,
        image_file_id: '',
        description: '',
        slide_order: null,
        document_slide: {
            id: crypto.randomUUID(),
            type: 'PRESENTATION',
            data: null, // Will be set to S3 file ID when first saved
            title: uniqueTitle,
            cover_file_id: '',
            total_pages: 1,
            published_data: null,
            published_document_total_pages: 0,
        },
        status: 'DRAFT',
        new_slide: true,
        notify: false,
    };
}
