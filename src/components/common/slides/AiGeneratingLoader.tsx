import React, { useState, useEffect } from 'react';
import { Bot, FileText, BrainCircuit, Sparkles, CheckCircle, FileUp, RefreshCw, Layers } from 'lucide-react';

export const aiSteps = [
    { text: 'Analyzing your topic...', icon: BrainCircuit },
    { text: 'Structuring the outline...', icon: FileText },
    { text: 'Drafting content for each slide...', icon: Bot },
    { text: 'Creating assessment questions...', icon: Sparkles },
    { text: 'Finalizing your Volt...', icon: CheckCircle },
];

export const pptSteps = [
    { text: 'Uploading your Volt...', icon: FileUp },
    { text: 'Converting file format...', icon: RefreshCw },
    { text: 'Extracting slides and content...', icon: Layers },
    { text: 'Processing images and text...', icon: Sparkles },
    { text: 'Finalizing your new slides...', icon: CheckCircle },
];

interface Step {
    text: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

interface AiGeneratingLoaderProps {
    title?: string;
    description?: string;
    steps: Step[];
}

export const AiGeneratingLoader = ({
    title = "Generating your Volt",
    description = "Our AI is crafting your content. This may take a moment.",
    steps,
}: AiGeneratingLoaderProps) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        // This simulates progress. The total duration is roughly in line with the expected wait time.
        const stepDuration = Math.max(1000, 50000 / steps.length); // Aim for a ~50s total time
        const interval = setInterval(() => {
            setCurrentStepIndex(prev => {
                if (prev < steps.length - 1) {
                    return prev + 1;
                }
                clearInterval(interval); // Stop interval on the last step
                return prev;
            });
        }, stepDuration);

        return () => clearInterval(interval);
    }, [steps.length]);

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-white rounded-lg min-h-[350px]">
            <div className="relative">
                <Bot className="h-12 w-12 text-orange-500 animate-pulse" />
                <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-neutral-800 text-center">
                {title}
            </h2>
            <p className="text-center text-sm text-neutral-600 px-4">
                {description}
            </p>

            <div className="w-full pt-2 space-y-3 px-4">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;

                    return (
                        <div key={index} className="flex items-center space-x-4 transition-all duration-300">
                            <div className="flex items-center justify-center w-8 h-8">
                                {isCompleted ? (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                ) : (
                                    <div className="relative flex items-center justify-center w-6 h-6">
                                        {isActive && (
                                            <div className="absolute w-full h-full bg-orange-200 rounded-full animate-ping"></div>
                                        )}
                                        <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-orange-600' : 'text-neutral-400'}`} />
                                    </div>
                                )}
                            </div>
                            <span className={`text-sm transition-colors duration-300 ${isActive ? 'text-orange-600 font-semibold' : isCompleted ? 'text-neutral-700 line-through' : 'text-neutral-500'}`}>
                                {step.text}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}; 