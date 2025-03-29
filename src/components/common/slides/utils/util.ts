import { SlideType } from "../constant/slideType";
import { Slide } from "../types";
import { titleSlide, textSlide, webEmbedSlide, videoSlide, textMediaSlide, fullMediaSlide } from "../constant/textSlide";

export const createNewSlide = (type: SlideType): Slide => {
        switch (type) {
            case SlideType.Title:
                return { id: String(Math.random()), elements: titleSlide };
            case SlideType.Text:
                return { id: String(Math.random()), elements: textSlide };
            case SlideType.WebLink:
                return { id: String(Math.random()), elements: webEmbedSlide };
            case SlideType.InteractiveVideo:
                return { id: String(Math.random()), elements: videoSlide };
            case SlideType.TextMedia:
                return { id: String(Math.random()), elements: textMediaSlide };
            case SlideType.FullscreenMedia:
                return { id: String(Math.random()), elements: fullMediaSlide };
            default:
                return { id: String(Math.random()), elements: [] };
        }
};