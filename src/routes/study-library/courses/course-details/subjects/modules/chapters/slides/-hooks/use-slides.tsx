// hooks/use-slides.ts
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import {
    GET_SLIDES,
    ADD_UPDATE_VIDEO_SLIDE,
    ADD_UPDATE_DOCUMENT_SLIDE,
    UPDATE_SLIDE_STATUS,
    UPDATE_SLIDE_ORDER,
    UPDATE_QUESTION_ORDER,
    UPDATE_ASSIGNMENT_ORDER,
    ADD_UPDATE_QUIZ_SLIDE,
} from '@/constants/urls';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { useContentStore } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-stores/chapter-sidebar-store';
import { SlideQuestionsDataInterface } from '@/types/study-library/study-library-slides-type';
import { cleanVideoQuestions } from '../-helper/helper';

// Common interfaces
export interface TextData {
    id: string;
    type: string;
    content: string;
}

export interface Option {
    id: string;
    text: TextData;
    explanation_text_data: TextData;
    media_id: string;
}

export interface QuestionSlideOption extends Option {
    question_slide_id: string;
}

// Video question interface
export interface VideoQuestion {
    id: string;
    parent_rich_text: TextData;
    text_data: TextData;
    explanation_text_data: TextData;
    media_id: string;
    question_response_type: string;
    question_type: string;
    access_level: string;
    auto_evaluation_json: string;
    evaluation_type: string;
    question_time_in_millis: number;
    question_order: number;
    status: string;
    options: Option[];
    new_question: boolean;
}

// Video slide interface
export interface VideoSlide {
    id: string;
    description: string;
    title: string;
    url: string;
    video_length_in_millis: number;
    published_url: string;
    published_video_length_in_millis: number;
    source_type: string;
    embedded_type?: string;
    embedded_data?: string;
    questions: VideoQuestion[];
}
export interface QuizSlide {
    id: string;
    title: string;
    media_id: string;
    parent_rich_text: TextData;
    explanation_text_data: TextData;
    questions: QuestionSlide[]; // Reusing existing structure
    question_response_type: string;
    access_level: string;
    evaluation_type: string;
    default_question_time_mins: number;
    re_attempt_count: number;
    source_type: string;
}

// Document slide interface
export interface DocumentSlide {
    id: string;
    type: string;
    data: string;
    title: string;
    cover_file_id: string;
    total_pages: number;
    published_data: string;
    published_document_total_pages: number;
}

// Question slide interface
export interface QuestionSlide {
    id: string;
    parent_rich_text: TextData;
    text_data: TextData;
    explanation_text_data: TextData;
    media_id: string;
    question_response_type: string;
    question_type: string;
    access_level: string;
    auto_evaluation_json: string;
    evaluation_type: string;
    default_question_time_mins: number;
    re_attempt_count: number;
    points: number;
    options: QuestionSlideOption[];
    source_type: string;
}

// Assignment slide interface
export interface AssignmentSlide {
    id: string;
    parent_rich_text: TextData;
    text_data: TextData;
    live_date: string; // ISO 8601 date format
    end_date: string; // ISO 8601 date format
    re_attempt_count: number;
    comma_separated_media_ids: string;
    questions: AssignmentQuestion[];
}

export interface AssignmentQuestion {
    id: string;
    text_data: TextData;
    question_order: number;
    status: string;
    new_question: boolean;
    question_type: string;
}

// Main slide interface
export interface Slide {
    id: string;
    source_id: string;
    source_type: string;
    title: string;
    image_file_id: string;
    description: string;
    status: string;
    slide_order: number;
    video_slide?: VideoSlide | null;
    document_slide?: DocumentSlide | null;
    question_slide?: QuestionSlide | null;
    assignment_slide?: AssignmentSlide | null;
    quiz_slide?: QuizSlide | null;

    is_loaded: boolean;
    new_slide: boolean;

    // Frontend-only
    splitScreenMode?: boolean;
    splitScreenData?: Record<string, unknown>;
    splitScreenType?: string;
}

