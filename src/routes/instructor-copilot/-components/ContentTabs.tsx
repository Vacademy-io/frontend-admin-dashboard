import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    FileText,
    Notepad,
    Exam,
    Presentation,
    VideoCamera,
    Cards,
    BookOpen,
    PencilSimple,
    CheckCircle,
    Hash,
    ArrowsLeftRight,
    CaretLeft,
    CaretRight,
    MagicWand,
} from '@phosphor-icons/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InstructorCopilotLog } from '@/services/instructor-copilot';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ContentTabsProps {
    transcription?: string;
    log?: InstructorCopilotLog | null;
}

interface SummaryData {
    overview: string;
    key_points: string[];
}

interface NoteData {
    topic: string;
    content: string;
}

interface FlashcardData {
    front: string;
    back: string;
}

const SummaryView = ({ content }: { content: string }) => {
    let data: SummaryData | null = null;

    try {
        data = JSON.parse(content);
    } catch (e) {
        return (
            <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{content}</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* Overview Section */}
            {data.overview && (
                <div className="rounded-lg bg-slate-50 p-6 dark:bg-slate-900/50">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
                        <BookOpen size={20} className="text-primary-500" />
                        Overview
                    </h3>
                    <div className="prose prose-sm max-w-none dark:prose-invert text-slate-600 dark:text-slate-400">
                        <ReactMarkdown>{data.overview}</ReactMarkdown>
                    </div>
                </div>
            )}

            {/* Key Points Section */}
            {data.key_points && data.key_points.length > 0 && (
                <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
                        <CheckCircle size={20} className="text-green-500" />
                        Key Takeaways
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-1">
                        {data.key_points.map((point, index) => (
                            <div
                                key={index}
                                className="group relative flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-primary-200 hover:bg-primary-50/30 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary-800"
                            >
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                                    {index + 1}
                                </span>
                                <div className="prose prose-sm max-w-none dark:prose-invert text-slate-700 dark:text-slate-300">
                                    <ReactMarkdown>{point}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const NotesView = ({ content }: { content: string }) => {
    let data: NoteData[] | null = null;

    try {
        data = JSON.parse(content);
        if (!Array.isArray(data)) {
            data = null;
        }
    } catch (e) {
        return (
            <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{content}</p>
            </div>
        );
    }

    if (!data) return (
        <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{content}</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {data.map((note, index) => (
                <div key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                            <Hash size={18} className="text-primary-500" />
                            {note.topic}
                        </h3>
                    </div>
                    <div className="px-5 py-3">
                        <div className="prose prose-sm max-w-none dark:prose-invert text-slate-600 dark:text-slate-400">
                            <ReactMarkdown>{note.content}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const FlashcardsView = ({ content }: { content: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    let data: FlashcardData[] | null = null;
    try {
        data = JSON.parse(content);
        if (!Array.isArray(data)) data = null;
    } catch (e) {
        // Fallback
    }

    if (!data || data.length === 0) {
        return (
            <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{content}</p>
            </div>
        );
    }

    const currentCard = data[currentIndex];

    if (!currentCard) return null;

    const handleNext = () => {
        setIsFlipped(false);
        const length = data!.length;
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % length);
        }, 300); // Wait for potential flip reset visual
    };

    const handlePrev = () => {
        setIsFlipped(false);
        const length = data!.length;
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + length) % length);
        }, 300);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="mx-auto max-w-2xl py-2">
            <div
                className="relative h-64 w-full cursor-pointer"
                style={{ perspective: '1000px' }}
                onClick={handleFlip}
            >
                <div
                    className={cn(
                        "relative h-full w-full transition-all duration-500",
                        isFlipped ? "" : ""
                    )}
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                >
                    {/* Front */}
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-lg dark:border-slate-700 dark:bg-slate-800"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <span className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Question</span>
                        <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100">
                            {currentCard.front}
                        </h3>
                        <div className="absolute bottom-6 text-slate-400">
                            <ArrowsLeftRight size={20} className="animate-pulse" />
                            <span className="mt-1 block text-[10px]">Click to flip</span>
                        </div>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 p-6 text-center shadow-lg dark:border-primary-900 dark:bg-primary-900/20"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                        }}
                    >
                        <span className="mb-4 text-xs font-bold uppercase tracking-wider text-primary-500">Answer</span>
                        <div className="prose prose-lg dark:prose-invert">
                            <p className="text-lg text-slate-800 dark:text-slate-200">{currentCard.back}</p>
                        </div>
                        <div className="absolute bottom-6 text-primary-400">
                            <ArrowsLeftRight size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    disabled={data.length <= 1}
                    className="gap-2"
                >
                    <CaretLeft size={16} />
                    Previous
                </Button>

                <span className="text-sm font-medium text-slate-500">
                    Card {currentIndex + 1} of {data.length}
                </span>

                <Button
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    disabled={data.length <= 1}
                    className="gap-2"
                >
                    Next
                    <CaretRight size={16} />
                </Button>
            </div>
        </div>
    );
};

export function ContentTabs({ transcription, log }: ContentTabsProps) {
    const tabs = [
        {
            id: 'transcription',
            label: 'Transcription',
            icon: FileText,
            description: 'Full text transcription of the audio',
            content: log?.transcript_json || transcription,
        },
        {
            id: 'notes',
            label: 'Notes',
            icon: BookOpen,
            description: 'Structured notes from the content',
            content: log?.flashnotes_json,
        },
        {
            id: 'summary',
            label: 'Summary',
            icon: Notepad,
            description: 'AI-generated summary of key points',
            content: log?.summary,
        },
        {
            id: 'flashcards',
            label: 'Flashcards',
            icon: Cards,
            description: 'Study flashcards',
            content: log?.flashcard_json,
        },
        {
            id: 'quiz',
            label: 'Quiz',
            icon: Exam,
            description: 'Auto-generated quiz questions',
            content: log?.question_json,
        },
        {
            id: 'slides',
            label: 'Slides',
            icon: Presentation,
            description: 'Presentation slides outline',
            content: log?.slides_json,
        },
        {
            id: 'videos',
            label: 'Video Ideas',
            icon: VideoCamera,
            description: 'Video content suggestions',
            content: log?.video_json,
        },
        {
            id: 'homework',
            label: 'Homework',
            icon: PencilSimple,
            description: 'Homework assignment ideas',
            content: null, // Not yet in schema
        },
        {
            id: 'classwork',
            label: 'Classwork',
            icon: BookOpen,
            description: 'In-class activity ideas',
            content: null, // Not yet in schema
        },
    ];

    const renderContent = (content: string | null | undefined, label: string) => {
        if (!content) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-6 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                        {/* Render generic icon or specific if available */}
                        <MagicWand size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                        No {label} Generated Yet
                    </h3>
                    <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                        Generate {label.toLowerCase()} from your transcription to see the content here.
                    </p>
                    <Button
                        onClick={() => {
                            toast.info(`Generating ${label}... (TODO)`);
                            console.log('Generate ' + label);
                        }}
                        className="mt-6 gap-2"
                        variant="default"
                    >
                        <MagicWand size={16} />
                        Generate {label}
                    </Button>
                </div>
            );
        }

        if (label === 'Summary') {
            return <SummaryView content={content} />;
        }

        if (label === 'Notes') {
            return <NotesView content={content} />;
        }

        if (label === 'Flashcards') {
            return <FlashcardsView content={content} />;
        }

        // Simple check if it looks like JSON and try to pretty print
        let displayContent = content;
        if ((content.startsWith('{') || content.startsWith('[')) && (content.endsWith('}') || content.endsWith(']'))) {
            try {
                const parsed = JSON.parse(content);
                displayContent = JSON.stringify(parsed, null, 2);
            } catch (e) {
                // ignore, keep as string
            }
        }

        return (
            <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans">{displayContent}</pre>
            </div>
        );
    };

    return (
        <Tabs defaultValue="transcription" className="w-full">
            <ScrollArea className="w-full">
                <TabsList className="w-full justify-start">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                                <Icon size={16} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </ScrollArea>

            {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <tab.icon size={20} />
                                {tab.label}
                            </CardTitle>
                            <CardDescription>{tab.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderContent(tab.content, tab.label)}
                        </CardContent>
                    </Card>
                </TabsContent>
            ))}
        </Tabs>
    );
}


