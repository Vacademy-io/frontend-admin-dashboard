import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PencilSimpleLine, Plus, TrashSimple } from "phosphor-react";
import UploadImageDialogue from "./UploadImageDialogue";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { QuestionImagePreviewDialogueProps } from "@/types/question-image-preview";
import { useQuestionStore } from "../-global-states/question-index";
import { useQuestionImageStore } from "../-global-states/question-image-index";

const QuestionImagePreviewDialogue: React.FC<QuestionImagePreviewDialogueProps> = ({
    form,
    currentQuestionImageIndex,
    isUploadedAgain,
}) => {
    const { currentQuestionIndex } = useQuestionStore();
    const { setCurrentQuestionImageIndex } = useQuestionImageStore();

    const { setValue, getValues, watch } = form;
    console.log(getValues());
    watch(`questions.${currentQuestionIndex}.imageDetails`);
    const imageDetails = getValues(`questions.${currentQuestionIndex}.imageDetails`);

    const handleRemovePicture = (currentQuestionImageIndex: number) => {
        // Filter out the image to be removed
        const updatedImageDetails = imageDetails?.filter(
            (_, index: number) => index !== currentQuestionImageIndex,
        );

        // Update the value with the filtered array
        setValue(`questions.${currentQuestionIndex}.imageDetails`, updatedImageDetails);
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
            setValue(`questions.${currentQuestionIndex}.imageDetails`, [...imageDetails, newImage]);
            setCurrentQuestionImageIndex(imageDetails.length);
        }
    };

    return (
        <Dialog>
            <DialogTrigger>
                <Button
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
            <DialogContent className="flex h-96 w-96 flex-col !gap-0 !p-0">
                <h1 className="rounded-md bg-primary-100 p-3 pl-4 font-bold text-primary-500">
                    Question Image
                </h1>
                <div className="relative flex h-80 w-full items-center justify-center bg-black !p-0">
                    {getValues(
                        `questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageFile`,
                    ) && (
                        <img
                            src={getValues(
                                `questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageFile`,
                            )}
                            alt="logo"
                            className="h-64 w-96"
                        />
                    )}

                    {!getValues(
                        `questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageFile`,
                    ) && (
                        <UploadImageDialogue
                            form={form}
                            title="Upload Image"
                            currentQuestionImageIndex={currentQuestionImageIndex}
                        />
                    )}
                </div>
                <div className="flex gap-4 p-4">
                    <FormField
                        control={form.control}
                        name={`questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageTitle`}
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
                        currentQuestionImageIndex={currentQuestionImageIndex}
                    />
                    <Button
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
