/* eslint-disable */
// @ts-nocheck
'use client';
import debounce from 'lodash.debounce'; // Import debounce
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { SlideEditor } from './SlideEditor';
import { getPublicUrl, UploadFileInS3V2 } from '@/services/upload_file';
import { filterSlidesByIdType } from './utils/util';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { Button } from '@/components/ui/button';
import { ListStart, Save, Loader2, PlaySquare, Tv2, PlusCircle } from 'lucide-react';
import SlideList from './PresentationView';
import { QuizSlide } from './slidesTypes/QuizSlides'; // Ensure path is correct
import { useSlideStore } from '@/stores/Slides/useSlideStore'; // Assumed path
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { useRouter } from '@tanstack/react-router'; // Or your router import
import { useGetSinglePresentation } from './hooks/useGetSinglePresntation'; // Assumed path
import { toast } from 'sonner';
import { IoArrowBackSharp } from 'react-icons/io5';
import { TokenKey } from '@/constants/auth/tokens';
import { ActualPresentationDisplay } from './ActualPresentationDisplay'; // Import the new component
import { SessionOptionsModal, type SessionOptions } from './components/SessionOptionModel'; // Assumed path
import { WaitingRoom } from './components/SessionWaitingRoom'; // Assumed path
import { ADD_PRESENTATION, EDIT_PRESENTATION } from '@/constants/urls';
import { SlideRenderer } from './SlideRenderer'; // Import the extracted SlideRenderer
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

import type {
    Slide as AppSlide,
    ExcalidrawSlideData,
    QuizSlideData,
    FeedbackSlideData,
    AppState as ExcalidrawAppState,
    ExcalidrawElement,
    ExcalidrawBinaryFiles,
    QuestionFormData,
} from './types';
import { SlideTypeEnum } from '././utils/types';

const CREATE_SESSION_API_URL =
    'https://backend-stage.vacademy.io/community-service/engage/admin/create';
const START_SESSION_API_URL =
    'https://backend-stage.vacademy.io/community-service/engage/admin/start';

interface SlideRendererProps {
    currentSlideId: string;
    editMode: boolean; // In editor, this will be true. In PresentationView, SlideEditor gets editMode=false
}

