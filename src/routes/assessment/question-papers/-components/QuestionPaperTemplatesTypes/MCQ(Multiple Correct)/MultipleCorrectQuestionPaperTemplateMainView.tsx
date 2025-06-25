import { useEffect } from 'react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Sliders, X } from 'phosphor-react';
import { Checkbox } from '@/components/ui/checkbox';
import 'react-quill/dist/quill.snow.css';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PopoverClose } from '@radix-ui/react-popover';
import SelectField from '@/components/design-system/select-field';
import CustomInput from '@/components/design-system/custom-input';
import { MainViewQuillEditor } from '@/components/quill/MainViewQuillEditor';
import { QuestionPaperTemplateFormProps } from '../../../-utils/question-paper-template-form';
import { formatStructure } from '../../../-utils/helper';
import { QUESTION_TYPES } from '@/constants/dummy-data';
import { Badge } from '@/components/ui/badge';

export const MultipleCorrectQuestionPaperTemplateMainView = ({
    form,
    currentQuestionIndex,
    className,
}: QuestionPaperTemplateFormProps) => {
    const { control, getValues } = form;

    useEffect(() => {
        const reattempt = form.getValues(`questions.${currentQuestionIndex}.reattemptCount`);
        if (reattempt === undefined) {
            form.setValue(`questions.${currentQuestionIndex}.reattemptCount`, 0);
        }
    }, []);

    const answersType = getValues('answersType') || 'Answer:';
    const explanationsType = getValues('explanationsType') || 'Explanation:';
    const optionsType = getValues('optionsType') || '';
    const questionsType = getValues('questionsType') || '';
    const allQuestions = getValues('questions') || [];

    const option1 = getValues(`questions.${currentQuestionIndex}.multipleChoiceOptions.${0}`);
    const option2 = getValues(`questions.${currentQuestionIndex}.multipleChoiceOptions.${1}`);
    const option3 = getValues(`questions.${currentQuestionIndex}.multipleChoiceOptions.${2}`);
    const option4 = getValues(`questions.${currentQuestionIndex}.multipleChoiceOptions.${3}`);

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

                            <CustomInput
                                control={form.control}
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

            <div className="flex w-full grow flex-col gap-4">
                <span className="-mb-3">{answersType}</span>
                {[option1, option2, option3, option4].map((option, i) => (
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
                                        ? formatStructure(optionsType, String.fromCharCode(97 + i))
                                        : `(${String.fromCharCode(97 + i)}.)`}
                                </span>
                            </div>
                            <FormField
                                control={control}
                                name={`questions.${currentQuestionIndex}.multipleChoiceOptions.${i}.name`}
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
                                name={`questions.${currentQuestionIndex}.multipleChoiceOptions.${i}.isSelected`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={() => {
                                                    field.onChange(!field.value);
                                                    form.trigger(
                                                        `questions.${currentQuestionIndex}.multipleChoiceOptions`
                                                    );
                                                }}
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
                ))}
            </div>

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
        </div>
    );
};
