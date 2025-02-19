import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PencilSimpleLine, Plus, TrashSimple } from "phosphor-react";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AssessmentQuestionImagePreviewDialogueProps } from "@/types/assessment-image-preview";
import UploadImageDialogue from "./UploadImageDialogue";

const QuestionImagePreviewDialogue: React.FC<AssessmentQuestionImagePreviewDialogueProps> = ({
    form,
    currentQuestionIndex,
    currentQuestionImageIndex,
    setCurrentQuestionImageIndex,
    selectedSectionIndex,
    isUploadedAgain,
}) => {
    const { setValue, getValues, watch } = form;
    watch(`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.imageDetails`);
    const imageDetails = getValues(
        `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.imageDetails`,
    );

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

    // Handle Add Image click
    const handleAddImage = () => {
        // Only append a new image if imageDetails is not empty (prevent duplicates)
        const newImage = {
            imageId: "",
            imageName: "",
            imageTitle: "",
            imageFile: "", // or an empty string if you prefer
            isDeleted: false,
        };

        // Update form state to append the new image to the imageDetails array
        if (imageDetails && !isUploadedAgain) {
            setValue(
                `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.imageDetails`,
                [...imageDetails, newImage],
            );
            setCurrentQuestionImageIndex(imageDetails.length);
        }
    };

    return (
        <Dialog>
            <DialogTrigger>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddImage}
                    className={`${isUploadedAgain ? "px-2" : ""}`}
                >
                    {isUploadedAgain ? (
                        <PencilSimpleLine size={16} />
                    ) : (
                        <>
                            <Plus size={32} />
                            Add Image
                        </>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="flex size-96 flex-col !gap-0 !p-0">
                <h1 className="rounded-md bg-primary-100 p-3 pl-4 font-bold text-primary-500">
                    Question Image
                </h1>
                <div className="relative flex h-80 w-full items-center justify-center bg-black !p-0">
                    {getValues(
                        `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageFile`,
                    ) && (
                        <img
                            src={getValues(
                                `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageFile`,
                            )}
                            alt="logo"
                            className="h-64 w-96"
                        />
                    )}

                    {!getValues(
                        `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageFile`,
                    ) && (
                        <UploadImageDialogue
                            form={form}
                            title="Upload Image"
                            selectedSectionIndex={selectedSectionIndex}
                            currentQuestionIndex={currentQuestionIndex}
                            currentQuestionImageIndex={currentQuestionImageIndex}
                        />
                    )}
                </div>
                <div className="flex gap-4 p-4">
                    <FormField
                        control={form.control}
                        name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageTitle`}
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Image Title"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <UploadImageDialogue
                        form={form}
                        title="Change Image"
                        selectedSectionIndex={selectedSectionIndex}
                        currentQuestionIndex={currentQuestionIndex}
                        currentQuestionImageIndex={currentQuestionImageIndex}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        className="p-0 px-3"
                        onClick={() => handleRemovePicture(currentQuestionImageIndex)}
                    >
                        <TrashSimple size={32} className="text-red-500" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
export default QuestionImagePreviewDialogue;
