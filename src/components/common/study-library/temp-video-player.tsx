// import React, { useEffect, useRef, useState } from 'react';

// declare global {
//   interface Window {
//     YT: {
//       Player: any;
//       PlayerState: {
//         ENDED: number;
//         PLAYING: number;
//         PAUSED: number;
//         BUFFERING: number;
//         CUED: number;
//       };
//     };
//     onYouTubeIframeAPIReady: () => void;
//   }
// }

// interface YouTubePlayerProps {
//   videoId: string;
//   videoTitle: string;
// }

// interface VideoActivity {
//   activityDate: string;
//   startTime: string;
//   endTime: string;
//   duration: string;
//   videoWatched: string;
// }

// const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, videoTitle }) => {
//   const playerRef = useRef<any>(null);
//   const playerContainerRef = useRef<HTMLDivElement>(null);
//   const [videoDuration, setVideoDuration] = useState<number>(0);
//   const startTimeRef = useRef<Date | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const lastApiCallTime = useRef<number>(0);

//   const shouldCallApi = () => {
//     const now = Date.now();
//     if (now - lastApiCallTime.current >= 10000) { // 10 seconds throttling
//       lastApiCallTime.current = now;
//       return true;
//     }
//     return false;
//   };

//   const formatActivityDate = (date: Date): string => {
//     return date.toLocaleDateString('en-GB');
//   };

//   const formatActivityTime = (date: Date): string => {
//     return date.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   const calculateDurationInSeconds = (start: Date, end: Date): string => {
//     const diffInSeconds = Math.round((end.getTime() - start.getTime()) / 1000);
//     return `${diffInSeconds}s`;
//   };

//   const calculatePercentageWatched = (): number => {
//     if (!playerRef.current || !videoDuration) return 0;
//     const currentTime = playerRef.current.getCurrentTime();
//     return Math.min(Math.round((currentTime / videoDuration) * 100), 100);
//   };

//   const logVideoActivity = (action: 'play' | 'pause'): void => {
//     if (!playerRef.current) return;

//     const now = new Date();
//     const currentTime = playerRef.current.getCurrentTime();

//     if (action === 'play') {
//         startTimeRef.current = now;
//     }

//     const percentage = calculatePercentageWatched();

//     const activityData: VideoActivity = {
//         activityDate: formatActivityDate(startTimeRef.current || now),
//         startTime: formatActivityTime(startTimeRef.current || now),
//         endTime: formatActivityTime(now),
//         duration: `${Math.round(currentTime)}s`, // Use current video time directly
//         videoWatched: `${percentage}%`
//     };

//     // API call logic with throttling
//     if (action === 'play' && shouldCallApi()) {
//         console.log('Calling API with data:', activityData);
//     } else if (action === 'play') {
//         console.log('API call throttled. Last call was less than 10 seconds ago.');
//     }

//     console.log(`Video ${action}ed at ${currentTime.toFixed(2)} seconds`);
//     console.log('Activity Data:', activityData);
//     console.log(`Current video progress: ${percentage}%`);
// };

//   useEffect(() => {
//     const tag = document.createElement('script');
//     tag.src = 'https://www.youtube.com/iframe_api';
//     const firstScriptTag = document.getElementsByTagName('script')[0];
//     if(firstScriptTag) firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

//     window.onYouTubeIframeAPIReady = () => {
//       playerRef.current = new window.YT.Player(playerContainerRef.current, {
//         height: '390',
//         width: '640',
//         videoId: videoId,
//         playerVars: {
//           autoplay: 0,
//           controls: 1,
//           showinfo: 0,
//           rel: 0,
//         },
//         events: {
//           onReady: onPlayerReady,
//           onStateChange: onPlayerStateChange,
//         },
//       });
//     };

//     return () => {
//       if (playerRef.current) {
//         playerRef.current.destroy();
//       }
//     };
//   }, [videoId]);

//   const onPlayerReady = (event: any): void => {
//     const duration = event.target.getDuration();
//     setVideoDuration(duration);
//     console.log('Video duration:', duration, 'seconds');
//   };

//   const onPlayerStateChange = (event: any): void => {
//     switch (event.data) {
//       case window.YT.PlayerState.PLAYING:
//         setIsPlaying(true);
//         logVideoActivity('play');
//         break;

//       case window.YT.PlayerState.PAUSED:
//         setIsPlaying(false);
//         logVideoActivity('pause');
//         break;

//       case window.YT.PlayerState.ENDED:
//         setIsPlaying(false);
//         console.log('Video ended at 100%');
//         break;
//     }
//   };

//   // Update progress periodically while playing
//   useEffect(() => {
//     let progressInterval: NodeJS.Timeout;

//     if (isPlaying) {
//       progressInterval = setInterval(() => {
//         const percentage = calculatePercentageWatched();
//         console.log(`Current progress: ${percentage}%`);
//       }, 5000); // Log every 5 seconds while playing
//     }

//     return () => {
//       if (progressInterval) {
//         clearInterval(progressInterval);
//       }
//     };
//   }, [isPlaying]);

