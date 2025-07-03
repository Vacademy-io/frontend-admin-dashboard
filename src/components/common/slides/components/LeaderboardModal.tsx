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
    Crown,
    Target,
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
        if (rank === 0) return <Crown className="text-yellow-500" size={20} />;
        if (rank === 1) return <Medal className="text-gray-400" size={20} />;
        if (rank === 2) return <Medal className="text-amber-700" size={20} />;
        return (
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-600">{rank + 1}</span>
            </div>
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
        
        // First, try to find by exact ID match
        let selectedOption = slideOptions.find(
            (opt: { id: string; name: string }) => opt.id === selectedId
        );

        // If not found by ID, this might be a case where we have database IDs vs temp IDs
        // Let's try to find a reasonable fallback
        if (!selectedOption) {
            console.log(`[Leaderboard] Option with ID ${selectedId} not found in slide options:`, slideOptions);
            
            // Try to match by index if the selectedId looks like a database UUID
            // This is a fallback for when temp IDs don't match database IDs
            if (selectedId.includes('-') && selectedId.length > 10) {
                // Check if we have responses from other users to see a pattern
                const allSelectedIds = responses
                    .map(r => r.response_data?.selected_option_ids?.[0])
                    .filter(Boolean);
                
                const uniqueSelectedIds = [...new Set(allSelectedIds)];
                
                // If we have unique IDs that match the number of options, map by index
                if (uniqueSelectedIds.length <= slideOptions.length) {
                    const selectedIndex = uniqueSelectedIds.indexOf(selectedId);
                    if (selectedIndex >= 0 && selectedIndex < slideOptions.length) {
                        selectedOption = slideOptions[selectedIndex];
                        console.log(`[Leaderboard] Matched by index ${selectedIndex}:`, selectedOption);
                    }
                }
            }
        }

        if (selectedOption?.name) {
            // Get the option index for display
            const optionIndex = slideOptions.findIndex((opt: any) => opt.id === selectedOption.id);
            const optionLetter = optionIndex >= 0 ? String.fromCharCode(65 + optionIndex) : '?';
            
            return (
                <div className="flex items-start gap-2">
                    <div className="flex items-center justify-center w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-sm flex-shrink-0 mt-0.5">
                        {optionLetter}
                    </div>
                <div
                        className="prose prose-sm max-w-none flex-1"
                    dangerouslySetInnerHTML={{ __html: selectedOption.name }}
                />
                </div>
            );
        }

        // Still not found - show the ID for debugging
        return (
            <div className="text-sm italic text-red-500">
                Option not found (ID: {selectedId.substring(0, 8)}...)
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:w-full max-w-3xl p-0 bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                {/* Enhanced background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white to-yellow-50/50 pointer-events-none" />
                <div className="absolute top-0 right-1/4 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl" />
                
                <DialogHeader className="relative z-10 border-b border-slate-200/50 p-6 pb-4 bg-white/80 backdrop-blur-sm">
                    <DialogTitle className="flex items-center text-2xl lg:text-3xl font-bold text-slate-800">
                        <div className="p-2 mr-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl shadow-lg">
                            <Trophy className="text-white" size={24} />
                        </div>
                        <span className="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                        Live Leaderboard
                        </span>
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-slate-600">
                        Responses sorted by correctness and speed. 
                        <span className="inline-flex items-center gap-1 ml-2 px-2 py-1 bg-orange-100/80 backdrop-blur-sm rounded-lg border border-orange-200/50">
                            <Target size={14} className="text-orange-600" />
                            <span className="font-semibold text-orange-700">{responses.length}</span>
                            <span className="text-orange-600">participants</span>
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="relative z-10 max-h-[60vh]">
                    <div className="space-y-3 p-6">
                        {sortedResponses.length > 0 ? (
                            sortedResponses.map((res, index) => (
                                <div
                                    key={res.username + res.submitted_at}
                                    className={cn(
                                        'group relative flex flex-col rounded-2xl border p-4 transition-all duration-300 ease-out hover:scale-[1.01] shadow-sm hover:shadow-lg backdrop-blur-sm',
                                        res.is_correct === true
                                            ? 'border-green-200/50 bg-green-50/80 hover:border-green-300/50'
                                            : res.is_correct === false
                                              ? 'border-red-200/50 bg-red-50/80 hover:border-red-300/50'
                                              : 'border-slate-200/50 bg-slate-50/80 hover:border-slate-300/50'
                                    )}
                                >
                                    {/* Subtle gradient overlay */}
                                    <div className={cn(
                                        'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                                        res.is_correct === true
                                            ? 'bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5'
                                            : res.is_correct === false
                                              ? 'bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5'
                                              : 'bg-gradient-to-r from-slate-500/5 via-transparent to-slate-500/5'
                                    )} />
                                    
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex w-8 items-center justify-center">
                                                {getRankIcon(index)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-slate-100/80 backdrop-blur-sm rounded-lg border border-slate-200/50">
                                                    <User className="text-slate-500" size={16} />
                                                </div>
                                                <span className="font-semibold text-slate-700 group-hover:text-slate-800 transition-colors duration-200">
                                                    {res.username}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 sm:gap-6">
                                            <div className={cn(
                                                'p-2 rounded-lg border backdrop-blur-sm',
                                                res.is_correct === true
                                                    ? 'bg-green-100/80 border-green-200/50'
                                                    : res.is_correct === false
                                                      ? 'bg-red-100/80 border-red-200/50'
                                                      : 'bg-slate-100/80 border-slate-200/50'
                                            )}>
                                            {res.is_correct === true ? (
                                                    <CheckCircle className="text-green-600" size={18} />
                                            ) : res.is_correct === false ? (
                                                    <XCircle className="text-red-600" size={18} />
                                            ) : (
                                                    <MinusCircle className="text-slate-600" size={18} />
                                            )}
                                            </div>
                                            <div
                                                className="flex items-center gap-2 px-3 py-2 bg-slate-100/80 backdrop-blur-sm rounded-lg border border-slate-200/50"
                                                title="Response Time"
                                            >
                                                <Clock className="text-slate-500" size={16} />
                                                <span className="font-mono text-sm font-semibold text-slate-700">
                                                    {formatTime(res.time_to_response_millis)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative mt-3 border-t border-dashed border-slate-300/60 pl-12 pt-3">
                                        <div className="flex items-start gap-3">
                                            <div className="p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-lg border border-slate-200/50">
                                            <MessageSquare
                                                    size={14}
                                                    className="text-slate-500"
                                            />
                                            </div>
                                            <div className="text-sm text-slate-800 flex-1">
                                                {getResponseText(res)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-16 text-center">
                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-r from-slate-300 to-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <Trophy className="text-white" size={32} />
                                    </div>
                                </div>
                                <p className="text-slate-500 text-lg font-medium mb-2">No responses yet</p>
                                <p className="text-slate-400 text-sm">The leaderboard will update as participants submit their answers.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="relative z-10 rounded-b-2xl border-t border-slate-200/50 bg-white/80 backdrop-blur-sm p-4">
                    <Button 
                        onClick={onClose} 
                        variant="outline"
                        className="bg-white/80 backdrop-blur-sm border-slate-300 hover:bg-white hover:border-orange-400 text-slate-700 hover:text-orange-700 font-semibold transition-all duration-200 hover:scale-105 rounded-xl"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
