import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { MainViewQuillEditor } from "@/components/quill/MainViewQuillEditor";
import { formatStructure } from "@/routes/assessment/question-papers/-utils/helper";
import { SlideType } from "../constant/slideType";
export const QuizeSlide = ({
  formdata,
  questionType,
  className,
}: {
  formdata: any;
  questionType:SlideType;
  className?: string;
}) => {
  const [currentQuestionIndex] = useState(0);

  const form = useForm({
    defaultValues: {
      questions: [formdata],
      answersType: "Answer:",
      optionsType: "",
      questionsType: "",
    },
  });

  const { control, getValues, setValue } = form;
  const allQuestions = getValues("questions");
  const option1 = getValues(`questions.${currentQuestionIndex}.singleChoiceOptions.0`);
  const option2 = getValues(`questions.${currentQuestionIndex}.singleChoiceOptions.1`);
  const option3 = getValues(`questions.${currentQuestionIndex}.singleChoiceOptions.2`);
  const option4 = getValues(`questions.${currentQuestionIndex}.singleChoiceOptions.3`);
  const optionsType = getValues("optionsType");
  const answersType = getValues("answersType");

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
  };

  if (allQuestions.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1>Please add a question to show question details</h1>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className={`bg-white p-8 ${className}`}>
        {/* Question */}
        <div className="flex w-full flex-col !flex-nowrap items-start gap-1 mt-4">
          <span>Question</span>
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
        </div>

        {questionType === SlideType.Quiz && (
          <>
            {/* Options */}
            <span className="mt-6">{answersType}</span>
            <div className="flex w-full grow flex-wrap gap-8 mt-2">
              {[option1, option2, option3, option4].map((opt, idx) => (
                <div
                  key={idx}
                  className={`flex w-2/5 items-center justify-between gap-4 rounded-md bg-neutral-100 p-4 ${
                    opt?.isSelected
                      ? "border border-primary-300 bg-primary-50"
                      : ""
                  }`}
                >
                  <div className="flex w-full items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-white px-3">
                      <span className="!p-0 text-sm">
                        {optionsType
                          ? formatStructure(optionsType, String.fromCharCode(97 + idx))
                          : `(${String.fromCharCode(97 + idx)}.)`}
                      </span>
                    </div>
                    <FormField
                      control={control}
                      name={`questions.${currentQuestionIndex}.singleChoiceOptions.${idx}.name`}
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
                      name={`questions.${currentQuestionIndex}.singleChoiceOptions.${idx}.isSelected`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={() => handleOptionChange(idx)}
                              className={`mt-1 size-5 rounded-xl border-2 shadow-none ${
                                field.value
                                  ? "border-none bg-green-500 text-white"
                                  : ""
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
              name={`questions.${currentQuestionIndex}.feedbackAnswer`}
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
