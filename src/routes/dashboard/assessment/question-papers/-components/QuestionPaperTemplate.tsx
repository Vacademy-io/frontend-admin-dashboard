import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { DotsSixVertical, PencilSimpleLine } from "phosphor-react";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { questionFormSchema } from "../-utils/question-form-schema";
import { Separator } from "@/components/ui/separator";
import { SSDCLogo } from "@/svgs";
import { QuestionPaperTemplateForm } from "./QuestionPaperTemplateForm";
import { Sortable, SortableDragHandle, SortableItem } from "@/components/ui/sortable";
import { useQuestionStore } from "../-global-states/question-index";

export function QuestionPaperTemplate() {
    const [isHeaderEditable, setIsHeaderEditable] = useState(false); // State to toggle edit mode
    const { currentQuestionIndex, setCurrentQuestionIndex } = useQuestionStore();

    const form = useForm<z.infer<typeof questionFormSchema>>({
        resolver: zodResolver(questionFormSchema),
        defaultValues: {
            title: "",
            description: "",
            createdDate: new Date().toLocaleDateString(), // Default to the current date
            questions: [
                {
                    questionId: "",
                    questionName: "",
                    explanation: "",
                    imageDetails: [],
                    option1: {
                        name: "",
                        isSelected: false,
                    },
                    option2: {
                        name: "",
                        isSelected: false,
                    },
                    option3: {
                        name: "",
                        isSelected: false,
                    },
                    option4: {
                        name: "",
                        isSelected: false,
                    },
                },
            ],
        },
    });

    const { control, getValues, setValue } = form;

    function onSubmit(values: z.infer<typeof questionFormSchema>) {
        console.log(values);
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
            imageDetails: [],
            option1: {
                name: "",
                isSelected: false,
            },
            option2: {
                name: "",
                isSelected: false,
            },
            option3: {
                name: "",
                isSelected: false,
            },
            option4: {
                name: "",
                isSelected: false,
            },
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

    return (
        <Dialog>
            <DialogTrigger>
                <Button variant="outline" className="w-52 border-2">
                    Preview
                </Button>
            </DialogTrigger>
            <DialogContent className="no-scrollbar h-full !w-full !max-w-full overflow-y-auto p-0 [&>button]:hidden">
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col">
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
                        <div className="flex items-start gap-6">
                            <div className="flex w-28 flex-col items-start justify-between !gap-0 p-2">
                                <Sortable
                                    value={fields}
                                    onMove={({ activeIndex, overIndex }) =>
                                        move(activeIndex, overIndex)
                                    }
                                >
                                    <div className="flex flex-col gap-2">
                                        {fields.map((field, index) => (
                                            <SortableItem key={field.id} value={field.id} asChild>
                                                <div
                                                    key={index}
                                                    onClick={() => handlePageClick(index)}
                                                    className={`w-[600px] origin-top-left scale-[0.2] rounded-xl border-4 bg-primary-50 p-6 ${
                                                        index !== 0 ? "!mb-0 mt-[-23.8rem]" : ""
                                                    } ${
                                                        currentQuestionIndex === index
                                                            ? "border-primary-500 bg-none"
                                                            : "bg-none"
                                                    }`}
                                                    onMouseEnter={() => handlePageClick(index)}
                                                >
                                                    <div className="flex flex-col">
                                                        <div className="flex justify-between">
                                                            <h1 className="text-5xl font-bold">
                                                                Question {index + 1}
                                                            </h1>
                                                            <SortableDragHandle
                                                                variant="outline"
                                                                size="icon"
                                                                className="size-24"
                                                            >
                                                                <DotsSixVertical className="text-bold !size-16" />
                                                            </SortableDragHandle>
                                                        </div>
                                                        <QuestionPaperTemplateForm
                                                            form={form}
                                                            currentQuestionIndex={index}
                                                            className="relative mt-4 rounded-xl border-4 border-primary-300 bg-white p-4"
                                                            isSideBar={true}
                                                        />
                                                    </div>
                                                </div>
                                            </SortableItem>
                                        ))}
                                    </div>
                                </Sortable>
                                <Button
                                    type="button"
                                    className="ml-3 bg-primary-500 text-xs text-white shadow-none"
                                    onClick={handleAddNewQuestion}
                                >
                                    Add Question
                                </Button>
                            </div>
                            <Separator orientation="vertical" className="ml-4 h-screen" />
                            <QuestionPaperTemplateForm
                                form={form}
                                className="flex w-full flex-col gap-6 pr-6 pt-4"
                                currentQuestionIndex={currentQuestionIndex}
                            />
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
