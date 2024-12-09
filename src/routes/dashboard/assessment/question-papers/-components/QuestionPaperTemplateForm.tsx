import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import UploadImageDialogue from "./UploadImageDialogue";
import { Button } from "@/components/ui/button";
import { DotsThree, PencilSimpleLine, TrashSimple } from "phosphor-react";
import QuestionImagePreviewDialogue from "./QuestionImagePreviewDialogue";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { QuestionPaperTemplateFormProps } from "../-utils/question-paper-template-form";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatStructure } from "../-utils/helper";
import QuillEditor from "@/components/quill/QuillEditor";
import "react-quill/dist/quill.snow.css";
import { OptionImagePreview } from "./options/OptionImagePreview";
import { OptionUploadImagePreview } from "./options/OptionUploadImagePreview";

export const QuestionPaperTemplateForm = ({
    form,
    currentQuestionIndex,
    className,
    isSideBar,
    questionPaperUploadForm,
}: QuestionPaperTemplateFormProps) => {
    const { getValues: getQuestionPaperUploadForm } = questionPaperUploadForm;
    const answersType = getQuestionPaperUploadForm("answers") || "Answer:";
    const explanationsType = getQuestionPaperUploadForm("explanations") || "Explanation:";
    const optionsType = getQuestionPaperUploadForm("options") || "";
    const questionsType = getQuestionPaperUploadForm("questions") || "";

    const [isDropdownVisible, setIsDropdownVisible] = useState(false); // State to track dropdown visibility
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown open state

    const { control, getValues, setValue } = form;

    const imageDetails = getValues(`questions.${currentQuestionIndex}.imageDetails`);
    const allQuestions = getValues("questions") || [];
    const option1 = getValues(`questions.${currentQuestionIndex}.option1`);
    const option2 = getValues(`questions.${currentQuestionIndex}.option2`);
    const option3 = getValues(`questions.${currentQuestionIndex}.option3`);
    const option4 = getValues(`questions.${currentQuestionIndex}.option4`);

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

    const handleRemovePictureInOptions = (
        option: "option1" | "option2" | "option3" | "option4",
    ) => {
        setValue(`questions.${currentQuestionIndex}.${option}.image.isDeleted`, true);
        setValue(`questions.${currentQuestionIndex}.${option}.image.imageFile`, "");
        setValue(`questions.${currentQuestionIndex}.${option}.image.imageName`, "");
        setValue(`questions.${currentQuestionIndex}.${option}.image.imageTitle`, "");
    };

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

    if (allQuestions.length === 0) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <h1>Please add a question to show question details</h1>
            </div>
        );
    }

    return (
        <div
            className={className}
            onMouseEnter={() => setIsDropdownVisible(true)}
            onMouseLeave={() => !isDropdownOpen && setIsDropdownVisible(false)}
        >
            <div className="flex w-full flex-col !flex-nowrap items-start gap-1">
                <span>
                    Question&nbsp;
                    {questionsType
                        ? formatStructure(questionsType, currentQuestionIndex + 1)
                        : currentQuestionIndex + 1}
                </span>
                <FormField
                    control={control}
                    name={`questions.${currentQuestionIndex}.questionName`}
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormControl>
                                <QuillEditor value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            {!isSideBar && (
                <div className="flex flex-wrap items-end gap-8">
                    {Array.isArray(allQuestions) &&
                        allQuestions.length > 0 &&
                        Array.isArray(imageDetails) &&
                        imageDetails.length > 0 &&
                        imageDetails.map((imgDetail, index) => {
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
                                                    onClick={() => handleRemovePicture(index)}
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
                    <QuestionImagePreviewDialogue form={form} />
                </div>
            )}
            {!isSideBar && (
                <div className="flex w-full flex-grow flex-col gap-4">
                    <span className="-mb-3">{answersType}</span>
                    <div className="flex gap-4">
                        <div className="flex w-1/2 items-center justify-between gap-4 rounded-md bg-neutral-100 p-4">
                            <div className="flex w-full items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-3">
                                    <span className="!p-0 text-sm">
                                        {optionsType ? formatStructure(optionsType, "a") : "(a.)"}
                                    </span>
                                </div>
                                {option1?.image?.imageFile ? (
                                    <div className="flex w-72 flex-col">
                                        <div className="h-64 w-72 items-center justify-center bg-black !p-0">
                                            <img
                                                src={option1.image.imageFile}
                                                alt="logo"
                                                className="h-64 w-96"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-sm">
                                                {option1.image.imageTitle}
                                            </span>
                                            <div className="flex items-center gap-4">
                                                <OptionUploadImagePreview
                                                    form={form}
                                                    title="Change Image"
                                                    triggerButton={
                                                        <Button
                                                            variant="outline"
                                                            className="p-0 px-2"
                                                        >
                                                            <PencilSimpleLine size={16} />
                                                        </Button>
                                                    }
                                                    option="option1"
                                                />
                                                <Button
                                                    variant="outline"
                                                    className="p-0 px-2"
                                                    onClick={() =>
                                                        handleRemovePictureInOptions("option1")
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
                                ) : (
                                    <FormField
                                        control={control}
                                        name={`questions.${currentQuestionIndex}.option1.name`}
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormControl>
                                                    <QuillEditor
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {!option1?.image?.imageFile && (
                                    <OptionImagePreview form={form} option="option1" />
                                )}
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
                        <div className="flex w-1/2 items-center justify-between gap-4 rounded-md bg-neutral-100 p-4">
                            <div className="flex w-full items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-3">
                                    <span className="!p-0 text-sm">
                                        {optionsType ? formatStructure(optionsType, "b") : "(b.)"}
                                    </span>
                                </div>
                                {option2?.image?.imageFile ? (
                                    <div className="flex w-72 flex-col">
                                        <div className="h-64 w-72 items-center justify-center bg-black !p-0">
                                            <img
                                                src={option2.image.imageFile}
                                                alt="logo"
                                                className="h-64 w-96"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-sm">
                                                {option2.image.imageTitle}
                                            </span>
                                            <div className="flex items-center gap-4">
                                                <OptionUploadImagePreview
                                                    form={form}
                                                    title="Change Image"
                                                    triggerButton={
                                                        <Button
                                                            variant="outline"
                                                            className="p-0 px-2"
                                                        >
                                                            <PencilSimpleLine size={16} />
                                                        </Button>
                                                    }
                                                    option="option2"
                                                />
                                                <Button
                                                    variant="outline"
                                                    className="p-0 px-2"
                                                    onClick={() =>
                                                        handleRemovePictureInOptions("option2")
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
                                ) : (
                                    <FormField
                                        control={control}
                                        name={`questions.${currentQuestionIndex}.option2.name`}
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormControl>
                                                    <QuillEditor
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {!option2?.image?.imageFile && (
                                    <OptionImagePreview form={form} option="option2" />
                                )}
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
                    <div className="flex gap-4">
                        <div className="flex w-1/2 items-center justify-between gap-4 rounded-md bg-neutral-100 p-4">
                            <div className="flex w-full items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-3">
                                    <span className="!p-0 text-sm">
                                        {optionsType ? formatStructure(optionsType, "c") : "(c.)"}
                                    </span>
                                </div>
                                {option3?.image?.imageFile ? (
                                    <div className="flex w-72 flex-col">
                                        <div className="h-64 w-72 items-center justify-center bg-black !p-0">
                                            <img
                                                src={option3.image.imageFile}
                                                alt="logo"
                                                className="h-64 w-96"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-sm">
                                                {option3.image.imageTitle}
                                            </span>
                                            <div className="flex items-center gap-4">
                                                <OptionUploadImagePreview
                                                    form={form}
                                                    title="Change Image"
                                                    triggerButton={
                                                        <Button
                                                            variant="outline"
                                                            className="p-0 px-2"
                                                        >
                                                            <PencilSimpleLine size={16} />
                                                        </Button>
                                                    }
                                                    option="option3"
                                                />
                                                <Button
                                                    variant="outline"
                                                    className="p-0 px-2"
                                                    onClick={() =>
                                                        handleRemovePictureInOptions("option3")
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
                                ) : (
                                    <FormField
                                        control={control}
                                        name={`questions.${currentQuestionIndex}.option3.name`}
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormControl>
                                                    <QuillEditor
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {!option3?.image?.imageFile && (
                                    <OptionImagePreview form={form} option="option3" />
                                )}
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
                        <div className="flex w-1/2 items-center justify-between gap-4 rounded-md bg-neutral-100 p-4">
                            <div className="flex w-full items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white px-3">
                                    <span className="!p-0 text-sm">
                                        {optionsType ? formatStructure(optionsType, "d") : "(d.)"}
                                    </span>
                                </div>
                                {option4?.image?.imageFile ? (
                                    <div className="flex w-72 flex-col">
                                        <div className="h-64 w-72 items-center justify-center bg-black !p-0">
                                            <img
                                                src={option4.image.imageFile}
                                                alt="logo"
                                                className="h-64 w-96"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-sm">
                                                {option4.image.imageTitle}
                                            </span>
                                            <div className="flex items-center gap-4">
                                                <OptionUploadImagePreview
                                                    form={form}
                                                    title="Change Image"
                                                    triggerButton={
                                                        <Button
                                                            variant="outline"
                                                            className="p-0 px-2"
                                                        >
                                                            <PencilSimpleLine size={16} />
                                                        </Button>
                                                    }
                                                    option="option4"
                                                />
                                                <Button
                                                    variant="outline"
                                                    className="p-0 px-2"
                                                    onClick={() =>
                                                        handleRemovePictureInOptions("option4")
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
                                ) : (
                                    <FormField
                                        control={control}
                                        name={`questions.${currentQuestionIndex}.option4.name`}
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormControl>
                                                    <QuillEditor
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {!option4?.image?.imageFile && (
                                    <OptionImagePreview form={form} option="option4" />
                                )}
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
            )}

            <div className="flex w-full flex-col !flex-nowrap items-start gap-1">
                <span>{explanationsType}</span>
                <FormField
                    control={control}
                    name={`questions.${currentQuestionIndex}.explanation`}
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormControl>
                                <QuillEditor value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
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
