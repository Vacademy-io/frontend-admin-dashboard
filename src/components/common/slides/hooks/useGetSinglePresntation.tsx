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

export const fetchPresentation = async (presentationId: string) => {
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
        const fileId = presResponse.data.added_slides[0].source_id;
        const publicUrl = await getPublicUrl(fileId);

        // 3. Fetch the actual slide content from S3 using axios
        const s3Response = await axios.get(publicUrl, {
            responseType: 'json', // Ensure proper JSON parsing
            timeout: 10000, // 10 second timeout
            headers: {
                'Cache-Control': 'no-cache' // Avoid cached responses
            }
        });

        if (s3Response.status !== 200) {
            throw new Error(`S3 request failed with status ${s3Response.status}`);
        }

        // 4. Return combined data
        console.log(s3Response.data, "hello")
        return s3Response.data

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
    presentationId
}: {
    presentationId: string
}) => {
    return useQuery<
        Presentation & {
            slideContent?: any;
            s3Url?: string
        }
    >({
        queryKey: ["presentation"],
        queryFn: () => fetchPresentation(presentationId),
        staleTime: 5 * 60 * 1000, // 5 minute cache
        retry: (failureCount, error) => {
            // Don't retry for 404 errors
            if (error.message.includes("404")) return false;
            return failureCount < 2; // Retry twice max
        },
        enabled: !!presentationId,
        onError: (error) => {
            console.error("Presentation fetch error:", error);
        }
    });
};