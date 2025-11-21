import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState } from 'react';
import { ChalkboardTeacher, Microphone, UploadSimple } from 'phosphor-react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from './-components/FileUploader';
import { AudioRecorder } from './-components/AudioRecorder';
import { AudioPlayer } from './-components/AudioPlayer';
import { ContentTabs } from './-components/ContentTabs';
import { uploadAudioFile, createTranscription, waitForTranscription } from '@/services/assemblyai';
import { toast } from 'sonner';

export const Route = createFileRoute('/instructor-copilot/')({
    component: InstructorCopilotPage,
});

type AudioSource = 'upload' | 'record' | null;

function InstructorCopilotPage() {
    const { setNavHeading } = useNavHeadingStore();
    const [audioSource, setAudioSource] = useState<AudioSource>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [transcription, setTranscription] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<string>('');

    useEffect(() => {
        setNavHeading(
            <div className="flex items-center gap-2">
                <ChalkboardTeacher size={24} className="text-primary-500" />
                <h1 className="text-lg font-semibold">Instructor Copilot</h1>
            </div>
        );
    }, [setNavHeading]);

    const handleFileSelected = async (file: File) => {
        try {
            setIsProcessing(true);
            setProcessingStatus('Uploading audio file...');
            toast.info('Uploading audio file...');

            // Upload file
            const uploadUrl = await uploadAudioFile(file);

            setProcessingStatus('Creating transcription job...');
            toast.info('Processing transcription...');

            // Create transcription
            const transcriptId = await createTranscription(uploadUrl);

            setProcessingStatus('Transcribing audio...');

            // Wait for transcription
            const result = await waitForTranscription(transcriptId, (status) => {
                setProcessingStatus(`Transcription status: ${status}`);
            });

            if (result.status === 'completed' && result.text) {
                setTranscription(result.text);
                const fileUrl = URL.createObjectURL(file);
                setAudioUrl(fileUrl);
                toast.success('Transcription completed!');
            } else if (result.status === 'error') {
                throw new Error(result.error || 'Transcription failed');
            }
        } catch (error) {
            console.error('Error processing audio:', error);
            toast.error('Failed to process audio file');
        } finally {
            setIsProcessing(false);
            setProcessingStatus('');
        }
    };

    const handleFileUploadComplete = (url: string) => {
        setAudioUrl(url);
    };

    const handleRecordingComplete = (audioBlob: Blob, url: string) => {
        setAudioUrl(url);
        // For recordings, we already have real-time transcription
        // so we don't need to process it again
    };

    const handleReset = () => {
        setAudioSource(null);
        setAudioUrl(null);
        setTranscription('');
        setIsProcessing(false);
        setProcessingStatus('');
    };

    return (
        <LayoutContainer>
            <Helmet>
                <title>Instructor Copilot - Audio Transcription</title>
                <meta
                    name="description"
                    content="Transform audio into actionable content with AI-powered transcription and analysis."
                />
            </Helmet>

            <div className="space-y-6 px-4 py-0 lg:px-0">
                {/* Main Content */}
                {!audioUrl ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Get Started</CardTitle>
                            <CardDescription>
                                Choose how you want to provide your audio content
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs
                                value={audioSource || ''}
                                onValueChange={(value) => setAudioSource(value as AudioSource)}
                            >
                                <TabsList className="mb-6 grid w-full grid-cols-2">
                                    <TabsTrigger value="upload" className="gap-2">
                                        <UploadSimple size={18} />
                                        Upload File
                                    </TabsTrigger>
                                    <TabsTrigger value="record" className="gap-2">
                                        <Microphone size={18} />
                                        Record Audio
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="upload" className="mt-0">
                                    <FileUploader
                                        onFileSelected={handleFileSelected}
                                        onUploadComplete={handleFileUploadComplete}
                                    />
                                </TabsContent>

                                <TabsContent value="record" className="mt-0">
                                    <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                                </TabsContent>
                            </Tabs>

                            {/* Processing Status */}
                            {isProcessing && (
                                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-5 animate-spin rounded-full border-b-2 border-blue-600" />
                                        <p className="text-sm font-medium text-blue-800">
                                            {processingStatus}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Split View - Audio Player and Content */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Left Side - Audio Player */}
                            <div className="lg:col-span-1">
                                <div className="space-y-4">
                                    <AudioPlayer audioUrl={audioUrl} />
                                    <Button
                                        variant="outline"
                                        onClick={handleReset}
                                        className="w-full"
                                    >
                                        Start New Session
                                    </Button>
                                </div>
                            </div>

                            {/* Right Side - Content Tabs */}
                            <div className="lg:col-span-2">
                                <ContentTabs transcription={transcription} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </LayoutContainer>
    );
}
