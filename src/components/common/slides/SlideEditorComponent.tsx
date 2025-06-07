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
import { ListStart, Save, Loader2, PlaySquare, Tv2, PlusCircle, Share2, ChevronDown, Check, Edit2 } from 'lucide-react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown components
import { Input } from "@/components/ui/input"; // Import Input

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
import type { InsertionBehavior } from './components/QuickQuestionFAB';

const CREATE_SESSION_API_URL =
    'https://backend-stage.vacademy.io/community-service/engage/admin/create';
const START_SESSION_API_URL =
    'https://backend-stage.vacademy.io/community-service/engage/admin/start';
const ADD_SLIDE_IN_SESSION_API_URL = 'https://backend-stage.vacademy.io/community-service/engage/admin/add-slide-in-session';

interface SlideRendererProps {
    currentSlideId: string;
    editMode: boolean; // In editor, this will be true. In PresentationView, SlideEditor gets editMode=false
}

export default function SlidesEditorComponent({
    metaData,
    presentationId,
    isEdit, 
    autoStartLive,
}: {
    metaData: { title: string; description: string };
    presentationId: string;
    isEdit: boolean;
    autoStartLive?: string;
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
        updateSlideIds,
    } = useSlideStore();

    const router = useRouter();
    const searchParams = router.state.location.search;

    const {
        isLoading: isLoadingPresentation, 
        isRefetching: isRefetchingPresentation, 
    } = useGetSinglePresentation({ presentationId, setSlides, setCurrentSlideId, isEdit });

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

    // State to store the IDs of slides initially loaded for an existing presentation
    const [originalSlideIds, setOriginalSlideIds] = useState(new Set<string>());

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

    // State for inline title editing
    const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
    const [currentTitle, setCurrentTitle] = useState<string>(metaData.title || '');

    // State for Participants Panel in Live Session
    const [isParticipantsPanelOpen, setIsParticipantsPanelOpen] = useState<boolean>(false);

    useEffect(() => {
        // Populate originalSlideIds when editing an existing presentation and slides are loaded
        if (isEdit && slides && slides.length > 0 && originalSlideIds.size === 0 && !isLoadingPresentation && !isRefetchingPresentation) {
            const ids = new Set(slides.map(s => s.id).filter(id => !!id)); // Ensure only valid IDs are stored
            setOriginalSlideIds(ids);
            console.log("Original slide IDs captured:", ids);
        }
        // Do not run this if originalSlideIds is already populated, to avoid resetting on re-renders where slides might change
    }, [isEdit, slides, isLoadingPresentation, isRefetchingPresentation, originalSlideIds.size]);

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

    useEffect(() => {
        // Update currentTitle if metaData.title changes from props (e.g., after initial load or URL update)
        if (metaData.title !== currentTitle && !isEditingTitle) {
            setCurrentTitle(metaData.title || '');
        }
    }, [metaData.title, isEditingTitle]);

    // Effect to auto-open session options modal if autoStartLive is true
    useEffect(() => {
        if (searchParams && typeof searchParams.autoStartLive === 'string' && searchParams.autoStartLive === 'true') {
            // Ensure slides are loaded before opening the modal
            // This check might need to be more robust based on your slide loading logic
            if (slides && slides.length > 0) {
                setShowSessionOptionsModal(true);
                // Optional: Clean up the query parameter from URL if desired, though this can be complex
                // router.history.replace({ search: '...' }); 
            } else if (!isLoadingPresentation && !isRefetchingPresentation && slides && slides.length === 0){
                toast.error("Cannot start a live session for an empty presentation. Please add slides.");
            }
            // If slides are still loading, the modal will open once they are loaded by other effects or user action.
        }
    }, [searchParams, slides, isLoadingPresentation, isRefetchingPresentation]);

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

    const savePresentation = async (isAutoSave: boolean = false) => {
        setIsSaving(true);
        let autoCreateNavigated = false; // Flag to track if auto-create navigation happened

        try {
            const accessToken = getTokenFromCookie(TokenKey.accessToken);
            if (!accessToken) {
                toast.error('Please login to save presentations');
                setIsSaving(false); // Reset saving state
                return;
            }

            const tokenData = getTokenDecodedData(accessToken);
            const INSTITUTE_ID = tokenData?.authorities && Object.keys(tokenData.authorities)[0];
            if (!INSTITUTE_ID) {
                toast.error('Organization information missing');
                setIsSaving(false); // Reset saving state
                return;
            }

            // Renamed from addedSlides to avoid confusion, this holds all slides processed in this save operation.
            const allProcessedSlidesInCurrentSave = [];
            for (let index = 0; index < slides.length; index++) {
                const slide = slides[index];
                let fileId;

                try {
                    // TODO: Optimize S3 upload - only upload if content has actually changed.
                    // For now, it re-uploads every time, generating a new fileId.
                    fileId = await UploadFileInS3V2(
                        slide,
                        () => {}, // Progress callback (noop)
                        tokenData.sub, // User ID
                        'SLIDES',      // Category
                        tokenData.sub, // Institute ID (using sub as placeholder if specific institute ID is different)
                        true           // isPublic
                    );
                } catch (uploadError) {
                    console.error('Upload failed for slide:', slide.id, uploadError);
                    toast.error(`Failed to upload content for slide ${index + 1}.`);
                    setIsSaving(false); // Ensure saving state is reset
                    return; // Stop the save process if any upload fails
                }

                const isQuestionSlide = [SlideTypeEnum.Quiz, SlideTypeEnum.Feedback].includes(
                    slide.type
                );

                // Determine if the slide is new from the backend's perspective
                const isNewSlideForBackend = !isEdit || !originalSlideIds.has(slide.id);

                const baseSlideObject = {
                    id: isNewSlideForBackend ? null : slide.id, // Use null for new slides for the backend
                    presentation_id: '', // Backend will associate with the main presentationId
                    title: slide?.elements?.questionName || `Slide ${index + 1}`,
                    source_id: fileId, // ID of the content in S3
                    source: isQuestionSlide ? 'question' : 'excalidraw',
                    status: 'PUBLISHED', // Assuming all saved slides are published
                    interaction_status: '',
                    slide_order: index,
                    default_time: 0,
                    content: fileId, // Repeating source_id as content, as per original structure
                    added_question: null,
                };

                if (isQuestionSlide) {
                    const questionData = slide as QuizSlideData | FeedbackSlideData;

                    // Find the correct option to populate auto_evaluation_json correctly
                    const singleChoiceOptions = (questionData?.elements as QuestionFormData)?.singleChoiceOptions || [];
                    const correctOptionIndex = singleChoiceOptions.findIndex(opt => opt.isSelected);
                    const correctOptionIds = correctOptionIndex !== -1 ? [`${correctOptionIndex + 1}`] : [];
                    const correctOptionPreviewIdAsNumber = correctOptionIndex !== -1 ? (correctOptionIndex + 1) : null;

                    baseSlideObject.added_question = {
                        preview_id: '1',
                        section_id: null,
                        question_order_in_section: 1,
                        text: {
                            id: null,
                            type: 'HTML',
                            content: questionData?.elements?.questionName || 'Question text',
                        },
                        media_id: '',
                        question_response_type: slide.type === SlideTypeEnum.Quiz ? 'AUTO' : 'MANUAL',
                        question_type: slide.type === SlideTypeEnum.Quiz ? 'MCQS' : 'LONG_ANSWER',
                        access_level: 'public',
                        auto_evaluation_json: slide.type === SlideTypeEnum.Quiz ? JSON.stringify({ type: 'MCQS', data: { correctOptionIds: correctOptionIds }, }) : null,
                        options_json: null,
                        parsed_evaluation_object: slide.type === SlideTypeEnum.Quiz ? { correct_option: correctOptionPreviewIdAsNumber, } : null,
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
                        default_question_time_mins: (questionData?.elements as QuestionFormData)?.timeLimit || 1,
                        options: ((questionData?.elements as QuestionFormData)?.singleChoiceOptions || []).map(
                            (option, optIndex) => ({
                                id: isNewSlideForBackend || !option.id ? null : option.id, // null for new options or if option.id is falsy
                                preview_id: `${optIndex + 1}`,
                                question_id: isNewSlideForBackend || !questionData.questionId ? null : questionData.questionId, // null for new questions
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
                }
                allProcessedSlidesInCurrentSave.push(baseSlideObject);
            }
            
            if (slides.length === 0 && isEdit) { // Handle case where all slides are deleted from an existing presentation
                 const payload = {
                    id: presentationId,
                    title: metaData?.title || 'New Presentation',
                    description: metaData?.description || '',
                    cover_file_id: '',
                    added_slides: [],
                    updated_slides: [],
                    deleted_slides: Array.from(originalSlideIds).map(id => ({ id })), // All original slides are deleted
                    status: 'PUBLISHED',
                };
                 await authenticatedAxiosInstance.post(
                    EDIT_PRESENTATION,
                    payload,
                    { /* headers and params */ }
                );
                toast.success('Presentation updated: All slides deleted.');
                if (!isAutoSave) router.navigate({ to: '/study-library/present' });
                setIsSaving(false);
                return;
            }


            if (slides.length === 0 && !isEdit) {
                 toast.error('Cannot create an empty presentation. Please add slides.');
                 setIsSaving(false);
                 return;
            }


            const finalPayload = {
                id: isEdit ? presentationId : null, // Use null for new presentation ID
                title: metaData?.title || 'New Presentation',
                description: metaData?.description || '',
                cover_file_id: '',
                status: 'PUBLISHED',
                added_slides: [],
                updated_slides: [],
                deleted_slides: [],
            };

            if (isEdit) {
                const newSlidesForPayload = [];
                const updatedSlidesForPayload = [];

                allProcessedSlidesInCurrentSave.forEach(processedSlide => {
                    if (originalSlideIds.has(processedSlide.id)) {
                        updatedSlidesForPayload.push(processedSlide);
                    } else {
                        newSlidesForPayload.push(processedSlide);
                    }
                });

                finalPayload.added_slides = newSlidesForPayload;
                finalPayload.updated_slides = updatedSlidesForPayload;

                const currentSlideIdSet = new Set(allProcessedSlidesInCurrentSave.map(s => s.id));
                const deletedBackendSlideObjects = Array.from(originalSlideIds)
                    .filter(id => !currentSlideIdSet.has(id))
                    .map(id => ({ id: id })); // Ensure it's an object with an id property
                finalPayload.deleted_slides = deletedBackendSlideObjects;
            } else {
                // For a new presentation, all slides are "added"
                finalPayload.added_slides = allProcessedSlidesInCurrentSave;
                // updated_slides and deleted_slides remain empty as initialized
            }

            // Store the response from the API call
            const response = await authenticatedAxiosInstance.post(
                isEdit ? EDIT_PRESENTATION : ADD_PRESENTATION,
                finalPayload,
                {
                    params: { instituteId: INSTITUTE_ID },
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            // After a successful save, update the frontend store with the backend-assigned IDs.
            if (response.data) {
                const idUpdates = [];
                let backendSlides = [];

                if (isEdit) {
                    // For EDIT, the response data is the array of slides itself.
                    backendSlides = Array.isArray(response.data) ? response.data : [];
                } else {
                    // For ADD, the response data is a presentation object containing the slides.
                    // And we also need to handle the case of auto-create where the whole presentation object is returned
                    const presentationData = response.data;
                    if (presentationData && Array.isArray(presentationData.added_slides)) {
                         backendSlides = presentationData.added_slides;
                    } else if (presentationData && Array.isArray(presentationData.slides)) { // Fallback for a different key
                         backendSlides = presentationData.slides;
                    } else if (Array.isArray(presentationData)) { // Fallback if add also returns a direct array
                        backendSlides = presentationData;
                    }
                }

                backendSlides.forEach(backendSlide => {
                    // Find the corresponding local slide using slide_order as the unique key
                    const localSlide = slides[backendSlide.slide_order];
                    
                    if (localSlide && localSlide.id !== backendSlide.id) {
                         const updatePayload = {
                            tempId: localSlide.id,
                            newId: backendSlide.id,
                            newQuestionId: backendSlide.added_question?.id,
                            newOptions: []
                        };

                        // If it's a quiz slide, map old and new option IDs as well
                        if (backendSlide.added_question?.options && (localSlide as QuizSlideData).elements?.singleChoiceOptions) {
                            updatePayload.newOptions = backendSlide.added_question.options.map((backendOption, index) => {
                                const localOption = (localSlide as QuizSlideData).elements.singleChoiceOptions[index];
                                if (localOption) {
                                    return { tempOptionId: localOption.id, newOptionId: backendOption.id };
                                }
                                return null;
                            }).filter(Boolean);
                        }
                        idUpdates.push(updatePayload);
                    }
                });

                if (idUpdates.length > 0) {
                    console.log("Syncing frontend IDs with backend:", idUpdates);
                    updateSlideIds(idUpdates);
                }
            }

            // Handle auto-create success by updating URL and re-rendering
            if (isAutoSave && !isEdit && response.data && response.data.id) {
                const newPresentationId = response.data.id;
                console.log(`Auto-create successful. New Presentation ID: ${newPresentationId}. Navigating to edit mode.`);
                
                // Preserve title and description from metaData for the new URL
                // autoStartLive should be removed if present, as it's a one-time action
                const newSearchParams = {
                    id: newPresentationId,
                    isEdit: 'true',
                    title: metaData.title,
                    description: metaData.description,
                };
                // router.state.location.search might contain other params; selectively carry them over if needed.
                // For now, focusing on core params for the editor.

                router.navigate({
                    to: '/study-library/present/add', // Target route for the editor
                    search: newSearchParams,
                    replace: true, // Replace history to avoid issues with back button
                });
                autoCreateNavigated = true; // Set flag
                // setIsSaving is NOT called here; will be handled by useEffect after navigation
                return; 
            }

            if (isAutoSave) {
                toast.info("Presentation auto-saved.", { duration: 2000});
            } else {
                toast.success(`Presentation ${isEdit ? 'updated' : 'created'} successfully`);
            }
            if (!isAutoSave && !isEdit) { // Only navigate for explicit create action
                router.navigate({ to: '/study-library/present' });
            }
            // If we reach here and didn't auto-create-navigate, it's safe to set isSaving to false.
            if (!autoCreateNavigated) {
                setIsSaving(false);
            }
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error(error.response?.data?.message || 'Failed to save presentation.');
            setIsSaving(false); // Ensure isSaving is reset on error
        }
    };

    const exportPresentationToFile = () => toast.info('Export function coming soon!');
    const importPresentationFromFile = () => toast.info('Import function coming soon!');

    const handleSharePresentation = () => {
        if (presentationId) {
            const shareUrl = `https://engage.vacademy.io/presentation/public/${presentationId}`;
            window.open(shareUrl, '_blank');
            toast.success("Public presentation link opened!");
        } else {
            toast.error("Presentation ID is not available. Save the presentation first to enable sharing.");
        }
    };

    const handleUpdateTitle = async () => {
        if (!isEdit || !presentationId) {
            toast.error("Cannot update title: Presentation ID is missing or not in edit mode.");
            setIsEditingTitle(false);
            setCurrentTitle(metaData.title || ''); // Reset to original
            return;
        }

        const newTitle = currentTitle.trim();
        if (!newTitle) {
            toast.error("Title cannot be empty.");
            setCurrentTitle(metaData.title || ''); // Reset to original
            // setIsEditingTitle(false); // Keep editing open for user to correct
            return;
        }

        if (newTitle === metaData.title) {
            setIsEditingTitle(false); // No change, just close input
            return;
        }

        // Optimistically update UI, but prepare to revert or confirm
        // setCurrentTitle(newTitle); // Already set by input's onChange

        try {
            const accessToken = getTokenFromCookie(TokenKey.accessToken);
            if (!accessToken) {
                toast.error('Please login to update the presentation title.');
                setCurrentTitle(metaData.title); // Revert
                setIsEditingTitle(false);
                return;
            }
            const tokenData = getTokenDecodedData(accessToken);
            const INSTITUTE_ID = tokenData?.authorities && Object.keys(tokenData.authorities)[0];
            if (!INSTITUTE_ID) {
                toast.error('Organization information missing.');
                setCurrentTitle(metaData.title); // Revert
                setIsEditingTitle(false);
                return;
            }

            const payload = {
                id: presentationId,
                title: newTitle,
                description: metaData.description || '', // Preserve existing description
                cover_file_id: '', // Assuming this should be preserved or is not editable here
                status: 'PUBLISHED', // Assuming status remains published
                added_slides: [], // Crucial: empty arrays for metadata-only update
                updated_slides: [],
                deleted_slides: [],
            };

            await authenticatedAxiosInstance.post(EDIT_PRESENTATION, payload, {
                params: { instituteId: INSTITUTE_ID },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            toast.success("Presentation title updated successfully!");
            setIsEditingTitle(false);

            // Update router search params to reflect the new title
            const search = router.state.location.search;
            const newSearchParams = {
                ...search, // Preserve other existing search params
                id: presentationId,
                isEdit: 'true',
                title: newTitle,
                description: metaData.description, // keep current description
            };
            router.navigate({
                to: '/study-library/present/add',
                search: newSearchParams,
                replace: true,
            });
            // The metaData.title prop will update on re-render due to router state change

        } catch (error: any) {
            console.error('Error updating presentation title:', error);
            toast.error(error.response?.data?.message || 'Failed to update presentation title.');
            setCurrentTitle(metaData.title); // Revert optimistic update on error
            setIsEditingTitle(false);
        }
    };

    // Auto-save useEffect
    useEffect(() => {
        if (!editMode) return; // Only run if editor UI is active

        // This function will be called by setInterval.
        // It will use the values of isEdit, presentationId, etc., from the time this useEffect hook last ran.
        const performAutoSave = async () => {
            // Re-check conditions at the time of execution, as state might have changed.
            if (!isSaving && slides && slides.length > 0) {
                console.log(`Auto-saving... Current isEdit: ${isEdit}, presentationId: ${presentationId}`);
                await savePresentation(true); // isAutoSave = true
            }
        };

        const intervalId = setInterval(performAutoSave, 60000); // 60000 ms = 1 minute

        return () => {
            clearInterval(intervalId);
            console.log("Auto-save interval cleared.");
        };
    // Dependencies: The interval needs to be reset if editMode changes (to start/stop it),
    // or if isEdit/presentationId change (because that changes the nature of the save from ADD to EDIT),
    // or if slides/isSaving state changes to re-evaluate if save should run.
    // metaData should be included if savePresentation relies on it and it can change independently.
    }, [editMode, isEdit, presentationId, slides, isSaving, metaData]); // Removed savePresentation from deps

    // New useEffect to reset isSaving after successful auto-create and navigation
    useEffect(() => {
        if (isEdit && presentationId && isSaving) {
            // This condition means we were saving (likely an auto-create that just finished)
            // and the component has now re-rendered with isEdit=true and a presentationId.
            console.log("Auto-create navigation complete. Resetting isSaving state.");
            setIsSaving(false);
        }
    }, [isEdit, presentationId, isSaving]);

    // Function to toggle the participants panel visibility
    const handleToggleParticipantsPanel = () => {
        setIsParticipantsPanelOpen(prev => !prev);
    };

    const handleAddQuickQuestion = async (newSlideData: AppSlide, insertionBehavior: InsertionBehavior) => {
        if (!sessionDetails?.session_id) {
            toast.error("No active session found to add a question to.");
            return;
        }

        toast.info("Preparing your quick question...");

        // 1. Determine insertion order
        const currentSlide = getSlide(currentSlideId);
        let afterSlideOrder = -1; 
        if (insertionBehavior === 'next' && currentSlide) {
            afterSlideOrder = currentSlide.slide_order;
        } else { // 'end'
            if (slides.length > 0) {
                // To add at the very end, we specify the order of the last slide.
                afterSlideOrder = slides[slides.length - 1].slide_order;
            }
        }
        
        try {
            // 2. Construct the payload
            const accessToken = getTokenFromCookie(TokenKey.accessToken);
            if (!accessToken) throw new Error("Authentication token not found.");
            const tokenData = getTokenDecodedData(accessToken);
            if (!tokenData) throw new Error("Invalid token data.");

            // Upload content to S3 to get a source_id
            const fileId = await UploadFileInS3V2(newSlideData, () => {}, tokenData.sub, 'SLIDES', tokenData.sub, true);

            const isQuestionSlide = [SlideTypeEnum.Quiz, SlideTypeEnum.Feedback].includes(newSlideData.type);

            const payload = {
                id: null,
                presentation_id: presentationId,
                title: (newSlideData as QuizSlideData).elements?.questionName || 'Quick Question',
                source_id: fileId,
                source: isQuestionSlide ? 'question' : 'excalidraw',
                status: 'PUBLISHED',
                interaction_status: '',
                slide_order: 0, // Backend will recalculate
                default_time: 0,
                content: fileId,
                added_question: null,
            };

            if (isQuestionSlide) {
                const questionData = newSlideData as QuizSlideData;
                const questionElements = questionData.elements;
                payload.added_question = {
                    preview_id: '1',
                    text: { id: null, type: 'HTML', content: questionElements.questionName || '' },
                    question_response_type: newSlideData.type === SlideTypeEnum.Quiz ? 'AUTO' : 'MANUAL',
                    question_type: newSlideData.type === SlideTypeEnum.Quiz ? 'MCQS' : 'LONG_ANSWER',
                    access_level: 'public',
                    auto_evaluation_json: newSlideData.type === SlideTypeEnum.Quiz ? JSON.stringify({ type: 'MCQS', data: { correctOptionIds: [] } }) : null,
                    parsed_evaluation_object: {},
                    evaluation_type: 'auto',
                    explanation_text: { id: null, type: 'HTML', content: '' },
                    parent_rich_text_id: 'prt_001',
                    parent_rich_text: { id: null, type: 'HTML', content: '' },
                    default_question_time_mins: 1,
                    options: (questionElements.singleChoiceOptions || []).map((option, optIndex) => ({
                        id: null,
                        preview_id: `${optIndex + 1}`,
                        question_id: null,
                        text: { id: null, type: 'HTML', content: option.name || '' },
                        media_id: '',
                        option_order: optIndex,
                        explanation_text: { id: null, type: 'HTML', content: '' },
                    })),
                    errors: [],
                    warnings: [],
                };
            }

            const url = `${ADD_SLIDE_IN_SESSION_API_URL}?sessionId=${sessionDetails.session_id}&afterSlideOrder=${afterSlideOrder}`;

            // 3. Make API call
            const response = await authenticatedAxiosInstance.post(url, payload);
            
            if (response.data?.slides?.added_slides) {
                const backendSlideList = response.data.slides.added_slides;

                // The backend provides the full, correct list of slides for the session.
                // We will re-format this entire list for our frontend state.
                const newFrontendSlidesPromises = backendSlideList.map(async (backendSlide: any) => {
                    if (backendSlide.source === 'question') {
                        const questionData = backendSlide.added_question;
                        const slideType = questionData.question_type === 'MCQS' ? SlideTypeEnum.Quiz : SlideTypeEnum.Feedback;
                        
                        return {
                            id: backendSlide.id,
                            type: slideType,
                            slide_order: backendSlide.slide_order,
                            questionId: questionData.id,
                            elements: {
                                questionName: questionData.text?.content || '',
                                singleChoiceOptions: (questionData.options || []).map((opt: any) => ({
                                    id: opt.id, // This is the permanent DB ID for the option
                                    name: opt.text?.content || '',
                                    isSelected: false,
                                })),
                                feedbackAnswer: '',
                            },
                        };
                    } else { // Handle excalidraw-based slides
                        let excalidrawContent = { elements: [], appState: {}, files: {} };
                        try {
                            if (backendSlide.source_id) {
                                const s3PublicUrl = await getPublicUrl(backendSlide.source_id);
                                const res = await fetch(s3PublicUrl);
                                if (res.ok) excalidrawContent = await res.json();
                            }
                        } catch (error) {
                            console.error(`Error fetching Excalidraw content for slide ${backendSlide.id}:`, error);
                        }

                        const oldSlide = slides.find(s => s.id === backendSlide.id);

                        return {
                            id: backendSlide.id,
                            type: oldSlide?.type || SlideTypeEnum.Excalidraw,
                            slide_order: backendSlide.slide_order,
                            elements: excalidrawContent.elements || [],
                            appState: excalidrawContent.appState || {},
                            files: excalidrawContent.files || {},
                        };
                    }
                });

                const newFrontendSlides = (await Promise.all(newFrontendSlidesPromises)).filter(Boolean);

                newFrontendSlides.sort((a: AppSlide, b: AppSlide) => a.slide_order - b.slide_order);
                
                setSlides(newFrontendSlides as AppSlide[]);
                
                toast.success("Your question has been added!");
            } else {
                toast.error("Slide added, but the slide list could not be updated automatically.");
            }

        } catch (error: any) {
            console.error("Failed to add quick question:", error);
            toast.error(error.response?.data?.message || "An error occurred while adding the question.");
        }
    };

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
                  setIsParticipantsPanelOpen(false); // Close panel on exit
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
                        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current); 
                        toast.info('Recording paused.');
                    }
                }}
                onResumeAudio={() => {
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
                        mediaRecorderRef.current.resume();
                        setIsRecordingPaused(false);
                        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
                        recordingIntervalRef.current = setInterval(() => {
                            setRecordingDuration(prevDuration => prevDuration + 1);
                        }, 1000);
                        toast.info('Recording resumed.');
                    }
                }}
                onDownloadAudio={downloadCurrentAudioSnapshot}
                isParticipantsPanelOpen={isParticipantsPanelOpen} // Pass state
                onToggleParticipantsPanel={handleToggleParticipantsPanel} // Pass handler
                onAddQuickQuestion={handleAddQuickQuestion} // Pass handler for FAB
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
                <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.navigate({ to: '/study-library/present' })}
                        className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    >
                        <IoArrowBackSharp size={20} />
                    </Button>
                    
                    {isEditingTitle && isEdit ? (
                        <div className="flex items-center gap-1">
                            <Input
                                type="text"
                                value={currentTitle}
                                onChange={(e) => setCurrentTitle(e.target.value)}
                                onBlur={handleUpdateTitle} // Save on blur
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUpdateTitle();
                                    if (e.key === 'Escape') {
                                        setIsEditingTitle(false);
                                        setCurrentTitle(metaData.title || ''); // Revert
                                    }
                                }}
                                className="h-8 text-md sm:text-lg font-semibold text-slate-800 focus-visible:ring-orange-400"
                                autoFocus
                                maxLength={100}
                            />
                            <Button variant="ghost" size="icon" onClick={handleUpdateTitle} className="h-8 w-8 text-green-600 hover:bg-green-100">
                                <Check size={18} />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 group">
                            <span 
                                className="text-md max-w-[150px] truncate font-semibold text-slate-800 sm:max-w-xs sm:text-lg md:max-w-sm group-hover:text-orange-600"
                                title={currentTitle}
                                onClick={() => { if(isEdit) setIsEditingTitle(true);}} // Allow click to edit only if isEdit is true
                            >
                                {currentTitle || 'Untitled Presentation'}
                            </span>
                            {isEdit && ( // Only show edit icon if isEdit is true
                                <Button variant="ghost" size="icon" onClick={() => setIsEditingTitle(true)} className="h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-orange-500">
                                    <Edit2 size={16} />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 sm:gap-2.5">
                    {isEdit ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    disabled={isSaving}
                                    size="sm"
                                    variant="default"
                                    className="gap-1.5 bg-orange-500 px-3 text-white hover:bg-orange-600 focus-visible:ring-orange-400 sm:gap-2 sm:px-4"
                                >
                                    <Save className="size-4" />
                                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
                                    <ChevronDown className="size-4 opacity-80" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                    onClick={() => savePresentation()}
                                    disabled={isSaving}
                                >
                                    <Save className="mr-2 size-4" /> Just Save
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={async () => {
                                        await savePresentation();
                                        if (!isSaving) { // Ensure save was successful (or not in progress) before navigating
                                            router.navigate({ to: '/study-library/present' });
                                        }
                                    }}
                                    disabled={isSaving}
                                >
                                    <Save className="mr-2 size-4" /> Save and Exit
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button
                            onClick={() => savePresentation()}
                            disabled={isSaving}
                            size="sm"
                            className="gap-1.5 bg-orange-500 px-3 text-white hover:bg-orange-600 focus-visible:ring-orange-400 sm:gap-2 sm:px-4"
                        >
                            <Save className="size-4" />
                            {isSaving ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                'Create'
                            )}
                        </Button>
                    )}
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
                        className="gap-1.5 bg-green-500 px-3 text-white hover:bg-green-600 focus-visible:ring-green-400 sm:px-4 relative overflow-hidden transition-all duration-300 ease-in-out hover:scale-105 focus-visible:scale-105 hover:shadow-lg group"
                    >
                        <span className="absolute inset-0 w-full h-full bg-emerald-400/25 rounded-md animate-pulse"></span>
                        <span className="relative z-10 flex items-center">
                           <Tv2 className="size-4 mr-1.5" /> 
                           Start Live
                        </span>
                    </Button>
                    <Button
                        onClick={handleSharePresentation}
                        disabled={!isEdit || !presentationId} // Can only share an existing, saved presentation
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-purple-500 px-3 text-purple-600 hover:bg-purple-50 hover:text-purple-700 focus-visible:ring-purple-400 sm:px-4"
                        title={!isEdit || !presentationId ? "Save the presentation to enable sharing" : "Share Presentation"}
                    >
                        <Share2 className="size-4" />
                        Share
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
