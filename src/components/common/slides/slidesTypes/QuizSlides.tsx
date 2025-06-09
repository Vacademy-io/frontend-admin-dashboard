/* eslint-disable */
// @ts-nocheck
import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { MainViewQuillEditor } from '@/components/quill/MainViewQuillEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSlideStore } from '@/stores/Slides/useSlideStore'; // Adjust path
import debounce from 'lodash.debounce'; // Import debounce
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Assuming QuestionFormData and SlideTypeEnum are from your types file
import type { QuestionFormData } from '@/components/common/slides/utils/types'; // Import QuestionFormData as type
import { SlideTypeEnum } from '@/components/common/slides/utils/types';

interface QuizSlideProps {
    formdata: QuestionFormData; // Initial data for the form
    questionType: SlideTypeEnum.Quiz | SlideTypeEnum.Feedback;
    className?: string;
    currentSlideId: string;
    isPresentationMode?: boolean;
}

export const QuizSlide: React.FC<QuizSlideProps> = ({
    formdata,
    questionType,
    className,
    currentSlideId,
    isPresentationMode = false,
}) => {
    const { updateQuizFeedbackSlide } = useSlideStore();

    // console.log(`[QuizSlide] ID: ${currentSlideId}, PresentationMode: ${isPresentationMode}, Received formdata:`, JSON.parse(JSON.stringify(formdata)));

    const form = useForm<QuestionFormData>({
        defaultValues: formdata || {
            questionName: '',
            singleChoiceOptions: [],
            feedbackAnswer: '',
        },
    });

    const { control, getValues, setValue, watch, reset } = form;

    useEffect(() => {
        if (formdata) {
            reset(formdata);
        } else {
            // Reset to empty structure if formdata is null/undefined to clear previous slide's data
            reset({ questionName: '', singleChoiceOptions: [], feedbackAnswer: '' });
        }
    }, [formdata, reset]);

    // Using watch() on the entire form could be expensive.
    // It's better to use useEffect with specific field watches or a debounced submit.
    const watchedFormValues = watch();

    // Debounce the function that updates the Zustand store
    const debouncedUpdateStore = useMemo(
        () =>
            debounce((data: QuestionFormData) => {
                if (!isPresentationMode) {
                    // console.log("QuizSlide: Debounced update to store for slide", currentSlideId, data);
                    updateQuizFeedbackSlide(currentSlideId, data);
                }
            }, 500), // 500ms delay, adjust as needed
        [currentSlideId, isPresentationMode, updateQuizFeedbackSlide]
    );

    useEffect(() => {
        // Call the debounced function when form values change
        debouncedUpdateStore(watchedFormValues);

        // Cleanup function to cancel any pending debounced calls if the component unmounts
        // or if the dependencies of debouncedUpdateStore change.
        return () => {
            debouncedUpdateStore.cancel();
        };
    }, [watchedFormValues, debouncedUpdateStore]);

    const handleOptionSelectionChange = (optionIndex: number) => {
        if (isPresentationMode) return;

        const currentOptions = getValues('singleChoiceOptions') || [];
        const isCurrentlySelected = currentOptions[optionIndex]?.isSelected;

        const updatedOptions = currentOptions.map((option: any, index: number) => ({
            ...option,
            isSelected: index === optionIndex ? !isCurrentlySelected : false,
        }));

        setValue('singleChoiceOptions', updatedOptions, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const handleAddOption = () => {
        const currentOptions = getValues('singleChoiceOptions') || [];
        if (currentOptions.length >= 5) {
            toast.info('You can add a maximum of 5 options.');
            return;
        }
        const newOption = {
            id: `temp-opt-${Date.now()}`,
            name: '',
            isSelected: false,
        };
        setValue('singleChoiceOptions', [...currentOptions, newOption], {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const handleRemoveOption = (indexToRemove: number) => {
        const currentOptions = getValues('singleChoiceOptions') || [];
        if (currentOptions.length <= 2) {
            toast.info('You need at least 2 options for a quiz.');
            return;
        }
        const updatedOptions = currentOptions.filter((_, index) => index !== indexToRemove);
        setValue('singleChoiceOptions', updatedOptions, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    if (isPresentationMode) {
        const displayData = formdata || {};
        // console.log(`[QuizSlide] Presentation Mode - ID: ${currentSlideId}, DisplayData:`, JSON.parse(JSON.stringify(displayData)));

        return (
            <div
                className={`flex h-full w-full flex-col items-center justify-center overflow-hidden p-4 text-slate-800 sm:p-6 md:p-8 ${className}`}
                style={{ boxSizing: 'border-box' }}
            >
                <ScrollArea className="h-full w-full">
                    <div className="px-2 py-4 text-center">
                        {displayData?.questionName && (
                            <h2
                                className="mb-6 text-2xl font-bold leading-tight sm:mb-8 sm:text-3xl md:text-4xl"
                                dangerouslySetInnerHTML={{ __html: displayData.questionName }}
                            />
                        )}
                        {/* ... (rest of presentation mode JSX from your original code, ensure 'SlideType' is SlideTypeEnum) ... */}
                        {questionType === SlideTypeEnum.Quiz &&
                            displayData?.singleChoiceOptions &&
                            Array.isArray(displayData.singleChoiceOptions) && (
                                <div className="mx-auto w-full max-w-2xl space-y-3 sm:space-y-4">
                                    {displayData.singleChoiceOptions.map(
                                        (option: any, index: number) => (
                                            <div
                                                key={option.id || `option-${index}`}
                                                className="group rounded-xl border border-slate-300 bg-slate-50 p-4 text-left text-base transition-all duration-150 ease-in-out hover:border-orange-400 hover:bg-slate-100 sm:text-lg"
                                            >
                                                <span className="mr-3 font-semibold text-orange-600">
                                                    {String.fromCharCode(65 + index)}.
                                                </span>
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            option.name || 'Option text missing',
                                                    }}
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            )}

                        {questionType === SlideTypeEnum.Feedback && (
                            <div className="mx-auto mt-6 w-full max-w-2xl">
                                <p className="mb-4 text-lg italic text-slate-500 sm:text-xl">
                                    Your feedback is valuable!
                                </p>
                                {displayData?.feedbackAnswer /* Assuming feedbackAnswer is where collected data is stored */ ? (
                                    <div className="rounded-lg border bg-blue-50 p-4 text-left shadow-sm">
                                        <p
                                            className="text-base sm:text-lg"
                                            dangerouslySetInnerHTML={{
                                                __html: displayData.feedbackAnswer,
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                        <p className="text-sm text-slate-400">(Feedback area)</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {!(
                            displayData?.questionName ||
                            (questionType === SlideTypeEnum.Quiz &&
                                displayData?.singleChoiceOptions?.length > 0) ||
                            (questionType === SlideTypeEnum.Feedback && displayData?.feedbackAnswer)
                        ) && (
                            <p className="mt-8 italic text-slate-400">
                                This slide is awaiting content.
                            </p>
                        )}
                    </div>
                </ScrollArea>
            </div>
        );
    }

    // Editor Mode
    const currentOptions = watch('singleChoiceOptions') || [];

    return (
        <ScrollArea className="h-full w-full">
            <Form {...form}>
                <form className={`space-y-6 bg-white p-4 sm:p-6 ${className}`}>
                    <div>
                        <FormLabel className="mb-1.5 block text-sm font-medium text-slate-700">
                            Question Title/Prompt
                        </FormLabel>
                        <FormField
                            control={control}
                            name="questionName"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <MainViewQuillEditor
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            placeholder="Type your question or prompt here..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {questionType === SlideTypeEnum.Quiz && (
                        <div className="space-y-4">
                            <FormLabel className="mb-1.5 block text-sm font-medium text-slate-700">
                                Answer Options (Mark the correct one)
                            </FormLabel>
                            {Array.isArray(currentOptions) &&
                                currentOptions.map((option: any, idx: number) => (
                                    <div
                                        key={option?.id || `edit-option-${idx}`}
                                        className={`flex items-start gap-3 rounded-lg border p-3 transition-colors
                                        ${option?.isSelected ? 'border-orange-400 bg-orange-50/50 shadow-sm' : 'border-slate-200 bg-slate-50/30 hover:border-slate-300'}`}
                                    >
                                        <div className="flex items-center pt-1">
                                            <FormField
                                                control={control}
                                                name={`singleChoiceOptions.${idx}.isSelected`}
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={!!field.value}
                                                                onCheckedChange={() =>
                                                                    handleOptionSelectionChange(idx)
                                                                }
                                                                className={`size-5 rounded border-slate-400 focus-visible:ring-orange-400 data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500`}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <span className="ml-3 text-sm font-medium text-slate-600">
                                                {String.fromCharCode(65 + idx)}.
                                            </span>
                                        </div>
                                        <FormField
                                            control={control}
                                            name={`singleChoiceOptions.${idx}.name`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <MainViewQuillEditor
                                                            value={field.value || ''}
                                                            onChange={field.onChange}
                                                            placeholder={`Option ${String.fromCharCode(65 + idx)} content`}
                                                            className="text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="ml-2 mt-1 shrink-0 text-slate-400 hover:bg-red-100 hover:text-red-500"
                                            onClick={() => handleRemoveOption(idx)}
                                            title="Remove Option"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full border-dashed"
                                onClick={handleAddOption}
                            >
                                <Plus size={14} className="mr-1" /> Add Option
                            </Button>
                        </div>
                    )}

                    {questionType === SlideTypeEnum.Feedback && (
                        <div>
                            <FormLabel className="mb-1.5 block text-sm font-medium text-slate-700">
                                Feedback Area Configuration
                            </FormLabel>
                            <FormField
                                control={control}
                                name="feedbackAnswer" // This name might be confusing. Is it a prompt or where answer is stored?
                                // If it's a prompt for users to fill, "feedbackPrompt" might be better.
                                // If it's where responses are shown, "feedbackDisplay" or similar.
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <MainViewQuillEditor
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                placeholder="Configure feedback prompt or display area..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </form>
            </Form>
        </ScrollArea>
    );
};
