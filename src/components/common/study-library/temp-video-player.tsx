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
//   const lastApiCallTime = useRef<number>(0);
//   const startTimeRef = useRef<Date | null>(null);

//   const shouldCallApi = () => {
//     const now = Date.now();
//     if (now - lastApiCallTime.current >= 10000) {
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
//     if (!shouldCallApi() || !playerRef.current) return;

//     const now = new Date();
//     if (action === 'play') {
//       startTimeRef.current = now;
//     }

//     const activityData: VideoActivity = {
//       activityDate: formatActivityDate(startTimeRef.current || now),
//       startTime: formatActivityTime(startTimeRef.current || now),
//       endTime: formatActivityTime(now),
//       duration: startTimeRef.current ? calculateDurationInSeconds(startTimeRef.current, now) : '0s',
//       videoWatched: `${calculatePercentageWatched()}%`
//     };

//     console.log(`Video ${action}ed:`, activityData);
//   };

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
//     const duration = playerRef.current.getDuration();
//     setVideoDuration(duration);
//   };

//   const onPlayerStateChange = (event: any): void => {
//     switch (event.data) {
//       case window.YT.PlayerState.PLAYING:
//         logVideoActivity('play');
//         break;

//       case window.YT.PlayerState.PAUSED:
//         logVideoActivity('pause');
//         break;
//     }
//   };

//   return (
//     <div>
//       <h1>Video: {videoTitle}</h1>
//       <div ref={playerContainerRef} />
//     </div>
//   );
// };

// export default YouTubePlayer;