export default function SlidesEditorComponent({
    metaData,
    presentationId,
    isEdit, 
}: {
    metaData: { title: string; description: string };
    presentationId: string;
    isEdit: boolean;
}) {
    const {
        slides,
        currentSlideId,
        editMode,
        setCurrentSlideId,
        setEditMode,
        addSlide,
        deleteSlide,
        getSlide,
        setSlides,
        updateSlide,
        initializeNewPresentationState,
    } = useSlideStore();

    const router = useRouter();
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [showSessionOptionsModal, setShowSessionOptionsModal] = useState<boolean>(false);
    const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);
    const [isStartingSessionInProgress, setIsStartingSessionInProgress] = useState<boolean>(false);
    const [sessionDetails, setSessionDetails] = useState<{
        session_id: string;
        invite_code: string;
        [key: string]: any;
    } | null>(null);
    const [isWaitingForParticipants, setIsWaitingForParticipants] = useState<boolean>(false);

    // States for Audio Recording
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isRecordingPaused, setIsRecordingPaused] = useState<boolean>(false);
    const [shouldRecordAudio, setShouldRecordAudio] = useState<boolean>(false);
    const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null); // For playback/final download
    const [recordingDuration, setRecordingDuration] = useState<number>(0);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const ffmpegRef = useRef<FFmpeg>(new FFmpeg()); // Ref to store initialized ffmpeg instance
    const [isFFmpegLoaded, setIsFFmpegLoaded] = useState<boolean>(false);

    useEffect(() => {
        console.log("SlideEditorComponent useEffect fired");
        const loadFFmpeg = async () => {
            console.log("loadFFmpeg called");
            if (isFFmpegLoaded) {
                console.log("FFmpeg already considered loaded, skipping load attempt.");
                return;
            }
            try {
                console.log("Attempting to call ffmpegRef.current.load()");
                await ffmpegRef.current.load()
                    .then(() => {
                        console.log("ffmpegRef.current.load() promise resolved.");
                        setIsFFmpegLoaded(true);
                        console.log("FFmpeg loaded successfully.");
                    })
                    .catch(loadError => {
                        console.error("ffmpegRef.current.load() promise rejected:", loadError);
                        toast.error("MP3 converter failed to initialize during load. Details in console.");
                        setIsFFmpegLoaded(false);
                    });
                console.log("After ffmpegRef.current.load() attempt");
            } catch (error) {
                console.error("Outer catch: Failed to load FFmpeg:", error);
                toast.error("Failed to initialize MP3 converter. MP3 download may not be available.");
                setIsFFmpegLoaded(false);
            }
        };
        loadFFmpeg();
    }, []); // Empty dependency array ensures this runs once on mount

    const downloadCurrentAudioSnapshot = async (format: 'webm' | 'mp3' = 'webm') => {
        if (audioChunksRef.current && audioChunksRef.current.length > 0) {
            const currentWebMBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            let processedBlob = currentWebMBlob;
            let fileExtension = 'webm';

            try {
                if (format === 'mp3') {
                    toast.info('Preparing MP3 converter...');
                    if (!isFFmpegLoaded) {
                        toast.error("MP3 converter is not ready. Please try again shortly or ensure FFmpeg is loaded.");
                        return;
                    }
                    const ffmpeg = ffmpegRef.current; // Directly use the initialized ref
                    toast.info('Converting to MP3... This may take a moment.');

                    const inputName = 'input.webm';
                    const outputName = 'output.mp3';

                    ffmpeg.FS('writeFile', inputName, await fetchFile(currentWebMBlob));
                    
                    // Run FFmpeg command. Options can be added e.g. -b:a 128k for bitrate
                    await ffmpeg.run('-i', inputName, outputName);
                    
                    const outputData = ffmpeg.FS('readFile', outputName);
                    ffmpeg.FS('unlink', inputName); // Clean up input file
                    ffmpeg.FS('unlink', outputName); // Clean up output file

                    processedBlob = new Blob([outputData.buffer], { type: 'audio/mpeg' });
                    fileExtension = 'mp3';
                    toast.success('Conversion to MP3 successful!');
                }

                const tempUrl = URL.createObjectURL(processedBlob);
                const anchor = document.createElement('a');
                anchor.href = tempUrl;
                anchor.download = `presentation_audio_snapshot_${new Date().toISOString().replace(/[:.]/g, '-')}.${fileExtension}`;
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
                URL.revokeObjectURL(tempUrl);
                if (format === 'webm') {
                   toast.success("Current audio snapshot download started.");
                }
            } catch (error) {
                console.error(`Error during audio processing or download for ${format}:`, error);
                toast.error(`Failed to process audio as ${format.toUpperCase()}. Downloading as WebM instead.`);
                if (format !== 'webm') { // Fallback for failed MP3 conversion
                    const fallbackUrl = URL.createObjectURL(currentWebMBlob);
                    const fallbackAnchor = document.createElement('a');
                    fallbackAnchor.href = fallbackUrl;
                    fallbackAnchor.download = `presentation_audio_snapshot_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
                    document.body.appendChild(fallbackAnchor);
                    fallbackAnchor.click();
                    document.body.removeChild(fallbackAnchor);
                    URL.revokeObjectURL(fallbackUrl);
                }
            }
        } else {
            toast.error("No audio has been recorded yet to download.");
        }
    };

    const startDurationTracker = () => {
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        setRecordingDuration(0); // Reset on start
        recordingIntervalRef.current = setInterval(() => {
            setRecordingDuration(prevDuration => prevDuration + 1);
        }, 1000);
    };

    const stopDurationTracker = (reset: boolean = true) => {
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
        if (reset) setRecordingDuration(0);
    };

    useEffect(() => {
        if (isEdit === false) {
            console.log('[SlidesEditorComponent] Initializing new presentation state.');
            initializeNewPresentationState();
        }
    }, [isEdit, initializeNewPresentationState]);

    const {
        isLoading: isLoadingPresentation, 
        isRefetching: isRefetchingPresentation, 
    } = useGetSinglePresentation({ presentationId, setSlides, setCurrentSlideId, isEdit });

    useEffect(() => {
        if (
            !isLoadingPresentation &&
            !isRefetchingPresentation &&
            editMode &&
            slides &&
            slides.length > 0 &&
            !currentSlideId
        ) {
            const firstValidSlide = slides.find((s) => s && s.id);
            if (firstValidSlide) {
                setCurrentSlideId(firstValidSlide.id);
            } else if (slides.length > 0) {
                setCurrentSlideId(slides[0].id);
            }
        }
    }, [
        isLoadingPresentation,
        isRefetchingPresentation,
        editMode,
        slides,
        currentSlideId,
        setCurrentSlideId,
    ]);

    const changeCurrentSlide = (id: string) => {
        setCurrentSlideId(id);
    };

    const handleAddSlide = (type: SlideTypeEnum) => {
        addSlide(type);
    };

    const handleDeleteCurrentSlide = () => {
        if (currentSlideId) {
            deleteSlide(currentSlideId);
        }
    };

    const handleOpenSessionOptions = () => {
        if (slides && slides.length > 0) {
            setShowSessionOptionsModal(true);
        } else {
            toast.error('Add slides before starting a live session.');
        }
    };

    const handleCreateSession = async (options: SessionOptions) => {
        setIsCreatingSession(true);
        setShouldRecordAudio(options.record_audio); // Store if audio recording is requested

        if (options.record_audio) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = []; // Reset chunks for new recording session

                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const url = URL.createObjectURL(audioBlob);
                    setAudioBlobUrl(url);
                    // TODO: Handle saving or uploading the audioBlob
                    toast.success('Audio recording finished. Ready for playback/download.');
                    setIsRecording(false);
                    setIsRecordingPaused(false);
                    // Clean up the stream tracks
                    stream.getTracks().forEach(track => track.stop());
                };
                // Do not start recording here, wait for actual presentation start
                toast.success("Microphone access granted for recording.")
            } catch (err) {
                console.error('Error accessing microphone or setting up recorder:', err);
                toast.error('Failed to access microphone. Audio will not be recorded.');
                setShouldRecordAudio(false); // Disable recording if permission failed
                if (mediaRecorderRef.current) {
                    mediaRecorderRef.current = null;
                }
            }
        }

        try {
            const payload = {
                source: 'PRESENTATION',
                source_id: presentationId,
                ...options,
                default_seconds_for_question: Number(options.default_seconds_for_question),
                student_attempts: Number(options.student_attempts),
            };
            const response = await authenticatedAxiosInstance.post(CREATE_SESSION_API_URL, payload);
            if (response.data && response.data.session_id && response.data.invite_code) {
                setSessionDetails(response.data);
                setShowSessionOptionsModal(false);
                setIsWaitingForParticipants(true);
                toast.success('Session created! Waiting for participants.');
            } else {
                toast.error(
                    response.data?.message ||
                        'Failed to create session. Invalid response from server.'
                );
            }
        } catch (error: any) {
            console.error('Error creating session:', error);
            toast.error(
                error.response?.data?.message ||
                    'An unexpected error occurred while creating the session.'
            );
        } finally {
            setIsCreatingSession(false);
        }
    };

    const handleStartActualPresentation = async () => {
        if (!sessionDetails || !slides || slides.length === 0) {
            toast.error('Session details or slides are missing. Cannot start presentation.');
            return;
        }
        setIsStartingSessionInProgress(true);
        try {
            const firstSlide = slides[0];
            const initialSlideOrder =
                typeof firstSlide?.slide_order === 'number' ? firstSlide.slide_order : 0;

            await authenticatedAxiosInstance.post(START_SESSION_API_URL, {
                session_id: sessionDetails.session_id,
                move_to: initialSlideOrder,
            });

            // Start recording if permission was granted and it's a recording session
            if (shouldRecordAudio && mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
                mediaRecorderRef.current.start(1000);
                setIsRecording(true);
                setIsRecordingPaused(false);
                startDurationTracker(); // Start duration tracker
                toast.info("Audio recording started.");
            }

            setIsWaitingForParticipants(false);
            setEditMode(false);
            if (slides.length > 0) setCurrentSlideId(slides[0].id);
            toast.success('Presentation started!');
        } catch (error: any) {
            console.error('Error starting presentation:', error);
            toast.error(error.response?.data?.message || 'Failed to start the presentation.');
        } finally {
            setIsStartingSessionInProgress(false);
        }
    };

    const handleExitSessionFlow = () => {
        // Stop recording if active
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop(); // This will trigger onstop where audioBlobUrl is set
        }
        stopDurationTracker(); // Stop and reset duration tracker
        // Stream tracks are stopped in onstop handler
        audioChunksRef.current = []; // Clear chunks after stopping/processing
        setShouldRecordAudio(false); // Reset for next session
        setAudioBlobUrl(null); // Clear previous recording URL

        setEditMode(true);
        setShowSessionOptionsModal(false);
        setIsWaitingForParticipants(false);
        setSessionDetails(null);
        setIsCreatingSession(false);
        setIsStartingSessionInProgress(false);
        toast.info('Exited live session flow.');
    };

    const toggleDirectPresentationPreview = () => {
        if (slides && slides.length > 0) {
            if (sessionDetails) setSessionDetails(null);
            setEditMode(!editMode); 
            if (!editMode && slides.length > 0) {
                setCurrentSlideId(slides[0].id);
            }
        } else {
            toast.info('Add some slides to preview the presentation.');
        }
    };

    const savePresentation = async () => {
        setIsSaving(true);
        try {
            const accessToken = getTokenFromCookie(TokenKey.accessToken);
            if (!accessToken) {
                toast.error('Please login to save presentations');
                return;
            }

            const tokenData = getTokenDecodedData(accessToken);
            const INSTITUTE_ID = tokenData?.authorities && Object.keys(tokenData.authorities)[0];
            if (!INSTITUTE_ID) {
                toast.error('Organization information missing');
                return;
            }

            if (!slides || slides.length === 0) {
                toast.error('No slides to save');
                return;
            }

            const addedSlides = [];
            for (let index = 0; index < slides.length; index++) {
                const slide = slides[index];
                let fileId;

                try {
                    fileId = await UploadFileInS3V2(
                        slide,
                        () => {},
                        tokenData.sub,
                        'SLIDES',
                        tokenData.sub,
                        true
                    );
                } catch (uploadError) {
                    console.error('Upload failed:', uploadError);
                    toast.error('Failed to upload slides');
                    return;
                }

                const isQuestionSlide = [SlideTypeEnum.Quiz, SlideTypeEnum.Feedback].includes(
                    slide.type
                );

                const baseSlide = {
                    id: slide.id ?? '',
                    presentation_id: '',
                    title: slide?.elements?.questionName || `Slide ${index + 1}`,
                    source_id: fileId,
                    source: isQuestionSlide ? 'question' : 'excalidraw',
                    status: 'PUBLISHED',
                    interaction_status: '',
                    slide_order: index,
                    default_time: 0,
                    content: fileId,
                    added_question: null,
                };

                if (isQuestionSlide) {
                    const question = {
                        preview_id: '1',
                        section_id: null,
                        question_order_in_section: 1,
                        text: {
                            id: null,
                            type: 'HTML',
                            content: slide?.elements?.questionName || 'Question text',
                        },
                        media_id: '',
                        question_response_type: slide.type === SlideTypeEnum.Quiz ? 'AUTO' : 'MANUAL',
                        question_type: slide.type === SlideTypeEnum.Quiz ? 'MCQS' : 'LONG_ANSWER',
                        access_level: 'public',
                        auto_evaluation_json: slide.type === SlideTypeEnum.Quiz ? JSON.stringify({
                            type: 'MCQS',
                            data: { correctOptionIds: slide?.elements?.correctOptions || [] },
                        }) : null,
                        options_json: null,
                        parsed_evaluation_object: slide.type === SlideTypeEnum.Quiz ? {
                            correct_option: slide?.elements?.correctOptions?.[0] || 1,
                        } : null,
                        evaluation_type: slide.type === SlideTypeEnum.Quiz ? 'auto' : 'manual',
                        explanation_text: {
                            id: null,
                            type: 'HTML',
                            content: '',
                        },
                        parent_rich_text_id: 'prt_001',
                        parent_rich_text: {
                            id: null,
                            type: 'HTML',
                            content: '',
                        },
                        default_question_time_mins: slide?.elements?.timeLimit || 1,
                        options: (slide?.elements?.singleChoiceOptions || []).map(
                            (option, optIndex) => ({
                                id: isEdit ? option.id || '' : '',
                                preview_id: `${optIndex + 1}`,
                                question_id: isEdit ? slide.questionId || '' : '',
                                text: {
                                    id: null,
                                    type: 'HTML',
                                    content: option.name || `Option ${optIndex + 1}`,
                                },
                                media_id: '',
                                option_order: optIndex,
                                explanation_text: {
                                    id: null,
                                    type: 'HTML',
                                    content: '',
                                },
                            })
                        ),
                        errors: [],
                        warnings: [],
                    };
                    baseSlide.added_question = question;
                }

                addedSlides.push(baseSlide);
            }

            const payload = {
                id: isEdit ? presentationId : '',
                title: metaData?.title || 'New Presentation',
                description: metaData?.description || '',
                cover_file_id: '',
                added_slides: filterSlidesByIdType(addedSlides, true),
                status: 'PUBLISHED',
            };

            if (isEdit) {
                payload.updated_slides = filterSlidesByIdType(addedSlides, false);
                payload.deleted_slides = [];
            }

            await authenticatedAxiosInstance.post(
                isEdit ? EDIT_PRESENTATION : ADD_PRESENTATION,
                payload,
                {
                    params: { instituteId: INSTITUTE_ID },
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            toast.success(`Presentation ${isEdit ? 'updated' : 'created'} successfully`);
            router.navigate({ to: '/study-library/present' });
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error(error.response?.data?.message || 'Failed to save presentation.');
        } finally {
            setIsSaving(false);
        }
    };

    const exportPresentationToFile = () => toast.info('Export function coming soon!');
    const importPresentationFromFile = () => toast.info('Import function coming soon!');

    if (isLoadingPresentation || isRefetchingPresentation) {
        return (
            <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <Loader2 className="size-12 animate-spin text-orange-500" />
                <p className="mt-3 text-lg text-slate-600">Loading Presentation...</p>
            </div>
        );
    }

    if (showSessionOptionsModal) {
        return (
            <SessionOptionsModal
                isOpen={showSessionOptionsModal}
                onClose={() => {
                    setShowSessionOptionsModal(false);
                    if (isCreatingSession) setIsCreatingSession(false);
                }}
                onSubmit={handleCreateSession}
                isCreatingSession={isCreatingSession}
            />
        );
    }

    if (isWaitingForParticipants && sessionDetails) {
        return (
            <WaitingRoom
                sessionDetails={{ ...sessionDetails, title: metaData.title }}
                onStartPresentation={handleStartActualPresentation}
                onCancelSession={handleExitSessionFlow}
                isStarting={isStartingSessionInProgress}
            />
        );
    }

    if (!editMode) {
        const onPresentationExit = sessionDetails
            ? handleExitSessionFlow
            : () => {
                  setEditMode(true);
                  if (slides.length > 0 && !slides.find((s) => s.id === currentSlideId)) {
                      setCurrentSlideId(slides[0].id);
                  }
                  if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                      mediaRecorderRef.current.stop();
                  }
                  stopDurationTracker(); // Stop and reset duration tracker
                  audioChunksRef.current = []; // Clear chunks on exiting direct preview too
              };
        return (
            <ActualPresentationDisplay
                slides={slides}
                initialSlideId={currentSlideId || (slides.length > 0 ? slides[0].id : undefined)}
                liveSessionData={sessionDetails}
                onExit={onPresentationExit}
                isAudioRecording={isRecording}
                isAudioPaused={isRecordingPaused}
                audioBlobUrl={audioBlobUrl}
                recordingDuration={recordingDuration}
                onPauseAudio={() => {
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                        mediaRecorderRef.current.pause();
                        setIsRecordingPaused(true);
                        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current); // Clear interval on pause
                        toast.info('Recording paused.');
                    }
                }}
                onResumeAudio={() => {
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
                        mediaRecorderRef.current.resume();
                        setIsRecordingPaused(false);
                        // Restart interval, but don't reset duration
                        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
                        recordingIntervalRef.current = setInterval(() => {
                            setRecordingDuration(prevDuration => prevDuration + 1);
                        }, 1000);
                        toast.info('Recording resumed.');
                    }
                }}
                onDownloadAudio={downloadCurrentAudioSnapshot}
            />
        );
    }

    if ((!slides || slides.length === 0) && editMode) {
        return (
            <div className="flex h-screen flex-col">
                <div className="sticky top-0 z-40 flex items-center border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.navigate({ to: '/study-library/present' })}
                        className="text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    >
                        <IoArrowBackSharp size={22} />
                    </Button>
                    <span className="ml-3 text-lg font-semibold text-slate-700">
                        {metaData.title || 'New Presentation'}
                    </span>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 p-6 text-center">
                    <img
                        src="/placeholder-empty-slides.svg"
                        alt="Empty Presentation"
                        className="mx-auto mb-8 h-52 w-52 opacity-70"
                    />
                    <h2 className="mb-3 text-2xl font-semibold text-slate-700">
                        Your Presentation is Empty
                    </h2>
                    <p className="mb-8 max-w-md text-base text-slate-500">
                        Let's bring your ideas to life. Add your first slide to get started!
                    </p>
                    <Button
                        onClick={() => handleAddSlide(SlideTypeEnum.Title)}
                        className="group rounded-lg bg-orange-500 px-8 py-3 text-base font-medium text-white shadow-md transition-all duration-150 ease-in-out hover:bg-orange-600 hover:shadow-lg"
                    >
                        <PlusCircle className="mr-2.5 size-5 group-hover:animate-pulse" />
                        Add First Slide
                    </Button>
                </div>
            </div>
        );
    }

    const currentSlideData = getSlide(currentSlideId || '');
    const needsEditorPadding =
        currentSlideData &&
        (currentSlideData.type === SlideTypeEnum.Title ||
            currentSlideData.type === SlideTypeEnum.Text ||
            currentSlideData.type === SlideTypeEnum.Blank ||
            currentSlideData.type === SlideTypeEnum.Excalidraw);

    return (
        <div className="flex h-screen w-full flex-col bg-slate-100">
            <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:px-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.navigate({ to: '/study-library/present' })}
                        className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    >
                        <IoArrowBackSharp size={20} />
                    </Button>
                    <span className="text-md max-w-[120px] truncate font-semibold text-slate-800 sm:max-w-xs sm:text-lg md:max-w-sm">
                        {metaData.title || 'Untitled Presentation'}
                    </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <Button
                        onClick={savePresentation}
                        disabled={isSaving}
                        size="sm"
                        className="gap-1.5 bg-orange-500 px-3 text-white hover:bg-orange-600 focus-visible:ring-orange-400 sm:gap-2 sm:px-4"
                    >
                        <Save className="size-4" />
                        {isSaving ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : isEdit ? (
                            'Save'
                        ) : (
                            'Create'
                        )}
                    </Button>
                    <Button
                        onClick={toggleDirectPresentationPreview}
                        disabled={!slides || slides.length === 0}
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-blue-500 px-3 text-blue-600 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-400 sm:px-4"
                    >
                        <PlaySquare className="size-4" />
                        Preview
                    </Button>
                    <Button
                        onClick={handleOpenSessionOptions}
                        disabled={!slides || slides.length === 0}
                        size="sm"
                        className="gap-1.5 bg-green-500 px-3 text-white hover:bg-green-600 focus-visible:ring-green-400 sm:px-4"
                    >
                        <Tv2 className="size-4" />
                        Start Live
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <SlideList
                    slides={slides}
                    currentSlideId={currentSlideId}
                    onSlideChange={changeCurrentSlide}
                    onAddSlide={handleAddSlide}
                    onDeleteSlide={handleDeleteCurrentSlide}
                    onExport={exportPresentationToFile}
                    onImport={importPresentationFromFile}
                    onReorderSlides={(reorderedSlides) => setSlides(reorderedSlides)}
                />

                <main className={`flex flex-1 flex-col bg-slate-200 p-2 sm:p-3`}>
                    <div
                        className="relative z-0 flex-1 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-inner"
                    >
                        {currentSlideId && currentSlideData ? (
                            <SlideRenderer
                                currentSlideId={currentSlideId}
                                editMode={true}
                            />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center p-5 text-slate-500">
                                <ListStart size={48} className="mb-4 text-slate-400" />
                                <p className="text-lg font-medium">
                                    {slides && slides.length > 0
                                        ? 'Select a slide to edit'
                                        : 'Your presentation is empty.'}
                                </p>
                                {slides && slides.length === 0 && (
                                    <p className="mt-1 text-sm">
                                        Click "Add Slide" in the left panel to begin.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
