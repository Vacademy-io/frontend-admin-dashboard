import type {
    DocumentSlidePayload,
    Slide,
} from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-hooks/use-slides';
import { generateUniqueAssignmentSlideTitle } from '../../-helper/slide-naming-utils';

export function createAssignmentSlidePayload(
    allSlides: Slide[] = [],
    titleOverride?: string
): DocumentSlidePayload {
    const slideId = crypto.randomUUID();
    const title =
        titleOverride?.trim() ||
        generateUniqueAssignmentSlideTitle(allSlides) ||
        'Untitled Assignment';

    const date = new Date();

    return {
        id: slideId,
        title: title,
        source_id: '',
        source_type: 'ASSIGNMENT',
        image_file_id: '',
        description: '',
        status: 'DRAFT',
        slide_order: 0,
        video_slide: null,
        document_slide: null,
        question_slide: null,
        assignment_slide: {
            id: crypto.randomUUID(),
            parent_rich_text: {
                id: '',
                type: '',
                content: '',
            },
            text_data: {
                id: '',
                type: '',
                content: '',
            },
            live_date: date.toLocaleString(),
            end_date: date.toLocaleString(),
            re_attempt_count: 0,
            comma_separated_media_ids: '',
            questions: [],
        },
        quiz_slide: null,
        is_loaded: true,
        new_slide: true,
    };
}