//   return (
//     <div>
//       <h1>Video: {videoTitle}</h1>
//       <div ref={playerContainerRef} />
//     </div>
//   );
// };

// export default YouTubePlayer;

import React, { useEffect, useRef, useState } from "react";

interface YTPlayerState {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
}

interface YTPlayer {
    destroy(): void;
    getCurrentTime(): number;
    getDuration(): number;
}

interface YTPlayerEvent {
    target: YTPlayer;
    data: number;
}

interface YTPlayerOptions {
    height: string;
    width: string;
    videoId: string;
    playerVars: {
        autoplay: number;
        controls: number;
        showinfo: number;
        rel: number;
    };
    events: {
        onReady: (event: YTPlayerEvent) => void;
        onStateChange: (event: YTPlayerEvent) => void;
    };
}

// Update the global namespace
declare global {
    interface Window {
        YT: {
            Player: new (container: HTMLElement | null, options: YTPlayerOptions) => YTPlayer;
            PlayerState: YTPlayerState;
        };
        onYouTubeIframeAPIReady: () => void;
    }
}

interface YouTubePlayerProps {
    videoId: string;
    videoTitle: string;
}

interface VideoActivity {
    activityDate: string;
    startTime: string;
    endTime: string;
    duration: string;
    videoWatched: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, videoTitle }) => {
    const playerRef = useRef<YTPlayer | null>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const startTimeRef = useRef<Date | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const lastApiCallTime = useRef<number>(0);

    const shouldCallApi = () => {
        const now = Date.now();
        if (now - lastApiCallTime.current >= 10000) {
            // 10 seconds throttling
            lastApiCallTime.current = now;
            return true;
        }
        return false;
    };

    const formatActivityDate = (date: Date): string => {
        return date.toLocaleDateString("en-GB");
    };

    const formatActivityTime = (date: Date): string => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    //   const calculateDurationInSeconds = (start: Date, end: Date): string => {
    //     const diffInSeconds = Math.round((end.getTime() - start.getTime()) / 1000);
    //     return `${diffInSeconds}s`;
    //   };

    const calculatePercentageWatched = (): number => {
        if (!playerRef.current || !videoDuration) return 0;
        const currentTime = playerRef.current.getCurrentTime();
        return Math.min(Math.round((currentTime / videoDuration) * 100), 100);
    };

    const logVideoActivity = (action: "play" | "pause"): void => {
        if (!playerRef.current) return;

        const now = new Date();
        const currentTime = playerRef.current.getCurrentTime();

        if (action === "play") {
            startTimeRef.current = now;
        }

        const percentage = calculatePercentageWatched();

        const activityData: VideoActivity = {
            activityDate: formatActivityDate(startTimeRef.current || now),
            startTime: formatActivityTime(startTimeRef.current || now),
            endTime: formatActivityTime(now),
            duration: `${Math.round(currentTime)}s`, // Use current video time directly
            videoWatched: `${percentage}%`,
        };

        // API call logic with throttling
        if (action === "play" && shouldCallApi()) {
            console.log("Calling API with data:", activityData);
        } else if (action === "play") {
            console.log("API call throttled. Last call was less than 10 seconds ago.");
        }

        console.log(`Video ${action}ed at ${currentTime.toFixed(2)} seconds`);
        console.log("Activity Data:", activityData);
        console.log(`Current video progress: ${percentage}%`);
    };

    useEffect(() => {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        if (firstScriptTag) firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            const options: YTPlayerOptions = {
                height: "390",
                width: "640",
                videoId: videoId,
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                    showinfo: 0,
                    rel: 0,
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange,
                },
            };

            playerRef.current = new window.YT.Player(playerContainerRef.current, options);
        };

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [videoId]);

    const onPlayerReady = (event: YTPlayerEvent): void => {
        const duration = event.target.getDuration();
        setVideoDuration(duration);
        console.log("Video duration:", duration, "seconds");
    };

    const onPlayerStateChange = (event: YTPlayerEvent): void => {
        switch (event.data) {
            case window.YT.PlayerState.PLAYING:
                setIsPlaying(true);
                logVideoActivity("play");
                break;

            case window.YT.PlayerState.PAUSED:
                setIsPlaying(false);
                logVideoActivity("pause");
                break;

            case window.YT.PlayerState.ENDED:
                setIsPlaying(false);
                console.log("Video ended at 100%");
                break;
        }
    };

    // Update progress periodically while playing
    useEffect(() => {
        let progressInterval: NodeJS.Timeout;

        if (isPlaying) {
            progressInterval = setInterval(() => {
                const percentage = calculatePercentageWatched();
                console.log(`Current progress: ${percentage}%`);
            }, 5000); // Log every 5 seconds while playing
        }

        return () => {
            if (progressInterval) {
                clearInterval(progressInterval);
            }
        };
    }, [isPlaying]);

    return (
        <div>
            <h1>Video: {videoTitle}</h1>
            <div ref={playerContainerRef} />
        </div>
    );
};

export default YouTubePlayer;
