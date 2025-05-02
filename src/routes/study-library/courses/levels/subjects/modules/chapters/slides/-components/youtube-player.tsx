import { MyButton } from "@/components/design-system/button";
import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FormProvider, useForm } from "react-hook-form";
import {
    VideoPlayerTimeFormType,
    videoPlayerTimeSchema,
} from "../-form-schemas/video-player-time-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { MyInput } from "@/components/design-system/input";
import AddVideoQuestionDialog from "./slides-sidebar/add-video-question-dialog";
import { UploadQuestionPaperFormType } from "@/routes/assessment/question-papers/-components/QuestionPaperUpload";
import { PencilSimpleLine } from "phosphor-react";
import VideoQuestionsTimeFrameDialog from "./video-questions-timeframe";

interface YTPlayer {
    destroy(): void;
    getCurrentTime(): number;
    getDuration(): number;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getPlayerState(): number;
}

interface YouTubePlayerEvent {
    target: YTPlayer;
    data: number;
}

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: {
            Player: new (
                element: HTMLElement | string,
                options: {
                    height?: string | number;
                    width?: string | number;
                    videoId?: string;
                    playerVars?: {
                        autoplay?: number;
                        controls?: number;
                        showinfo?: number;
                        rel?: number;
                        [key: string]: unknown;
                    };
                    events?: {
                        onReady?: (event: YouTubePlayerEvent) => void;
                        onStateChange?: (event: YouTubePlayerEvent) => void;
                        onError?: (event: YouTubePlayerEvent) => void;
                        [key: string]: unknown;
                    };
                },
            ) => YTPlayer;
            PlayerState: {
                PLAYING: number;
                PAUSED: number;
                ENDED: number;
                BUFFERING: number;
                CUED: number;
                UNSTARTED: number;
            };
        };
    }
}

interface Question {
    id: string;
    text: string;
    timestamp: number;
}

