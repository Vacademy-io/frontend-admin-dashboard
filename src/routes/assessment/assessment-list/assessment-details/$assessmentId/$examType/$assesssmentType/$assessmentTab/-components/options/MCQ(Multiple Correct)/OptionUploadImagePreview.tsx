import { FileUploadComponent } from "@/components/design-system/file-upload";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Check } from "phosphor-react";
import { useRef, useState } from "react";
import { AssessmentOptionImageDialogueProps } from "@/types/assessment-upload-image-dialog";
import { getInstituteId } from "@/constants/helper";
import { useFileUpload } from "@/hooks/use-file-upload";

export const OptionUploadImagePreview: React.FC<AssessmentOptionImageDialogueProps> = ({
    form,
    title,
    triggerButton,
    option,
    currentQuestionIndex,
    selectedSectionIndex,
}) => {
    const instituteId = getInstituteId();
    const [isUploading, setIsUploading] = useState(false);
    console.log(isUploading);
    const { uploadFile, getPublicUrl } = useFileUpload();
    const { getValues, setValue } = form;
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileSubmit = async (file: File) => {
        try {
            setIsUploading(true);
            const fileId = await uploadFile({
                file,
                setIsUploading,
                userId: "your-user-id",
                source: instituteId,
                sourceId: "STUDENTS",
            });

            if (fileId) {
                setValue(
                    `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.multipleChoiceOptions.${option}.image.imageName`,
                    fileId,
                );

                const publicUrl = await getPublicUrl(fileId);

                setValue(
                    `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.multipleChoiceOptions.${option}.image.imageFile`,
                    publicUrl,
                );
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
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
                        name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.multipleChoiceOptions.${option}.image.imageFile`}
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
                                `sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.multipleChoiceOptions.${option}.image.imageFile`,
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
                            name={`sections.${selectedSectionIndex}.questions.${currentQuestionIndex}.multipleChoiceOptions.${option}.image.imageName`}
                        />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
