import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, TrashSimple } from "phosphor-react";
import UploadImageDialogue from "./UploadImageDialogue";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { QuestionImagePreviewDialogueProps } from "@/types/question-image-preview";
import { useQuestionStore } from "../-global-states/question-index";
import { useQuestionImageStore } from "../-global-states/question-imag-index";

const QuestionImagePreviewDialogue: React.FC<QuestionImagePreviewDialogueProps> = ({ form }) => {
    const { currentQuestionIndex } = useQuestionStore();
    const { currentQuestionImageIndex, setCurrentQuestionImageIndex } = useQuestionImageStore();

    const { setValue, getValues, watch } = form;
    watch(`questions.${currentQuestionIndex}.imageDetails`);
    const imageDetails = getValues(`questions.${currentQuestionIndex}.imageDetails`);

    const handleRemovePicture = () => {
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

    // Handle Add Image click
    const handleAddImage = () => {
        // Only append a new image if imageDetails is not empty (prevent duplicates)
        const newImage = {
            imageId: "",
            imageName: "",
            imageTitle: "",
            imageFile: undefined, // or an empty string if you prefer
            isDeleted: false,
        };

        // Update form state to append the new image to the imageDetails array
        setValue(`questions.${currentQuestionIndex}.imageDetails`, [...imageDetails, newImage]);
        setCurrentQuestionImageIndex(imageDetails.length);
    };

    return (
        <Dialog>
            <DialogTrigger>
                <Button variant="outline" onClick={handleAddImage}>
                    <Plus size={32} />
                    Add Image
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
                    ) && <UploadImageDialogue form={form} title="Upload Image" />}
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

                    <UploadImageDialogue form={form} title="Change Image" />

                    <Button variant="outline" className="p-0 px-3" onClick={handleRemovePicture}>
                        <TrashSimple size={32} className="text-red-500" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QuestionImagePreviewDialogue;
