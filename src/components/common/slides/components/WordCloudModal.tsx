import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Cloud, Feather } from 'lucide-react';
import { WordCloud, WordCloudProps } from '@isoterik/react-word-cloud';

interface ResponseData {
    username: string;
    response_data: {
        text_answer: string | null;
    };
}

interface WordCloudModalProps {
    isOpen: boolean;
    onClose: () => void;
    responses: ResponseData[];
}

export const WordCloudModal: React.FC<WordCloudModalProps> = ({ isOpen, onClose, responses }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<{ width: number; height: number } | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    useEffect(() => {
        if (!resizeObserverRef.current) {
            resizeObserverRef.current = new ResizeObserver(entries => {
                const entry = entries[0];
                if (entry) {
                    const { width, height } = entry.contentRect;
                    if (width > 0 && height > 0) {
                        setSize({ width, height });
                    }
                }
            });
        }

        const observer = resizeObserverRef.current;
        const currentRef = containerRef.current;

        if (isOpen && currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [isOpen]);

    const words = useMemo(() => {
        if (!responses) {
            return [];
        }
        
        const textBlob = responses
            .map(r => r.response_data.text_answer)
            .filter(Boolean)
            .join(' ');

        const wordCounts: { [key: string]: number } = {};
        
        textBlob.toLowerCase().split(/\s+/).forEach(word => {
            if (word && word.length > 2) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        });
        
        const result = Object.entries(wordCounts).map(([text, value]) => ({ text, value }));
        return result;
    }, [responses]);

    const fontSize: WordCloudProps['fontSize'] = (word) => {
        // Create a simple scale. For more complex scenarios, consider d3-scale.
        const minSize = 24;
        const maxSize = 96;
        const values = words.map(w => w.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        
        if (minValue === maxValue) {
            return minSize; // Or any default size if all words have the same count
        }
        
        const scale = (value: number) => 
            minSize + ((value - minValue) / (maxValue - minValue)) * (maxSize - minSize);
            
        return scale(word.value);
    };

    const colors = ["#2563eb", "#f97316", "#10b981", "#6366f1", "#ec4899", "#f59e0b"];

    const shouldRenderCloud = size && size.width > 0 && words.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl w-full p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle className="flex items-center text-2xl font-bold text-slate-800">
                        <Cloud className="mr-3 text-teal-500" size={28} />
                        Response Word Cloud
                    </DialogTitle>
                    <DialogDescription>
                        A visualization of the most common words used in participant responses.
                    </DialogDescription>
                </DialogHeader>
                
                <div ref={containerRef} className="p-6 h-[400px] w-full">
                    {shouldRenderCloud ? (
                        <WordCloud 
                            words={words} 
                            width={size.width} 
                            height={size.height} 
                            fontSize={fontSize}
                            font="Inter"
                            fill={(_, index) => colors[index % colors.length] || '#000'}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                            <Feather size={48} className="mb-4 text-slate-400" />
                            {words.length === 0 ? (
                                <>
                                    <p className="text-lg font-medium">No text responses submitted yet.</p>
                                    <p className="text-sm">The word cloud will appear here once participants respond.</p>
                                </>
                            ) : (
                                <p>Calculating layout...</p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 border-t bg-slate-50 rounded-b-lg">
                    <Button onClick={onClose} variant="outline">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 