import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart, Trophy, Loader2, PieChart, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { LeaderboardModal } from './LeaderboardModal';
import { ResponseDistributionModal } from './ResponseDistributionModal';
import type { QuizSlideData } from '../utils/types';
import { WordCloudModal } from './WordCloudModal';

const RESPONSES_API_URL_BASE = 'https://backend-stage.vacademy.io/community-service/engage/admin/';

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

interface ResponseOverlayProps {
    sessionId: string;
    slideData: QuizSlideData;
}

export const ResponseOverlay: React.FC<ResponseOverlayProps> = ({ sessionId, slideData }) => {
    const [responses, setResponses] = useState<ResponseData[]>([]);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [isDistributionOpen, setIsDistributionOpen] = useState(false);
    const [isWordCloudOpen, setIsWordCloudOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const isMcqQuestion = useMemo(() => {
        return (
            slideData?.elements?.singleChoiceOptions &&
            slideData.elements.singleChoiceOptions.length > 0
        );
    }, [slideData]);

    useEffect(() => {
        // Function to fetch responses
        const fetchResponses = async () => {
            if (!sessionId || !slideData.id) return;
            try {
                const response = await authenticatedAxiosInstance.get(
                    `${RESPONSES_API_URL_BASE}${sessionId}/slide/${slideData.id}/responses`
                );
                if (Array.isArray(response.data)) {
                    setResponses(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch slide responses:', error);
                // Don't show toast on interval, it would be annoying.
                // toast.error("Could not fetch latest responses.");
            } finally {
                setIsLoading(false);
            }
        };

        // Fetch immediately on mount, then set up polling
        fetchResponses();

        // Clear any existing interval before setting a new one
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        pollingIntervalRef.current = setInterval(fetchResponses, 5000); // Poll every 5 seconds

        // Cleanup function
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [sessionId, slideData.id]);

    return (
        <>
            <div className="absolute bottom-14 left-1/2 z-[1002] flex -translate-x-1/2 items-center gap-2 rounded-lg bg-slate-800/80 p-2 text-white shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 border-r border-slate-600 pr-2">
                    <BarChart size={20} className="text-sky-400" />
                    <span className="font-medium">Responses:</span>
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <span className="text-lg font-bold">{responses.length}</span>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-400 bg-transparent text-orange-400 hover:bg-orange-400 hover:text-white"
                    onClick={() => setIsLeaderboardOpen(true)}
                >
                    <Trophy size={16} className="mr-2" />
                    Leaderboard
                </Button>
                {isMcqQuestion ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-sky-400 bg-transparent text-sky-400 hover:bg-sky-400 hover:text-white"
                        onClick={() => setIsDistributionOpen(true)}
                    >
                        <PieChart size={16} className="mr-2" />
                        Distribution
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-teal-400 bg-transparent text-teal-400 hover:bg-teal-400 hover:text-white"
                        onClick={() => setIsWordCloudOpen(true)}
                    >
                        <Cloud size={16} className="mr-2" />
                        Word Cloud
                    </Button>
                )}
            </div>
            <LeaderboardModal
                isOpen={isLeaderboardOpen}
                onClose={() => setIsLeaderboardOpen(false)}
                responses={responses}
                slideData={slideData}
                isMcq={isMcqQuestion}
            />
            {isMcqQuestion ? (
                <ResponseDistributionModal
                    isOpen={isDistributionOpen}
                    onClose={() => setIsDistributionOpen(false)}
                    responses={responses}
                    slideData={slideData}
                />
            ) : (
                <WordCloudModal
                    isOpen={isWordCloudOpen}
                    onClose={() => setIsWordCloudOpen(false)}
                    responses={responses}
                />
            )}
        </>
    );
};
