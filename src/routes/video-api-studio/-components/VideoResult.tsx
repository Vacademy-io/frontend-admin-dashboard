import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, CheckCircle2, ExternalLink } from 'lucide-react';
import { AIVideoPlayer } from '@/components/ai-video-player/AIVideoPlayer';

interface VideoResultProps {
    htmlUrl: string;
    audioUrl: string;
    videoUrl?: string;
    isRenderComplete: boolean;
    prompt: string;
}

export function VideoResult({
    htmlUrl,
    audioUrl,
    videoUrl,
    isRenderComplete,
    prompt,
}: VideoResultProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!videoUrl) return;

        setIsDownloading(true);
        try {
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-video-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: open in new tab
            window.open(videoUrl, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4">
            {/* Prompt Display */}
            <Card className="bg-muted/30">
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Prompt</p>
                    <p className="text-foreground">{prompt}</p>
                </CardContent>
            </Card>

            {/* Video Player */}
            <div className="rounded-xl overflow-hidden border shadow-lg">
                <AIVideoPlayer
                    timelineUrl={htmlUrl}
                    audioUrl={audioUrl}
                    width={1920}
                    height={1080}
                />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-4">
                {isRenderComplete && videoUrl ? (
                    <Button onClick={handleDownload} disabled={isDownloading} className="gap-2">
                        {isDownloading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Download MP4
                    </Button>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Rendering MP4... Download will be available soon</span>
                    </div>
                )}

                {videoUrl && (
                    <Button variant="outline" asChild className="gap-2">
                        <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Open in New Tab
                        </a>
                    </Button>
                )}
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
                {isRenderComplete ? (
                    <Badge className="gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle2 className="h-3 w-3" />
                        Video Ready
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="gap-1">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Rendering in Progress
                    </Badge>
                )}
            </div>
        </div>
    );
}
