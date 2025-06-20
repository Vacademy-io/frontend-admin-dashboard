// import type { SlideType } from '../constant/slideType';
import { slideType } from '@/routes/manage-students/students-list/-components/students-list/student-side-view/student-learning-progress/chapter-details/topic-details/topic-details';
import type { DocumentSlidePayload } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
// import { SlideType } from './slide-type-sheet';

/**
 * Creates a payload for a new presentation slide with excalidraw source type
 */
export function createPresentationSlidePayload(slideType: slideType): DocumentSlidePayload {
    // Create a new slide ID
    const slideId = crypto.randomUUID();

    // Create the presentation slide payload
    return {
        id: slideId,
        title: `New ${slideType.name} Slide`,
        image_file_id: '',
        description: '',
        slide_order: null,
        document_slide: {
            id: crypto.randomUUID(),
            type: 'PRESENTATION',
            data: JSON.stringify({
                type: slideType,
                elements: [],
                appState: {
                    viewBackgroundColor: '#ffffff',
                    gridSize: null,
                },
                files: {},
            }),
            title: `New ${slideType.name} Slide`,
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
