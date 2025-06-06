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
import { Trophy, CheckCircle, XCircle, Clock, Medal, User, MessageSquare, MinusCircle } from 'lucide-react';
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
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose, responses, slideData }) => {


    useEffect(() => {
        if (isOpen) {
            console.log("[Leaderboard] Modal opened. Received slideData with options:", JSON.stringify(slideData?.elements?.singleChoiceOptions, null, 2));
            console.log("[Leaderboard] Modal opened. Received responses:", JSON.stringify(responses, null, 2));
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
    }

    const getRankIcon = (rank: number) => {
        if (rank === 0) return <Medal className="text-yellow-500" size={20} />;
        if (rank === 1) return <Medal className="text-gray-400" size={20} />;
        if (rank === 2) return <Medal className="text-amber-700" size={20} />;
        return <span className="text-sm font-medium text-slate-500 w-5 text-center">{rank + 1}</span>;
    }

    const getResponseText = (response: ResponseData) => {
        const selectedId = response.response_data?.selected_option_ids?.[0];

        if (!selectedId) {
            return <span className="text-slate-500 italic">No answer submitted</span>;
        }

        const slideOptions = slideData?.elements?.singleChoiceOptions || [];
        const selectedOption = slideOptions.find((opt: {id: string; name: string}) => opt.id === selectedId);

        if (selectedOption?.name) {
            return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedOption.name }} />;
        }
        
        return <span className="text-red-500 italic text-sm">Option not found</span>;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl w-full p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle className="flex items-center text-2xl font-bold text-slate-800">
                        <Trophy className="mr-3 text-orange-500" size={28} />
                        Live Leaderboard
                    </DialogTitle>
                    <DialogDescription>
                        Responses are sorted by correctness, then by the fastest time.
                    </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="max-h-[60vh]">
                    <div className="p-6 space-y-3">
                        {sortedResponses.length > 0 ? (
                            sortedResponses.map((res, index) => (
                                <div key={res.username + res.submitted_at} className={cn(
                                    "flex flex-col p-3 rounded-lg border transition-all",
                                    res.is_correct === true ? "bg-green-50 border-green-200" :
                                    res.is_correct === false ? "bg-red-50 border-red-200" :
                                    "bg-slate-50 border-slate-200"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-8">
                                                {getRankIcon(index)}
                                            </div>
                                            <div className="flex items-center">
                                                 <User className="mr-2 text-slate-400" size={16} />
                                                 <span className="font-semibold text-slate-700">{res.username}</span>
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
                                            <div className="flex items-center text-slate-600 w-24" title="Response Time">
                                                <Clock className="mr-1.5" size={16} />
                                                <span className="font-mono text-sm">{formatTime(res.time_to_response_millis)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pl-12 pt-2 mt-2 border-t border-slate-300/60 border-dashed">
                                        <div className="flex items-start gap-2">
                                            <MessageSquare size={15} className="text-slate-500 mt-0.5 shrink-0" />
                                            <div className="text-sm text-slate-800">
                                                {getResponseText(res)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-500">
                                No responses submitted yet.
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-4 border-t bg-slate-50 rounded-b-lg">
                    <Button onClick={onClose} variant="outline">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 