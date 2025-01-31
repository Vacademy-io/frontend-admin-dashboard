import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Image, PencilSimpleLine, TrashSimple } from "phosphor-react";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OptionUploadImagePreview } from "./OptionUploadImagePreview";
import { AssessmentOptionImagePreviewDialogueProps } from "@/types/assessment-image-preview";

export const OptionImagePreview: React.FC<AssessmentOptionImagePreviewDialogueProps> = ({
    form,
    option,
    selectedSectionIndex,
    currentQuestionIndex,
    isUploadedAgain,
}) => {
    const { setValue, getValues } = form;

    const handleRemovePicture = () => {
        setValue(
            `${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${option}.image.isDeleted`,
            true,
        );
        setValue(
            `${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${option}.image.imageFile`,
            "",
        );
        setValue(
            `${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${option}.image.imageName`,
            "",
        );
        setValue(
            `${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${option}.image.imageTitle`,
            "",
        );
    };

    return (
        <Dialog>
            <DialogTrigger>
                <Button variant="outline" className="px-2">
                    {isUploadedAgain ? (
                        <PencilSimpleLine size={16} />
                    ) : (
                        <Image size={32} className="!size-5" />
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="flex size-96 flex-col !gap-0 !p-0">
                <h1 className="rounded-md bg-primary-100 p-3 pl-4 font-bold text-primary-500">
                    Question Image
                </h1>
                <div className="relative flex h-80 w-full items-center justify-center bg-black !p-0">
                    {getValues(
                        `${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${option}.image.imageFile`,
                    ) && (
                        <img
                            src={getValues(
                                `${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${option}.image.imageFile`,
                            )}
                            alt="logo"
                            className="h-64 w-96"
                        />
                    )}

                    {!getValues(
                        `${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${option}.image.imageFile`,
                    ) && (
                        <OptionUploadImagePreview
                            form={form}
                            title="Upload Image"
                            option={option}
                            currentQuestionIndex={currentQuestionIndex}
                            selectedSectionIndex={selectedSectionIndex}
                        />
                    )}
                </div>
                <div className="flex gap-4 p-4">
                    <FormField
                        control={form.control}
                        name={`${selectedSectionIndex}.questions.${currentQuestionIndex}.singleChoiceOptions.${option}.image.imageTitle`}
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

                    <OptionUploadImagePreview
                        form={form}
                        title="Change Image"
                        option={option}
                        currentQuestionIndex={currentQuestionIndex}
                        selectedSectionIndex={selectedSectionIndex}
                    />

                    <Button variant="outline" className="p-0 px-3" onClick={handleRemovePicture}>
                        <TrashSimple size={32} className="text-red-500" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
