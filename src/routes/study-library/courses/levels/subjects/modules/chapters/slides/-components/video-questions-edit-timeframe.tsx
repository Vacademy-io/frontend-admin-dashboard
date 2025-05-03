import { MyButton } from "@/components/design-system/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FormProvider, useForm } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { MyInput } from "@/components/design-system/input";
import { MutableRefObject, useEffect, useRef } from "react";
import { UploadQuestionPaperFormType } from "@/routes/assessment/question-papers/-components/QuestionPaperUpload";
import {
    VideoPlayerTimeFormType,
    videoPlayerTimeSchema,
} from "../-form-schemas/video-player-time-schema";
import { PencilSimpleLine } from "phosphor-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { StudyLibraryQuestion } from "@/types/study-library/study-library-video-questions";

interface VideoQuestionsTimeFrameDialogProps {
    formRefData: MutableRefObject<UploadQuestionPaperFormType>;
    handleSetCurrentTimeStamp: () => void;
    question?: StudyLibraryQuestion;
}

const VideoQuestionsTimeFrameEditDialog = ({
    formRefData,
    handleSetCurrentTimeStamp,
    question,
}: VideoQuestionsTimeFrameDialogProps) => {
    const closeRef = useRef<HTMLButtonElement | null>(null);
    const form = useForm<VideoPlayerTimeFormType>({
        resolver: zodResolver(videoPlayerTimeSchema),
        defaultValues: {
            hrs: "",
            min: "",
            sec: "",
        },
    });
    const handleEditTimeStampCurrentQuestion = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const currentQuestionIndex = formRefData.current.questions.findIndex(
            (q) => q.questionId === question?.questionId,
        );
        const currentQuestion = formRefData.current.questions[currentQuestionIndex];

        if (!currentQuestion) return;
        currentQuestion.timestamp =
            form.getValues("hrs") + ":" + form.getValues("min") + ":" + form.getValues("sec");
        closeRef.current?.click();
    };

    useEffect(() => {
        if (question && question.timestamp) {
            form.reset({
                hrs: question?.timestamp.split(":")[0],
                min: question?.timestamp.split(":")[1],
                sec: question?.timestamp.split(":")[2],
            });
        }
    }, []);

    return (
        <Dialog>
            <DialogTrigger>
                <MyButton
                    type="button"
                    buttonType="secondary"
                    scale="small"
                    layoutVariant="default"
                    className="h-8 min-w-4"
                >
                    <PencilSimpleLine size={32} />
                </MyButton>
            </DialogTrigger>
            <DialogContent className="w-fit p-0">
                <h1 className="rounded-t-lg bg-primary-50 p-4 font-semibold text-primary-500">
                    Time Stamp
                </h1>
                <FormProvider {...form}>
                    <form className="flex flex-col items-center gap-2 p-4">
                        <div className="flex items-center gap-4 p-4">
                            <FormField
                                control={form.control}
                                name={`hrs`}
                                render={({ field: { ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                inputPlaceholder="00"
                                                input={field.value}
                                                onKeyPress={(e) => {
                                                    const charCode = e.key;
                                                    if (!/[0-9]/.test(charCode)) {
                                                        e.preventDefault(); // Prevent non-numeric input
                                                    }
                                                }}
                                                onChangeFunction={(e) => {
                                                    const inputValue = e.target.value.replace(
                                                        /[^0-9]/g,
                                                        "",
                                                    ); // Remove non-numeric characters
                                                    field.onChange(inputValue); // Call onChange with the sanitized value
                                                }}
                                                size="large"
                                                {...field}
                                                className="w-11"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <span>hrs</span>
                            <span>:</span>
                            <FormField
                                control={form.control}
                                name={`min`}
                                render={({ field: { ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                inputPlaceholder="00"
                                                input={field.value}
                                                onKeyPress={(e) => {
                                                    const charCode = e.key;
                                                    if (!/[0-9]/.test(charCode)) {
                                                        e.preventDefault(); // Prevent non-numeric input
                                                    }
                                                }}
                                                onChangeFunction={(e) => {
                                                    const inputValue = e.target.value.replace(
                                                        /[^0-9]/g,
                                                        "",
                                                    ); // Remove non-numeric characters
                                                    field.onChange(inputValue); // Call onChange with the sanitized value
                                                }}
                                                size="large"
                                                {...field}
                                                className="w-11"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <span>min</span>
                            <span>:</span>
                            <FormField
                                control={form.control}
                                name={`sec`}
                                render={({ field: { ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                inputPlaceholder="00"
                                                input={field.value}
                                                onKeyPress={(e) => {
                                                    const charCode = e.key;
                                                    if (!/[0-9]/.test(charCode)) {
                                                        e.preventDefault(); // Prevent non-numeric input
                                                    }
                                                }}
                                                onChangeFunction={(e) => {
                                                    const inputValue = e.target.value.replace(
                                                        /[^0-9]/g,
                                                        "",
                                                    ); // Remove non-numeric characters
                                                    field.onChange(inputValue); // Call onChange with the sanitized value
                                                }}
                                                size="large"
                                                {...field}
                                                className="w-11"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <span>sec</span>
                            <MyButton
                                type="button"
                                buttonType="secondary"
                                scale="medium"
                                layoutVariant="default"
                                className="ml-8"
                                onClick={handleSetCurrentTimeStamp}
                            >
                                Use Current Position
                            </MyButton>
                        </div>
                    </form>
                </FormProvider>
                <div className="flex justify-end">
                    <DialogClose asChild>
                        <button ref={closeRef} className="hidden" />
                    </DialogClose>
                    <MyButton
                        type="button"
                        buttonType="primary"
                        scale="medium"
                        layoutVariant="default"
                        className="mb-6 mr-8"
                        onClick={handleEditTimeStampCurrentQuestion}
                    >
                        Edit
                    </MyButton>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VideoQuestionsTimeFrameEditDialog;
