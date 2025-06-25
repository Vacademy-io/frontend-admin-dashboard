<<<<<<< HEAD
'use client';

=======
>>>>>>> 46a334276a0f4020e9f8aaf6e434888ef81d9e29
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Sliders, X } from 'phosphor-react';
import { Checkbox } from '@/components/ui/checkbox';
import 'react-quill/dist/quill.snow.css';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PopoverClose } from '@radix-ui/react-popover';
import SelectField from '@/components/design-system/select-field';
import { MainViewQuillEditor } from '@/components/quill/MainViewQuillEditor';
import { QuestionPaperTemplateFormProps } from '../../../-utils/question-paper-template-form';
import { formatStructure } from '../../../-utils/helper';
import { QUESTION_TYPES } from '@/constants/dummy-data';
import { PPTViewQuillEditor } from '@/components/quill/PPTViewQuillEditor';
import { Badge } from '@/components/ui/badge';

export const ComprehensiveMultipleCorrectQuestionPaperTemplateMainView = ({
    form,
    currentQuestionIndex,
    className,
}: QuestionPaperTemplateFormProps) => {
    const { control, getValues } = form;

    const answersType = getValues('answersType') || 'Answer:';
    const explanationsType = getValues('explanationsType') || 'Explanation:';
    const optionsType = getValues('optionsType') || '';
    const questionsType = getValues('questionsType') || '';

    const allQuestions = getValues('questions') || [];

    const option1 = getValues(`questions.${currentQuestionIndex}.cmultipleChoiceOptions.${0}`);
    const option2 = getValues(`questions.${currentQuestionIndex}.cmultipleChoiceOptions.${1}`);
    const option3 = getValues(`questions.${currentQuestionIndex}.cmultipleChoiceOptions.${2}`);
    const option4 = getValues(`questions.${currentQuestionIndex}.cmultipleChoiceOptions.${3}`);
    const tags = getValues(`questions.${currentQuestionIndex}.tags`) || [];
    const level = getValues(`questions.${currentQuestionIndex}.level`) || '';

    if (allQuestions.length === 0) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <h1>Please add a question to show question details</h1>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="-mb-8 flex justify-end">
                <Popover>
                    <PopoverTrigger>
                        <Button variant="outline" type="button" className="cursor-pointer px-3">
                            <Sliders size={32} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <div className="mb-2 flex flex-col gap-4">
                            <div className="flex w-full items-center justify-between">
                                <h1 className="text-primary-500">Questions Settings</h1>
                                <PopoverClose>
                                    <X size={16} />
                                </PopoverClose>
                            </div>
                            <SelectField
                                label="Question Type"
                                name={`questions.${currentQuestionIndex}.questionType`}
                                options={QUESTION_TYPES.map((option, index) => ({
                                    value: option.code,
                                    label: option.display,
                                    _id: index,
                                }))}
                                control={form.control}
                                className="!w-full"
                                required
                            />
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Comprehension Text */}
            <div className="flex w-full flex-col !flex-nowrap items-start gap-1">
                <span>Comprehension Text</span>
                <FormField
                    control={control}
                    name={`questions.${currentQuestionIndex}.parentRichTextContent`}
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

            {/* Question */}
            <div className="flex w-full flex-col !flex-nowrap items-start gap-1">
                <div className="flex items-center gap-2">
                    <span>
                        Question&nbsp;
                        {questionsType
                            ? formatStructure(questionsType, currentQuestionIndex + 1)
                            : currentQuestionIndex + 1}
                    </span>
                    <Badge variant="outline">{level}</Badge>
                </div>
                <FormField
                    control={control}
                    name={`questions.${currentQuestionIndex}.questionName`}
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormControl>
                                <PPTViewQuillEditor value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="mt-2 flex items-center gap-2">
                    {tags?.map((tag, idx) => (
                        <Badge variant="outline" key={idx}>
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Options (Answer Choices) */}
            <div className="flex w-full grow flex-col gap-4">
                <span className="-mb-3">{answersType}</span>

                {[option1, option2, option3, option4].map((opt, i) => {
                    const letter = ['a', 'b', 'c', 'd'][i];
                    return (
                        <div className="flex gap-4" key={i}>
                            <div
                                className={`flex w-full items-center justify-between gap-4 rounded-md bg-neutral-100 p-4 ${
                                    opt?.isSelected ? 'border border-primary-300 bg-primary-50' : ''
                                }`}
                            >
                                <div className="flex w-full items-center gap-4">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-white px-3">
                                        <span className="!p-0 text-sm">
                                            {optionsType
<<<<<<< HEAD
                                                ? formatStructure(optionsType, letter!)
=======
                                                ? formatStructure(optionsType, letter)
>>>>>>> 46a334276a0f4020e9f8aaf6e434888ef81d9e29
                                                : `(${letter}.)`}
                                        </span>
                                    </div>
                                    <FormField
                                        control={control}
                                        name={`questions.${currentQuestionIndex}.cmultipleChoiceOptions.${i}.name`}
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
                                        name={`questions.${currentQuestionIndex}.cmultipleChoiceOptions.${i}.isSelected`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className={`mt-1 size-5 border-2 shadow-none ${
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
                        </div>
                    );
                })}
            </div>

            {/* Explanation */}
            <div className="flex w-full flex-col !flex-nowrap items-start gap-1">
                <span>{explanationsType}</span>
                <FormField
                    control={control}
                    name={`questions.${currentQuestionIndex}.explanation`}
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

            {/* ✅ Reattempt Count */}
            <div className="flex w-full flex-col !flex-nowrap items-start gap-1">
                <span>Reattempt Count</span>
                <FormField
                    control={control}
                    name={`questions.${currentQuestionIndex}.reattemptCount`}
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormControl>
                                <input
                                    type="number"
                                    min={0}
                                    className="focus:border-primary w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder="Enter reattempt count"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};
