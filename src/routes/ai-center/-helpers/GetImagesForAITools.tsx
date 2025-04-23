import {
    AIChatImg,
    AIExtractImg,
    AIExtractPdfImg,
    AIGivePromptImg,
    AISortAndSplitImg,
    AIUploadAudioImg,
    AIUploadPdfImg,
} from "@/assets/svgs";

export const GetImagesForAITools = (key: string) => {
    switch (key) {
        case "assessment":
            return <AIUploadPdfImg />;
        case "audio":
            return <AIUploadAudioImg />;
        case "text":
            return <AIGivePromptImg />;
        case "chat":
            return <AIChatImg />;
        case "question":
            return <AIExtractPdfImg />;
        case "image":
            return <AIExtractImg />;
        case "sort-split-pdf":
            return <AISortAndSplitImg />;
        case "sort-topics-pdf":
            return <AISortAndSplitImg />;
        default:
            <></>;
    }
    return <></>;
};
