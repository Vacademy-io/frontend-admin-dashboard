import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Sliders, X, Plus } from 'phosphor-react';
import { Checkbox } from '@/components/ui/checkbox';
import 'react-quill/dist/quill.snow.css';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PopoverClose } from '@radix-ui/react-popover';
import SelectField from '@/components/design-system/select-field';
import CustomInput from '@/components/design-system/custom-input';
import { MainViewQuillEditor } from '@/components/quill/MainViewQuillEditor';
import { QuestionPaperTemplateFormProps } from '../../../-utils/question-paper-template-form';
import { formatStructure } from '../../../-utils/helper';
import { QUESTION_TYPES, NUMERIC_TYPES } from '@/constants/dummy-data';
import { MyInput } from '@/components/design-system/input';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

export const ComprehensiveNumericQuestionPaperTemplateMainView = ({
    form,
    currentQuestionIndex,
    className,
}: QuestionPaperTemplateFormProps) => {
    const [isMultipleAnswersAllowed, setIsMultipleAnswersAllowed] = useState(false);
    const { control, getValues, trigger, watch, setValue } = form;

    const numericType = watch(`questions.${currentQuestionIndex}.numericType`);
    const validAnswers = watch(`questions.${currentQuestionIndex}.validAnswers`);
    const reattemptCount = watch(`questions.${currentQuestionIndex}.reattemptCount`);

    useEffect(() => {
        if (validAnswers && validAnswers.length > 1) setIsMultipleAnswersAllowed(true);
    }, []);

    useEffect(() => {
        trigger(`questions.${currentQuestionIndex}.validAnswers`);
    }, [numericType, currentQuestionIndex, trigger]);

    useEffect(() => {
        const validAnswrs = getValues(`questions.${currentQuestionIndex}.validAnswers`);
        if (!validAnswrs) {
            setValue(`questions.${currentQuestionIndex}.validAnswers`, [0]);
        }
        const reattempt = getValues(`questions.${currentQuestionIndex}.reattemptCount`);
        if (reattempt === undefined) {
            setValue(`questions.${currentQuestionIndex}.reattemptCount`, 0);
        }
    }, []);

    const answersType = getValues('answersType') || 'Answer:';
    const explanationsType = getValues('explanationsType') || 'Explanation:';
    const questionsType = getValues('questionsType') || '';
    const allQuestions = getValues('questions') || [];
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
                                control={control}
                                className="!w-full"
                                required
                            />
                            <SelectField
                                label="Numerical Type"
                                name={`questions.${currentQuestionIndex}.numericType`}
                                options={NUMERIC_TYPES.map((option, index) => ({
                                    value: option,
                                    label: option,
                                    _id: index,
                                }))}
                                control={control}
                                className="!w-full"
                                required
                            />
                            <CustomInput
                                control={control}
                                name={`questions.${currentQuestionIndex}.decimals`}
                                label="Decimal Precision"
                                required
                            />
                            <CustomInput
                                control={control}
                                name={`questions.${currentQuestionIndex}.reattemptCount`}
                                label="Reattempt Count"
                                type="number"
                                min={0}
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

            {/* Question Name */}
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
                    {tags?.map((tag, idx) => (
                        <Badge variant="outline" key={idx}>
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Valid Answers */}
            <div className="flex w-full flex-col gap-4">
                <FormField
                    control={control}
                    name={`questions.${currentQuestionIndex}.validAnswers`}
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormControl>
                                <div className="flex flex-row justify-between">
                                    <div>{answersType}</div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Checkbox
                                            checked={isMultipleAnswersAllowed}
                                            onCheckedChange={(checked) => {
                                                setIsMultipleAnswersAllowed(!!checked);
                                                if (!checked) {
                                                    form.setValue(
                                                        `questions.${currentQuestionIndex}.validAnswers`,
                                                        field.value ? [field.value[0] || 0] : [0]
                                                    );
                                                }
                                            }}
                                        />
                                        <div>Contains Multiple Answers</div>
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={`questions.${currentQuestionIndex}.validAnswers`}
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormControl>
                                <div className="flex flex-row flex-wrap items-center gap-4">
                                    {Array.isArray(field.value) &&
                                        field.value.map((answer, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <MyInput
                                                    input={answer.toString()}
                                                    onChangeFunction={(e) => {
                                                        const updatedAnswers = [
                                                            ...(field.value ?? []),
                                                        ];
                                                        updatedAnswers[index] =
                                                            parseFloat(e.target.value) || 0;
                                                        field.onChange(updatedAnswers);
                                                    }}
                                                    inputType="number"
                                                />
                                                {isMultipleAnswersAllowed && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            field.onChange(
                                                                field.value?.filter(
                                                                    (_, i) => i !== index
                                                                )
                                                            );
                                                        }}
                                                    >
                                                        <X />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    {isMultipleAnswersAllowed && (
                                        <Button
                                            variant="outline"
                                            type="button"
                                            className="cursor-pointer"
                                            onClick={() => {
                                                field.onChange([...(field.value || []), 0]);
                                            }}
                                        >
                                            <Plus size={20} />
                                        </Button>
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
