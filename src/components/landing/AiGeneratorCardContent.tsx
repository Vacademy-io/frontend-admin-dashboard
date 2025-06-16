import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, FileText, BrainCircuit, Sparkles, CheckCircle, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const aiSteps = [
    { text: 'Analyzing your topic...', icon: BrainCircuit },
    { text: 'Structuring the outline...', icon: FileText },
    { text: 'Drafting content for each slide...', icon: Bot },
    { text: 'Creating assessment questions...', icon: Sparkles },
    { text: 'Finalizing your Volt...', icon: CheckCircle },
];

const promptText = "The impact of renewable energy on climate change";

export const AiGeneratorCardContent = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [typedPrompt, setTypedPrompt] = useState("");

    useEffect(() => {
        const typingTimeout = setTimeout(() => {
            let i = 0;
            const typingInterval = setInterval(() => {
                setTypedPrompt(promptText.substring(0, i + 1));
                i++;
                if (i > promptText.length) {
                    clearInterval(typingInterval);
                    setTimeout(() => setIsGenerating(true), 1000);
                }
            }, 50);
            return () => clearInterval(typingInterval);
        }, 1000);

        return () => clearTimeout(typingTimeout);
    }, []);

    useEffect(() => {
        if (!isGenerating) return;

        const stepDuration = 1500;
        const interval = setInterval(() => {
            setCurrentStepIndex(prev => {
                if (prev < aiSteps.length - 1) {
                    return prev + 1;
                }
                clearInterval(interval);
                return prev;
            });
        }, stepDuration);
        
        return () => clearInterval(interval);
    }, [isGenerating]);

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6 h-[320px]">
                <AnimatePresence mode="wait">
                    {!isGenerating ? (
                        <motion.div
                            key="prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Wand2 className="text-orange-500" size={24}/>
                                <h3 className="text-md font-semibold text-slate-700">AI Presentation Generator</h3>
                            </div>
                            <div className="relative w-full">
                                <p className="text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-md p-3 min-h-[44px]">
                                    {typedPrompt}
                                    <motion.span 
                                        className="inline-block w-0.5 h-4 bg-orange-500"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
                                    />
                                </p>
                            </div>
                            <button className="w-full mt-4 bg-orange-500 text-white font-semibold py-2 rounded-md opacity-50 cursor-not-allowed">
                                Generate
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                             <div className="flex flex-col items-center justify-center space-y-2">
                                <div className="relative">
                                    <Bot className="h-10 w-10 text-orange-500" />
                                    <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />
                                </div>
                                <h2 className="text-md font-bold text-neutral-800 text-center">
                                    Creating your Volt...
                                </h2>
                            </div>
                             <div className="w-full pt-4 space-y-2">
                                {aiSteps.map((step, index) => {
                                    const Icon = step.icon;
                                    const isActive = index === currentStepIndex;
                                    const isCompleted = index < currentStepIndex;

                                    return (
                                        <div key={index} className="flex items-center space-x-3 transition-all duration-300">
                                            <div className="flex items-center justify-center w-6 h-6">
                                                {isCompleted ? (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    </motion.div>
                                                ) : (
                                                    <div className="relative flex items-center justify-center w-5 h-5">
                                                        {isActive && (
                                                            <motion.div 
                                                                className="absolute w-full h-full bg-orange-200 rounded-full"
                                                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                                                transition={{ duration: 1.5, repeat: Infinity}}
                                                            />
                                                        )}
                                                        <Icon className={cn(`w-4 h-4 transition-colors duration-300`, isActive ? 'text-orange-600' : 'text-neutral-400')} />
                                                    </div>
                                                )}
                                            </div>
                                            <span className={cn(`text-sm transition-colors duration-300`, {
                                                'text-orange-600 font-semibold': isActive,
                                                'text-neutral-700 line-through decoration-green-500': isCompleted,
                                                'text-neutral-500': !isActive && !isCompleted,
                                            })}>
                                                {step.text}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}; 