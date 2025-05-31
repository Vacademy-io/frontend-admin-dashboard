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
import { SlideTypeEnum } from "../utils/types";

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

        const addedSlides = presResponse?.data?.added_slides;

        if (!addedSlides?.length) throw new Error("No slides found in presentation");

        const sortedSlides = addedSlides.sort((a, b) => a.slide_order - b.slide_order);

        const slidesData = [];

        // 2. Loop over slides and fetch each slide's content using S3
        for (const slide of sortedSlides) {
            try {
                const fileId = slide.content;
                const publicUrl = await getPublicUrl(fileId);

                const s3Response = await axios.get(publicUrl, {
                    responseType: "json",
                    headers: { "Cache-Control": "no-cache" }
                });

                let slideDataFromS3 = s3Response.data;

                // Ensure basic structure for Excalidraw-like slides
                if (slide.source !== 'question') { // Assuming non-question slides are Excalidraw-like
                    slideDataFromS3 = {
                        elements: [], // Default empty elements
                        appState: {}, // Default empty appState
                        files: null, // Default null files
                        ...slideDataFromS3, // Spread S3 data, potentially overriding defaults if present
                    };
                    // Ensure elements is always an array if it came from S3 but wasn't an array
                    if (!Array.isArray(slideDataFromS3.elements)) {
                        slideDataFromS3.elements = [];
                    }
                     // Ensure appState is always an object
                    if (typeof slideDataFromS3.appState !== 'object' || slideDataFromS3.appState === null) {
                        slideDataFromS3.appState = {};
                    }
                }

                const slideContent = {
                    ...slideDataFromS3,
                    id: slide.id, // Inject original slide ID
                    slide_order: slide.slide_order, // Ensure slide_order is carried over
                    type: slide.source === 'question' 
                        ? (slide.added_question?.question_type === 'MCQS' || slide.added_question?.question_type === 'MCQM' 
                            ? SlideTypeEnum.Quiz 
                            : (slide.added_question?.question_type === 'LONG_ANSWER' 
                                ? SlideTypeEnum.Feedback 
                                : SlideTypeEnum.Feedback)) // Default to Feedback for unknown question types from 'question' source
                        : (slideDataFromS3.type || SlideTypeEnum.Excalidraw)
                };

                slidesData.push(slideContent);
            } catch (innerErr) {
                console.error(`Error fetching slide content for slide ID ${slide.id}:`, innerErr);
            }
        }

        // 3. Set and return
        if (slidesData.length > 0) {
            setSlides(slidesData);
            setCurrentSlideId(slidesData[0]?.id);
        }

        return slidesData;
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
    setSlides: (slides: any) => void,
    setCurrentSlideId: (id: string) => void
}) => {
    return useQuery<
        Presentation & {
            slideContent?: any[];
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
