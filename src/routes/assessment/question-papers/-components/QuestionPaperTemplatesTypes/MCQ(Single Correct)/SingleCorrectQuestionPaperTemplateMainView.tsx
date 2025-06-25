'use client';

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
import { Badge } from '@/components/ui/badge';
import { MyInput } from '@/components/design-system/input';

export const SingleCorrectQuestionPaperTemplateMainView = ({
    form,
    currentQuestionIndex,
    className,
}: QuestionPaperTemplateFormProps) => {
    const { control, getValues, setValue } = form;

    const answersType = getValues('answersType') || 'Answer:';
    const explanationsType = getValues('explanationsType') || 'Explanation:';
    const optionsType = getValues('optionsType') || '';
    const questionsType = getValues('questionsType') || '';
    const allQuestions = getValues('questions') || [];
    const tags = getValues(`questions.${currentQuestionIndex}.tags`) || [];
    const level = getValues(`questions.${currentQuestionIndex}.level`) || '';

    const option1 = getValues(`questions.${currentQuestionIndex}.singleChoiceOptions.0`);
    const option2 = getValues(`questions.${currentQuestionIndex}.singleChoiceOptions.1`);
    const option3 = getValues(`questions.${currentQuestionIndex}.singleChoiceOptions.2`);
    const option4 = getValues(`questions.${currentQuestionIndex}.singleChoiceOptions.3`);

    const handleOptionChange = (optionIndex: number) => {
        const options = [0, 1, 2, 3];
        const isCurrentlySelected = getValues(
            `questions.${currentQuestionIndex}.singleChoiceOptions.${optionIndex}.isSelected`
        );

        options.forEach((option) => {
            setValue(
                `questions.${currentQuestionIndex}.singleChoiceOptions.${option}.isSelected`,
                option === optionIndex ? !isCurrentlySelected : false,
                { shouldDirty: true, shouldValidate: true }
            );
        });
        form.trigger(`questions.${currentQuestionIndex}.singleChoiceOptions`);
    };

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

                            {/* Question Type */}
                            <SelectField
                                label="Question Type"
                                name={`questions.${currentQuestionIndex}.questionType`}
                                options={QUESTION_TYPES.map((option, index) => ({
                                    value: option.code,
                                    label: option.display,
                                    _id: index,
                                }))}
                                control={control}
                                className="!w-full"
                                required
                            />

                            {/* Reattempt Count */}
                            <FormField
                                control={control}
                                name={`questions.${currentQuestionIndex}.reattemptCount`}
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <label className="text-sm font-medium">
                                            Reattempt Count
                                        </label>
                                        <FormControl>
                                            <MyInput
                                                input={
                                                    field.value !== undefined
                                                        ? String(field.value)
                                                        : ''
                                                }
                                                inputType="number"
                                                min={0}
                                                onChangeFunction={(e) => {
                                                    const val = e.target.value;
                                                    field.onChange(
                                                        val === '' ? '' : Math.max(0, parseInt(val))
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {getValues(`questions.${currentQuestionIndex}.parentRichTextContent`) && (
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
            )}

            {/* Question Text */}
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
                                <MainViewQuillEditor
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="mt-2 flex items-center gap-2">
                    {tags.map((tag, idx) => (
                        <Badge variant="outline" key={idx}>
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Options */}
            <div className="flex w-full grow flex-col gap-4">
                <span className="-mb-3">{answersType}</span>
                {[option1, option2, option3, option4].map((option, i) => {
                    const label = ['a', 'b', 'c', 'd'][i];
                    return (
                        <div
                            key={i}
                            className={`flex w-full items-center justify-between gap-4 rounded-md bg-neutral-100 p-4 ${
                                option?.isSelected ? 'border border-primary-300 bg-primary-50' : ''
                            }`}
                        >
                            <div className="flex w-full items-center gap-4">
                                <div className="flex size-10 items-center justify-center rounded-full bg-white px-3">
                                    <span className="!p-0 text-sm">
                                        {optionsType
                                            ? formatStructure(optionsType, label)
                                            : `(${label}.)`}
                                    </span>
                                </div>
                                <FormField
                                    control={control}
                                    name={`questions.${currentQuestionIndex}.singleChoiceOptions.${i}.name`}
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
                                    name={`questions.${currentQuestionIndex}.singleChoiceOptions.${i}.isSelected`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={() => handleOptionChange(i)}
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
                    );
                })}
            </div>

            {/* Explanation */}
            <div className="mb-6 flex w-full flex-col !flex-nowrap items-start gap-1">
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
        </div>
    );
};
