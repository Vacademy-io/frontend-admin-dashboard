import { createLazyFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect, useState } from 'react';
import { ChalkboardTeacher, Microphone, UploadSimple, Plus, Trash, FileText, CheckCircle, Clock, ArrowLeft } from '@phosphor-icons/react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from './-components/FileUploader';
import { AudioRecorder } from './-components/AudioRecorder';
import { AudioPlayer } from './-components/AudioPlayer';
import { ContentTabs } from './-components/ContentTabs';
import { uploadAudioFile, createTranscription, waitForTranscription } from '@/services/assemblyai';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInstituteQuery } from '@/services/student-list-section/getInstituteDetails';
import {
    createInstructorCopilotLog,
    listInstructorCopilotLogs,
    deleteInstructorCopilotLog,
    retryInstructorCopilotLog,
    type InstructorCopilotLog,
} from '@/services/instructor-copilot';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format, subDays } from 'date-fns';

export const Route = createLazyFileRoute('/instructor-copilot/')({
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
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedLog, setSelectedLog] = useState<InstructorCopilotLog | null>(null);
    const [lastRegenerationTime, setLastRegenerationTime] = useState<number | null>(null);
    const [canRegenerate, setCanRegenerate] = useState(true);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);

    const { data: instituteDetails } = useQuery(useInstituteQuery());
    const queryClient = useQueryClient();

    const { data: logs, isLoading: isLoadingLogs } = useQuery({
        queryKey: ['instructor-copilot-logs', instituteDetails?.id],
        queryFn: () =>
            listInstructorCopilotLogs({
                instituteId: instituteDetails?.id!,
                status: 'ACTIVE',
                startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
                endDate: format(new Date(), 'yyyy-MM-dd'),
            }),
        enabled: !!instituteDetails?.id,
    });

    const createLogMutation = useMutation({
        mutationFn: createInstructorCopilotLog,
        onSuccess: (newLog) => {
            toast.success('Content generation started successfully!');
            queryClient.invalidateQueries({ queryKey: ['instructor-copilot-logs'] });
            // Transition to detail view of the new log
            setSelectedLog(newLog);
            // We can choose to keep audioUrl if we want to allow playing, 
            // but for now let's focus on the log view. 
            // If the log interface supported audioUrl, we would use that.
        },
        onError: (error) => {
            console.error('Error creating log:', error);
            toast.error('Failed to start content generation.');
        },
    });

    const deleteLogMutation = useMutation({
        mutationFn: deleteInstructorCopilotLog,
        onSuccess: () => {
            toast.success('Log deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['instructor-copilot-logs'] });
            if (selectedLog) {
                handleReset(); // Go back if we deleted the currently viewed log
            }
        },
        onError: () => {
            toast.error('Failed to delete log');
        },
    });

    const retryLogMutation = useMutation({
        mutationFn: retryInstructorCopilotLog,
        onSuccess: () => {
            toast.success('Content regeneration started!');
            setLastRegenerationTime(Date.now());
            setCanRegenerate(false);
            // Start 2-minute cooldown timer
            setTimeout(() => {
                setCanRegenerate(true);
            }, 2 * 60 * 1000); // 2 minutes
            queryClient.invalidateQueries({ queryKey: ['instructor-copilot-logs'] });
        },
        onError: () => {
            toast.error('Failed to regenerate content');
        },
    });

    useEffect(() => {
        setNavHeading(
            <div className="flex items-center gap-2">
                <ChalkboardTeacher size={24} className="text-primary-500" />
                <h1 className="text-lg font-semibold">Instructor Copilot</h1>
            </div>
        );
    }, [setNavHeading]);

    // Cooldown countdown effect
    useEffect(() => {
        if (!canRegenerate && lastRegenerationTime) {
            const interval = setInterval(() => {
                const twoMinutes = 2 * 60 * 1000;
                const elapsed = Date.now() - lastRegenerationTime;
                const remaining = Math.max(0, Math.ceil((twoMinutes - elapsed) / 1000));
                setCooldownSeconds(remaining);

                if (remaining === 0) {
                    clearInterval(interval);
                }
            }, 1000);

            return () => clearInterval(interval);
        }

        setCooldownSeconds(0);
        return undefined;
    }, [canRegenerate, lastRegenerationTime]);

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

                // Auto-start content generation after transcription
                await autoGenerateContent(result.text);
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

    const autoGenerateContent = async (transcriptText: string) => {
        if (!transcriptText || !instituteDetails?.id) return;
        setIsGenerating(true);
        try {
            const newLog = await createLogMutation.mutateAsync({
                transcript_json: transcriptText,
                instituteId: instituteDetails.id,
            });
            // Set the cooldown timer from log creation time
            setLastRegenerationTime(Date.now());
            setCanRegenerate(false);
            setTimeout(() => {
                setCanRegenerate(true);
            }, 2 * 60 * 1000); // 2 minutes
        } catch (error) {
            console.error('Auto-generation error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileUploadComplete = (url: string) => {
        setAudioUrl(url);
    };

    const handleRecordingComplete = (audioBlob: Blob, url: string) => {
        setAudioUrl(url);
    };

    const handleReset = () => {
        setAudioSource(null);
        setAudioUrl(null);
        setTranscription('');
        setIsProcessing(false);
        setProcessingStatus('');
        setIsGenerating(false);
        setSelectedLog(null);
        setLastRegenerationTime(null);
        setCanRegenerate(true);
        setCooldownSeconds(0);
    };


    const handleDeleteLog = async (id: string) => {
        if (confirm('Are you sure you want to delete this log?')) {
            await deleteLogMutation.mutateAsync(id);
        }
    };

    const handleViewDetails = (log: InstructorCopilotLog) => {
        setSelectedLog(log);
        setAudioUrl(null); // Clear manual session state
        setTranscription('');

        // Check if we need to set cooldown based on log creation time
        const logCreatedTime = new Date(log.created_at).getTime();
        const timeSinceCreation = Date.now() - logCreatedTime;
        const twoMinutes = 2 * 60 * 1000;

        if (timeSinceCreation < twoMinutes) {
            setCanRegenerate(false);
            setLastRegenerationTime(logCreatedTime);
            // Set timeout for remaining time
            setTimeout(() => {
                setCanRegenerate(true);
            }, twoMinutes - timeSinceCreation);
        } else {
            setCanRegenerate(true);
        }
    };

    const handleRegenerateContent = async () => {
        if (!selectedLog || !canRegenerate) return;
        await retryLogMutation.mutateAsync(selectedLog.id);
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

            <div className="space-y-8 px-4 py-0 lg:px-0">
                {/* View Details Mode */}
                {selectedLog ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" onClick={handleReset} className="gap-2">
                                <ArrowLeft size={16} />
                                Back to History
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold sm:text-2xl">{selectedLog.title || 'Untitled Session'}</h1>
                                <p className="text-sm text-gray-500">
                                    Generated on {format(new Date(selectedLog.created_at), 'PPP p')}
                                </p>
                            </div>
                            {/* Show regenerate button if content is stuck in processing */}
                            {!selectedLog.summary && (
                                <Button
                                    variant="outline"
                                    onClick={handleRegenerateContent}
                                    disabled={!canRegenerate || retryLogMutation.isPending}
                                    className="gap-2"
                                >
                                    {retryLogMutation.isPending
                                        ? 'Regenerating...'
                                        : !canRegenerate
                                            ? `Wait ${Math.floor(cooldownSeconds / 60)}:${String(cooldownSeconds % 60).padStart(2, '0')}`
                                            : 'Regenerate Content'}
                                </Button>
                            )}
                        </div>

                        {/* Detail Content */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Left Side (Optional - if we had audio url logic for logs) */}
                            {/* For now, maybe just show stats or nothing, making main content wider? 
                                Let's keep the layout consistent. */}
                            <div className="lg:col-span-3">
                                <ContentTabs
                                    log={selectedLog}
                                    onLogUpdate={async () => {
                                        // Invalidate the queries to refetch the list
                                        await queryClient.invalidateQueries({ queryKey: ['instructor-copilot-logs'] });

                                        // Refetch the updated logs and find the current one
                                        const updatedLogs = await listInstructorCopilotLogs({
                                            instituteId: instituteDetails?.id!,
                                            status: 'ACTIVE',
                                            startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
                                            endDate: format(new Date(), 'yyyy-MM-dd'),
                                        });

                                        // Find and update the selected log
                                        const freshLog = updatedLogs.find(log => log.id === selectedLog.id);
                                        if (freshLog) {
                                            setSelectedLog(freshLog);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Creation Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold opacity-0">New Session</h2>
                                {audioSource && (
                                    <Button variant="ghost" onClick={handleReset} size="sm">
                                        Cancel
                                    </Button>
                                )}
                            </div>

                            {!audioUrl ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>New Session</CardTitle>
                                        <CardDescription>
                                            Start a new Instructor Copilot session by uploading or recording audio.
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
                                                    <span className="hidden sm:inline">Upload File</span>
                                                    <span className="inline sm:hidden">Upload</span>
                                                </TabsTrigger>
                                                <TabsTrigger value="record" className="gap-2">
                                                    <Microphone size={18} />
                                                    <span className="hidden sm:inline">Record Audio</span>
                                                    <span className="inline sm:hidden">Record</span>
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
                                <div className="space-y-6">
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                                {/* Left Side - Audio Player */}
                                                <div className="lg:col-span-1">
                                                    <div className="space-y-4">
                                                        <AudioPlayer audioUrl={audioUrl} />
                                                        {isGenerating && (
                                                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="size-5 animate-spin rounded-full border-b-2 border-blue-600" />
                                                                    <p className="text-sm font-medium text-blue-800">
                                                                        Generating content...
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            onClick={handleReset}
                                                            className="w-full"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Right Side - Transcription Preview -> Content Tabs */}
                                                <div className="lg:col-span-2">
                                                    <ContentTabs transcription={transcription} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>

                        <div className="my-8 h-px bg-slate-200" />

                        {/* History / Logs Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">History</h2>

                            {isLoadingLogs ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <Skeleton className="h-48 rounded-xl" />
                                    <Skeleton className="h-48 rounded-xl" />
                                    <Skeleton className="h-48 rounded-xl" />
                                </div>
                            ) : logs && logs.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {logs.map((log) => (
                                        <Card key={log.id} className="flex flex-col">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <CardTitle className="text-base line-clamp-1">
                                                            {log.title || 'Untitled Session'}
                                                        </CardTitle>
                                                        <CardDescription className="text-xs">
                                                            {format(new Date(log.created_at), 'PPP p')}
                                                        </CardDescription>
                                                    </div>
                                                    <Badge variant={log.summary ? 'default' : 'secondary'}>
                                                        {log.summary ? 'Ready' : 'Processing'}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="grow">
                                                <p className="line-clamp-3 text-sm text-gray-500">
                                                    {log.summary || 'Content generation in progress...'}
                                                </p>
                                            </CardContent>
                                            <CardFooter className="flex justify-between border-t p-4">
                                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteLog(log.id)}>
                                                    <Trash size={16} />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleViewDetails(log)}>
                                                    View Details
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-gray-500">
                                    <FileText size={48} className="mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">No sessions yet</p>
                                    <p className="text-sm">Start a new session to see your logs here.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </LayoutContainer>
    );
}
