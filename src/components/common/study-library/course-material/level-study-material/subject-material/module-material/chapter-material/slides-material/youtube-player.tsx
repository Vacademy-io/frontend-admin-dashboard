// components/common/study-library/youtube-player.tsx
import React, { useEffect, useRef, useState } from "react";

interface YTPlayer {
    destroy(): void;
    getCurrentTime(): number;
    getDuration(): number;
}

interface YouTubePlayerEvent {
    target: YTPlayer;
    data: number;
}

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: {
            Player: new (
                element: HTMLElement | string,
                options: {
                    height?: string | number;
                    width?: string | number;
                    videoId?: string;
                    playerVars?: {
                        autoplay?: number;
                        controls?: number;
                        showinfo?: number;
                        rel?: number;
                        [key: string]: unknown;
                    };
                    events?: {
                        onReady?: (event: YouTubePlayerEvent) => void;
                        onStateChange?: (event: YouTubePlayerEvent) => void;
                        onError?: (event: YouTubePlayerEvent) => void;
                        [key: string]: unknown;
                    };
                },
            ) => YTPlayer;
        };
    }
}

interface YouTubePlayerProps {
    videoUrl: string;
    videoTitle: string | null;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoUrl }) => {
    const playerRef = useRef<YTPlayer | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isAPIReady, setIsAPIReady] = useState(false);

    const extractVideoId = (url: string): string => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        if (match && match[2] && match[2].length === 11) {
            return match[2];
        }
        return "";
    };

    // Function to load YouTube IFrame API
    const loadYouTubeAPI = () => {
        console.log("Loading YouTube API...");

        if (window.YT) {
            console.log("YouTube API already loaded");
            setIsAPIReady(true);
            return;
        }

        // Remove any existing YouTube API script
        const existingScript = document.querySelector(
            'script[src="https://www.youtube.com/iframe_api"]',
        );
        if (existingScript) {
            console.log("Removing existing YouTube API script");
            existingScript.remove();
        }

        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";

        window.onYouTubeIframeAPIReady = () => {
            console.log("YouTube API Ready");
            setIsAPIReady(true);
        };

        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    };

    // Initialize YouTube API
    useEffect(() => {
        loadYouTubeAPI();

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, []);

    // Create player when API is ready and URL changes
    useEffect(() => {
        if (!isAPIReady || !videoUrl) {
            console.log("Waiting for API or missing video URL");
            return;
        }

        const videoId = extractVideoId(videoUrl);
        if (!videoId || !containerRef.current) {
            console.log("Invalid video ID or missing container");
            return;
        }

        // Destroy existing player
        if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
        }

        // Create container element
        const playerContainer = document.createElement("div");
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(playerContainer);

        // Create new player
        const player = new window.YT.Player(playerContainer, {
            height: "100%",
            width: "100%",
            videoId: videoId,
            playerVars: {
                autoplay: 0,
                controls: 1,
                showinfo: 0,
                rel: 0,
                modestbranding: 1,
            },
            events: {
                onReady: (event) => {
                    console.log("Player ready:", event);
                },
                onStateChange: (event) => {
                    console.log("Player state changed:", event);
                },
                onError: (event) => {
                    console.error("Player error:", event);
                },
            },
        });

        playerRef.current = player;
    }, [isAPIReady, videoUrl]);

    return (
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            {" "}
            {/* 16:9 aspect ratio */}
            <div
                ref={containerRef}
                className="absolute left-0 top-0 h-full w-full bg-neutral-100"
            />
        </div>
    );
};

export default YouTubePlayer;
