import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { PencilSimpleLine, Plus, TrashSimple } from "phosphor-react";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { questionFormSchema } from "./-utils/question-form-schema";
import { Checkbox } from "@/components/ui/checkbox";
import UploadImageDialogue from "./-components/UploadImageDialogue";
import QuestionImagePreviewDialogue from "./-components/QuestionImagePreviewDialogue";

export const Route = createFileRoute("/dashboard/assessment/question-papers/view/")({
    component: () => <ViewQuestionPaperComponent />,
});

function ViewQuestionPaperComponent() {
    const [isHeaderEditable, setIsHeaderEditable] = useState(false); // State to toggle edit mode
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestionImageIndex] = useState(0);

    const form = useForm<z.infer<typeof questionFormSchema>>({
        resolver: zodResolver(questionFormSchema),
        defaultValues: {
            title: "",
            description: "",
            createdDate: new Date().toISOString(), // Default to the current date
            questions: [
                {
                    questionId: "",
                    questionName: "",
                    explanation: "",
                    imageDetails: [
                        {
                            imageId: "",
                            imageName: "",
                            imageTitle: "",
                            isDeleted: false,
                        },
                    ],
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
    console.log(getValues("questions"));

    function onSubmit(values: z.infer<typeof questionFormSchema>) {
        console.log(values);
    }

    // UseFieldArray to manage questions array
    const { fields, append } = useFieldArray({
        control,
        name: "questions", // Name of the field array
    });

    // Function to handle adding a new question
    const handleAddNewQuestion = () => {
        append({
            questionId: "",
            questionName: "",
            explanation: "",
            imageDetails: [
                {
                    imageId: "",
                    imageName: "",
                    imageTitle: "",
                    isDeleted: false,
                },
            ],
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

    useEffect(() => {
        setValue(
            `questions.${currentQuestionIndex}`,
            getValues(`questions.${currentQuestionIndex}`),
        );
    }, [currentQuestionIndex]);

    // Function to handle page navigation by question number
    const handlePageClick = (pageIndex: number) => {
        setCurrentQuestionIndex(pageIndex);
    };

    const itemsPerPage = 5; // Number of items to show between "previous" and "next" buttons

    const handleNextBlock = () => {
        if (currentQuestionIndex < fields.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        }
    };

    const handlePreviousBlock = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
        }
    };

    const getPaginationRange = () => {
        const totalItems = fields.length;
        const start = Math.floor(currentQuestionIndex / itemsPerPage) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, totalItems);

        const range = [];
        for (let i = start; i < end; i++) {
            range.push(i); // Display index starting from 1
        }

        return range;
    };

    const paginationRange = getPaginationRange();

    return (
        <div className="flex w-full flex-col">
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col">
                    <div className="flex flex-col gap-8 bg-primary-100 p-8 pt-4">
                        <h1 className="text-2xl font-bold text-primary-500">View Question Paper</h1>
                        <div>
                            <div className="flex items-center justify-between">
                                <FormField
                                    control={control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    className="rounded-none border-none p-0 !text-2xl font-bold shadow-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                    placeholder="Untitled"
                                                    disabled={!isHeaderEditable}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    variant="outline"
                                    className="w-44 bg-transparent shadow-none hover:bg-transparent"
                                    type="button"
                                    onClick={() => setIsHeaderEditable(!isHeaderEditable)}
                                >
                                    <PencilSimpleLine size={16} />
                                    Edit
                                </Button>
                            </div>
                            <FormField
                                control={control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                className="mt-2 w-auto rounded-none border-none p-0 shadow-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Add Description"
                                                disabled={!isHeaderEditable}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <p className="mt-4 text-sm">Created On: 11/03/2023</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6 p-8">
                        <div className="flex w-full !flex-nowrap items-start gap-4">
                            <span>Question&nbsp;(1.)</span>
                            <FormField
                                control={control}
                                name={`questions.${currentQuestionIndex}.questionName`}
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <Textarea
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Enter Question"
                                                className="h-20 !resize-none"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex flex-wrap items-end gap-8">
                            <div className="flex w-72 flex-col">
                                <div className="h-72 w-72 items-center justify-center bg-black !p-0"></div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-sm">Eye Diagram</span>
                                    <div className="flex items-center gap-4">
                                        <UploadImageDialogue
                                            form={form}
                                            currentQuestionIndex={currentQuestionIndex}
                                            currentQuestionImageIndex={currentQuestionImageIndex}
                                            title="Change Image"
                                            triggerButton={
                                                <Button variant="outline" className="p-0 px-2">
                                                    <PencilSimpleLine size={16} />
                                                </Button>
                                            }
                                        />
                                        <Button variant="outline" className="p-0 px-2">
                                            <TrashSimple size={32} className="text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <QuestionImagePreviewDialogue
                                form={form}
                                currentQuestionIndex={currentQuestionIndex}
                                currentQuestionImageIndex={currentQuestionImageIndex}
                            />
                        </div>
                        <div className="mt-2 flex w-full flex-col gap-4">
                            <div className="flex items-center justify-between rounded-md bg-neutral-100 p-4">
                                <div className="flex w-[100%] items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                        <span className="!p-0 text-sm">(a.)</span>
                                    </div>
                                    <FormField
                                        control={control}
                                        name={`questions.${currentQuestionIndex}.option1.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        className="rounded-none border-none p-0 shadow-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                        placeholder="option 1"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <PencilSimpleLine size={16} className="text-neutral-400" />
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                    <FormField
                                        control={control}
                                        name={`questions.${currentQuestionIndex}.option1.isSelected`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className={`mt-1 h-5 w-5 border-2 shadow-none ${
                                                            field.value
                                                                ? "border-none bg-green-500 text-white" // Blue background and red tick when checked
                                                                : "" // Default styles when unchecked
                                                        }`}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-md bg-neutral-100 p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                        <span className="!p-0 text-sm">(a.)</span>
                                    </div>
                                    <FormField
                                        control={control}
                                        name={`questions.${currentQuestionIndex}.option2.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        className="rounded-none border-none p-0 shadow-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                        placeholder="option 2"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <PencilSimpleLine size={16} className="text-neutral-400" />
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                    <FormField
                                        control={control}
                                        name={`questions.${currentQuestionIndex}.option2.isSelected`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className={`mt-1 h-5 w-5 border-2 shadow-none ${
                                                            field.value
                                                                ? "border-none bg-green-500 text-white" // Blue background and red tick when checked
                                                                : "" // Default styles when unchecked
                                                        }`}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between rounded-md bg-neutral-100 p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                        <span className="!p-0 text-sm">(a.)</span>
                                    </div>
                                    <FormField
                                        control={control}
                                        name={`questions.${currentQuestionIndex}.option3.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        className="rounded-none border-none p-0 shadow-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                        placeholder="option 3"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <PencilSimpleLine size={16} className="text-neutral-400" />
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                    <FormField
                                        control={control}
                                        name={`questions.${currentQuestionIndex}.option3.isSelected`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className={`mt-1 h-5 w-5 border-2 shadow-none ${
                                                            field.value
                                                                ? "border-none bg-green-500 text-white" // Blue background and red tick when checked
                                                                : "" // Default styles when unchecked
                                                        }`}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between rounded-md bg-neutral-100 p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                        <span className="!p-0 text-sm">(a.)</span>
                                    </div>
                                    <FormField
                                        control={control}
                                        name={`questions.${currentQuestionIndex}.option4.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        className="rounded-none border-none p-0 shadow-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                        placeholder="option 4"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <PencilSimpleLine size={16} className="text-neutral-400" />
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                    <FormField
                                        control={control}
                                        name={`questions.${currentQuestionIndex}.option4.isSelected`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className={`mt-1 h-5 w-5 border-2 shadow-none ${
                                                            field.value
                                                                ? "border-none bg-green-500 text-white" // Blue background and red tick when checked
                                                                : "" // Default styles when unchecked
                                                        }`}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="mt-3 flex w-full !flex-nowrap items-start gap-4">
                                <span>Exp:</span>
                                <FormField
                                    control={control}
                                    name={`questions.${currentQuestionIndex}.explanation`}
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormControl>
                                                <Textarea
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Enter Explanation"
                                                    className="h-20 !resize-none"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center bg-primary-100 p-4">
                        <div className="flex items-center gap-12">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem
                                        onClick={handlePreviousBlock}
                                        className="cursor-pointer"
                                    >
                                        <PaginationPrevious />
                                    </PaginationItem>
                                    <PaginationItem className="flex items-center gap-2">
                                        {paginationRange.map((page, index) => (
                                            <PaginationLink
                                                key={index}
                                                onClick={() => handlePageClick(page)}
                                                className={`flex cursor-pointer items-center rounded-md border-2 p-0 ${
                                                    currentQuestionIndex === page
                                                        ? "border-primary-500 bg-none"
                                                        : "bg-none"
                                                }`}
                                            >
                                                {page + 1}
                                            </PaginationLink>
                                        ))}
                                    </PaginationItem>

                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>

                                    <PaginationItem
                                        onClick={handleNextBlock}
                                        className="cursor-pointer"
                                    >
                                        <PaginationNext />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                            <div className="flex items-center gap-2">
                                <span>Go&nbsp;to</span>
                                <Input className="h-7 w-10 border-2 shadow-none focus-visible:ring-0 focus-visible:ring-transparent" />
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <Button
                                type="button"
                                variant="outline"
                                className="border-2 bg-transparent p-0 px-3 hover:bg-transparent"
                                onClick={handleAddNewQuestion}
                            >
                                <Plus size={20} />
                            </Button>
                            <Button
                                type="submit"
                                variant="outline"
                                className="w-40 border-2 bg-transparent hover:bg-transparent"
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
