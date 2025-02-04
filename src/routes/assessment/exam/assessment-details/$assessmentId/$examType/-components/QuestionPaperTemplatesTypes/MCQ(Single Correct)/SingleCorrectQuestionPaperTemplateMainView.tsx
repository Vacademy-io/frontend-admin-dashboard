import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Sliders, TrashSimple, X } from "phosphor-react";
import { Checkbox } from "@/components/ui/checkbox";
import "react-quill/dist/quill.snow.css";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import SelectField from "@/components/design-system/select-field";
import CustomInput from "@/components/design-system/custom-input";
import { MainViewQuillEditor } from "@/components/quill/MainViewQuillEditor";
import { OptionImagePreview } from "../../options/MCQ(Single Correct)/OptionImagePreview";
import { QUESTION_TYPES } from "@/constants/dummy-data";
import { SectionQuestionPaperFormProps } from "../../../-utils/assessment-question-paper";
import QuestionImagePreviewDialogue from "../../QuestionImagePreviewDialogue";

interface ImageDetail {
    imageId: string;
    imageName: string;
    imageTitle: string;
    imageFile: string;
    isDeleted: boolean;
}

interface ChoiceOption {
    name: string;
    isSelected: boolean;
    image: ImageDetail;
}

export const SingleCorrectQuestionPaperTemplateMainView = ({
    form,
    currentQuestionIndex,
    currentQuestionImageIndex,
    setCurrentQuestionImageIndex,
    className,
    selectedSectionIndex,
}: SectionQuestionPaperFormProps) => {
    const { control, getValues, setValue } = form;

    const imageDetails = getValues(
        `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.imageDetails`,
    );
    const allQuestions = getValues(`sections.${selectedSectionIndex}.questions`) || [];

    const option1 = getValues(
        `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${0}`,
    ) as ChoiceOption;
    const option2 = getValues(
        `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${1}`,
    ) as ChoiceOption;
    const option3 = getValues(
        `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${2}`,
    ) as ChoiceOption;
    const option4 = getValues(
        `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${3}`,
    ) as ChoiceOption;

    const handleRemovePicture = (currentQuestionImageIndex: number) => {
        // Filter out the image to be removed
        const updatedImageDetails = imageDetails?.filter(
            (_, index: number) => index !== currentQuestionImageIndex,
        );

        // Update the value with the filtered array
        setValue(
            `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.imageDetails`,
            updatedImageDetails,
        );
    };

    const handleRemovePictureInOptions = (optionIndex: number) => {
        setValue(
            `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${optionIndex}.image.isDeleted`,
            true,
        );
        setValue(
            `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${optionIndex}.image.imageFile`,
            "",
        );
        setValue(
            `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${optionIndex}.image.imageName`,
            "",
        );
        setValue(
            `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${optionIndex}.image.imageTitle`,
            "",
        );
    };

    const handleOptionChange = (optionIndex: number) => {
        const options = [0, 1, 2, 3];

        // Check current state of the selected option
        const isCurrentlySelected = getValues(
            `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${optionIndex}.isSelected`,
        );

        options.forEach((option) => {
            setValue(
                `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${option}.isSelected`,
                option === optionIndex ? !isCurrentlySelected : false, // Toggle only the selected option
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
                                name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.questionType`}
                                options={QUESTION_TYPES.map((option, index) => ({
                                    value: option,
                                    label: option,
                                    _id: index,
                                }))}
                                control={form.control}
                                className="!w-full"
                                required
                            />
                            <CustomInput
                                control={form.control}
                                name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.questionMark`}
                                label="Marks"
                                required
                            />
                            <CustomInput
                                control={form.control}
                                name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.questionPenalty`}
                                label="Negative Marking"
                                required
                            />
                            <div className="flex flex-col gap-2">
                                <h1 className="text-sm font-semibold">Time Limit</h1>
                                <div className="flex items-center gap-4 text-sm">
                                    <CustomInput
                                        control={form.control}
                                        name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.questionDuration.hrs`}
                                        label=""
                                        className="w-10"
                                    />
                                    <span>hrs</span>
                                    <span>:</span>
                                    <CustomInput
                                        control={form.control}
                                        name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.questionDuration.min`}
                                        label=""
                                        className="w-10"
                                    />
                                    <span>min</span>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex w-full flex-col !flex-nowrap items-start gap-1">
                <span>
                    Question&nbsp;
                    {currentQuestionIndex + 1}
                </span>
                <FormField
                    control={control}
                    name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.questionName`}
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

            <div className="flex flex-wrap items-end justify-center gap-8">
                {Array.isArray(allQuestions) &&
                    allQuestions.length > 0 &&
                    Array.isArray(imageDetails) &&
                    imageDetails.length > 0 &&
                    imageDetails.map((imgDetail, index) => {
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
                                        <QuestionImagePreviewDialogue
                                            form={form}
                                            currentQuestionIndex={currentQuestionIndex}
                                            currentQuestionImageIndex={index}
                                            setCurrentQuestionImageIndex={
                                                setCurrentQuestionImageIndex
                                            }
                                            selectedSectionIndex={selectedSectionIndex}
                                            isUploadedAgain={true}
                                        />
                                        <Button
                                            type="button"
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
                    })}
                {Array.isArray(imageDetails) && imageDetails.length < 4 && (
                    <QuestionImagePreviewDialogue
                        form={form}
                        currentQuestionIndex={currentQuestionIndex}
                        currentQuestionImageIndex={currentQuestionImageIndex}
                        setCurrentQuestionImageIndex={setCurrentQuestionImageIndex}
                        selectedSectionIndex={selectedSectionIndex}
                        isUploadedAgain={false}
                    />
                )}
            </div>

            <div className="flex w-full grow flex-col gap-4">
                <span className="-mb-3">Answer:</span>
                <div className="flex gap-4">
                    <div
                        className={`flex w-1/2 items-center justify-between gap-4 rounded-md bg-neutral-100 p-4 ${
                            option1.isSelected ? "border border-primary-300 bg-primary-50" : ""
                        }`}
                    >
                        <div className="flex w-full items-center gap-4">
                            <div className="flex size-10 items-center justify-center rounded-full bg-white px-3">
                                <span className="!p-0 text-sm">(a.)</span>
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
                                        <span className="text-sm">{option1.image.imageTitle}</span>
                                        <div className="flex items-center gap-4">
                                            <OptionImagePreview
                                                form={form}
                                                option={0}
                                                selectedSectionIndex={selectedSectionIndex}
                                                currentQuestionIndex={currentQuestionIndex}
                                                isUploadedAgain={true}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="p-0 px-2"
                                                onClick={() => handleRemovePictureInOptions(0)}
                                            >
                                                <TrashSimple size={32} className="text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <FormField
                                    control={control}
                                    name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${0}.name`}
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
                            )}
                            {!option1?.image?.imageFile && (
                                <OptionImagePreview
                                    form={form}
                                    option={0}
                                    selectedSectionIndex={selectedSectionIndex}
                                    currentQuestionIndex={currentQuestionIndex}
                                />
                            )}
                        </div>
                        <div className="flex size-10 items-center justify-center rounded-full bg-white px-4">
                            <FormField
                                control={control}
                                name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${0}.isSelected`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={() => handleOptionChange(0)}
                                                className={`mt-1 size-5 rounded-xl border-2 shadow-none ${
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
                    <div
                        className={`flex w-1/2 items-center justify-between gap-4 rounded-md bg-neutral-100 p-4 ${
                            option2.isSelected ? "border border-primary-300 bg-primary-50" : ""
                        }`}
                    >
                        <div className="flex w-full items-center gap-4">
                            <div className="flex size-10 items-center justify-center rounded-full bg-white px-3">
                                <span className="!p-0 text-sm">(b.)</span>
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
                                        <span className="text-sm">{option2.image.imageTitle}</span>
                                        <div className="flex items-center gap-4">
                                            <OptionImagePreview
                                                form={form}
                                                option={1}
                                                currentQuestionIndex={currentQuestionIndex}
                                                selectedSectionIndex={selectedSectionIndex}
                                                isUploadedAgain={true}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="p-0 px-2"
                                                onClick={() => handleRemovePictureInOptions(1)}
                                            >
                                                <TrashSimple size={32} className="text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <FormField
                                    control={control}
                                    name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${1}.name`}
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
                            )}
                            {!option2?.image?.imageFile && (
                                <OptionImagePreview
                                    form={form}
                                    option={1}
                                    currentQuestionIndex={currentQuestionIndex}
                                    selectedSectionIndex={selectedSectionIndex}
                                />
                            )}
                        </div>
                        <div className="flex size-10 items-center justify-center rounded-full bg-white px-4">
                            <FormField
                                control={control}
                                name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${1}.isSelected`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={() => handleOptionChange(1)}
                                                className={`mt-1 size-5 rounded-xl border-2 shadow-none ${
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
                    <div
                        className={`flex w-1/2 items-center justify-between gap-4 rounded-md bg-neutral-100 p-4 ${
                            option3.isSelected ? "border border-primary-300 bg-primary-50" : ""
                        }`}
                    >
                        <div className="flex w-full items-center gap-4">
                            <div className="flex size-10 items-center justify-center rounded-full bg-white px-3">
                                <span className="!p-0 text-sm">(c.)</span>
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
                                        <span className="text-sm">{option3.image.imageTitle}</span>
                                        <div className="flex items-center gap-4">
                                            <OptionImagePreview
                                                form={form}
                                                option={2}
                                                currentQuestionIndex={currentQuestionIndex}
                                                selectedSectionIndex={selectedSectionIndex}
                                                isUploadedAgain={true}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="p-0 px-2"
                                                onClick={() => handleRemovePictureInOptions(2)}
                                            >
                                                <TrashSimple size={32} className="text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <FormField
                                    control={control}
                                    name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${2}.name`}
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
                            )}
                            {!option3?.image?.imageFile && (
                                <OptionImagePreview
                                    form={form}
                                    option={2}
                                    currentQuestionIndex={currentQuestionIndex}
                                    selectedSectionIndex={selectedSectionIndex}
                                />
                            )}
                        </div>
                        <div className="flex size-10 items-center justify-center rounded-full bg-white px-4">
                            <FormField
                                control={control}
                                name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${2}.isSelected`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={() => handleOptionChange(2)}
                                                className={`mt-1 size-5 rounded-xl border-2 shadow-none ${
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
                    <div
                        className={`flex w-1/2 items-center justify-between gap-4 rounded-md bg-neutral-100 p-4 ${
                            option4.isSelected ? "border border-primary-300 bg-primary-50" : ""
                        }`}
                    >
                        <div className="flex w-full items-center gap-4">
                            <div className="flex size-10 items-center justify-center rounded-full bg-white px-3">
                                <span className="!p-0 text-sm">(d.)</span>
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
                                        <span className="text-sm">{option4.image.imageTitle}</span>
                                        <div className="flex items-center gap-4">
                                            <OptionImagePreview
                                                form={form}
                                                option={3}
                                                currentQuestionIndex={currentQuestionIndex}
                                                selectedSectionIndex={selectedSectionIndex}
                                                isUploadedAgain={true}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="p-0 px-2"
                                                onClick={() => handleRemovePictureInOptions(3)}
                                            >
                                                <TrashSimple size={32} className="text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <FormField
                                    control={control}
                                    name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${3}.name`}
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
                            )}
                            {!option4?.image?.imageFile && (
                                <OptionImagePreview
                                    form={form}
                                    option={3}
                                    currentQuestionIndex={currentQuestionIndex}
                                    selectedSectionIndex={selectedSectionIndex}
                                />
                            )}
                        </div>
                        <div className="flex size-10 items-center justify-center rounded-full bg-white px-4">
                            <FormField
                                control={control}
                                name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${3}.isSelected`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={() => handleOptionChange(3)}
                                                className={`mt-1 size-5 rounded-xl border-2 shadow-none ${
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
            <div className="mb-6 flex w-full flex-col !flex-nowrap items-start gap-1">
                <span>Explanation:</span>
                <FormField
                    control={control}
                    name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.explanation`}
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
