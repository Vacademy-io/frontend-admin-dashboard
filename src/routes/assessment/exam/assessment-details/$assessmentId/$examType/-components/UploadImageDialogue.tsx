import { FileUploadComponent } from "@/components/design-system/file-upload";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Check } from "phosphor-react";
import { useRef } from "react";
import { AssessmentUploadImageDialogueProps } from "@/types/assessment-upload-image-dialog";

const UploadImageDialogue: React.FC<AssessmentUploadImageDialogueProps> = ({
    form,
    title,
    triggerButton,
    selectedSectionIndex,
    currentQuestionIndex,
    currentQuestionImageIndex,
}) => {
    const { getValues, setValue } = form;
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileSubmit = (file: File) => {
        setValue(
            `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageName`,
            file.name,
        );

        // Generate the image preview URL
        const imageUrl = URL.createObjectURL(file);

        setValue(
            `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageFile`,
            imageUrl,
        );
    };

    const handleFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); // Trigger the file input click
        }
    };

    return (
        <Dialog>
            <DialogTrigger>
                {triggerButton ? (
                    triggerButton
                ) : (
                    <Button type="button" variant="outline">
                        {title}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-2 p-0">
                <h1 className="rounded-md bg-primary-100 p-4 font-bold text-primary-500">
                    {title}
                </h1>
                <div className="flex items-center gap-4 px-8 py-4">
                    <FormField
                        control={form.control}
                        name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageName`}
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Paste link to add an image"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button
                        type="button"
                        className="bg-primary-500 p-3"
                        disabled={
                            !getValues(
                                `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageName`,
                            )
                        }
                    >
                        <Check size={32} className="text-white" />
                    </Button>
                </div>
                <div className="text-center">
                    <h1>OR</h1>
                </div>
                <div className="mb-2 py-3 text-center">
                    <Button type="button" variant="outline" onClick={handleFileSelect}>
                        Upload From Device
                        <FileUploadComponent
                            fileInputRef={fileInputRef}
                            onFileSubmit={handleFileSubmit}
                            control={form.control}
                            name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.imageDetails.${currentQuestionImageIndex}.imageName`}
                        />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UploadImageDialogue;