export interface VideoSlidePayload {
    id?: string | null;
    title: string;
    description: string | null;
    image_file_id: string | null;
    slide_order: number | null;
    video_slide: {
        id: string;
        description: string;
        url: string | null;
        title: string;
        video_length_in_millis: number;
        published_url: string | null;
        published_video_length_in_millis: number;
        source_type: string;
        embedded_type?: string;
        embedded_data?: string;
        questions?: VideoQuestion[];
    };
    status: string;
    new_slide?: boolean;
    notify: boolean;
}

export interface DocumentSlidePayload {
    id: string | null;
    title: string;
    image_file_id: string;
    description: string | null;
    slide_order: number | null;
    document_slide: {
        id: string;
        type: string;
        data: string | null;
        title: string;
        cover_file_id: string;
        total_pages: number;
        published_data: string | null;
        published_document_total_pages: number;
    };
    status: string;
    new_slide: boolean;
    notify: boolean;
}

interface UpdateStatusParams {
    chapterId: string;
    slideId: string;
    status: string;
    instituteId: string;
}

export type slideOrderPayloadType = {
    slide_id: string;
    slide_order: number | null;
}[];

interface UpdateSlideOrderParams {
    chapterId: string;
    slideOrderPayload: slideOrderPayloadType;
}

// ✅ SEPARATED: Query hook (for reading slides data)
export const useSlidesQuery = (chapterId: string) => {
    const { setItems } = useContentStore();

    const getSlidesQuery = useQuery({
        queryKey: ['slides', chapterId],
        queryFn: async () => {
            try {
                console.log(`[useSlidesQuery] 🔥 Starting API call for chapterId: ${chapterId}`);

                const response = await authenticatedAxiosInstance.get(
                    `${GET_SLIDES}?chapterId=${chapterId}`
                );

                console.log(`[useSlidesQuery] 📦 Raw API response:`, {
                    status: response.status,
                    dataType: typeof response.data,
                    isArray: Array.isArray(response.data),
                    length: response.data?.length || 'N/A',
                    firstItem: response.data?.[0] || 'No items',
                });

                if (response.data && Array.isArray(response.data)) {
                    console.log(`[useSlidesQuery] 🔍 Checking for problematic slides...`);
                    const problemSlides = response.data.filter(
                        (slide) => !slide.id || !slide.title || slide.slide_order == null
                    );
                    if (problemSlides.length > 0) {
                        console.warn(`[useSlidesQuery] ⚠️ Problem slides detected:`, problemSlides);
                    }
                }

                console.log(`[useSlidesQuery] 🧹 Cleaning video questions...`);
                const cleanedData = cleanVideoQuestions(response.data);

                console.log(`[useSlidesQuery] ✅ Cleaned data result:`, {
                    originalLength: response.data?.length || 0,
                    cleanedLength: cleanedData?.length || 0,
                    cleanedDataType: typeof cleanedData,
                    isCleanedArray: Array.isArray(cleanedData),
                });

                console.log(`[useSlidesQuery] 🎯 Returning cleaned data from queryFn`);
                return cleanedData;
            } catch (error) {
                console.error(`[useSlidesQuery] ❌ Error in queryFn:`, {
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : 'No stack trace',
                    chapterId,
                });
                throw error;
            }
        },
        staleTime: 3600000,
        enabled: !!chapterId,
    });

    // Update store when query data changes
    useEffect(() => {
        console.log(`[useSlidesQuery] 🔄 useEffect triggered:`, {
            queryDataExists: !!getSlidesQuery.data,
            queryDataLength: getSlidesQuery.data?.length || 0,
            queryStatus: getSlidesQuery.status,
            isLoading: getSlidesQuery.isLoading,
            isError: getSlidesQuery.isError,
            error: getSlidesQuery.error?.message || 'none',
        });

        if (getSlidesQuery.data && Array.isArray(getSlidesQuery.data)) {
            console.log(
                `[useSlidesQuery] 🏪 Updating store with ${getSlidesQuery.data.length} slides`
            );
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setItems(getSlidesQuery.data);
        } else if (getSlidesQuery.status === 'success' && !getSlidesQuery.data) {
            console.warn(`[useSlidesQuery] ⚠️ Query succeeded but no data received`);
        }
    }, [getSlidesQuery.data, getSlidesQuery.status, setItems]);

    return {
        slides: getSlidesQuery.data,
        isLoading: getSlidesQuery.isLoading,
        isError: getSlidesQuery.isError,
        error: getSlidesQuery.error,
        refetch: getSlidesQuery.refetch,
    };
};

