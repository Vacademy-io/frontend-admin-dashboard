import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DotsThree } from "phosphor-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "react-quill/dist/quill.snow.css";
import { PPTViewQuillEditor } from "@/components/quill/PPTViewQuillEditor";
import { QuestionPaperTemplateFormProps } from "../../-utils/question-paper-template-form";
import { formatStructure } from "../../-utils/helper";

export const QuestionPaperTemplatePPTView = ({
    form,
    currentQuestionIndex,
    className,
    questionPaperUploadForm,
}: QuestionPaperTemplateFormProps) => {
    const { getValues: getQuestionPaperUploadForm } = questionPaperUploadForm;
    const optionsType = getQuestionPaperUploadForm("options") || "";
    const [isDropdownVisible, setIsDropdownVisible] = useState(false); // State to track dropdown visibility
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown open state

    const { control, getValues, setValue } = form;

    const imageDetails = getValues(`questions.${currentQuestionIndex}.imageDetails`);
    const allQuestions = getValues("questions") || [];

    const handleDeleteSlide = () => {
        allQuestions.splice(currentQuestionIndex, 1);
        setValue("questions", allQuestions);
    };

    const handleDuplicateSlide = () => {
        const questionToDuplicate = allQuestions[currentQuestionIndex];
        if (questionToDuplicate) {
            const duplicatedQuestion = {
                ...questionToDuplicate,
                questionId: questionToDuplicate.questionId || "",
                questionName: questionToDuplicate.questionName || "",
                explanation: questionToDuplicate.explanation || "",
                imageDetails: questionToDuplicate.imageDetails || [],
                option1: { ...questionToDuplicate.option1 },
                option2: { ...questionToDuplicate.option2 },
                option3: { ...questionToDuplicate.option3 },
                option4: { ...questionToDuplicate.option4 },
            };
            allQuestions.splice(currentQuestionIndex, 0, duplicatedQuestion);
            setValue("questions", allQuestions);
        }
    };

    return (
        <div
            className={className}
            onMouseEnter={() => setIsDropdownVisible(true)}
            onMouseLeave={() => !isDropdownOpen && setIsDropdownVisible(false)}
        >
            <div className="flex w-full flex-col !flex-nowrap items-start gap-1">
                <FormField
                    control={control}
                    name={`questions.${currentQuestionIndex}.questionName`}
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormControl>
                                <PPTViewQuillEditor value={field.value} onChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 py-2">
                {Array.isArray(allQuestions) &&
                    allQuestions.length > 0 &&
                    Array.isArray(imageDetails) &&
                    imageDetails.length > 0 &&
                    imageDetails.slice(0, 4).map((imgDetail, index) => {
                        if (imgDetail.imageFile) {
                            return (
                                <div className="flex flex-col" key={index}>
                                    <div className="size-16 items-center justify-center bg-black !p-0">
                                        <img
                                            src={imgDetail.imageFile}
                                            alt="logo"
                                            className="size-16"
                                        />
                                    </div>
                                </div>
                            );
                        }

                        // Return null if imageFile doesn't exist
                        return null;
                    })}
            </div>

            <div className="flex w-full flex-grow flex-col gap-2">
                <div className="flex gap-2">
                    <div className="flex w-1/2 items-center justify-between gap-4 rounded-md bg-neutral-100 p-2">
                        <div className="flex w-full items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-3">
                                <span className="!p-0 text-sm">
                                    {optionsType ? formatStructure(optionsType, "a") : "(a.)"}
                                </span>
                            </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-4">
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <div className="flex w-1/2 items-center justify-between gap-4 rounded-md bg-neutral-100 p-2">
                        <div className="flex w-full items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-3">
                                <span className="!p-0 text-sm">
                                    {optionsType ? formatStructure(optionsType, "b") : "(b.)"}
                                </span>
                            </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-4">
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex w-1/2 items-center justify-between gap-4 rounded-md bg-neutral-100 p-2">
                        <div className="flex w-full items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-3">
                                <span className="!p-0 text-sm">
                                    {optionsType ? formatStructure(optionsType, "c") : "(c.)"}
                                </span>
                            </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-4">
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <div className="flex w-1/2 items-center justify-between gap-4 rounded-md bg-neutral-100 p-2">
                        <div className="flex w-full items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-3">
                                <span className="!p-0 text-sm">
                                    {optionsType ? formatStructure(optionsType, "d") : "(d.)"}
                                </span>
                            </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-4">
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 right-12">
                {(isDropdownVisible || isDropdownOpen) && (
                    <DropdownMenu
                        onOpenChange={(open) => {
                            setIsDropdownOpen(open);
                            if (!open) setIsDropdownVisible(false); // Reset visibility when closed
                        }}
                    >
                        <DropdownMenuTrigger>
                            <Button
                                type="button"
                                variant="outline"
                                className="scale-[2] border-2 border-primary-300 px-3 font-bold"
                            >
                                <DotsThree size="32" className="font-bold" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="mt-1">
                            <DropdownMenuItem onClick={handleDuplicateSlide}>
                                Duplicate Slide
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDeleteSlide}>
                                Delete Slide
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
};
