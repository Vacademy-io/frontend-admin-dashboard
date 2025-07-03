// src/routes/study-library/courses/levels/subjects/modules/chapters/slides/-utils/create-assignment-slide-payload.ts

import type { DocumentSlidePayload, Slide } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides';
import { generateUniqueAssignmentSlideTitle } from '../../-helper/slide-naming-utils';

export function createAssignmentSlidePayload(
  allSlides: Slide[] = [],
  titleOverride?: string
): DocumentSlidePayload {
  const slideId = crypto.randomUUID();
  const title = titleOverride?.trim() || generateUniqueAssignmentSlideTitle(allSlides) || 'Untitled Assignment';

  return {
    id: slideId,
    title: title,
    image_file_id: '',
    description: 'Assignment for student response',
    slide_order: 0,
    document_slide: {
      id: crypto.randomUUID(),
      type: 'ASSIGNMENT',
      data: JSON.stringify({
        parent_rich_text: {
          id: null,
          type: '',
          content: '',
        },
        text_data: {
          id: null,
          type: '',
          content: '',
        },
        live_date: '',
        end_date: '',
        re_attempt_count: 0,
        comma_separated_media_ids: '',
        timestamp: Date.now(),
      }),
      title: title,
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
