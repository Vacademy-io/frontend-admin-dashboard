// components/common/study-library/youtube-player.tsx
import React, { useEffect, useRef } from "react";

interface YTPlayer {
    destroy(): void;
    getCurrentTime(): number;
    getDuration(): number;
}

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
    }
}

// Define the props interface
interface YouTubePlayerProps {
    videoUrl: string;
    videoTitle?: string;
}

// Remove the type annotation in the component parameters since it's already defined in FC
export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoUrl }) => {
    const playerRef = useRef<YTPlayer | null>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);

    const extractVideoId = (url: string): string => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        if (match && match[2] && match[2].length === 11) {
            return match[2];
        }
        return "";
    };

    useEffect(() => {
        const videoId = extractVideoId(videoUrl);
        if (!videoId) return;

        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        if (firstScriptTag?.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            if (!playerContainerRef.current) return;

            const player = new window.YT.Player(playerContainerRef.current, {
                height: "600",
                width: "100%",
                videoId: videoId,
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                    showinfo: 0,
                    rel: 0,
                },
                events: {
                    onReady: () => {
                        console.log("Player is ready");
                    },
                    onStateChange: () => {
                        console.log("Player state changed");
                    },
                },
            });

            playerRef.current = player;
        };

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [videoUrl]);

    return (
        <div className="aspect-video w-full">
            <div ref={playerContainerRef} />
        </div>
    );
};

export default YouTubePlayer;
