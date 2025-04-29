/* eslint-disable */
// @ts-nocheck
import { TokenKey } from "@/constants/auth/tokens";
import { GET_PRESENTATION } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Presentation } from "../types";
import { getPublicUrl } from "@/services/upload_file";

export const fetchPresentation = async (presentationId: string, setSlides: any, setCurrentSlideId: any) => {
    try {
        const accessToken = getTokenFromCookie(TokenKey.accessToken);
        if (!accessToken) throw new Error("Authentication required");

        // 1. Get presentation metadata
        const presResponse = await authenticatedAxiosInstance.get(GET_PRESENTATION, {
            params: { presentationId },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!presResponse.data?.added_slides?.length) {
            throw new Error("No slides found in presentation");
        }

        // 2. Get file URL from the first slide
        const length = presResponse.data?.added_slides?.length;
        const fileId = presResponse.data.added_slides[length - 1].content;
        const publicUrl = await getPublicUrl(fileId);

        // 3. Fetch the actual slide content from S3 using axios
        const s3Response = await axios.get(publicUrl, {
            responseType: 'json', // Ensure proper JSON parsing
            headers: {
                'Cache-Control': 'no-cache' // Avoid cached responses
            }
        });


        // 4. Return combined data
        console.log(s3Response?.data, "hello")
        setSlides(s3Response?.data)

        setCurrentSlideId(s3Response?.data[0]?.id)
        return s3Response?.data

    } catch (error) {
        console.error("Error fetching presentation:", error);
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch presentation"
        );
    }
};

export const useGetSinglePresentation = ({
    presentationId,
    setSlides,
    setCurrentSlideId
}: {
    presentationId: string,
    setSlides: (slides: any) => void
}) => {
    return useQuery<
        Presentation & {
            slideContent?: any;
            s3Url?: string
        }
    >({
        queryKey: ["GET_PRESENTATION", presentationId],
        queryFn: () => fetchPresentation(presentationId, setSlides, setCurrentSlideId),
        onError: (error) => {
            console.error("Presentation fetch error:", error);
        },
        enabled: !!presentationId,
        refetchOnWindowFocus: false
    });
};