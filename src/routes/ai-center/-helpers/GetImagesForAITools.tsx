import {
    AIChatImg,
    AIExtractImg,
    AIExtractPdfImg,
    AIGivePromptImg,
    AISortAndSplitImg,
    AISorterImg,
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
        case "sortSplitPdf":
            return <AISortAndSplitImg />;
        case "sortTopicsPdf":
            return <AISorterImg />;
        default:
            <></>;
    }
    return <></>;
};
