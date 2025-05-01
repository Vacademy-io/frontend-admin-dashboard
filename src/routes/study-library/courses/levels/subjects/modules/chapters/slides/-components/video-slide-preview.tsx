import { Slide } from "../-hooks/use-slides";
import YouTubePlayer from "./youtube-player";

const VideoSlidePreview = ({ activeItem }: { activeItem: Slide }) => {
    const videoURL =
        (activeItem.status == "PUBLISHED" ? activeItem.published_url : activeItem.video_url) || "";
    return (
        <>
            <div key={`video-${activeItem.slide_id}`} className="size-full">
                <YouTubePlayer videoUrl={videoURL} videoTitle={activeItem.video_title} />
            </div>
            ,
        </>
    );
};

export default VideoSlidePreview;
