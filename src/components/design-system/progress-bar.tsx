import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
    progress: number;
}

export const ProgressBar = ({ progress }: ProgressBarProps) => {
    return (
        <div className="flex flex-col gap-1">
            <Progress value={progress} className="w-full bg-white [&>div]:bg-success-600" />
        </div>
    );
};
