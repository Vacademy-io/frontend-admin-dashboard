import { Slide } from '../-hooks/use-slides';
import { useContentStore } from '../-stores/chapter-sidebar-store';
import YouTubePlayer from './youtube-player';

const VideoSlidePreview = ({ activeItem }: { activeItem: Slide }) => {
    const { items } = useContentStore();
    const videoURL =
        (activeItem.status == 'PUBLISHED'
            ? activeItem.video_slide?.published_url
            : activeItem.video_slide?.url) || '';
    return (
        <>
            <div key={`video-${items.length + 1}`} className="size-full">
                <YouTubePlayer videoUrl={videoURL} />
            </div>
        </>
    );
};

export default VideoSlidePreview;
