import { BrainCircuit, FileText, Layers, Sparkles, CheckCircle } from 'lucide-react';
import { AiGeneratingLoader } from '@/components/common/slides/AiGeneratingLoader';

const outlineSteps = [
    { text: 'Analyzing your topic...', icon: BrainCircuit },
    { text: 'Structuring the outline...', icon: FileText },
    { text: 'Organizing chapters and topics...', icon: Layers },
    { text: 'Creating learning objectives...', icon: Sparkles },
    { text: 'Finalizing your course outline...', icon: CheckCircle },
];

interface OutlineGeneratingLoaderProps {
    estimatedTimeRemaining?: number;
}

export const OutlineGeneratingLoader = ({ estimatedTimeRemaining }: OutlineGeneratingLoaderProps) => {
    const minutes = estimatedTimeRemaining ? Math.floor(estimatedTimeRemaining / 60) : 0;
    const seconds = estimatedTimeRemaining ? estimatedTimeRemaining % 60 : 0;
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
            <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
                <AiGeneratingLoader
                    title="AI is generating your course outline"
                    description={
                        estimatedTimeRemaining && estimatedTimeRemaining > 0
                            ? `Estimated time: ${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`
                            : 'Our AI is crafting your course structure. This may take a moment.'
                    }
                    steps={outlineSteps}
                />
            </div>
        </div>
    );
};
