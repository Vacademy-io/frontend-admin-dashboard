/* eslint-disable */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { MainViewQuillEditor } from '@/components/quill/MainViewQuillEditor';
import { formatStructure } from '@/routes/assessment/question-papers/-utils/helper';
import { SlideType } from '../constant/slideType';
import { useSlideStore } from '@/stores/Slides/useSlideStore';

export const QuizeSlide = ({
    formdata,
    questionType,
    className,
    currentSlideId,
    isPresentationMode = false,
}: {
    formdata: any;
    questionType: SlideType;
    className?: string;
    currentSlideId: string;
    isPresentationMode?: boolean;
}) => {
    const { updateQuizeSlide } = useSlideStore();

    const form = useForm({
        defaultValues: formdata,
    });

    const { control, getValues, setValue, watch } = form;
    const options = getValues('singleChoiceOptions') ?? [];
    const optionsType = '';
    const answersType = 'Answers:';

    const formValues = form.getValues();
    const questionName = watch('questionName');
    const singleChoiceOptions = watch('singleChoiceOptions');
    const feedbackAnswer = watch('feedbackAnswer');

    useEffect(() => {
        updateQuizeSlide(currentSlideId, formValues);
    }, [questionName, singleChoiceOptions, feedbackAnswer, currentSlideId]);
    const handleOptionChange = (optionIndex: number) => {
        const isCurrentlySelected = getValues(`singleChoiceOptions.${optionIndex}.isSelected`);

        const updatedOptions = options.map((option: any, index: number) => ({
            ...option,
            isSelected: index === optionIndex ? !isCurrentlySelected : false,
        }));

        setValue('singleChoiceOptions', updatedOptions, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    if (isPresentationMode) {
        // This 'className' is passed from PresentationView, potentially including flex-grow
        // Add more specific styling for presentation view
        return (
            <div
                className={`${className} flex h-full w-full flex-col items-center justify-center overflow-auto p-6 text-center text-slate-800`}
                style={{ boxSizing: 'border-box' }} // Ensures padding is within width/height
            >
                {formdata?.questionName && (
                    <h2
                        className="mb-8 text-3xl font-bold" // Increased size and margin
                        dangerouslySetInnerHTML={{ __html: formdata.questionName }}
                    />
                )}
                {formdata?.questionText && <p className="mb-6 text-xl">{formdata.questionText}</p>}

                {questionType === SlideType.Quiz &&
                    formdata?.singleChoiceOptions &&
                    Array.isArray(formdata.singleChoiceOptions) && (
                        <div className="w-full max-w-lg space-y-4">
                            {' '}
                            {/* Options container */}
                            {formdata.singleChoiceOptions.map((option: any, index: number) => (
                                <div
                                    key={index}
                                    className="rounded-lg border border-gray-300 bg-gray-50 p-4 text-left text-lg transition-colors hover:bg-gray-100"
                                    // You might add onClick handlers here later for interactive quizzes
                                >
                                    <span className="mr-2 font-semibold">
                                        {String.fromCharCode(65 + index)}.
                                    </span>{' '}
                                    {/* A, B, C... */}
                                    {/* Assuming option.name contains the text/HTML for the option */}
                                    <span dangerouslySetInnerHTML={{ __html: option.name }} />
                                    {/* Optionally show if it's correct/selected - for review mode, not initial presentation
                 {option.isSelected && <span className="ml-2 text-green-600 font-bold">(Correct Answer)</span>}
                */}
                                </div>
                            ))}
                        </div>
                    )}

                {questionType === SlideType.Feedback && (
                    <div className="mt-6 w-full max-w-lg">
                        <p className="mb-4 text-xl italic text-gray-600">Feedback</p>
                        {/* For presentation, you might just show a prompt or the collected feedback later */}
                        {formdata?.feedbackAnswer ? (
                            <div className="rounded-lg border bg-blue-50 p-4 text-left">
                                <p
                                    className="text-lg"
                                    dangerouslySetInnerHTML={{ __html: formdata.feedbackAnswer }}
                                />
                            </div>
                        ) : (
                            <p className="text-gray-500">
                                (Space for feedback submission or display)
                            </p>
                        )}
                    </div>
                )}

                {/* Fallback if no specific content is available for the slide type/data */}
                {!(
                    formdata?.questionName ||
                    formdata?.questionText ||
                    (questionType === SlideType.Quiz && formdata?.singleChoiceOptions?.length > 0)
                ) &&
                    !(questionType === SlideType.Feedback && formdata?.feedbackAnswer) && (
                        <p className="mt-8 italic text-gray-400">This slide is awaiting content.</p>
                    )}
            </div>
        );
    }

    return (
        <Form {...form}>
            <form className={`bg-white p-8 ${className}`}>
                {/* Question */}
                <div className="mt-4 flex w-full flex-col !flex-nowrap items-start gap-1">
                    <span>Question</span>
                    <FormField
                        control={control}
                        name="questionName"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <MainViewQuillEditor
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {questionType === SlideType.Quiz && (
                    <>
                        {/* Options */}
                        <span className="mt-6">{answersType}</span>
                        <div className="mt-2 flex w-full grow flex-wrap gap-8">
                            {options.map((opt: any, idx: number) => (
                                <div
                                    key={idx}
                                    className={`flex w-2/5 items-center justify-between gap-4 rounded-md bg-neutral-100 p-4 ${
                                        opt?.isSelected
                                            ? 'border border-primary-300 bg-primary-50'
                                            : ''
                                    }`}
                                >
                                    <div className="flex w-full items-center gap-4">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-white px-3">
                                            <span className="!p-0 text-sm">
                                                {optionsType
                                                    ? formatStructure(
                                                          optionsType,
                                                          String.fromCharCode(97 + idx)
                                                      )
                                                    : `(${String.fromCharCode(97 + idx)}.)`}
                                            </span>
                                        </div>
                                        <FormField
                                            control={control}
                                            name={`singleChoiceOptions.${idx}.name`}
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <MainViewQuillEditor
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="flex size-10 items-center justify-center rounded-full bg-white px-4">
                                        <FormField
                                            control={control}
                                            name={`singleChoiceOptions.${idx}.isSelected`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={() =>
                                                                handleOptionChange(idx)
                                                            }
                                                            className={`mt-1 size-5 rounded-xl border-2 shadow-none ${
                                                                field.value
                                                                    ? 'border-none bg-green-500 text-white'
                                                                    : ''
                                                            }`}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {questionType === SlideType.Feedback && (
                    <div className="mt-6 w-full">
                        <FormField
                            control={control}
                            name="feedbackAnswer"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <MainViewQuillEditor
                                            value={field.value}
                                            onChange={field.onChange}
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
    );
};
