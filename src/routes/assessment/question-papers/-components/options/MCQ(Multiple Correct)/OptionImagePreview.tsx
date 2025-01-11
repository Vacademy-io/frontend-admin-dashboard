import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Image, TrashSimple } from "phosphor-react";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OptionImagePreviewDialogueProps } from "@/types/question-image-preview";
import { useQuestionStore } from "../../../-global-states/question-index";
import { OptionUploadImagePreview } from "./OptionUploadImagePreview";

export const OptionImagePreview: React.FC<OptionImagePreviewDialogueProps> = ({ form, option }) => {
    const { currentQuestionIndex } = useQuestionStore();
    const { setValue, getValues } = form;

    const handleRemovePicture = () => {
        setValue(
            `questions.${currentQuestionIndex}.multipleChoiceOptions.${option}.image.isDeleted`,
            true,
        );
        setValue(
            `questions.${currentQuestionIndex}.multipleChoiceOptions.${option}.image.imageFile`,
            "",
        );
        setValue(
            `questions.${currentQuestionIndex}.multipleChoiceOptions.${option}.image.imageName`,
            "",
        );
        setValue(
            `questions.${currentQuestionIndex}.multipleChoiceOptions.${option}.image.imageTitle`,
            "",
        );
    };

    return (
        <Dialog>
            <DialogTrigger>
                <Button variant="outline" className="px-2">
                    <Image size={32} className="!size-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="flex size-96 flex-col !gap-0 !p-0">
                <h1 className="rounded-md bg-primary-100 p-3 pl-4 font-bold text-primary-500">
                    Question Image
                </h1>
                <div className="relative flex h-80 w-full items-center justify-center bg-black !p-0">
                    {getValues(
                        `questions.${currentQuestionIndex}.multipleChoiceOptions.${option}.image.imageFile`,
                    ) && (
                        <img
                            src={getValues(
                                `questions.${currentQuestionIndex}.multipleChoiceOptions.${option}.image.imageFile`,
                            )}
                            alt="logo"
                            className="h-64 w-96"
                        />
                    )}

                    {!getValues(
                        `questions.${currentQuestionIndex}.multipleChoiceOptions.${option}.image.imageFile`,
                    ) && (
                        <OptionUploadImagePreview
                            form={form}
                            title="Upload Image"
                            option={option}
                        />
                    )}
                </div>
                <div className="flex gap-4 p-4">
                    <FormField
                        control={form.control}
                        name={`questions.${currentQuestionIndex}.multipleChoiceOptions.${option}.image.imageTitle`}
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

                    <OptionUploadImagePreview form={form} title="Change Image" option={option} />

                    <Button variant="outline" className="p-0 px-3" onClick={handleRemovePicture}>
                        <TrashSimple size={32} className="text-red-500" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
