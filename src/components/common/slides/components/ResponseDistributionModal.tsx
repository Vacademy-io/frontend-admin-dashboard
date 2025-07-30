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
import { BarChart2, CheckCircle, Percent, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizSlideData } from '../utils/types';

interface ResponseData {
    username: string;
    response_data: {
        selected_option_ids: string[];
    };
}

interface DistributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    responses: ResponseData[];
    slideData: QuizSlideData;
}

export const ResponseDistributionModal: React.FC<DistributionModalProps> = ({
    isOpen,
    onClose,
    responses,
    slideData,
}) => {
    useEffect(() => {
        if (isOpen) {
            console.log(
                '[Distribution] Modal opened. Received slideData with options:',
                JSON.stringify(slideData?.elements?.singleChoiceOptions, null, 2)
            );
            console.log(
                '[Distribution] Modal opened. Received responses:',
                JSON.stringify(responses, null, 2)
            );
        }
    }, [isOpen, slideData, responses]);

    const distributionData = useMemo(() => {
        if (!responses || !slideData?.elements?.singleChoiceOptions) {
            return { stats: [], totalResponses: 0 };
        }

        const totalResponses = responses.length;
        if (totalResponses === 0) {
            return { stats: [], totalResponses: 0 };
        }

        const slideOptions = slideData.elements.singleChoiceOptions;

        // Collect all selected IDs from responses
        const allSelectedIds = responses
            .map((r) => r.response_data?.selected_option_ids?.[0])
            .filter(Boolean);

        const uniqueSelectedIds = [...new Set(allSelectedIds)];

        console.log('[Distribution] All selected IDs:', allSelectedIds);
        console.log('[Distribution] Unique selected IDs:', uniqueSelectedIds);
        console.log(
            '[Distribution] Slide option IDs:',
            slideOptions.map((opt: any) => opt.id)
        );

        // Create a mapping function to match response IDs to slide option IDs
        const getMatchingSlideOptionId = (responseOptionId: string): string | null => {
            // First, try exact match
            const exactMatch = slideOptions.find((opt: any) => opt.id === responseOptionId);
            if (exactMatch) {
                return exactMatch.id;
            }

            // Fallback: Try to match by index if IDs don't match
            if (responseOptionId.includes('-') && responseOptionId.length > 10) {
                const responseIndex = uniqueSelectedIds.indexOf(responseOptionId);
                if (responseIndex >= 0 && responseIndex < slideOptions.length) {
                    console.log(
                        `[Distribution] Mapping response ID ${responseOptionId} to slide option at index ${responseIndex}`
                    );
                    return slideOptions[responseIndex].id;
                }
            }

            console.log(`[Distribution] Could not match response option ID: ${responseOptionId}`);
            return null;
        };

        // Count responses for each slide option
        const optionCounts = new Map<string, number>();

        for (const res of responses) {
            const selectedId = res.response_data?.selected_option_ids?.[0];
            if (selectedId) {
                const matchingSlideOptionId = getMatchingSlideOptionId(selectedId);
                if (matchingSlideOptionId) {
                    optionCounts.set(
                        matchingSlideOptionId,
                        (optionCounts.get(matchingSlideOptionId) || 0) + 1
                    );
                }
            }
        }

        console.log('[Distribution] Final option counts:', Object.fromEntries(optionCounts));

        const stats = slideOptions.map((option: any, index: number) => {
            const count = optionCounts.get(option.id) || 0;
            const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
            return {
                id: option.id,
                name: option.name,
                count,
                percentage,
                isCorrect: option.isSelected, // Assuming isSelected marks the correct answer
                index, // Add index for display
            };
        });

        console.log('[Distribution] Final stats:', stats);

        return { stats, totalResponses };
    }, [responses, slideData]);

    const stripHtml = (html: string) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-3xl overflow-hidden rounded-2xl border-white/20 bg-white/95 p-0 shadow-2xl backdrop-blur-xl sm:w-full">
                {/* Enhanced background effects */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50" />
                <div className="absolute right-1/4 top-0 size-48 rounded-full bg-blue-500/5 blur-3xl" />
                <div className="absolute bottom-0 left-1/4 size-48 rounded-full bg-cyan-500/5 blur-3xl" />

                <DialogHeader className="relative z-10 border-b border-slate-200/50 bg-white/80 p-6 pb-4 backdrop-blur-sm">
                    <DialogTitle className="flex items-center text-2xl font-bold text-slate-800 lg:text-3xl">
                        <div className="mr-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 p-2 shadow-lg">
                            <BarChart2 className="text-white" size={24} />
                        </div>
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Response Distribution
                        </span>
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-slate-600">
                        Visual breakdown of participant responses.
                        <span className="ml-2 inline-flex items-center gap-1 rounded-lg border border-blue-200/50 bg-blue-100/80 px-2 py-1 backdrop-blur-sm">
                            <TrendingUp size={14} className="text-blue-600" />
                            <span className="font-semibold text-blue-700">
                                {distributionData.totalResponses}
                            </span>
                            <span className="text-blue-600">total responses</span>
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="relative z-10 max-h-[60vh]">
                    <div className="space-y-4 p-6">
                        {distributionData.stats.length > 0 ? (
                            distributionData.stats.map((optionStat: any, index: number) => (
                                <div
                                    key={optionStat.id}
                                    className="group relative space-y-2 rounded-2xl border border-slate-200/50 bg-white/50 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.01] hover:border-blue-300/50 hover:shadow-lg"
                                >
                                    {/* Subtle gradient overlay */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                    <div className="relative flex items-center justify-between">
                                        <div className="flex min-w-0 flex-1 items-center font-medium text-slate-700">
                                            <div className="mr-4 flex items-center gap-3">
                                                {/* Option letter */}
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-slate-600 to-slate-700 text-sm font-bold text-white shadow-sm">
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                {/* Correct answer indicator */}
                                                {optionStat.isCorrect && (
                                                    <div className="rounded-lg border border-green-200/50 bg-green-100/80 p-1 backdrop-blur-sm">
                                                        <CheckCircle
                                                            size={16}
                                                            className="text-green-600"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                className="prose prose-sm min-w-0 max-w-none flex-1 text-slate-700 transition-colors duration-200 group-hover:text-slate-800"
                                                dangerouslySetInnerHTML={{
                                                    __html: optionStat.name,
                                                }}
                                            />
                                        </div>
                                        <div className="flex shrink-0 items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-slate-800">
                                                    {optionStat.count}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    responses
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 rounded-lg border border-slate-200/50 bg-slate-100/80 px-3 py-1 backdrop-blur-sm">
                                                <Percent size={14} className="text-slate-600" />
                                                <span className="font-mono font-bold text-slate-700">
                                                    {optionStat.percentage.toFixed(0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced progress bar */}
                                    <div className="relative h-3 w-full overflow-hidden rounded-full border border-slate-300/50 bg-slate-200/80 backdrop-blur-sm">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-100/50 to-slate-200/50" />
                                        <div
                                            className={cn(
                                                'relative h-full rounded-full shadow-sm transition-all duration-700 ease-out',
                                                optionStat.isCorrect
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/25'
                                                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/25'
                                            )}
                                            style={{ width: `${optionStat.percentage}%` }}
                                        />
                                        {/* Shimmer effect */}
                                        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-16 text-center">
                                <div className="mb-6">
                                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-r from-slate-300 to-slate-400 shadow-lg">
                                        <BarChart2 className="text-white" size={32} />
                                    </div>
                                </div>
                                <p className="mb-2 text-lg font-medium text-slate-500">
                                    No responses yet
                                </p>
                                <p className="text-sm text-slate-400">
                                    Response distribution will appear here once participants submit
                                    their answers.
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="relative z-10 rounded-b-2xl border-t border-slate-200/50 bg-white/80 p-4 backdrop-blur-sm">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="rounded-xl border-slate-300 bg-white/80 font-semibold text-slate-700 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-blue-400 hover:bg-white hover:text-blue-700"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
