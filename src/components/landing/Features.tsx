'use client';

import { BentoGrid } from '@/components/landing/BentoGrid';
import {
    MessageCircleCode,
    BarChart,
    Mic,
    Bot,
    Wand2,
    Brush,
    FileUp,
    Send,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AiGeneratorCardContent } from './AiGeneratorCardContent';
import { QuizJoinContent } from './QuizJoinContent';
import { LeaderboardCardContent } from './LeaderboardCardContent';
import { AudioTranscriptionContent } from './AudioTranscriptionContent';
import { LiveRecommendationsContent } from './LiveRecommendationsContent';
import { ExcalidrawToolbarContent } from './ExcalidrawToolbarContent';
import { PptImportContent } from './PptImportContent';
import { ShareSummaryContent } from './ShareSummaryContent';

const features = [
    {
        Icon: Bot,
        title: 'AI Presentation Generator',
        description: 'Describe your topic, and our AI will create a full presentation for you in seconds.',
        content: <AiGeneratorCardContent />,
        className: 'lg:col-span-1',
    },
    {
        Icon: MessageCircleCode,
        title: 'Interactive Quizzing & Polling',
        description: 'Engage your audience with live multiple-choice questions, polls, and open-ended feedback.',
        content: <QuizJoinContent />,
        className: 'lg:col-span-1',
    },
    {
        Icon: BarChart,
        title: 'Live Session Analytics',
        description: 'Visualize responses in real-time with leaderboards and word clouds.',
        content: <LeaderboardCardContent />,
        className: 'lg:col-span-1',
    },
    {
        Icon: Mic,
        title: 'Audio Transcription & Insights',
        description: 'Get a full transcript and AI-powered suggestions based on what you say.',
        content: <AudioTranscriptionContent />,
        className: 'lg:col-span-1',
    },
    {
        Icon: Wand2,
        title: 'Get Live Recommendations',
        description: 'Volt suggests polls and summaries in real-time as you speak.',
        content: <LiveRecommendationsContent />,
        className: 'lg:col-span-1',
    },
    {
        Icon: Brush,
        title: 'Full Creative Control',
        description: 'Built on Excalidraw for the freedom of a whiteboard, with the structure of slides.',
        content: <ExcalidrawToolbarContent />,
        className: 'lg:col-span-1',
    },
    {
        Icon: FileUp,
        title: 'Import from PowerPoint',
        description: 'Automatically convert your existing PPT/PPTX files into interactive Volt slides.',
        content: <PptImportContent />,
        className: 'lg:col-span-1',
    },
    {
        Icon: Send,
        title: 'Share Session Summary',
        description: 'Automatically email participants a summary, action items, and a link to the Volt.',
        content: <ShareSummaryContent />,
        className: 'lg:col-span-1',
    },
];

const variants = {
    initial: {
        scale: 0.95,
        opacity: 0,
        y: 20,
    },
    animate: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
};

export function Features() {
    return (
        <section id="features" className="bg-slate-50">
            <div className="py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-base font-semibold leading-7 text-orange-600">Features</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Everything You Need for Interactive Presentations
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            From AI creation to real-time analytics, Volt provides a comprehensive suite of tools to
                            make your presentations unforgettable.
                        </p>
                    </div>

                    <div className="mt-16">
                        <BentoGrid className="auto-rows-[32rem] md:auto-rows-[30rem] lg:grid-cols-2">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    variants={variants}
                                    className={cn(
                                        'group relative col-span-3 flex flex-col overflow-hidden rounded-xl',
                                        'bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
                                        'transform-gpu-framer-motion',
                                        feature.className,
                                    )}
                                >
                                    <div className="relative flex-1 flex items-center justify-center bg-slate-100/50 overflow-hidden">
                                        {feature.content}
                                    </div>
                                    <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                                        <feature.Icon className="h-8 w-8 mb-2 text-neutral-700" />
                                        <h3 className="text-md font-semibold text-neutral-700">{feature.title}</h3>
                                        <p className="text-sm text-neutral-500">{feature.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </BentoGrid>
                    </div>
                </div>
            </div>
        </section>
    );
} 