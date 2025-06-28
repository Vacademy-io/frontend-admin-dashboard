import React, { useMemo, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Trophy,
    CheckCircle,
    XCircle,
    Clock,
    Medal,
    User,
    MessageSquare,
    MinusCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizSlideData } from '../utils/types';

interface ResponseData {
    username: string;
    time_to_response_millis: number;
    submitted_at: number;
    response_data: {
        type: string;
        selected_option_ids: string[];
        text_answer: string | null;
    };
    is_correct: boolean | null;
}

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    responses: ResponseData[];
    slideData: QuizSlideData;
    isMcq: boolean;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
    isOpen,
    onClose,
    responses,
    slideData,
    isMcq,
}) => {
    useEffect(() => {
        if (isOpen) {
            console.log(
                '[Leaderboard] Modal opened. Received slideData with options:',
                JSON.stringify(slideData?.elements?.singleChoiceOptions, null, 2)
            );
            console.log(
                '[Leaderboard] Modal opened. Received responses:',
                JSON.stringify(responses, null, 2)
            );
        }
    }, [isOpen, slideData, responses]);

    const sortedResponses = useMemo(() => {
        if (!responses) return [];

        const getCorrectnessScore = (isCorrect: boolean | null) => {
            if (isCorrect === true) return 2;
            if (isCorrect === null) return 1;
            return 0; // false
        };

        return [...responses].sort((a, b) => {
            const scoreA = getCorrectnessScore(a.is_correct);
            const scoreB = getCorrectnessScore(b.is_correct);

            if (scoreA !== scoreB) {
                return scoreB - scoreA; // Sort descending by score (true > null > false)
            }

            // If scores are the same, sort by time (faster on top)
            return a.time_to_response_millis - b.time_to_response_millis;
        });
    }, [responses]);

    const formatTime = (millis: number) => {
        return `${(millis / 1000).toFixed(2)}s`;
    };

    const getRankIcon = (rank: number) => {
        if (rank === 0) return <Medal className="text-yellow-500" size={20} />;
        if (rank === 1) return <Medal className="text-gray-400" size={20} />;
        if (rank === 2) return <Medal className="text-amber-700" size={20} />;
        return (
            <span className="w-5 text-center text-sm font-medium text-slate-500">{rank + 1}</span>
        );
    };

    const getResponseText = (response: ResponseData) => {
        if (!isMcq) {
            return (
                <span className="font-normal text-slate-800">
                    {response.response_data?.text_answer || (
                        <span className="italic text-slate-500">No answer submitted</span>
                    )}
                </span>
            );
        }

        const selectedId = response.response_data?.selected_option_ids?.[0];

        if (!selectedId) {
            return <span className="italic text-slate-500">No answer submitted</span>;
        }

        const slideOptions = slideData?.elements?.singleChoiceOptions || [];
        const selectedOption = slideOptions.find(
            (opt: { id: string; name: string }) => opt.id === selectedId
        );

        if (selectedOption?.name) {
            return (
                <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedOption.name }}
                />
            );
        }

        return <span className="text-sm italic text-red-500">Option not found</span>;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-2xl p-0">
                <DialogHeader className="border-b p-6 pb-4">
                    <DialogTitle className="flex items-center text-2xl font-bold text-slate-800">
                        <Trophy className="mr-3 text-orange-500" size={28} />
                        Live Leaderboard
                    </DialogTitle>
                    <DialogDescription>
                        Responses are sorted by correctness, then by the fastest time.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-3 p-6">
                        {sortedResponses.length > 0 ? (
                            sortedResponses.map((res, index) => (
                                <div
                                    key={res.username + res.submitted_at}
                                    className={cn(
                                        'flex flex-col rounded-lg border p-3 transition-all',
                                        res.is_correct === true
                                            ? 'border-green-200 bg-green-50'
                                            : res.is_correct === false
                                              ? 'border-red-200 bg-red-50'
                                              : 'border-slate-200 bg-slate-50'
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex w-8 items-center justify-center">
                                                {getRankIcon(index)}
                                            </div>
                                            <div className="flex items-center">
                                                <User className="mr-2 text-slate-400" size={16} />
                                                <span className="font-semibold text-slate-700">
                                                    {res.username}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 sm:gap-6">
                                            {res.is_correct === true ? (
                                                <CheckCircle className="text-green-500" size={20} />
                                            ) : res.is_correct === false ? (
                                                <XCircle className="text-red-500" size={20} />
                                            ) : (
                                                <MinusCircle className="text-slate-500" size={20} />
                                            )}
                                            <div
                                                className="flex w-24 items-center text-slate-600"
                                                title="Response Time"
                                            >
                                                <Clock className="mr-1.5" size={16} />
                                                <span className="font-mono text-sm">
                                                    {formatTime(res.time_to_response_millis)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 border-t border-dashed border-slate-300/60 pl-12 pt-2">
                                        <div className="flex items-start gap-2">
                                            <MessageSquare
                                                size={15}
                                                className="mt-0.5 shrink-0 text-slate-500"
                                            />
                                            <div className="text-sm text-slate-800">
                                                {getResponseText(res)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center text-slate-500">
                                No responses submitted yet.
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="rounded-b-lg border-t bg-slate-50 p-4">
                    <Button onClick={onClose} variant="outline">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
