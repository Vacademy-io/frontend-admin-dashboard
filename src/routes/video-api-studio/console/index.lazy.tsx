import { useState, useEffect, useCallback, useRef } from 'react';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Video, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getInstituteId } from '@/constants/helper';
import { listApiKeys, ApiKey, getFirstAvailableFullKey } from '../-services/api-keys';
import {
    GenerateVideoRequest,
    HistoryItem,
    VideoStage,
    SSEEvent,
    ContentType,
    generateVideo,
    getHistory,
    saveToHistory,
    getVideoUrls,
} from '../-services/video-generation';
import { HistorySidebar } from '../-components/HistorySidebar';
import { PromptInput } from '../-components/PromptInput';
import { GenerationProgress } from '../-components/GenerationProgress';
import { VideoResult } from '../-components/VideoResult';

export const Route = createLazyFileRoute('/video-api-studio/console/')({
    component: VideoConsole,
});

type ConsoleState = 'idle' | 'generating' | 'complete';

interface CurrentGeneration {
    videoId: string;
    prompt: string;
    contentType: ContentType;
    stage: VideoStage;
    percentage: number;
    message: string;
    htmlUrl?: string;
    audioUrl?: string;
    wordsUrl?: string;
    options: Omit<GenerateVideoRequest, 'prompt'>;
}

