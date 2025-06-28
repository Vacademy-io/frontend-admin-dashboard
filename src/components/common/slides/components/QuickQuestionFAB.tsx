import React, { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, HelpCircle, Send, X, ChevronsRight, ListEnd } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { createNewSlide } from '../utils/util';
import { SlideTypeEnum } from '../utils/types';
import type { Slide as AppSlide, QuizSlideData } from '../utils/types';

export type InsertionBehavior = 'next' | 'end';

interface QuickQuestionFABProps {
    onAddQuickQuestion: (slideData: AppSlide, insertionBehavior: InsertionBehavior) => void;
    disabled?: boolean;
}

export const QuickQuestionFAB: React.FC<QuickQuestionFABProps> = ({
    onAddQuickQuestion,
    disabled,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [insertionBehavior, setInsertionBehavior] = useState<InsertionBehavior>('next');
    const formId = useId();

    const handleAddOption = () => {
        if (options.length < 5) {
            setOptions([...options, '']);
        } else {
            toast.info('You can add a maximum of 5 options.');
        }
    };

    const handleRemoveOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = [...options];
            newOptions.splice(index, 1);
            setOptions(newOptions);
        } else {
            toast.info('You need at least 2 options for a quiz.');
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const resetForm = () => {
        setQuestionText('');
        setOptions(['', '', '', '']);
        setInsertionBehavior('next');
    };

    const handleSubmit = (type: 'poll' | 'question') => {
        if (!questionText.trim()) {
            toast.error('Question text cannot be empty.');
            return;
        }

        let newSlide: AppSlide;

        if (type === 'poll') {
            newSlide = createNewSlide(SlideTypeEnum.Feedback);
            // For feedback slides, the question text is stored in `questionName` within `elements`.
            (newSlide as QuizSlideData).elements = {
                ...((newSlide as QuizSlideData).elements || {}),
                questionName: questionText,
                feedbackAnswer: '', // Default empty answer field
            };
        } else {
            // type === 'question'
            if (options.some((opt) => !opt.trim())) {
                toast.error('All option fields must be filled out.');
                return;
            }
            newSlide = createNewSlide(SlideTypeEnum.Quiz);
            (newSlide as QuizSlideData).elements = {
                questionName: questionText,
                singleChoiceOptions: options.map((opt, index) => ({
                    id: `temp-opt-${Date.now()}-${index}`,
                    name: opt,
                    isSelected: false,
                })),
                timeLimit: 60,
            };
        }

        onAddQuickQuestion(newSlide, insertionBehavior);
        resetForm();
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    className="fixed bottom-16 right-5 z-[1003] size-14 rounded-full bg-orange-500 text-white shadow-xl transition-all duration-300 hover:scale-110 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300"
                    size="icon"
                    disabled={disabled}
                    title="Add a Quick Question"
                >
                    <Plus
                        className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
                        size={28}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="mr-5 w-96 border-slate-300 p-0 shadow-2xl" align="end">
                <Tabs defaultValue="question" className="w-full">
                    <div className="flex items-center justify-between rounded-t-lg border-b border-slate-200 bg-slate-50 p-3">
                        <h3 className="font-semibold text-slate-800">Add Quick Question</h3>
                        <TabsList>
                            <TabsTrigger value="question">Question</TabsTrigger>
                            <TabsTrigger value="poll">Poll</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="space-y-4 p-4">
                        <TabsContent value="question" className="m-0 space-y-4">
                            <div>
                                <Label
                                    htmlFor={`q-text-${formId}`}
                                    className="text-sm font-medium text-slate-600"
                                >
                                    Question
                                </Label>
                                <Input
                                    id={`q-text-${formId}`}
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    placeholder="e.g., What is the capital of France?"
                                    className="mt-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">
                                    Options
                                </Label>
                                {options.map((opt, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input
                                            value={opt}
                                            onChange={(e) =>
                                                handleOptionChange(index, e.target.value)
                                            }
                                            placeholder={`Option ${index + 1}`}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 shrink-0 text-slate-400 hover:bg-red-100 hover:text-red-500"
                                            onClick={() => handleRemoveOption(index)}
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-dashed"
                                    onClick={handleAddOption}
                                >
                                    <Plus size={14} className="mr-1" /> Add Option
                                </Button>
                            </div>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleSubmit('question')}
                            >
                                <Send size={16} className="mr-2" /> Ask Question Now
                            </Button>
                        </TabsContent>

                        <TabsContent value="poll" className="m-0 space-y-4">
                            <div>
                                <Label
                                    htmlFor={`poll-text-${formId}`}
                                    className="text-sm font-medium text-slate-600"
                                >
                                    Poll Question
                                </Label>
                                <Input
                                    id={`poll-text-${formId}`}
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    placeholder="e.g., What topics should we cover next?"
                                    className="mt-1"
                                />
                            </div>
                            <p className="text-center text-xs italic text-slate-500">
                                Participants will be able to type a short text response.
                            </p>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleSubmit('poll')}
                            >
                                <HelpCircle size={16} className="mr-2" /> Launch Poll Now
                            </Button>
                        </TabsContent>

                        <div className="!mt-5 border-t border-slate-200 pt-4">
                            <Label className="text-sm font-medium text-slate-600">Placement</Label>
                            <RadioGroup
                                defaultValue="next"
                                value={insertionBehavior}
                                onValueChange={(val: InsertionBehavior) =>
                                    setInsertionBehavior(val)
                                }
                                className="mt-2 grid grid-cols-2 gap-2"
                            >
                                <div>
                                    <RadioGroupItem
                                        value="next"
                                        id={`placement-next-${formId}`}
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor={`placement-next-${formId}`}
                                        className="flex items-center justify-center gap-2 rounded-md border-2 border-slate-200 bg-white p-2 text-sm font-medium hover:bg-slate-50 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:text-orange-600 [&:has([data-state=checked])]:border-orange-500"
                                    >
                                        <ChevronsRight size={16} /> After This Slide
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem
                                        value="end"
                                        id={`placement-end-${formId}`}
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor={`placement-end-${formId}`}
                                        className="flex items-center justify-center gap-2 rounded-md border-2 border-slate-200 bg-white p-2 text-sm font-medium hover:bg-slate-50 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:text-orange-600 [&:has([data-state=checked])]:border-orange-500"
                                    >
                                        <ListEnd size={16} /> At The End
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
};