// ✅ SEPARATED: Mutations hook (for write operations only)
export const useSlidesMutations = (
    chapterId: string,
    moduleId?: string,
    subjectId?: string,
    packageSessionId?: string
) => {
    const queryClient = useQueryClient();
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];

    const addUpdateExcalidrawSlide = async (slideData: {
        id: string;
        title: string;
        image_file_id?: string;
        description?: string;
        slide_order: number;
        excalidraw_slide?: {
            elements: unknown[];
            files: Record<string, unknown>;
            appState: Record<string, unknown>;
        };
        status?: string;
        new_slide: boolean;
        notify: boolean;
    }) => {
        try {
            // Build Excalidraw data payload
            const excalidrawData = JSON.stringify({
                isExcalidraw: true,
                elements: slideData.excalidraw_slide?.elements || [],
                files: slideData.excalidraw_slide?.files || {},
                appState: slideData.excalidraw_slide?.appState || {},
            });

            // Prepare the document slide payload
            const documentSlidePayload = {
                id: slideData.id,
                title: slideData.title,
                image_file_id: slideData.image_file_id || '',
                description: slideData.description || '',
                slide_order: slideData.slide_order,
                document_slide: {
                    id: crypto.randomUUID(),
                    type: 'PRESENTATION',
                    data: excalidrawData,
                    title: slideData.title,
                    cover_file_id: '',
                    total_pages: 1,
                    published_data: null,
                    published_document_total_pages: 0,
                },
                status: slideData.status || 'DRAFT',
                new_slide: slideData.new_slide,
                notify: slideData.notify,
            };

            // Execute the mutation
            const response = await addUpdateDocumentSlideMutation.mutateAsync(documentSlidePayload);
            return response;
        } catch (error) {
            console.error('Error in addUpdateExcalidrawSlide:', error);
            throw error;
        }
    };

    const addUpdateVideoSlideMutation = useMutation({
        mutationFn: async (payload: VideoSlidePayload) => {
            const response = await authenticatedAxiosInstance.post(
                `${ADD_UPDATE_VIDEO_SLIDE}?chapterId=${chapterId}&instituteId=${INSTITUTE_ID}&packageSessionId=${packageSessionId}&moduleId=${moduleId}&subjectId=${subjectId}`,
                payload
            );
            return { data: response.data, isNewSlide: payload.new_slide };
        },
        onSuccess: async (result) => {
            // Invalidate and wait for slides query to refetch
            await queryClient.invalidateQueries({ queryKey: ['slides'] });
            queryClient.invalidateQueries({ queryKey: ['GET_MODULES_WITH_CHAPTERS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_INIT_INSTITUTE'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SUBJECTS_PROGRESS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SLIDES_PROGRESS'] });

            // If this was a new slide creation, set first slide as active after refetch completes
            if (result.isNewSlide) {
                // Wait for the slides query to actually refetch and update the store
                setTimeout(() => {
                    const { setActiveItem, items } = useContentStore.getState();

                    if (items && items.length > 0) {
                        setActiveItem(items[0] as Slide);
                    }
                }, 1000); // Increased timeout to ensure refetch completes
            }
        },
    });

    const addUpdateDocumentSlideMutation = useMutation({
        mutationFn: async (payload: DocumentSlidePayload) => {
            const response = await authenticatedAxiosInstance.post(
                `${ADD_UPDATE_DOCUMENT_SLIDE}?chapterId=${chapterId}&moduleId=${moduleId}&subjectId=${subjectId}&packageSessionId=${packageSessionId}&instituteId=${INSTITUTE_ID}`,
                payload
            );
            return { data: response.data, isNewSlide: payload.new_slide };
        },
        onSuccess: async (result) => {
            // Invalidate and wait for slides query to refetch
            await queryClient.invalidateQueries({ queryKey: ['slides'] });
            queryClient.invalidateQueries({ queryKey: ['GET_MODULES_WITH_CHAPTERS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_INIT_INSTITUTE'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SUBJECTS_PROGRESS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SLIDES_PROGRESS'] });

            // If this was a new slide creation, set first slide as active after refetch completes
            if (result.isNewSlide) {
                // Wait for the slides query to actually refetch and update the store
                setTimeout(() => {
                    const { setActiveItem, items } = useContentStore.getState();

                    if (items && items.length > 0) {
                        setActiveItem(items[0] as Slide);
                    }
                }, 1000); // Increased timeout to ensure refetch completes
            }
        },
    });

    const updateSlideStatus = useMutation({
        mutationFn: async ({ chapterId, slideId, status, instituteId }: UpdateStatusParams) => {
            return await authenticatedAxiosInstance.put(
                `${UPDATE_SLIDE_STATUS}?chapterId=${chapterId}&slideId=${slideId}&status=${status}&instituteId=${instituteId}`
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['slides'] });
            queryClient.invalidateQueries({ queryKey: ['GET_MODULES_WITH_CHAPTERS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_INIT_INSTITUTE'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SUBJECTS_PROGRESS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SLIDES_PROGRESS'] });
        },
    });

    const updateSlideOrderMutation = useMutation({
        mutationFn: async ({ chapterId, slideOrderPayload }: UpdateSlideOrderParams) => {
            return await authenticatedAxiosInstance.put(
                `${UPDATE_SLIDE_ORDER}?chapterId=${chapterId}`,
                slideOrderPayload
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['slides'] });
            queryClient.invalidateQueries({ queryKey: ['GET_MODULES_WITH_CHAPTERS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_INIT_INSTITUTE'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SUBJECTS_PROGRESS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SLIDES_PROGRESS'] });
        },
    });

    const updateQuestionSlideMutation = useMutation({
        mutationFn: async (payload: SlideQuestionsDataInterface) => {
            const response = await authenticatedAxiosInstance.post(
                `${UPDATE_QUESTION_ORDER}?chapterId=${chapterId}&instituteId=${INSTITUTE_ID}&packageSessionId=${packageSessionId}&moduleId=${moduleId}&subjectId=${subjectId}`,
                payload
            );
            return { data: response.data, isNewSlide: payload.new_slide };
        },
        onSuccess: async (result) => {
            // Invalidate and wait for slides query to refetch
            await queryClient.invalidateQueries({ queryKey: ['slides'] });
            queryClient.invalidateQueries({ queryKey: ['GET_MODULES_WITH_CHAPTERS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_INIT_INSTITUTE'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SUBJECTS_PROGRESS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SLIDES_PROGRESS'] });

            // If this was a new slide creation, set first slide as active after refetch completes
            if (result.isNewSlide) {
                // Wait for the slides query to actually refetch and update the store
                setTimeout(() => {
                    const { setActiveItem, items } = useContentStore.getState();

                    if (items && items.length > 0) {
                        setActiveItem(items[0] as Slide);
                    }
                }, 1000); // Increased timeout to ensure refetch completes
            }
        },
    });

    const updateAssignmentSlideMutation = useMutation({
        mutationFn: async (payload: SlideQuestionsDataInterface) => {
            const response = await authenticatedAxiosInstance.post(
                `${UPDATE_ASSIGNMENT_ORDER}?chapterId=${chapterId}&instituteId=${INSTITUTE_ID}&packageSessionId=${packageSessionId}&subjectId=${subjectId}&moduleId=${moduleId}`,
                payload
            );
            return { data: response.data, isNewSlide: payload.new_slide };
        },
        onSuccess: async (result) => {
            // Invalidate and wait for slides query to refetch
            await queryClient.invalidateQueries({ queryKey: ['slides'] });
            queryClient.invalidateQueries({ queryKey: ['GET_MODULES_WITH_CHAPTERS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_INIT_INSTITUTE'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SUBJECTS_PROGRESS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SLIDES_PROGRESS'] });

            // If this was a new slide creation, set first slide as active after refetch completes
            if (result.isNewSlide) {
                // Wait for the slides query to actually refetch and update the store
                setTimeout(() => {
                    const { setActiveItem, items } = useContentStore.getState();

                    if (items && items.length > 0) {
                        setActiveItem(items[0] as Slide);
                    }
                }, 1000); // Increased timeout to ensure refetch completes
            }
        },
    });
    const addUpdateQuizSlideMutation = useMutation({
        mutationFn: async (payload: SlideQuestionsDataInterface) => {
            const response = await authenticatedAxiosInstance.post(
                `${ADD_UPDATE_QUIZ_SLIDE}?chapterId=${chapterId}&instituteId=${INSTITUTE_ID}&packageSessionId=${packageSessionId}&subjectId=${subjectId}&moduleId=${moduleId}`,
                payload
            );

            return { data: response.data, isNewSlide: payload.new_slide };
        },
        onSuccess: async (result) => {
            await queryClient.invalidateQueries({ queryKey: ['slides'] });
            queryClient.invalidateQueries({ queryKey: ['GET_MODULES_WITH_CHAPTERS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_INIT_INSTITUTE'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SUBJECTS_PROGRESS'] });
            queryClient.invalidateQueries({ queryKey: ['GET_STUDENT_SLIDES_PROGRESS'] });

            if (result.isNewSlide) {
                setTimeout(() => {
                    const { setActiveItem, items } = useContentStore.getState();
                    if (items && items.length > 0) {
                        setActiveItem(items[0] as Slide);
                    }
                }, 1000);
            }
        },
    });

    return {
        addUpdateVideoSlide: (payload: VideoSlidePayload) =>
            addUpdateVideoSlideMutation.mutateAsync(payload).then((result) => result.data),
        addUpdateDocumentSlide: (payload: DocumentSlidePayload) =>
            addUpdateDocumentSlideMutation.mutateAsync(payload).then((result) => result.data),
        updateSlideStatus: updateSlideStatus.mutateAsync,
        updateSlideOrder: updateSlideOrderMutation.mutateAsync,
        updateQuestionOrder: (payload: SlideQuestionsDataInterface) =>
            updateQuestionSlideMutation.mutateAsync(payload).then((result) => result.data),
        updateAssignmentOrder: (payload: SlideQuestionsDataInterface) =>
            updateAssignmentSlideMutation.mutateAsync(payload).then((result) => result.data),
        addUpdateQuizSlide: (payload: SlideQuestionsDataInterface) =>
            addUpdateQuizSlideMutation.mutateAsync(payload).then((result) => result.data), // ✅ fixed
        addUpdateExcalidrawSlide,
        isUpdating:
            addUpdateVideoSlideMutation.isPending ||
            addUpdateDocumentSlideMutation.isPending ||
            updateSlideOrderMutation.isPending ||
            updateQuestionSlideMutation.isPending ||
            updateAssignmentSlideMutation.isPending ||
            addUpdateQuizSlideMutation.isPending,
    };
};

// ✅ LEGACY: Keep original hook for backwards compatibility (but mark as deprecated)
/**
 * @deprecated Use useSlidesQuery() for reading data or useSlidesMutations() for mutations only
 */
export const useSlides = (
    chapterId: string,
    moduleId?: string,
    subjectId?: string,
    packageSessionId?: string
) => {
    const queryResults = useSlidesQuery(chapterId);
    const mutations = useSlidesMutations(chapterId, moduleId, subjectId, packageSessionId);

    return {
        ...queryResults,
        ...mutations,
    };
};
