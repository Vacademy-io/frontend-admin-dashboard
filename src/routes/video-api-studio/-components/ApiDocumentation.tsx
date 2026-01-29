import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { AI_SERVICE_BASE_URL } from '@/constants/urls';

interface CodeBlockProps {
    code: string;
    language?: string;
}

function CodeBlock({ code, language = 'json' }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const copyCode = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code className={`language-${language}`}>{code}</code>
            </pre>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 hover:bg-slate-700 text-slate-100"
                onClick={copyCode}
            >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
        </div>
    );
}

interface EndpointCardProps {
    method: 'GET' | 'POST' | 'DELETE';
    path: string;
    title: string;
    description: string;
    requestBody?: string;
    response: string;
    queryParams?: { name: string; description: string; required?: boolean }[];
}

function EndpointCard({
    method,
    path,
    title,
    description,
    requestBody,
    response,
    queryParams,
}: EndpointCardProps) {
    const methodColors = {
        GET: 'bg-green-100 text-green-800',
        POST: 'bg-blue-100 text-blue-800',
        DELETE: 'bg-red-100 text-red-800',
    };

    return (
        <Card className="border-border">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                    <Badge className={methodColors[method]}>{method}</Badge>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{path}</code>
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {queryParams && queryParams.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium mb-2">Query Parameters</h4>
                        <div className="space-y-1">
                            {queryParams.map((param) => (
                                <div key={param.name} className="text-sm">
                                    <code className="bg-muted px-1 rounded">{param.name}</code>
                                    {param.required && (
                                        <span className="text-red-500 ml-1">*</span>
                                    )}
                                    <span className="text-muted-foreground ml-2">
                                        - {param.description}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {requestBody && (
                    <div>
                        <h4 className="text-sm font-medium mb-2">Request Body</h4>
                        <CodeBlock code={requestBody} />
                    </div>
                )}
                <div>
                    <h4 className="text-sm font-medium mb-2">Response</h4>
                    <CodeBlock code={response} />
                </div>
            </CardContent>
        </Card>
    );
}

export function ApiDocumentation() {
    const baseUrl = AI_SERVICE_BASE_URL;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Authentication</CardTitle>
                    <CardDescription>
                        All API requests must include your API key in the header
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock
                        code={`X-Institute-Key: vac_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`}
                        language="http"
                    />
                    <p className="text-sm text-muted-foreground mt-3">
                        Base URL: <code className="bg-muted px-2 py-1 rounded">{baseUrl}</code>
                    </p>
                </CardContent>
            </Card>

            <Tabs defaultValue="generate" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="generate">Generate</TabsTrigger>
                    <TabsTrigger value="status">Status</TabsTrigger>
                    <TabsTrigger value="urls">URLs</TabsTrigger>
                    <TabsTrigger value="frame-regen">Regenerate</TabsTrigger>
                    <TabsTrigger value="frame-update">Update</TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="mt-4">
                    <EndpointCard
                        method="POST"
                        path="/external/video/v1/generate"
                        title="Generate Video"
                        description="Start a video generation process. Returns a Server-Sent Events (SSE) stream with real-time progress updates."
                        queryParams={[
                            {
                                name: 'target_stage',
                                description:
                                    'Stage to generate up to. Options: SCRIPT, TTS, WORDS, HTML, RENDER (default)',
                            },
                        ]}
                        requestBody={JSON.stringify(
                            {
                                prompt: 'Explain photosynthesis to a 10-year-old.',
                                language: 'English',
                                captions_enabled: true,
                                html_quality: 'advanced',
                                target_audience: 'Class 5 (Ages 10-11)',
                                target_duration: '2-3 minutes',
                                video_id: 'optional-custom-id',
                            },
                            null,
                            2
                        )}
                        response={`data: {"type": "progress", "stage": "PENDING", "percentage": 0}
data: {"type": "progress", "stage": "SCRIPT", "percentage": 10}
...
data: {"type": "completed", "files": {"video": "https://..."}, "percentage": 100}`}
                    />
                </TabsContent>

                <TabsContent value="status" className="mt-4">
                    <EndpointCard
                        method="GET"
                        path="/external/video/v1/status/{video_id}"
                        title="Get Video Status"
                        description="Check the status of a video generation and retrieve file URLs."
                        response={JSON.stringify(
                            {
                                id: 'uuid-...',
                                video_id: 'custom-video-id',
                                current_stage: 'RENDER',
                                status: 'COMPLETED',
                                s3_urls: {
                                    script: 'https://bucket.s3.amazonaws.com/.../script.txt',
                                    audio: 'https://bucket.s3.amazonaws.com/.../narration.mp3',
                                    video: 'https://bucket.s3.amazonaws.com/.../output.mp4',
                                },
                                created_at: '2024-01-25T10:00:00Z',
                            },
                            null,
                            2
                        )}
                    />
                </TabsContent>

                <TabsContent value="urls" className="mt-4">
                    <EndpointCard
                        method="GET"
                        path="/external/video/v1/urls/{video_id}"
                        title="Get Player URLs"
                        description="Retrieve specific URLs needed to embed the video in a custom player (HTML timeline + Audio)."
                        response={JSON.stringify(
                            {
                                video_id: 'custom-video-id',
                                html_url:
                                    'https://bucket.s3.amazonaws.com/.../time_based_frame.json',
                                audio_url: 'https://bucket.s3.amazonaws.com/.../narration.mp3',
                                words_url:
                                    'https://bucket.s3.amazonaws.com/.../narration.words.json',
                                current_stage: 'RENDER',
                            },
                            null,
                            2
                        )}
                    />
                </TabsContent>

                <TabsContent value="frame-regen" className="mt-4">
                    <EndpointCard
                        method="POST"
                        path="/external/video/v1/frame/regenerate"
                        title="Regenerate Frame"
                        description="Generate a new HTML preview for a specific frame based on your instructions. Returns new HTML but does NOT apply it yet."
                        requestBody={JSON.stringify(
                            {
                                video_id: 'custom-video-id',
                                timestamp: 12.5,
                                user_prompt:
                                    'Change the background color to dark blue and make the font yellow.',
                            },
                            null,
                            2
                        )}
                        response={JSON.stringify(
                            {
                                video_id: 'custom-video-id',
                                frame_index: 5,
                                timestamp: 12.5,
                                original_html: '<html>...</html>',
                                new_html: '<html><style>body { background: darkblue; }</style>...</html>',
                            },
                            null,
                            2
                        )}
                    />
                </TabsContent>

                <TabsContent value="frame-update" className="mt-4">
                    <EndpointCard
                        method="POST"
                        path="/external/video/v1/frame/update"
                        title="Update Frame"
                        description="Apply the confirmed HTML change to the video timeline. Updates the underlying time_based_frame.json file."
                        requestBody={JSON.stringify(
                            {
                                video_id: 'custom-video-id',
                                frame_index: 5,
                                new_html: '<html>...</html>',
                            },
                            null,
                            2
                        )}
                        response={JSON.stringify(
                            {
                                status: 'success',
                                video_id: 'custom-video-id',
                                updated_frame_index: 5,
                                message:
                                    'Frame updated successfully. Player should reflect changes immediately.',
                            },
                            null,
                            2
                        )}
                    />
                </TabsContent>
            </Tabs>

            <Card>
                <CardHeader>
                    <CardTitle>Error Handling</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                                401
                            </Badge>
                            <span>Unauthorized - Invalid or missing X-Institute-Key</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                                404
                            </Badge>
                            <span>Not Found - Video ID not found</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                                500
                            </Badge>
                            <span>Internal Server Error - Service failure</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
