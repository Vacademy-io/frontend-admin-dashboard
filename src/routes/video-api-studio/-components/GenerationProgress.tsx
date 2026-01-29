import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { VideoStage } from '../-services/video-generation';
import {
    FileText,
    Mic,
    Type,
    Code,
    Film,
    CheckCircle2,
    Loader2,
    Circle,
} from 'lucide-react';

interface GenerationProgressProps {
    currentStage: VideoStage;
    percentage: number;
    message?: string;
}

const STAGES: { id: VideoStage; label: string; icon: React.ReactNode }[] = [
    { id: 'SCRIPT', label: 'Script', icon: <FileText className="h-4 w-4" /> },
    { id: 'TTS', label: 'Audio', icon: <Mic className="h-4 w-4" /> },
    { id: 'WORDS', label: 'Words', icon: <Type className="h-4 w-4" /> },
    { id: 'HTML', label: 'Visuals', icon: <Code className="h-4 w-4" /> },
    { id: 'RENDER', label: 'Render', icon: <Film className="h-4 w-4" /> },
];

function getStageIndex(stage: VideoStage): number {
    const index = STAGES.findIndex((s) => s.id === stage);
    return index === -1 ? -1 : index;
}

export function GenerationProgress({ currentStage, percentage, message }: GenerationProgressProps) {
    const currentIndex = getStageIndex(currentStage);

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-6">
                <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Generating your video...</span>
                            <span className="text-muted-foreground">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                    </div>

                    {/* Stage Indicators */}
                    <div className="flex items-center justify-between">
                        {STAGES.map((stage, index) => {
                            const isCompleted = index < currentIndex;
                            const isCurrent = index === currentIndex;
                            const isPending = index > currentIndex;

                            return (
                                <div key={stage.id} className="flex flex-col items-center gap-2">
                                    <div
                                        className={`
                                            flex items-center justify-center w-10 h-10 rounded-full transition-colors
                                            ${isCompleted ? 'bg-green-100 text-green-600' : ''}
                                            ${isCurrent ? 'bg-blue-100 text-blue-600' : ''}
                                            ${isPending ? 'bg-muted text-muted-foreground' : ''}
                                        `}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : isCurrent ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            stage.icon
                                        )}
                                    </div>
                                    <span
                                        className={`text-xs font-medium ${
                                            isCurrent
                                                ? 'text-blue-600'
                                                : isCompleted
                                                  ? 'text-green-600'
                                                  : 'text-muted-foreground'
                                        }`}
                                    >
                                        {stage.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Current Message */}
                    {message && (
                        <div className="text-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                            {message}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
