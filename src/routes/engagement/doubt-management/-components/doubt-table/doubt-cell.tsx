import { formatTime } from "@/helpers/formatYoutubeVideoTime";
import { Doubt } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-types/get-doubts-type"
import { Clock, FileText } from "phosphor-react";

const removeMediaTags = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('img, video').forEach(media => media.remove());
  return doc.body.innerHTML;
};

export const DoubtCell = ({doubt}:{doubt:Doubt}) => {
    const cleanHtml = removeMediaTags(doubt.html_text);

    const getIcon = () => {
        if(doubt.content_type == "VIDEO") return <Clock weight="fill"/>
        else return <FileText weight="fill" />
    }

    const getContent = () => {
        if(doubt.content_type == "VIDEO") return formatTime(Number(doubt.content_position)/1000)
        else return doubt.content_position
    }

    return(
        <div className="flex flex-col gap-1">
            <div className="line-clamp-2">
                <div dangerouslySetInnerHTML={{ __html: cleanHtml }} className="text-neutral-800" />
            </div>
            <div className="text-neutral-500 line-clamp-2">Slide: {doubt.source_name}</div>
            <div className="flex items-center gap-1 text-neutral-400">
                {getIcon()}
                <p className="text-blue-600">{getContent()}</p>
            </div>
        </div>
    )
}