function VideoConsole() {
    const navigate = useNavigate();
    const instituteId = getInstituteId();

    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isLoadingKeys, setIsLoadingKeys] = useState(true);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
    const [consoleState, setConsoleState] = useState<ConsoleState>('idle');
    const [currentGeneration, setCurrentGeneration] = useState<CurrentGeneration | null>(null);
    const [isLoadingVideoUrls, setIsLoadingVideoUrls] = useState(false);

    const abortRef = useRef<(() => void) | null>(null);

    // Load API keys
    useEffect(() => {
        const loadKeys = async () => {
            if (!instituteId) return;
            setIsLoadingKeys(true);
            try {
                const keys = await listApiKeys(instituteId);
                setApiKeys(keys.filter((k) => k.status === 'active'));
            } catch (error) {
                console.error('Error loading API keys:', error);
            } finally {
                setIsLoadingKeys(false);
            }
        };
        loadKeys();
    }, [instituteId]);

    // Load history
    useEffect(() => {
        setHistory(getHistory());
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortRef.current) {
                abortRef.current();
            }
        };
    }, []);

    // Get the full API key from localStorage (stored when key was generated)
    const activeApiKey = getFirstAvailableFullKey(apiKeys);

    const handleGenerate = useCallback(
        async (request: GenerateVideoRequest) => {
            if (!activeApiKey) {
                toast.error('No API key available');
                return;
            }

            // Reset state
            setConsoleState('generating');
            setSelectedHistoryId(null);

            const contentType = request.content_type || 'VIDEO';

            const { abort, videoId } = generateVideo(
                request,
                activeApiKey,
                (event: SSEEvent) => {
                    if (event.type === 'progress') {
                        // Extract URLs from files if available
                        const audioUrl = event.files?.audio?.s3_url;
                        const timelineUrl = event.files?.timeline?.s3_url;
                        const wordsUrl = event.files?.words?.s3_url;

                        setCurrentGeneration((prev) => ({
                            videoId,
                            prompt: request.prompt,
                            contentType,
                            stage: event.stage,
                            percentage: event.percentage,
                            message: event.message,
                            htmlUrl: timelineUrl || prev?.htmlUrl,
                            audioUrl: audioUrl || prev?.audioUrl,
                            wordsUrl: wordsUrl || prev?.wordsUrl,
                            options: {
                                content_type: contentType,
                                language: request.language,
                                voice_gender: request.voice_gender,
                                tts_provider: request.tts_provider,
                                captions_enabled: request.captions_enabled,
                                html_quality: request.html_quality,
                                target_audience: request.target_audience,
                                target_duration: request.target_duration,
                                model: request.model,
                            },
                        }));

                        // Update history with URLs if available
                        saveToHistory({
                            id: videoId,
                            video_id: videoId,
                            prompt: request.prompt,
                            content_type: contentType,
                            status: 'generating',
                            stage: event.stage,
                            created_at: new Date().toISOString(),
                            html_url: timelineUrl,
                            audio_url: audioUrl,
                            words_url: wordsUrl,
                            options: {
                                content_type: contentType,
                                language: request.language,
                                voice_gender: request.voice_gender,
                                tts_provider: request.tts_provider,
                                captions_enabled: request.captions_enabled,
                                html_quality: request.html_quality,
                                target_audience: request.target_audience,
                                target_duration: request.target_duration,
                                model: request.model,
                            },
                        });
                        setHistory(getHistory());

                        // When HTML stage is reached, show the player - content is ready
                        // Audio URL comes from TTS stage, timeline from HTML stage
                        setCurrentGeneration((prev) => {
                            if (
                                event.stage === 'HTML' &&
                                (timelineUrl || prev?.htmlUrl) &&
                                prev?.audioUrl
                            ) {
                                // HTML stage complete = content ready, show result
                                setConsoleState('complete');
                                toast.success('Content generated successfully!');
                            }
                            return prev
                                ? {
                                      ...prev,
                                      htmlUrl: timelineUrl || prev.htmlUrl,
                                      audioUrl: audioUrl || prev.audioUrl,
                                      wordsUrl: wordsUrl || prev.wordsUrl,
                                  }
                                : null;
                        });
                    } else if (event.type === 'completed') {
                        // Content is complete
                        setConsoleState('complete');
                        toast.success('Content generated successfully!');

                        // Update history as completed
                        setCurrentGeneration((prev) =>
                            prev
                                ? {
                                      ...prev,
                                      stage: 'HTML',
                                      percentage: 100,
                                  }
                                : null
                        );

                        saveToHistory({
                            id: videoId,
                            video_id: videoId,
                            prompt: request.prompt,
                            content_type: contentType,
                            status: 'completed',
                            stage: 'HTML',
                            created_at: new Date().toISOString(),
                            options: {
                                content_type: contentType,
                                language: request.language,
                                captions_enabled: request.captions_enabled,
                                html_quality: request.html_quality,
                                target_audience: request.target_audience,
                                voice_gender: request.voice_gender,
                                tts_provider: request.tts_provider,
                                target_duration: request.target_duration,
                                model: request.model,
                            },
                        });
                        setHistory(getHistory());
                    } else if (event.type === 'error') {
                        // Check if error happened after HTML stage
                        const errorStage = event.stage;
                        const hasContent = errorStage === 'HTML';

                        setCurrentGeneration((prev) => {
                            // If we have HTML URLs, keep showing the player
                            if (prev?.htmlUrl && prev?.audioUrl && hasContent) {
                                toast.error(
                                    'Generation encountered an issue. Content is still available.'
                                );
                                setConsoleState('complete');
                                return {
                                    ...prev,
                                    message: 'Generation completed with issues',
                                };
                            } else {
                                toast.error(event.message || 'Generation failed');
                                setConsoleState('idle');
                                return null;
                            }
                        });

                        // Update history
                        saveToHistory({
                            id: videoId,
                            video_id: videoId,
                            prompt: request.prompt,
                            content_type: contentType,
                            status: hasContent ? 'completed' : 'failed',
                            stage: errorStage || 'PENDING',
                            created_at: new Date().toISOString(),
                            options: {
                                content_type: contentType,
                                language: request.language,
                                captions_enabled: request.captions_enabled,
                                html_quality: request.html_quality,
                                target_audience: request.target_audience,
                                target_duration: request.target_duration,
                                voice_gender: request.voice_gender,
                                tts_provider: request.tts_provider,
                                model: request.model,
                            },
                        });
                        setHistory(getHistory());
                    }
                },
                (error) => {
                    toast.error(`Generation failed: ${error.message}`);
                    setConsoleState('idle');
                }
            );

            abortRef.current = abort;

            // Initialize generation state
            setCurrentGeneration({
                videoId,
                prompt: request.prompt,
                contentType,
                stage: 'PENDING',
                percentage: 0,
                message: 'Starting generation...',
                options: {
                    content_type: contentType,
                    language: request.language,
                    captions_enabled: request.captions_enabled,
                    html_quality: request.html_quality,
                    target_audience: request.target_audience,
                    voice_gender: request.voice_gender,
                    tts_provider: request.tts_provider,
                    target_duration: request.target_duration,
                    model: request.model,
                },
            });

            // Save initial history entry
            saveToHistory({
                id: videoId,
                video_id: videoId,
                prompt: request.prompt,
                content_type: contentType,
                status: 'pending',
                stage: 'PENDING',
                created_at: new Date().toISOString(),
                options: {
                    content_type: contentType,
                    language: request.language,
                    captions_enabled: request.captions_enabled,
                    html_quality: request.html_quality,
                    voice_gender: request.voice_gender,
                    tts_provider: request.tts_provider,
                    target_audience: request.target_audience,
                    target_duration: request.target_duration,
                    model: request.model,
                },
            });
            setHistory(getHistory());
        },
        [activeApiKey]
    );

    const handleSelectHistory = useCallback(
        async (item: HistoryItem) => {
            setSelectedHistoryId(item.video_id);

            // If we have URLs locally, use them directly
            if (item.html_url && item.audio_url) {
                setCurrentGeneration({
                    videoId: item.video_id,
                    prompt: item.prompt,
                    contentType: item.content_type || 'VIDEO',
                    stage: item.stage,
                    percentage: 100,
                    message: '',
                    htmlUrl: item.html_url,
                    audioUrl: item.audio_url,
                    wordsUrl: item.words_url,
                    options: item.options,
                });
                setConsoleState('complete');
                return;
            }

            // If completed but no URLs locally, try to fetch from API
            if (
                (item.status === 'completed' || item.stage === 'HTML' || item.stage === 'RENDER') &&
                activeApiKey
            ) {
                setIsLoadingVideoUrls(true);
                setConsoleState('idle');
                setCurrentGeneration(null);

                try {
                    const urls = await getVideoUrls(item.video_id, activeApiKey);

                    // Update history with fetched URLs
                    const updatedItem: HistoryItem = {
                        ...item,
                        html_url: urls.html_url,
                        audio_url: urls.audio_url,
                        words_url: urls.words_url,
                        status: 'completed',
                    };
                    saveToHistory(updatedItem);
                    setHistory(getHistory());

                    setCurrentGeneration({
                        videoId: item.video_id,
                        prompt: item.prompt,
                        contentType: item.content_type || 'VIDEO',
                        stage: urls.current_stage || item.stage,
                        percentage: 100,
                        message: '',
                        htmlUrl: urls.html_url,
                        audioUrl: urls.audio_url,
                        wordsUrl: urls.words_url,
                        options: item.options,
                    });
                    setConsoleState('complete');
                    toast.success('Video loaded successfully');
                } catch (error) {
                    console.error('Failed to fetch video URLs:', error);
                    toast.error(
                        'Failed to load video details. The video may no longer be available.'
                    );
                    setConsoleState('idle');
                    setCurrentGeneration(null);
                } finally {
                    setIsLoadingVideoUrls(false);
                }
                return;
            }

            // For pending/generating/failed items without URLs
            setConsoleState('idle');
            setCurrentGeneration(null);
        },
        [activeApiKey]
    );

    const handleDeleteHistory = useCallback(
        (videoId: string) => {
            setHistory(getHistory());
            if (videoId === selectedHistoryId) {
                setSelectedHistoryId(null);
                setCurrentGeneration(null);
                setConsoleState('idle');
            }
        },
        [selectedHistoryId]
    );

    const handleNewVideo = useCallback(() => {
        if (abortRef.current) {
            abortRef.current();
            abortRef.current = null;
        }
        setSelectedHistoryId(null);
        setCurrentGeneration(null);
        setConsoleState('idle');
    }, []);

    // No API keys or no stored full key - redirect to main page
    const hasActiveKeys = apiKeys.filter((k) => k.status === 'active').length > 0;
    if (!isLoadingKeys && (!hasActiveKeys || !activeApiKey)) {
        return (
            <LayoutContainer>
                <div className="flex h-[calc(100vh-theme(spacing.20))] flex-col items-center justify-center gap-4">
                    <div className="text-center">
                        <Video className="mx-auto mb-4 size-16 text-muted-foreground" />
                        <h1 className="mb-2 text-2xl font-bold">
                            {!hasActiveKeys ? 'No API Keys Found' : 'API Key Not Available'}
                        </h1>
                        <p className="mb-6 text-muted-foreground">
                            {!hasActiveKeys
                                ? 'You need an active API key to use the Video Console'
                                : 'Please generate a new API key to use the Video Console'}
                        </p>
                        <Button onClick={() => navigate({ to: '/video-api-studio' })}>
                            <ArrowLeft className="mr-2 size-4" />
                            Go to API Studio
                        </Button>
                    </div>
                </div>
            </LayoutContainer>
        );
    }

    const isGenerating = consoleState === 'generating';

    return (
        <div className="relative flex h-screen w-full overflow-hidden bg-background">
            {/* Sidebar */}
            <HistorySidebar
                history={history}
                selectedId={selectedHistoryId}
                onSelect={handleSelectHistory}
                onDelete={handleDeleteHistory}
                onNewVideo={handleNewVideo}
            />

            {/* Main Content */}
            <div className="flex min-w-0 flex-1 flex-col bg-secondary/10">
                {/* Header */}
                <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/50 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-primary -ml-2 size-8 text-muted-foreground"
                            onClick={() => navigate({ to: '/video-api-studio' })}
                        >
                            <ArrowLeft className="size-4" />
                        </Button>
                        <div className="hidden h-4 w-px bg-border sm:block" />
                        <div>
                            <h1 className="flex items-center gap-2 text-sm font-semibold sm:text-base">
                                <div className="rounded bg-violet-100 p-1 text-violet-600">
                                    <Sparkles className="size-3.5" />
                                </div>
                                Video Console
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth p-4 sm:p-6">
                    {consoleState === 'idle' && !currentGeneration && !isLoadingVideoUrls && (
                        <div className="flex h-full flex-col items-center justify-center p-4 text-center duration-500 animate-in fade-in zoom-in">
                            <div className="group relative mb-6">
                                <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-2xl transition-all duration-500 group-hover:bg-violet-500/30" />
                                <div className="relative rounded-2xl border border-violet-100/50 bg-gradient-to-br from-violet-100 to-indigo-50 p-6 shadow-sm">
                                    <Video className="size-12 text-violet-600" />
                                </div>
                                {/* Floating Icons */}
                                <div className="absolute -right-2 -top-2 animate-bounce rounded-lg border border-border bg-white p-1.5 shadow-sm delay-100">
                                    <Sparkles className="size-3 text-amber-500" />
                                </div>
                                <div className="absolute -bottom-2 -left-2 animate-bounce rounded-lg border border-border bg-white p-1.5 shadow-sm delay-700">
                                    <Sparkles className="size-3 text-indigo-500" />
                                </div>
                            </div>
                            <h2 className="mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-2xl font-semibold text-transparent">
                                Create Educational Video
                            </h2>
                            <p className="max-w-[460px] leading-relaxed text-muted-foreground">
                                Describe what you want to explain, and our AI will generate a
                                complete educational video with narration, visuals, and subtitles.
                            </p>
                        </div>
                    )}

                    {isLoadingVideoUrls && (
                        <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center duration-300 animate-in fade-in">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-2xl" />
                                <div className="relative rounded-2xl border border-violet-100/50 bg-gradient-to-br from-violet-100 to-indigo-50 p-6 shadow-sm">
                                    <Loader2 className="size-12 animate-spin text-violet-600" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold text-foreground">
                                    Loading Video
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Fetching video details from server...
                                </p>
                            </div>
                        </div>
                    )}

                    {consoleState === 'generating' && currentGeneration && (
                        <div className="mx-auto flex size-full max-w-2xl items-center justify-center">
                            <GenerationProgress
                                currentStage={currentGeneration.stage}
                                percentage={currentGeneration.percentage}
                                message={currentGeneration.message}
                                contentType={currentGeneration.contentType}
                            />
                        </div>
                    )}

                    {consoleState === 'complete' &&
                        currentGeneration?.htmlUrl &&
                        currentGeneration?.audioUrl && (
                            <VideoResult
                                videoId={currentGeneration.videoId}
                                htmlUrl={currentGeneration.htmlUrl}
                                audioUrl={currentGeneration.audioUrl}
                                wordsUrl={currentGeneration.wordsUrl}
                                contentType={currentGeneration.contentType}
                                prompt={currentGeneration.prompt}
                            />
                        )}
                </div>

                {/* Prompt Input */}
                <div className="sticky bottom-0 z-20 border-t bg-background/80 shadow-lg shadow-violet-500/5 backdrop-blur-md">
                    <PromptInput
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                        disabled={!activeApiKey}
                    />
                </div>
            </div>
        </div>
    );
}
