'use client';

import { useEffect, useRef, useState } from 'react';
import { Slide } from '../-hooks/use-slides';
import { useMediaNavigationStore } from '../-stores/media-navigation-store';
import { getPublicUrl } from '@/services/upload_file';
import YouTubePlayer from './youtube-player';
import { toast } from 'sonner';
import { GET_VIDEO_URLS } from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { AIVideoPlayer } from '@/components/ai-video-player/AIVideoPlayer';

const VideoSlidePreview = ({ activeItem, embedUrl }: { activeItem: Slide; embedUrl?: string }) => {
    const { videoSeekTime, clearVideoSeekTime } = useMediaNavigationStore();
    const videoSourceType = activeItem.video_slide?.source_type || (activeItem as any).source_type;
    const videoStatus = activeItem.status;
    // const videoTitle = activeItem.video_slide?.title || 'Video';
    const videoRef = useRef<HTMLVideoElement>(null);

    const fileId =
        videoStatus === 'PUBLISHED'
            ? activeItem.video_slide?.published_url
            : activeItem.video_slide?.url;

    const [videoUrl, setVideoUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUrlExpired, setIsUrlExpired] = useState(false);
    
    // HTML_VIDEO state
    const [htmlVideoData, setHtmlVideoData] = useState<{
        htmlUrl: string;
        audioUrl: string;
    } | null>(null);
    const [isLoadingHtmlVideo, setIsLoadingHtmlVideo] = useState(false);

    // Reset state when switching to a different video slide
    useEffect(() => {
        setVideoUrl('');
        setIsLoading(true);
        setError(null);
        setIsUrlExpired(false);
        setHtmlVideoData(null);
        setIsLoadingHtmlVideo(false);
    }, [activeItem.id]);

    // Fetch HTML_VIDEO URLs when source_type is HTML_VIDEO
    useEffect(() => {
        const fetchHtmlVideoUrls = async () => {
            if (videoSourceType !== 'HTML_VIDEO') return;

            const htmlVideoSlide = (activeItem as any).html_video_slide;
            if (!htmlVideoSlide?.ai_gen_video_id) {
                console.warn('HTML_VIDEO slide missing ai_gen_video_id');
                setError('Video ID not found');
                setIsLoadingHtmlVideo(false);
                return;
            }

            setIsLoadingHtmlVideo(true);
            setError(null);

            try {
                const response = await authenticatedAxiosInstance.get(
                    GET_VIDEO_URLS(htmlVideoSlide.ai_gen_video_id)
                );
                
                setHtmlVideoData({
                    htmlUrl: response.data.html_url,
                    audioUrl: response.data.audio_url,
                });
            } catch (err: any) {
                console.error('Error fetching HTML video URLs:', err);
                if (err.response?.status === 404) {
                    setError(`Video ${htmlVideoSlide.ai_gen_video_id} not found`);
                } else {
                    setError('Failed to load video URLs');
                }
            } finally {
                setIsLoadingHtmlVideo(false);
            }
        };

        fetchHtmlVideoUrls();
    }, [activeItem.id, videoSourceType]);

    const refreshS3Url = async () => {
        try {
            setIsLoading(true);
            const url = await getPublicUrl(fileId!);
            setVideoUrl(url);
            setIsUrlExpired(false);
        } catch (err) {
            console.error('Error refreshing video URL:', err);
            setError('Failed to refresh video URL');
        } finally {
            setIsLoading(false);
        }
    };

    //   video seeking when videoSeekTime changes
    useEffect(() => {
        if (videoSeekTime !== null && videoRef.current) {
            const video = videoRef.current;

            const handleSeek = () => {
                video.currentTime = videoSeekTime;
                clearVideoSeekTime();
                toast.success(
                    `Video jumped to ${Math.floor(videoSeekTime / 60)}:${Math.floor(
                        videoSeekTime % 60
                    )
                        .toString()
                        .padStart(2, '0')}`
                );
            };

            if (video.readyState >= 2) {
                handleSeek();
                return undefined; // Explicit return, but not necessary in React
            } else {
                const onLoadedData = () => {
                    handleSeek();
                    video.removeEventListener('loadeddata', onLoadedData);
                };
                video.addEventListener('loadeddata', onLoadedData);
                return () => {
                    video.removeEventListener('loadeddata', onLoadedData);
                };
            }
        }
        // No return needed if the condition isn't met, but you can return undefined if you want
        return undefined;
    }, [videoSeekTime, clearVideoSeekTime]);

    useEffect(() => {
        const fetchVideoUrl = async () => {
            try {
                console.log('Fetching video URL for file ID:', fileId);
                if (videoSourceType === 'FILE_ID') {
                    const url = await getPublicUrl(fileId!);
                    setVideoUrl(url);

                    if (url.includes('X-Amz-Expires=')) {
                        const expiresParam = url.match(/X-Amz-Expires=(\d+)/)?.[1];
                        if (expiresParam) {
                            const expiresInSeconds = Number.parseInt(expiresParam, 10);
                            const refreshTimer = setTimeout(
                                () => {
                                    setIsUrlExpired(true);
                                },
                                (expiresInSeconds - 30) * 1000
                            );

                            return () => clearTimeout(refreshTimer);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching video URL:', err);
                setError('Failed to load video');
            } finally {
                setIsLoading(false);
            }
            return undefined; // Ensure all code paths return a value
        };

        if (videoSourceType === 'FILE_ID') {
            fetchVideoUrl();
        }
    }, [fileId, videoSourceType]);

    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        console.error('Video playback error:', e);
        const videoElement = e.currentTarget;
        if (
            videoElement.error?.code === MediaError.MEDIA_ERR_NETWORK ||
            videoElement.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
        ) {
            setIsUrlExpired(true);
            toast.error('Video URL has expired. Refreshing...');
        } else {
            setError(`Video playback error: ${videoElement.error?.message || 'Unknown error'}`);
        }
    };

    useEffect(() => {
        if (isUrlExpired) {
            refreshS3Url();
        }
    }, [isUrlExpired]);

    // HTML_VIDEO rendering
    if (videoSourceType === 'HTML_VIDEO') {
        if (isLoadingHtmlVideo) {
            return (
                <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
                    <div className="flex flex-col items-center gap-3">
                        <div className="size-12 animate-spin rounded-full border-y-2 border-primary-500"></div>
                        <p className="text-sm text-gray-600">Loading video...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-red-50 p-4">
                    <p className="mb-2 font-medium text-red-500">{error}</p>
                </div>
            );
        }

        // Show processing loader when video data is not available yet
        if (!htmlVideoData?.htmlUrl || !htmlVideoData?.audioUrl) {
            return (
                <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
                    <div className="flex flex-col items-center gap-3">
                        <div className="size-12 animate-spin rounded-full border-y-2 border-primary-500"></div>
                        <p className="text-sm text-gray-600">Processing video...</p>
                    </div>
                </div>
            );
        }

        if (htmlVideoData.htmlUrl && htmlVideoData.audioUrl) {
            return (
                <div key={`html-video-${activeItem.id}`} className="w-full overflow-hidden rounded-lg flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <AIVideoPlayer
                        timelineUrl={htmlVideoData.htmlUrl}
                        audioUrl={htmlVideoData.audioUrl}
                        className="w-full"
                    />
                </div>
            );
        }

        return (
            <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
                <p className="text-gray-500">Video not available</p>
            </div>
        );
    }

    // Loading UI
    if (videoSourceType === 'FILE_ID' && isLoading) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
                <div className="size-12 animate-spin rounded-full border-y-2 border-primary-500"></div>
            </div>
        );
    }

    // Error UI
    if (videoSourceType === 'FILE_ID' && error) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-red-50 p-4">
                <p className="mb-2 font-medium text-red-500">{error}</p>
                <button
                    onClick={refreshS3Url}
                    className="rounded-md bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    // FILE_ID video rendering
    if (videoSourceType === 'FILE_ID') {
        return (
            <div key={`video-${activeItem.id}`} className="w-full overflow-hidden rounded-lg">
                {isUrlExpired ? (
                    <div className="flex h-64 flex-col items-center justify-center bg-yellow-50 p-4">
                        <p className="mb-4 text-yellow-700">Video URL has expired. Refreshing...</p>
                        <div className="size-8 animate-spin rounded-full border-y-2 border-primary-500"></div>
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        className="w-full"
                        controls
                        controlsList="nodownload"
                        onError={handleVideoError}
                        playsInline
                        preload="metadata"
                    >
                        <source src={videoUrl} type="video/webm" />
                        <source src={videoUrl} type="video/mp4" />
                        <source src={videoUrl} type="video/ogg" />
                        Your browser does not support the video tag or the video format.
                    </video>
                )}
            </div>
        );
    }

    // YouTube embed fallback for 'VIDEO'
    return (
        <div key={`video-${activeItem.id}`} className="size-full">
            <YouTubePlayer
                videoUrl={
                    activeItem.video_slide?.published_url ||
                    activeItem.video_slide?.url ||
                    embedUrl ||
                    ''
                }
            />
        </div>
    );
};

export default VideoSlidePreview;
