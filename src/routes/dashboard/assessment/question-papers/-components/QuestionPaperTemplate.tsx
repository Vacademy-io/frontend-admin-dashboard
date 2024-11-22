import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UploadImageDialogue from "./UploadImageDialogue";
import QuestionImagePreviewDialogue from "./QuestionImagePreviewDialogue";
import { questionFormSchema } from "../-utils/question-form-schema";

export function QuestionPaperTemplate() {
    const [isHeaderEditable, setIsHeaderEditable] = useState(false); // State to toggle edit mode
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestionImageIndex, setCurrentQuestionImageIndex] = useState(0);

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
    const imageDetails = getValues(`questions.${currentQuestionIndex}.imageDetails`);
    const createdDate = getValues(`createdDate`);

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

    const [options, setOptions] = useState([false, false, false, false]);

    const handleOptionToggle = (idx: number) => {
        const newOptions = options.map((option, index) => (index === idx ? !option : option));
        setOptions(newOptions);
    };

    const handleRemovePicture = (currentQuestionImageIndex: number) => {
        setValue(
            `questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.isDeleted`,
            true,
        );
        setValue(
            `questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageFile`,
            "",
        );
        setValue(
            `questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageName`,
            "",
        );
        setValue(
            `questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageTitle`,
            "",
        );
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
            <DialogContent className="no-scrollbar h-full !w-full !max-w-full overflow-y-auto p-0">
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col">
                        <div className="flex flex-col gap-8 bg-primary-100 p-8 pt-4">
                            <h1 className="text-2xl font-bold text-primary-500">
                                View Question Paper
                            </h1>
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
                                <p className="mt-4 text-sm">
                                    Created On: {createdDate.toLowerCase()}
                                </p>
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
                                {imageDetails.map((imgDetail, index) => {
                                    // Only render the div if imageFile exists
                                    if (imgDetail.imageFile) {
                                        return (
                                            <div className="flex w-72 flex-col" key={index}>
                                                <div className="h-64 w-72 items-center justify-center bg-black !p-0">
                                                    <img
                                                        src={imgDetail.imageFile}
                                                        alt="logo"
                                                        className="h-64 w-96"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between pt-2">
                                                    <span className="text-sm">
                                                        {imgDetail.imageTitle}
                                                    </span>
                                                    <div className="flex items-center gap-4">
                                                        <UploadImageDialogue
                                                            form={form}
                                                            currentQuestionIndex={
                                                                currentQuestionIndex
                                                            }
                                                            currentQuestionImageIndex={index}
                                                            title="Change Image"
                                                            triggerButton={
                                                                <Button
                                                                    variant="outline"
                                                                    className="p-0 px-2"
                                                                >
                                                                    <PencilSimpleLine size={16} />
                                                                </Button>
                                                            }
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            className="p-0 px-2"
                                                            onClick={() =>
                                                                handleRemovePicture(index)
                                                            }
                                                        >
                                                            <TrashSimple
                                                                size={32}
                                                                className="text-red-500"
                                                            />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Return null if imageFile doesn't exist
                                    return null;
                                })}

                                <QuestionImagePreviewDialogue
                                    form={form}
                                    currentQuestionIndex={currentQuestionIndex}
                                    currentQuestionImageIndex={currentQuestionImageIndex}
                                    setCurrentQuestionImageIndex={setCurrentQuestionImageIndex}
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
                                                            disabled={!options[0]}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <PencilSimpleLine
                                            size={16}
                                            className="cursor-pointer text-neutral-400"
                                            onClick={() => handleOptionToggle(0)}
                                        />
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
                                                            disabled={!options[1]}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <PencilSimpleLine
                                            size={16}
                                            className="cursor-pointer text-neutral-400"
                                            onClick={() => handleOptionToggle(1)}
                                        />
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
                                                            disabled={!options[2]}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <PencilSimpleLine
                                            size={16}
                                            className="cursor-pointer text-neutral-400"
                                            onClick={() => handleOptionToggle(2)}
                                        />
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
                                                            disabled={!options[3]}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <PencilSimpleLine
                                            size={16}
                                            className="cursor-pointer text-neutral-400"
                                            onClick={() => handleOptionToggle(3)}
                                        />
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
                        <div className="flex flex-wrap items-center justify-between bg-primary-100 p-4">
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
                                    className="border-2 bg-transparent p-0 px-2 hover:bg-transparent"
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
            </DialogContent>
        </Dialog>
    );
}
