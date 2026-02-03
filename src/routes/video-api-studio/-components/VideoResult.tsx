import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle2, Copy, Check, Code2, Link2, Share2 } from 'lucide-react';
import { AIContentPlayer } from '@/components/ai-video-player/AIContentPlayer';
import { ContentType, getContentTypeLabel } from '../-services/video-generation';

interface VideoResultProps {
    videoId: string;
    htmlUrl: string;
    audioUrl?: string;
    wordsUrl?: string;
    contentType?: ContentType;
    prompt: string;
}

export function VideoResult({
    videoId,
    htmlUrl,
    audioUrl,
    wordsUrl,
    contentType = 'VIDEO',
    prompt,
}: VideoResultProps) {
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedEmbed, setCopiedEmbed] = useState(false);

    // Build the shareable URL
    const baseUrl = window.location.origin;
    const shareableUrl = `${baseUrl}/content/${videoId}?timeline=${encodeURIComponent(htmlUrl)}${audioUrl ? `&audio=${encodeURIComponent(audioUrl)}` : ''}${wordsUrl ? `&words=${encodeURIComponent(wordsUrl)}` : ''}`;

    // Build the embed code
    const embedCode = `<iframe
  src="${shareableUrl}"
  width="100%"
  height="600"
  frameborder="0"
  allowfullscreen
  allow="autoplay; fullscreen"
  style="border-radius: 12px; overflow: hidden;"
></iframe>`;

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(shareableUrl);
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
        } catch (error) {
            console.error('Failed to copy URL:', error);
        }
    };

    const handleCopyEmbed = async () => {
        try {
            await navigator.clipboard.writeText(embedCode);
            setCopiedEmbed(true);
            setTimeout(() => setCopiedEmbed(false), 2000);
        } catch (error) {
            console.error('Failed to copy embed code:', error);
        }
    };

    const contentLabel = getContentTypeLabel(contentType);

    return (
        <div className="mx-auto w-full max-w-4xl space-y-4">
            {/* Prompt Display */}
            <Card className="bg-muted/30">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <p className="mb-1 text-sm text-muted-foreground">Prompt</p>
                            <p className="text-foreground">{prompt}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                            {contentLabel}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Content Player */}
            <div className="overflow-hidden rounded-xl border shadow-lg">
                <AIContentPlayer
                    timelineUrl={htmlUrl}
                    audioUrl={audioUrl}
                    wordsUrl={wordsUrl}
                    width={1920}
                    height={1080}
                />
            </div>

            {/* Share Actions */}
            <Card>
                <CardContent className="p-4">
                    <div className="space-y-4">
                        {/* Shareable URL */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <Link2 className="size-4" />
                                Shareable URL
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    value={shareableUrl}
                                    readOnly
                                    className="font-mono text-xs"
                                    onClick={(e) => e.currentTarget.select()}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopyUrl}
                                    className="shrink-0"
                                >
                                    {copiedUrl ? (
                                        <Check className="size-4 text-green-600" />
                                    ) : (
                                        <Copy className="size-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Embed Code */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Share2 className="size-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Share or embed this content
                                </span>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Code2 className="size-4" />
                                        Embed Code
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-96" align="end">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Embed Code</h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleCopyEmbed}
                                                className="h-7 gap-1.5 text-xs"
                                            >
                                                {copiedEmbed ? (
                                                    <>
                                                        <Check className="size-3 text-green-600" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="size-3" />
                                                        Copy
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs">
                                            {embedCode}
                                        </pre>
                                        <p className="text-xs text-muted-foreground">
                                            Paste this code into your website to embed the content.
                                        </p>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Status Badge */}
            <div className="flex justify-center">
                <Badge className="gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle2 className="size-3" />
                    Content Ready
                </Badge>
            </div>
        </div>
    );
}