interface YouTubePlayerProps {
    videoUrl: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoUrl }) => {
    const formRefData = useRef<UploadQuestionPaperFormType>({
        questionPaperId: "1",
        isFavourite: false,
        title: "",
        createdOn: new Date(),
        yearClass: "",
        subject: "",
        questionsType: "",
        optionsType: "",
        answersType: "",
        explanationsType: "",
        fileUpload: undefined,
        questions: [],
    });
    const videoPlayerTimeFrameForm = useForm<VideoPlayerTimeFormType>({
        resolver: zodResolver(videoPlayerTimeSchema),
        defaultValues: {
            hrs: "",
            min: "",
            sec: "",
        },
    });
    videoPlayerTimeFrameForm.watch();
    const playerRef = useRef<YTPlayer | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const [isAPIReady, setIsAPIReady] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [questions, setQuestions] = useState(formRefData.current.questions);
    const [hoveredQuestion, setHoveredQuestion] = useState<Question | null>(null);
    const [isTimeStampDialogOpen, setIsTimeStampDialogOpen] = useState(false);

    const extractVideoId = (url: string): string => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        if (match && match[2] && match[2].length === 11) {
            return match[2];
        }
        return "";
    };

    // Function to load YouTube IFrame API
    const loadYouTubeAPI = () => {
        console.log("Loading YouTube API...");

        if (window.YT) {
            console.log("YouTube API already loaded");
            setIsAPIReady(true);
            return;
        }

        // Remove any existing YouTube API script
        const existingScript = document.querySelector(
            'script[src="https://www.youtube.com/iframe_api"]',
        );
        if (existingScript) {
            console.log("Removing existing YouTube API script");
            existingScript.remove();
        }

        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";

        window.onYouTubeIframeAPIReady = () => {
            console.log("YouTube API Ready");
            setIsAPIReady(true);
        };

        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hrs > 0) {
            return `${hrs}:${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
        } else {
            return `${mins}:${secs < 10 ? "0" + secs : secs}`;
        }
    };

    function timestampToSeconds(timestamp: string): number {
        const [hours = 0, minutes = 0, seconds = 0] = timestamp.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    }

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!playerRef.current || !timelineRef.current) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const clickPercentage = clickPosition / rect.width;
        const newTime = videoDuration * clickPercentage;

        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
    };

    const handleQuestionClick = (timestamp: number) => {
        if (!playerRef.current) return;
        playerRef.current.seekTo(timestamp, true);
        setCurrentTime(timestamp);
    };

    const handleSetCurrentTimeStamp = () => {
        if (!playerRef.current) return;
        const timestamp = formatTime(playerRef.current.getCurrentTime());

        // Handle HH:MM:SS or MM:SS format
        const parts = timestamp.split(":");

        if (parts.length === 3) {
            // HH:MM:SS format
            const hrs = parseInt(parts[0], 10);
            const min = parseInt(parts[1], 10);
            const sec = parseInt(parts[2], 10);
            videoPlayerTimeFrameForm.reset({ hrs, min, sec });
        } else if (parts.length === 2) {
            // MM:SS format
            const min = parseInt(parts[0], 10);
            const sec = parseInt(parts[1], 10);
            videoPlayerTimeFrameForm.reset({ hrs: 0, min, sec });
        }
    };

    const handleGetOptions = (question) => {
        if (question.questionType === "MCQS") return question.singleChoiceOptions;
        else if (question.questionType === "CMCQS") return question.csingleChoiceOptions;
        else if (question.questionType === "MCQM") return question.multipleChoiceOptions;
        else if (question.questionType === "CMCQM") return question.cmultipleChoiceOptions;
        else if (question.questionType === "TRUE_FALSE") return question.trueFalseOptions;
        else if (question.questionType === "NUMERIC" || question.questionType === "CNUMERIC")
            return question.validAnswers;
        else if (question.questionType === "LONG_ANSWER" || question.questionType === "ONE_WORD")
            return question.subjectiveAnswerText;
    };

    const chunkArray = (arr, size) => {
        const result = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    };

    useEffect(() => {
        setQuestions(formRefData.current.questions);
    }, [formRefData.current]);

    // Initialize YouTube API
    useEffect(() => {
        loadYouTubeAPI();

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, []);

    // Create player when API is ready and URL changes
    useEffect(() => {
        if (!isAPIReady || !videoUrl) {
            console.log("Waiting for API or missing video URL");
            return;
        }

        const videoId = extractVideoId(videoUrl);
        if (!videoId || !containerRef.current) {
            console.log("Invalid video ID or missing container");
            return;
        }

        // Destroy existing player
        if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
        }

        // Create container element
        const playerContainer = document.createElement("div");
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(playerContainer);

        // Create new player
        const player = new window.YT.Player(playerContainer, {
            height: "100%",
            width: "100%",
            videoId: videoId,
            playerVars: {
                autoplay: 0,
                controls: 1,
                showinfo: 0,
                rel: 0,
                modestbranding: 1,
            },
            events: {
                onReady: (event) => {
                    console.log("Player ready:", event);
                    setVideoDuration(event.target.getDuration());
                },
                onStateChange: (event) => {
                    console.log("Player state changed:", event);
                    if (event.data === window.YT.PlayerState.PLAYING) {
                        setVideoDuration(event.target.getDuration());
                    }
                },
                onError: (event) => {
                    console.error("Player error:", event);
                },
            },
        });

        playerRef.current = player;
    }, [isAPIReady, videoUrl]);

    // Update current time for tracking
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (playerRef.current) {
            interval = setInterval(() => {
                try {
                    const player = playerRef.current;
                    if (player && player.getPlayerState && player.getPlayerState() !== 2) {
                        // not paused
                        setCurrentTime(player.getCurrentTime());
                    }
                } catch (e) {
                    console.error("Error getting player state:", e);
                }
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [playerRef.current]);

    return (
        <div className="flex w-full flex-col">
            {/* Video Player Container (preserving your aspect ratio) */}
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <div
                    ref={containerRef}
                    className="absolute left-0 top-0 size-full bg-neutral-100"
                />
            </div>

            {/* Timeline with Question Markers */}
            <div className="relative mt-2 w-full">
                <div
                    ref={timelineRef}
                    className="relative h-2 w-full cursor-pointer rounded-md bg-gray-200"
                    onClick={handleTimelineClick}
                >
                    {/* Progress Indicator */}
                    <div
                        className="pointer-events-none absolute left-0 top-0 h-2 bg-primary-300 opacity-50"
                        style={{
                            width: `${videoDuration ? (currentTime / videoDuration) * 100 : 0}%`,
                        }}
                    ></div>

                    {/* Question Markers */}
                    {questions.map((question) => (
                        <div
                            key={question.id}
                            className="absolute top-0 -ml-1.5 size-3 -translate-y-1/2 cursor-pointer rounded-full bg-red-500"
                            style={{
                                left: `${
                                    (timestampToSeconds(question.timestamp) / videoDuration) * 100
                                }%`,
                                top: "50%",
                            }}
                            onMouseEnter={() => setHoveredQuestion(question)}
                            onMouseLeave={() => setHoveredQuestion(null)}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleQuestionClick(timestampToSeconds(question.timestamp));
                            }}
                        >
                            {hoveredQuestion === question && (
                                <div className="absolute bottom-5 left-1/2 z-10 w-48 -translate-x-1/2 rounded border border-gray-300 bg-white p-4 shadow-xl">
                                    <p className="text-sm text-gray-500">
                                        Timestamp:{" "}
                                        {formatTime(timestampToSeconds(question.timestamp))}
                                    </p>
                                    <span
                                        className="text-sm font-medium"
                                        dangerouslySetInnerHTML={{
                                            __html: question.questionName || "",
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(videoDuration)}</span>
                </div>
            </div>

            {/* Add Question Form */}

            <div>
                <VideoQuestionsTimeFrameDialog
                    formRefData={formRefData}
                    videoPlayerTimeFrameForm={videoPlayerTimeFrameForm}
                    handleSetCurrentTimeStamp={handleSetCurrentTimeStamp}
                    isTimeStampDialogOpen={isTimeStampDialogOpen}
                    setIsTimeStampDialogOpen={setIsTimeStampDialogOpen}
                />
            </div>

            {/* Questions List */}
            <div className="mt-4 w-full">
                {questions.length === 0 ? (
                    <p className="text-sm italic text-gray-500">No questions added yet.</p>
                ) : (
                    <ul className="max-h-60 space-y-1 overflow-y-auto">
                        {questions.map((question, idx) => (
                            <li
                                key={question.id}
                                className="cursor-pointer rounded-md bg-white p-2 text-sm hover:bg-gray-50"
                                onClick={() =>
                                    handleQuestionClick(timestampToSeconds(question.timestamp))
                                }
                            >
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">
                                        {idx + 1}. Time stamp -{" "}
                                        {formatTime(timestampToSeconds(question.timestamp))}
                                    </p>
                                    <VideoQuestionsTimeFrameDialog
                                        formRefData={formRefData}
                                        videoPlayerTimeFrameForm={videoPlayerTimeFrameForm}
                                        handleSetCurrentTimeStamp={handleSetCurrentTimeStamp}
                                        isTimeStampDialogOpen={isTimeStampDialogOpen}
                                        setIsTimeStampDialogOpen={setIsTimeStampDialogOpen}
                                        question={question}
                                        isEdited={true}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span
                                        className="font-thin"
                                        dangerouslySetInnerHTML={{
                                            __html: question.questionName || "",
                                        }}
                                    />
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-lg border p-[6px] px-[10px]">
                                            <span>{question.questionType}</span>
                                        </div>
                                        <MyButton
                                            buttonType="secondary"
                                            scale="small"
                                            layoutVariant="default"
                                            className="h-8 min-w-4"
                                        >
                                            <PencilSimpleLine size={32} />
                                        </MyButton>
                                    </div>
                                </div>
                                {(question.questionType === "LONG_ANSWER" ||
                                    question.questionType === "ONE_WORD") && (
                                    <span className="flex w-1/2 rounded-xl border bg-neutral-50 p-4 font-thin">
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: handleGetOptions(question) || "",
                                            }}
                                        />
                                    </span>
                                )}
                                {(question.questionType === "NUMERIC" ||
                                    question.questionType === "CNUMERIC") && (
                                    <div className="mt-4 flex w-full flex-col gap-4">
                                        {chunkArray(handleGetOptions(question) || [], 2).map(
                                            (optionPair, rowIdx) => (
                                                <div
                                                    key={rowIdx}
                                                    className="mb-2 flex w-full items-center gap-4"
                                                >
                                                    {optionPair.map((option, idx) => {
                                                        const globalIndex = rowIdx * 2 + idx;
                                                        return (
                                                            <span
                                                                key={globalIndex}
                                                                className="flex w-1/2 rounded-xl border bg-neutral-50 p-4 font-thin"
                                                            >
                                                                <span
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: option || "",
                                                                    }}
                                                                />
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                                {!["LONG_ANSWER", "ONE_WORD", "NUMERIC", "CNUMERIC"].includes(
                                    question.questionType,
                                ) && (
                                    <div className="mt-4 flex w-full flex-col gap-4">
                                        {chunkArray(handleGetOptions(question) || [], 2).map(
                                            (optionPair, rowIdx) => (
                                                <div
                                                    key={rowIdx}
                                                    className="mb-2 flex w-full items-center gap-4"
                                                >
                                                    {optionPair.map((option, idx) => {
                                                        const globalIndex = rowIdx * 2 + idx;
                                                        return (
                                                            <span
                                                                key={globalIndex}
                                                                className="flex w-1/2 rounded-xl border bg-neutral-50 p-4 font-thin"
                                                            >
                                                                <span className="mr-1">
                                                                    (
                                                                    {String.fromCharCode(
                                                                        97 + globalIndex,
                                                                    )}
                                                                    .)
                                                                </span>
                                                                <span
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: option.name || "",
                                                                    }}
                                                                />
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default YouTubePlayer;
