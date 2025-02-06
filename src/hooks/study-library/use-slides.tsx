// hooks/use-slides.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { GET_SLIDES, ADD_UPDATE_VIDEO_SLIDE, ADD_UPDATE_DOCUMENT_SLIDE } from "@/constants/urls";

export interface Slide {
    id: string;
    title: string;
    type: string;
    url?: string;
    status: string;
    source_type: string;
    slide_description?: string;
    document_title?: string;
    document_url?: string;
    document_path?: string;
    video_url?: string;
    video_description?: string;
}

interface VideoSlidePayload {
    id?: string;
    title: string;
    description: string;
    image_file_id: string | null;
    slide_order: number;
    video_slide: {
        id: string;
        description: string;
        url: string;
        title: string;
    };
    status: string;
    new_slide?: boolean;
}

interface DocumentSlidePayload {
    id?: string;
    title: string;
    description: string;
    slide_content: {
        type: string;
        title: string;
        cover_file_id: string;
    };
    status: string;
    new_slide?: boolean;
}

export const useSlides = (chapterId: string) => {
    const getSlidesQuery = useQuery({
        queryKey: ["slides", chapterId],
        queryFn: async () => {
            const response = await authenticatedAxiosInstance.get(`${GET_SLIDES}/${chapterId}`);
            return response.data;
        },
    });

    const addUpdateVideoSlideMutation = useMutation({
        mutationFn: async (payload: VideoSlidePayload) => {
            const response = await authenticatedAxiosInstance.post(
                `${ADD_UPDATE_VIDEO_SLIDE}/${chapterId}`,
                payload,
            );
            return response.data;
        },
    });

    const addUpdateDocumentSlideMutation = useMutation({
        mutationFn: async (payload: DocumentSlidePayload) => {
            const response = await authenticatedAxiosInstance.post(
                `${ADD_UPDATE_DOCUMENT_SLIDE}/${chapterId}`,
                payload,
            );
            return response.data;
        },
    });

    return {
        slides: getSlidesQuery.data,
        isLoading: getSlidesQuery.isLoading,
        error: getSlidesQuery.error,
        addUpdateVideoSlide: addUpdateVideoSlideMutation.mutateAsync,
        addUpdateDocumentSlide: addUpdateDocumentSlideMutation.mutateAsync,
        isUpdating:
            addUpdateVideoSlideMutation.isPending || addUpdateDocumentSlideMutation.isPending,
    };
};
