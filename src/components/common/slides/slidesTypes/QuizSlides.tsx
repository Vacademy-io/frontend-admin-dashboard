/* eslint-disable */
// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { MainViewQuillEditor } from '@/components/quill/MainViewQuillEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSlideStore } from '@/stores/Slides/useSlideStore'; // Adjust path
import debounce from 'lodash.debounce'; // Import debounce
import { Loader2, CheckCircle, XCircle, Award, TrendingUp } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

// Assuming QuestionFormData and SlideTypeEnum are from your types file
import type { QuestionFormData } from '@/components/common/slides/utils/types'; // Import QuestionFormData as type
import { SlideTypeEnum } from '@/components/common/slides/utils/types';
import type { LiveSlideResponse } from '@/components/common/slides/ActualPresentationDisplay'; // Import LiveSlideResponse

// Helper to format milliseconds into MM:SS.ms
const formatResponseTime = (ms: number) => {
    if (typeof ms !== 'number' || ms < 0) return 'N/A';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
};

interface QuizSlideProps {
    formdata: QuestionFormData;
    questionType: SlideTypeEnum.Quiz | SlideTypeEnum.Feedback;
    className?: string;
    currentSlideId: string;
    isPresentationMode?: boolean;
    liveResponses?: LiveSlideResponse[] | null;
    isLoadingLiveResponses?: boolean;
    liveSessionId?: string | null;
}

