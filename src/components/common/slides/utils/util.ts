import { SlideType } from "../constant/slideType";
import { Slide } from "../types";
import { titleSlide, textSlide, webEmbedSlide, videoSlide, textMediaSlide, fullMediaSlide } from "../constant/textSlide";

export const createNewSlide = (type: SlideType): Slide => {
        switch (type) {
            case SlideType.Title:
                return {type : type ,  id: String(Math.random()), elements: titleSlide };
            case SlideType.Text:
                return {type : type ,  id: String(Math.random()), elements: textSlide };
            case SlideType.WebLink:
                return {type : type,  id: String(Math.random()), elements: webEmbedSlide };
            case SlideType.InteractiveVideo:
                return {type : type , id: String(Math.random()), elements: videoSlide };
            case SlideType.TextMedia:
                return {type : type, id: String(Math.random()), elements: textMediaSlide };
            case SlideType.FullscreenMedia:
                return {type : type, id: String(Math.random()), elements: fullMediaSlide };
            default:
                return {type : type, id: String(Math.random()), elements: [] };
        }
};