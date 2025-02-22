// hooks/use-slides.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import {
    GET_SLIDES,
    ADD_UPDATE_VIDEO_SLIDE,
    ADD_UPDATE_DOCUMENT_SLIDE,
    UPDATE_SLIDE_STATUS,
    UPDATE_SLIDE_ORDER,
} from "@/constants/urls";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { TokenKey } from "@/constants/auth/tokens";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";

export interface Slide {
    slide_title: string | null;
    document_id: string | null;
    document_title: string | null;
    document_type: string;
    slide_description: string | null;
    document_cover_file_id: string | null;
    video_description: string | null;
    document_data: string | null;
    video_id: string | null;
    video_title: string | null;
    video_url: string | null;
    slide_id: string;
    source_type: string;
    status: string;
}

interface VideoSlidePayload {
    id?: string;
    title: string;
    description: string | null;
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
    notify: boolean;
}

interface DocumentSlidePayload {
    id: string;
    title: string;
    image_file_id: string;
    description: string | null;
    slide_order: number;
    document_slide: {
        id: string;
        type: string;
        data: string;
        title: string;
        cover_file_id: string;
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
    slide_order: number;
}[];

interface UpdateSlideOrderParams {
    chapterId: string;
    slideOrderPayload: slideOrderPayloadType;
}

export const useSlides = (chapterId: string) => {
    const queryClient = useQueryClient();
    const { setItems } = useContentStore();
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];

    const getSlidesQuery = useQuery({
        queryKey: ["slides", chapterId],
        queryFn: async () => {
            const response = await authenticatedAxiosInstance.get(`${GET_SLIDES}/${chapterId}`);
            setItems(response.data);
            return response.data;
        },
    });

    const addUpdateVideoSlideMutation = useMutation({
        mutationFn: async (payload: VideoSlidePayload) => {
            const response = await authenticatedAxiosInstance.post(
                `${ADD_UPDATE_VIDEO_SLIDE}?chapterId=${chapterId}&instituteId=${INSTITUTE_ID}`,
                payload,
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["slides"] });
            queryClient.invalidateQueries({ queryKey: ["GET_MODULES_WITH_CHAPTERS"] });
            queryClient.invalidateQueries({ queryKey: ["GET_INIT_INSTITUTE"] });
        },
    });

    const addUpdateDocumentSlideMutation = useMutation({
        mutationFn: async (payload: DocumentSlidePayload) => {
            const response = await authenticatedAxiosInstance.post(
                `${ADD_UPDATE_DOCUMENT_SLIDE}?chapterId=${chapterId}&instituteId=${INSTITUTE_ID}`,
                payload,
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["slides"] });
            queryClient.invalidateQueries({ queryKey: ["GET_MODULES_WITH_CHAPTERS"] });
            queryClient.invalidateQueries({ queryKey: ["GET_INIT_INSTITUTE"] });
        },
    });

    const updateSlideStatus = useMutation({
        mutationFn: async ({ chapterId, slideId, status, instituteId }: UpdateStatusParams) => {
            return await authenticatedAxiosInstance.put(
                `${UPDATE_SLIDE_STATUS}?chapterId=${chapterId}&slideId=${slideId}&status=${status}&instituteId=${instituteId}`,
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["slides"] });
            queryClient.invalidateQueries({ queryKey: ["GET_MODULES_WITH_CHAPTERS"] });
            queryClient.invalidateQueries({ queryKey: ["GET_INIT_INSTITUTE"] });
        },
    });

    const updateSlideOrderMutation = useMutation({
        mutationFn: async ({ chapterId, slideOrderPayload }: UpdateSlideOrderParams) => {
            return await authenticatedAxiosInstance.put(
                `${UPDATE_SLIDE_ORDER}?chapterId=${chapterId}`,
                slideOrderPayload,
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["slides"] });
            queryClient.invalidateQueries({ queryKey: ["GET_MODULES_WITH_CHAPTERS"] });
            queryClient.invalidateQueries({ queryKey: ["GET_INIT_INSTITUTE"] });
        },
    });

    return {
        slides: getSlidesQuery.data,
        isLoading: getSlidesQuery.isLoading,
        error: getSlidesQuery.error,
        addUpdateVideoSlide: addUpdateVideoSlideMutation.mutateAsync,
        addUpdateDocumentSlide: addUpdateDocumentSlideMutation.mutateAsync,
        updateSlideStatus: updateSlideStatus.mutateAsync,
        updateSlideOrder: updateSlideOrderMutation.mutateAsync,
        isUpdating:
            addUpdateVideoSlideMutation.isPending ||
            addUpdateDocumentSlideMutation.isPending ||
            updateSlideOrderMutation.isPending,
    };
};