export const QuizSlide: React.FC<QuizSlideProps> = ({
    formdata,
    questionType,
    className,
    currentSlideId,
    isPresentationMode = false,
    liveResponses,
    isLoadingLiveResponses,
    liveSessionId,
}) => {
    const { updateQuizFeedbackSlide } = useSlideStore();
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    // console.log(`[QuizSlide] ID: ${currentSlideId}, PresentationMode: ${isPresentationMode}, Received formdata:`, JSON.parse(JSON.stringify(formdata)));

    const form = useForm<QuestionFormData>({
        defaultValues: formdata || {
            questionName: '',
            singleChoiceOptions: [],
            feedbackAnswer: '',
            isMcqmMsq: false,
        },
    });

    const { control, getValues, setValue, watch, reset } = form;

    useEffect(() => {
        if (formdata) {
            reset(formdata);
        } else {
            // Reset to empty structure if formdata is null/undefined to clear previous slide's data
            reset({ questionName: '', singleChoiceOptions: [], feedbackAnswer: '', isMcqmMsq: false });
        }
        setShowLeaderboard(false);
    }, [formdata, reset]);

    // Using watch() on the entire form could be expensive.
    // It's better to use useEffect with specific field watches or a debounced submit.
    const watchedFormValues = watch();

    // Debounce the function that updates the Zustand store
    const debouncedUpdateStore = useMemo(
        () =>
            debounce((data: QuestionFormData) => {
                if (!isPresentationMode && currentSlideId) {
                    // console.log(`QuizSlide (${currentSlideId}): Debounced update to store with:`, JSON.parse(JSON.stringify(data)));
                    updateQuizFeedbackSlide(currentSlideId, data);
                }
            }, 50), // REDUCED DEBOUNCE TIME from 500ms to 50ms
        [currentSlideId, isPresentationMode, updateQuizFeedbackSlide]
    );

    useEffect(() => {
        // Call the debounced function when form values change
        // console.log(`QuizSlide (${currentSlideId}): Setting up watch subscription.`);
        const subscription = watch((value, { name, type }) => {
            // value is the entire form data here
            // console.log(`QuizSlide (${currentSlideId}): Form value changed (name: ${name}, type: ${type}), scheduling debounced update.`);
            debouncedUpdateStore(value as QuestionFormData);
        });

        // Cleanup function to cancel any pending debounced calls if the component unmounts
        // or if the dependencies of debouncedUpdateStore change.
        return () => {
            // console.log(`QuizSlide (${currentSlideId}): Cleaning up watch subscription.`);
            subscription.unsubscribe();
            debouncedUpdateStore.cancel();
        };
    }, [watch, debouncedUpdateStore, currentSlideId]); // Added currentSlideId, watch and debouncedUpdateStore are dependencies

    const handleOptionSelectionChange = (optionIndex: number) => {
        if (isPresentationMode) return;

        const currentOptions = getValues('singleChoiceOptions') || [];
        const isMcqmMsq = getValues('isMcqmMsq');
        const isCurrentlySelected = currentOptions[optionIndex]?.isSelected;

        let updatedOptions;
        if (isMcqmMsq) {
            updatedOptions = currentOptions.map((option: any, index: number) => ({
                ...option,
                isSelected: index === optionIndex ? !isCurrentlySelected : option.isSelected,
            }));
        } else {
            updatedOptions = currentOptions.map((option: any, index: number) => ({
            ...option,
            isSelected: index === optionIndex ? !isCurrentlySelected : false,
        }));
        }

        setValue('singleChoiceOptions', updatedOptions, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const handleMcqmMsqToggle = () => {
        if (isPresentationMode) return;
        const currentIsMcqMsq = getValues('isMcqmMsq');
        setValue('isMcqmMsq', !currentIsMcqMsq, { shouldDirty: true });

        if (currentIsMcqMsq) {
            const currentOptions = getValues('singleChoiceOptions') || [];
            let firstSelectedFound = false;
            const updatedOptions = currentOptions.map((option: any) => {
                if (option.isSelected && !firstSelectedFound) {
                    firstSelectedFound = true;
                    return option;
                }
                return { ...option, isSelected: false };
            });
            setValue('singleChoiceOptions', updatedOptions, { shouldDirty: true });
        }
    };

    if (isPresentationMode) {
        const displayData = formdata || {};
        const isMCQType = questionType === SlideTypeEnum.Quiz && (displayData.isMcqmMsq || (!displayData.isMcqmMsq && displayData.singleChoiceOptions?.length > 0));
        const isTextResponseType = questionType === SlideTypeEnum.Feedback ||
            (questionType === SlideTypeEnum.Quiz && !isMCQType);

        const sortedLeaderboard = useMemo(() => {
            if (!liveResponses || !isMCQType) return [];
            return [...liveResponses]
                .filter(r => r.response_data.type === 'MCQS' || r.response_data.type === 'MCQM')
                .sort((a, b) => {
                    if ((a.is_correct ?? false) && !(b.is_correct ?? false)) return -1;
                    if (!(a.is_correct ?? false) && (b.is_correct ?? false)) return 1;
                    return (a.time_to_response_millis || 0) - (b.time_to_response_millis || 0);
                });
        }, [liveResponses, isMCQType]);

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
                        {/* Options are no longer displayed directly in presentation mode for MCQs */}
                        {/* {questionType === SlideTypeEnum.Quiz && isMCQType && (
                                <div className="mx-auto w-full max-w-2xl space-y-3 sm:space-y-4">
                                {displayData.singleChoiceOptions.map((option: any, index: number) => (
                                            <div
                                                key={option.id || `option-${index}`}
                                        className="group rounded-xl border border-slate-300 bg-slate-50 p-4 text-left text-base transition-all duration-150 ease-in-out sm:text-lg"
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
                                ))}
                            </div>
                        )} */} 

                        {liveSessionId && (
                            <div className="mt-8 w-full max-w-3xl mx-auto">
                                <div className="mb-4 flex items-center justify-between p-2 bg-slate-100 rounded-lg shadow">
                                    <div className="flex items-center">
                                        <TrendingUp className="mr-2 h-6 w-6 text-blue-500" />
                                        <h3 className="text-lg font-semibold text-slate-700">Live Responses</h3>
                                    </div>
                                    {isLoadingLiveResponses && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                                </div>

                                {isMCQType && (
                                    <div className="text-center mb-4">
                                        <p className="text-3xl sm:text-4xl font-bold text-slate-700 mb-4">
                                            Responses Received: {liveResponses?.length ?? 0}
                                        </p>
                                        <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 text-lg"
                                                >
                                                    <Award className="mr-2 h-5 w-5" /> Show Leaderboard
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="w-[80vw] max-w-7xl p-0">
                                                <DialogHeader className="bg-slate-800 text-white p-6 rounded-t-lg">
                                                    <DialogTitle className="text-2xl sm:text-3xl font-bold flex items-center">
                                                        <Award className="mr-3 h-8 w-8 text-yellow-400" /> Live Leaderboard
                                                    </DialogTitle>
                                                    {/* <DialogDescription className="text-slate-300">
                                                        See who's topping the charts!
                                                    </DialogDescription> */} 
                                                </DialogHeader>
                                                <div className="p-6 max-h-[70vh] overflow-y-auto">
                                                    {sortedLeaderboard.length > 0 ? (
                                                        <Table className="min-w-full divide-y divide-slate-200 table-fixed w-full">
                                                            <colgroup>
                                                                <col style={{ width: '15%' }} /> {/* Rank */}
                                                                <col style={{ width: '40%' }} /> {/* Participant */}
                                                                <col style={{ width: '20%' }} /> {/* Status */}
                                                                <col style={{ width: '25%' }} /> {/* Time */}
                                                            </colgroup>
                                                            <TableHeader className="bg-slate-100 sticky top-0">
                                                                <TableRow>
                                                                    <TableHead className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6">Rank</TableHead>
                                                                    <TableHead className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6">Participant</TableHead>
                                                                    <TableHead className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6">Status</TableHead>
                                                                    <TableHead className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6">Time</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody className="divide-y divide-slate-200 bg-white">
                                                                {sortedLeaderboard.map((res, idx) => (
                                                                    <TableRow key={res.username + idx} className={`transition-colors duration-300 ease-in-out ${idx === 0 ? 'bg-yellow-100 hover:bg-yellow-200' : (idx === 1 ? 'bg-slate-200 hover:bg-slate-300' : (idx === 2 ? 'bg-orange-100 hover:bg-orange-200' : 'hover:bg-slate-50')) }`}>
                                                                        <TableCell className="px-4 py-3 text-sm font-bold text-slate-800 sm:px-6 whitespace-nowrap">
                                                                            {idx === 0 ? <Award className="inline-block h-5 w-5 text-yellow-500 mr-2" /> : null}
                                                                            {idx + 1}
                                                                        </TableCell>
                                                                        <TableCell className="px-4 py-3 text-sm text-slate-700 font-medium sm:px-6 truncate" title={res.username}>{res.username}</TableCell>
                                                                        <TableCell className="px-4 py-3 text-sm sm:px-6 whitespace-nowrap">
                                                                            {res.is_correct ?
                                                                                <CheckCircle className="h-5 w-5 text-green-500 inline-block mr-1" /> :
                                                                                <XCircle className="h-5 w-5 text-red-500 inline-block mr-1" />}
                                                                            <span className={`font-semibold ${res.is_correct ? 'text-green-600' : 'text-red-600'}`}>{res.is_correct ? 'Correct' : 'Incorrect'}</span>
                                                                        </TableCell>
                                                                        <TableCell className="px-4 py-3 text-sm text-slate-600 sm:px-6 whitespace-nowrap">{formatResponseTime(res.time_to_response_millis)}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    ) : (
                                                        <div className="py-10 text-center text-sm text-slate-500">
                                                             No MCQ/MSQ responses yet for the leaderboard.
                                                        </div>
                                                    )}
                                                </div>
                                                <DialogFooter className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg">
                                                    <DialogClose asChild>
                                                        <Button variant="outline" className="w-full sm:w-auto">Close</Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}

                                {isTextResponseType && (
                                    <div className="mt-4 space-y-2 p-3 bg-white rounded-lg shadow">
                                        {liveResponses && liveResponses.length > 0 ? (
                                            liveResponses.filter(r => r.response_data.text_answer).map((res, idx) => (
                                                <div key={idx} className="p-2 border-b border-slate-100">
                                                    <span className="font-semibold text-slate-700 text-sm">{res.username}: </span>
                                                    <span className="text-slate-600 text-sm">{res.response_data.text_answer}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-sm text-slate-400 py-4">
                                                No text-based responses yet.
                                            </p>
                                        )}
                                        <p className="text-center text-xs text-slate-400 pt-4">(Word cloud display for text responses will be here)</p>
                                    </div>
                                )}

                                {(!liveResponses || liveResponses.length === 0) && !isLoadingLiveResponses && (
                                    <p className="text-center text-sm text-slate-400 py-6">
                                        Waiting for the first responses...
                                    </p>
                                    )}
                                </div>
                            )}

                        {questionType === SlideTypeEnum.Feedback && !liveSessionId && (
                            <div className="mx-auto mt-6 w-full max-w-2xl">
                                <p className="mb-4 text-lg italic text-slate-500 sm:text-xl">
                                    Your feedback is valuable!
                                </p>
                                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                    <p className="text-sm text-slate-400">(Feedback input area - visible to participants)</p>
                                    </div>
                            </div>
                        )}

                        {!displayData?.questionName && !isMCQType && !isTextResponseType && (
                            <p className="mt-8 italic text-slate-400">
                                This slide is awaiting content or is not a standard question type for live responses.
                            </p>
                        )}
                    </div>
                </ScrollArea>
            </div>
        );
    }

    // Editor Mode
    const currentOptions = watch('singleChoiceOptions') || [];
    const isMcqmMsqCurrent = watch('isMcqmMsq');

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
                            render={({ field }) => {
                                // Local state for immediate Quill updates for questionName
                                const [internalQuillValue, setInternalQuillValue] = useState(field.value || '');

                                // Debounce the call to react-hook-form's field.onChange
                                const debouncedFieldUpdate = useMemo(
                                    () =>
                                        debounce((newValue: string) => {
                                            field.onChange(newValue);
                                        }, 300), // 300ms debounce for this specific field
                                    [field.onChange] // field.onChange is stable from RHF
                                );

                                useEffect(() => {
                                    // Sync internal state if field.value changes from outside (e.g. form reset)
                                    // and it's different from internal state, to avoid feedback loops.
                                    if (field.value !== internalQuillValue) {
                                       setInternalQuillValue(field.value || '');
                                    }
                                }, [field.value]); // Only field.value

                                const handleQuillChange = (content: string) => {
                                    setInternalQuillValue(content); // Update local state immediately
                                    debouncedFieldUpdate(content); // Schedule debounced update to RHF
                                };
                                
                                // Cleanup debounced function on unmount
                                useEffect(() => () => debouncedFieldUpdate.cancel(), [debouncedFieldUpdate]);

                                return (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <MainViewQuillEditor
                                                value={internalQuillValue}
                                                onChange={handleQuillChange}
                                                placeholder="Type your question or prompt here..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                    </div>

                    {questionType === SlideTypeEnum.Quiz && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <FormLabel className="text-sm font-medium text-slate-700">
                                    Answer Options (Mark correct ones)
                            </FormLabel>
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="isMcqmMsqToggle" className="text-xs text-slate-600">
                                        Allow Multiple Correct Answers (MSQ/MCQM)
                                    </label>
                                    <Checkbox
                                        id="isMcqmMsqToggle"
                                        checked={!!isMcqmMsqCurrent}
                                        onCheckedChange={handleMcqmMsqToggle}
                                        className="size-4 rounded border-slate-400 focus-visible:ring-orange-400 data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500"
                                    />
                                </div>
                            </div>
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
                                                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                                            className="text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="mt-0.5 h-7 w-7 shrink-0 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500"
                                            onClick={() => {
                                                const updated = [...currentOptions];
                                                updated.splice(idx, 1);
                                                setValue('singleChoiceOptions', updated, { shouldDirty: true });
                                            }}
                                            title="Remove option"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-dashed border-orange-400 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                                onClick={() => {
                                    const newOption = { id: `new_${Date.now()}` , name: '', isSelected: false };
                                    setValue('singleChoiceOptions', [...currentOptions, newOption], { shouldDirty: true });
                                }}
                            >
                                Add Option
                            </Button>
                        </div>
                    )}

                    {questionType === SlideTypeEnum.Feedback && (
                        <div>
                            <FormLabel className="mb-1.5 block text-sm font-medium text-slate-700">
                                Feedback Prompt (Optional - if different from title)
                            </FormLabel>
                            <FormField
                                control={control}
                                name="feedbackAnswer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MainViewQuillEditor
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                placeholder="e.g., What are your thoughts on...? or leave blank if title is sufficient"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <p className="mt-2 text-xs text-slate-500">
                                This text can guide users on the type of feedback you are looking for.
                                Participants will provide their responses during the live session.
                            </p>
                        </div>
                    )}
                </form>
            </Form>
        </ScrollArea>
    );
};
