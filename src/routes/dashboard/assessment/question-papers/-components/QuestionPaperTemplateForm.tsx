import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import UploadImageDialogue from "./UploadImageDialogue";
import { Button } from "@/components/ui/button";
import { DotsThree, PencilSimpleLine, TrashSimple } from "phosphor-react";
import QuestionImagePreviewDialogue from "./QuestionImagePreviewDialogue";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { QuestionPaperTemplateFormProps } from "../-utils/question-paper-template-form";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const QuestionPaperTemplateForm = ({
    form,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    currentQuestionImageIndex,
    setCurrentQuestionImageIndex,
    className,
    isSideBar,
}: QuestionPaperTemplateFormProps) => {
    // UseFieldArray to manage questions array
    console.log(setCurrentQuestionIndex);

    const [isDropdownVisible, setIsDropdownVisible] = useState(false); // State to track dropdown visibility
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown open state

    const { control, getValues, setValue } = form;

    const imageDetails = getValues(`questions.${currentQuestionIndex}.imageDetails`);

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

    const handleDeleteSlide = () => {
        const currentQuestions = getValues("questions");
        const updatedQuestions = currentQuestions.filter(
            (_, index) => index !== currentQuestionIndex,
        );
        setValue("questions", updatedQuestions);
    };

    const handleDuplicateSlide = () => {
        const allQuestions = getValues("questions") || [];
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
                <span>Question&nbsp;({currentQuestionIndex + 1}.)</span>
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
                {imageDetails.length > 0 &&
                    imageDetails.map((imgDetail, index) => {
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
                                        <span className="text-sm">{imgDetail.imageTitle}</span>
                                        <div className="flex items-center gap-4">
                                            <UploadImageDialogue
                                                form={form}
                                                currentQuestionIndex={currentQuestionIndex}
                                                currentQuestionImageIndex={index}
                                                title="Change Image"
                                                triggerButton={
                                                    <Button variant="outline" className="p-0 px-2">
                                                        <PencilSimpleLine size={16} />
                                                    </Button>
                                                }
                                            />
                                            <Button
                                                variant="outline"
                                                className="p-0 px-2"
                                                onClick={() => handleRemovePicture(index)}
                                            >
                                                <TrashSimple size={32} className="text-red-500" />
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
            <div className="flex w-full flex-grow flex-col gap-4">
                <div className="flex gap-4">
                    <div className="flex w-1/2 items-center justify-between rounded-md bg-neutral-100 p-4">
                        <div className="flex items-center gap-4">
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
                    <div className="flex w-1/2 items-center justify-between rounded-md bg-neutral-100 p-4">
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
                </div>
                <div className="flex gap-4">
                    <div className="flex w-1/2 items-center justify-between rounded-md bg-neutral-100 p-4">
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
                    <div className="flex w-1/2 items-center justify-between rounded-md bg-neutral-100 p-4">
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
                </div>
            </div>
            <div className="flex w-full flex-col !flex-nowrap items-start gap-1">
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
            {isSideBar && (
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
            )}
        </div>
    );
};
