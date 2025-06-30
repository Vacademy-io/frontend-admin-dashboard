import React, { useMemo } from 'react';
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
import { BarChart2, CheckCircle, Percent } from 'lucide-react';
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
    const distributionData = useMemo(() => {
        if (!responses || !slideData?.elements?.singleChoiceOptions) {
            return { stats: [], totalResponses: 0 };
        }

        const totalResponses = responses.length;
        if (totalResponses === 0) {
            return { stats: [], totalResponses: 0 };
        }

        const optionCounts = new Map<string, number>();
        for (const res of responses) {
            const selectedId = res.response_data?.selected_option_ids?.[0];
            if (selectedId) {
                optionCounts.set(selectedId, (optionCounts.get(selectedId) || 0) + 1);
            }
        }

        const stats = slideData.elements.singleChoiceOptions.map((option: any) => {
            const count = optionCounts.get(option.id) || 0;
            const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
            return {
                id: option.id,
                name: option.name,
                count,
                percentage,
                isCorrect: option.isSelected, // Assuming isSelected marks the correct answer
            };
        });

        return { stats, totalResponses };
    }, [responses, slideData]);

    const stripHtml = (html: string) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-2xl p-0">
                <DialogHeader className="border-b p-6 pb-4">
                    <DialogTitle className="flex items-center text-2xl font-bold text-slate-800">
                        <BarChart2 className="mr-3 text-sky-500" size={28} />
                        Response Distribution
                    </DialogTitle>
                    <DialogDescription>
                        A visual breakdown of participant responses for this question. Total
                        responses: {distributionData.totalResponses}.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-4 p-6">
                        {distributionData.stats.length > 0 ? (
                            distributionData.stats.map((optionStat: any) => (
                                <div key={optionStat.id} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center font-medium text-slate-700">
                                            {optionStat.isCorrect && (
                                                <CheckCircle
                                                    size={16}
                                                    className="mr-2 text-green-500"
                                                />
                                            )}
                                            <div
                                                className="prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{
                                                    __html: optionStat.name,
                                                }}
                                            />
                                        </div>
                                        <div className="font-mono text-slate-600">
                                            {optionStat.count} ({optionStat.percentage.toFixed(0)}%)
                                        </div>
                                    </div>
                                    <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all duration-500 ease-out',
                                                optionStat.isCorrect ? 'bg-green-500' : 'bg-sky-500'
                                            )}
                                            style={{ width: `${optionStat.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center text-slate-500">
                                No responses have been submitted for this question yet.
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
