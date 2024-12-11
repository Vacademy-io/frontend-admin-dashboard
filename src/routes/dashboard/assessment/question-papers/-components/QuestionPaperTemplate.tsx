import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { DotsSixVertical, PencilSimpleLine } from "phosphor-react";
import { useEffect, useState } from "react";
import {
    FieldErrors,
    FormProvider,
    SubmitErrorHandler,
    useFieldArray,
    useForm,
} from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { questionFormSchema } from "../-utils/question-form-schema";
import { Separator } from "@/components/ui/separator";
import { SSDCLogo } from "@/svgs";
import { Sortable, SortableDragHandle, SortableItem } from "@/components/ui/sortable";
import { useQuestionStore } from "../-global-states/question-index";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FormValues } from "@/types/error-form-values";
import { PPTComponentFactory } from "./QuestionPaperTemplatesTypes/PPTComponentFactory";
import { MainViewComponentFactory } from "./QuestionPaperTemplatesTypes/MainViewComponentFactory";
import { QuestionPaperTemplateProps } from "@/types/question-paper-template";

export function QuestionPaperTemplate({ questionPaperUploadForm }: QuestionPaperTemplateProps) {
    const { getValues: getQuestionPaperUploadForm } = questionPaperUploadForm;
    const title = getQuestionPaperUploadForm("title") || "";
    const [isHeaderEditable, setIsHeaderEditable] = useState(false); // State to toggle edit mode
    const { currentQuestionIndex, setCurrentQuestionIndex } = useQuestionStore();

    const form = useForm<z.infer<typeof questionFormSchema>>({
        resolver: zodResolver(questionFormSchema),
        defaultValues: {
            title: `${title}`,
            questions: [
                {
                    questionId: "",
                    questionName: "",
                    explanation: "",
                    questionType: "MCQ (Single Correct)",
                    questionMark: "",
                    imageDetails: [],
                    singleChoiceOptions: [
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                    ],
                    multipleChoiceOptions: [
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                    ],
                    booleanOptions: [
                        {
                            isSelected: false,
                        },
                        {
                            isSelected: false,
                        },
                    ],
                },
            ],
        },
        mode: "onChange",
    });

    const { control, getValues, setValue, formState, watch } = form;
    watch(`questions.${currentQuestionIndex}`);
    watch(`questions.${currentQuestionIndex}`);
    watch(`questions.${currentQuestionIndex}`);
    watch(`questions.${currentQuestionIndex}`);
    watch(`questions.${currentQuestionIndex}.questionType`);

    function onSubmit(values: z.infer<typeof questionFormSchema>) {
        console.log("Submitted Values:", values);
    }

    // UseFieldArray to manage questions array
    const { fields, append, move } = useFieldArray({
        control: form.control,
        name: "questions", // Name of the field array
    });

    // Function to handle adding a new question
    const handleAddNewQuestion = () => {
        append({
            questionId: "",
            questionName: "",
            explanation: "",
            questionType: "MCQ (Single Correct)",
            questionMark: "",
            imageDetails: [],
            singleChoiceOptions: [
                {
                    name: "",
                    isSelected: false,
                    image: {
                        imageId: "",
                        imageName: "",
                        imageTitle: "",
                        imageFile: "",
                        isDeleted: false,
                    },
                },
                {
                    name: "",
                    isSelected: false,
                    image: {
                        imageId: "",
                        imageName: "",
                        imageTitle: "",
                        imageFile: "",
                        isDeleted: false,
                    },
                },
                {
                    name: "",
                    isSelected: false,
                    image: {
                        imageId: "",
                        imageName: "",
                        imageTitle: "",
                        imageFile: "",
                        isDeleted: false,
                    },
                },
                {
                    name: "",
                    isSelected: false,
                    image: {
                        imageId: "",
                        imageName: "",
                        imageTitle: "",
                        imageFile: "",
                        isDeleted: false,
                    },
                },
            ],
            multipleChoiceOptions: [
                {
                    name: "",
                    isSelected: false,
                    image: {
                        imageId: "",
                        imageName: "",
                        imageTitle: "",
                        imageFile: "",
                        isDeleted: false,
                    },
                },
                {
                    name: "",
                    isSelected: false,
                    image: {
                        imageId: "",
                        imageName: "",
                        imageTitle: "",
                        imageFile: "",
                        isDeleted: false,
                    },
                },
                {
                    name: "",
                    isSelected: false,
                    image: {
                        imageId: "",
                        imageName: "",
                        imageTitle: "",
                        imageFile: "",
                        isDeleted: false,
                    },
                },
                {
                    name: "",
                    isSelected: false,
                    image: {
                        imageId: "",
                        imageName: "",
                        imageTitle: "",
                        imageFile: "",
                        isDeleted: false,
                    },
                },
            ],
            booleanOptions: [
                {
                    isSelected: false,
                },
                {
                    isSelected: false,
                },
            ],
        });
        setCurrentQuestionIndex(fields.length);
    };

    // Function to handle page navigation by question number
    const handlePageClick = (pageIndex: number) => {
        setCurrentQuestionIndex(pageIndex);
    };

    useEffect(() => {
        setValue(
            `questions.${currentQuestionIndex}`,
            getValues(`questions.${currentQuestionIndex}`),
        );
    }, [currentQuestionIndex]);

    useEffect(() => {
        form.reset({
            title: title,
            questions: [
                {
                    questionId: "",
                    questionName: "",
                    explanation: "",
                    questionType: "MCQ (Single Correct)",
                    questionMark: "",
                    imageDetails: [],
                    singleChoiceOptions: [
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                    ],
                    multipleChoiceOptions: [
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                        {
                            name: "",
                            isSelected: false,
                            image: {
                                imageId: "",
                                imageName: "",
                                imageTitle: "",
                                imageFile: "",
                                isDeleted: false,
                            },
                        },
                    ],
                    booleanOptions: [
                        {
                            isSelected: false,
                        },
                        {
                            isSelected: false,
                        },
                    ],
                },
            ],
        });
    }, [title, form]);

    const onError: SubmitErrorHandler<FormValues> = (errors: FieldErrors<FormValues>) => {
        const message =
            errors.questions?.questions?.[currentQuestionIndex]?.message ?? "An error occurred";
        toast(message);
        if (errors.questions?.questions?.[currentQuestionIndex]?.option1) {
            toast(errors.questions?.questions?.[currentQuestionIndex]?.option1?.message);
        }
        if (errors.questions?.questions?.[currentQuestionIndex]?.option2) {
            toast(errors.questions?.questions?.[currentQuestionIndex]?.option2?.message);
        }
        if (errors.questions?.questions?.[currentQuestionIndex]?.option3) {
            toast(errors.questions?.questions?.[currentQuestionIndex]?.option3?.message);
        }
        if (errors.questions?.questions?.[currentQuestionIndex]?.option4) {
            toast(errors.questions?.questions?.[currentQuestionIndex]?.option4?.message);
        }
    };

    return (
        <Dialog>
            <DialogTrigger>
                <Button type="button" variant="outline" className="w-52 border-2">
                    Preview
                </Button>
            </DialogTrigger>
            <DialogContent className="no-scrollbar h-full !w-full !max-w-full overflow-y-auto !rounded-none p-0 [&>button]:hidden">
                <FormProvider {...form}>
                    <form
                        className="flex w-full flex-col"
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.handleSubmit(onSubmit, onError)(e);
                        }}
                    >
                        <Toaster />
                        <div className="flex items-center justify-between bg-primary-100 p-2">
                            <div className="flex items-start gap-2">
                                <SSDCLogo />
                                <FormField
                                    control={control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    className="rounded-none border-none p-0 !text-[1.2rem] shadow-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                    placeholder="Untitled"
                                                    disabled={!isHeaderEditable}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    variant="outline"
                                    className="border-none bg-transparent shadow-none hover:bg-transparent"
                                    type="button"
                                    onClick={() => setIsHeaderEditable(!isHeaderEditable)}
                                >
                                    <PencilSimpleLine size={16} />
                                </Button>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-44 bg-transparent shadow-none hover:bg-transparent"
                                >
                                    Save
                                </Button>
                                <DialogClose>
                                    <Button
                                        variant="outline"
                                        className="w-44 bg-transparent shadow-none hover:bg-transparent"
                                    >
                                        Exit
                                    </Button>
                                </DialogClose>
                            </div>
                        </div>
                        <div className="flex items-start gap-12">
                            <div className="flex w-24 flex-col items-start justify-between gap-4 p-2">
                                <Button
                                    type="button"
                                    className="ml-3 bg-primary-500 text-xs text-white shadow-none"
                                    onClick={handleAddNewQuestion}
                                >
                                    Add Question
                                </Button>
                                <Sortable
                                    value={fields}
                                    onMove={({ activeIndex, overIndex }) =>
                                        move(activeIndex, overIndex)
                                    }
                                >
                                    <div className="flex flex-col gap-2">
                                        {fields.map((field, index) => {
                                            // Check if the current question has an error
                                            const hasError = formState.errors?.questions?.[index];
                                            return (
                                                <SortableItem
                                                    key={field.id}
                                                    value={field.id}
                                                    asChild
                                                >
                                                    <div
                                                        key={index}
                                                        onClick={() => handlePageClick(index)}
                                                        className={`origin-top-left scale-[0.26] rounded-xl border-4 bg-primary-50 p-6 ${
                                                            currentQuestionIndex === index
                                                                ? "border-primary-500 bg-none"
                                                                : "bg-none"
                                                        }`}
                                                        onMouseEnter={() => handlePageClick(index)}
                                                    >
                                                        <TooltipProvider>
                                                            <Tooltip open={hasError ? true : false}>
                                                                <TooltipTrigger>
                                                                    <div className="flex flex-col">
                                                                        <div className="flex items-center justify-start gap-4">
                                                                            <h1 className="left-0 w-96 whitespace-nowrap text-4xl font-bold">
                                                                                {index + 1}
                                                                                &nbsp;
                                                                                {getValues(
                                                                                    `questions.${index}.questionType`,
                                                                                ) ||
                                                                                    `MCQ (Single Correct)`}
                                                                            </h1>
                                                                            <SortableDragHandle
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="size-16"
                                                                            >
                                                                                <DotsSixVertical className="text-bold !size-12" />
                                                                            </SortableDragHandle>
                                                                        </div>
                                                                        <PPTComponentFactory
                                                                            type={
                                                                                getValues(
                                                                                    `questions.${index}.questionType`,
                                                                                ) as
                                                                                    | "MCQ (Single Correct)"
                                                                                    | "MCQ (Multiple Correct)"
                                                                            }
                                                                            props={{
                                                                                form: form,
                                                                                currentQuestionIndex:
                                                                                    index,
                                                                                className:
                                                                                    "relative mt-4 rounded-xl border-4 border-primary-300 bg-white p-4",
                                                                                questionPaperUploadForm:
                                                                                    questionPaperUploadForm,
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </TooltipTrigger>
                                                                {hasError && (
                                                                    <TooltipContent
                                                                        className="ml-3 border-2 border-danger-400 bg-primary-50"
                                                                        side="right"
                                                                    >
                                                                        <p>
                                                                            Question isn&apos;t
                                                                            complete
                                                                        </p>
                                                                    </TooltipContent>
                                                                )}
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </SortableItem>
                                            );
                                        })}
                                    </div>
                                </Sortable>
                            </div>
                            <Separator orientation="vertical" className="ml-4 min-h-screen" />
                            <MainViewComponentFactory
                                type={
                                    getValues(`questions.${currentQuestionIndex}.questionType`) as
                                        | "MCQ (Single Correct)"
                                        | "MCQ (Multiple Correct)"
                                }
                                props={{
                                    form: form,
                                    className: "-ml-6 flex w-full flex-col gap-6 pr-6 pt-4",
                                    currentQuestionIndex: currentQuestionIndex,
                                    questionPaperUploadForm: questionPaperUploadForm,
                                }}
                            />
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
