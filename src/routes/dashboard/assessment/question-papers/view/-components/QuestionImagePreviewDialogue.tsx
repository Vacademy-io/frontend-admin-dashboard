import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, TrashSimple } from "phosphor-react";
import UploadImageDialogue from "./UploadImageDialogue";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { QuestionImagePreviewDialogueProps } from "@/types/question-image-preview";

const QuestionImagePreviewDialogue: React.FC<QuestionImagePreviewDialogueProps> = ({
    form,
    currentQuestionIndex,
    currentQuestionImageIndex,
}) => {
    return (
        <Dialog>
            <DialogTrigger>
                <Button variant="outline">
                    <Plus size={32} />
                    Add Image
                </Button>
            </DialogTrigger>
            <DialogContent className="flex h-96 w-96 flex-col !gap-0 !p-0">
                <h1 className="rounded-md bg-primary-100 p-3 pl-4 font-bold text-primary-500">
                    Question Image
                </h1>
                <div className="flex h-80 w-full items-center justify-center bg-black !p-0">
                    <UploadImageDialogue
                        form={form}
                        currentQuestionIndex={currentQuestionIndex}
                        currentQuestionImageIndex={currentQuestionImageIndex}
                        title="Upload Image"
                    />
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
                        currentQuestionIndex={currentQuestionIndex}
                        currentQuestionImageIndex={currentQuestionImageIndex}
                        title="Change Image"
                    />

                    <Button variant="outline" className="p-0 px-3">
                        <TrashSimple size={32} className="text-red-500" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QuestionImagePreviewDialogue;
