import { MyButton } from '@/components/design-system/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { FormProvider, useForm } from 'react-hook-form';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { MyInput } from '@/components/design-system/input';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { UploadQuestionPaperFormType } from '@/routes/assessment/question-papers/-components/QuestionPaperUpload';
import {
    VideoPlayerTimeFormType,
    videoPlayerTimeSchema,
} from '../-form-schemas/video-player-time-schema';
import { PencilSimpleLine } from 'phosphor-react';
import { StudyLibraryQuestion } from '@/types/study-library/study-library-video-questions';
import { toast } from 'sonner';
import { formatTimeStudyLibraryInSeconds, timestampToSeconds } from '../-helper/helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { YTPlayer } from './youtube-player';

interface VideoQuestionsTimeFrameDialogProps {
    playerRef: MutableRefObject<YTPlayer | null>;
    formRefData: MutableRefObject<UploadQuestionPaperFormType>;
    question?: StudyLibraryQuestion;
    videoDuration: number;
}

const VideoQuestionsTimeFrameEditDialog = ({
    playerRef,
    formRefData,
    question,
    videoDuration,
}: VideoQuestionsTimeFrameDialogProps) => {
    const tempEditQuestionTimeFrameForm = useForm<VideoPlayerTimeFormType>({
        resolver: zodResolver(videoPlayerTimeSchema),
        defaultValues: {
            hrs: question?.timestamp?.split(':')[0],
            min: question?.timestamp?.split(':')[1],
            sec: question?.timestamp?.split(':')[2],
        },
    });
    const closeRef = useRef<HTMLButtonElement | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { hrs, min, sec } = tempEditQuestionTimeFrameForm.watch();
    const isButtonDisabled = !hrs && !min && !sec;

    const handleEditTimeStampCurrentQuestion = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const timestamp = timestampToSeconds(
            `${tempEditQuestionTimeFrameForm.getValues('hrs')}:${tempEditQuestionTimeFrameForm.getValues('min')}:${tempEditQuestionTimeFrameForm.getValues('sec')}`
        );
        if (timestamp === null || timestamp < 0 || timestamp > videoDuration) {
            toast.error(
                'Invalid timestamp. Please enter a valid time in MM:SS format or seconds also current timestamp should be less than video length',
                {
                    className: 'error-toast',
                    duration: 3000,
                }
            );
            return;
        }
        const currentQuestionIndex = formRefData.current.questions.findIndex(
            (q) => q.questionId === question?.questionId
        );
        const currentQuestion = formRefData.current.questions[currentQuestionIndex];

        if (!currentQuestion) return;
        currentQuestion.timestamp =
            tempEditQuestionTimeFrameForm.getValues('hrs') +
            ':' +
            tempEditQuestionTimeFrameForm.getValues('min') +
            ':' +
            tempEditQuestionTimeFrameForm.getValues('sec');
        closeRef.current?.click();
    };

    const handleSetCurrentTimeStampEditForm = () => {
        if (!playerRef.current) return;
        const timestamp = formatTimeStudyLibraryInSeconds(playerRef.current.getCurrentTime());

        // Handle HH:MM:SS or MM:SS format
        const parts = timestamp.split(':');

        if (parts.length === 3) {
            // HH:MM:SS format
            const hrs = String(parseInt(parts[0] as string, 10));
            const min = String(parseInt(parts[1] as string, 10));
            const sec = String(parseInt(parts[2] as string, 10));
            tempEditQuestionTimeFrameForm.reset({ hrs, min, sec });
        } else if (parts.length === 2) {
            // MM:SS format
            const min = String(parseInt(parts[0] as string, 10));
            const sec = String(parseInt(parts[1] as string, 10));
            tempEditQuestionTimeFrameForm.reset({ hrs: '0', min, sec });
        }
    };

    useEffect(() => {
        if (question && question.timestamp) {
            tempEditQuestionTimeFrameForm.reset({
                hrs: question?.timestamp.split(':')[0],
                min: question?.timestamp.split(':')[1],
                sec: question?.timestamp.split(':')[2],
            });
        }
    }, []);

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <MyButton
                type="button"
                buttonType="secondary"
                scale="small"
                layoutVariant="default"
                className="h-8 min-w-4"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsDialogOpen(true);
                }}
            >
                <PencilSimpleLine size={32} />
            </MyButton>

            <DialogContent className="w-fit p-0">
                <h1 className="rounded-t-lg bg-primary-50 p-4 font-semibold text-primary-500">
                    Time Stamp
                </h1>
                <FormProvider {...tempEditQuestionTimeFrameForm}>
                    <form className="flex flex-col items-center gap-2 p-4">
                        <div className="flex items-center gap-4 p-4">
                            <FormField
                                control={tempEditQuestionTimeFrameForm.control}
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
                                                        ''
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
                                control={tempEditQuestionTimeFrameForm.control}
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
                                                        ''
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
                                control={tempEditQuestionTimeFrameForm.control}
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
                                                        ''
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetCurrentTimeStampEditForm();
                                }}
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
                        disable={isButtonDisabled}
                    >
                        Edit
                    </MyButton>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VideoQuestionsTimeFrameEditDialog;
