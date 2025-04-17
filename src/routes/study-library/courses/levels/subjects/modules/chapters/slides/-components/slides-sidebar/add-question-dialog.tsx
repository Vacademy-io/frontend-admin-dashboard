import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useSlides } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides";
import { toast } from "sonner";
import { Route } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/index";
import { useContentStore } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/chapter-sidebar-store";

const questionType = [
    { type: "MCQS", label: "Single Correct Multiple Choice" },
    { type: "MCQM", label: "Multiple Correct Multiple Choice" },
    { type: "LONG_ANSWER", label: "Subjective" },
    { type: "TRUE_FALSE", label: "True / False" },
    { type: "NUMERIC", label: "Numeric" },
];

const formSchema = z.object({
    questionType: z.string().min(1, "Question Type is Required"),
    questionName: z.string().min(1, "File name is required"),
});

type FormValues = z.infer<typeof formSchema>;

export const AddQuestionDialog = ({
    openState,
}: {
    openState?: ((open: boolean) => void) | undefined;
}) => {
    const { chapterId } = Route.useSearch();
    const { addUpdateVideoSlide } = useSlides(chapterId);
    const { setActiveItem, getSlideById } = useContentStore();

    const handleSubmit = async (data: FormValues) => {
        try {
            const slideId = crypto.randomUUID();
            const response: string = await addUpdateVideoSlide({
                id: slideId,
                title: data.questionName,
                description: null,
                image_file_id: null,
                slide_order: null,
                video_slide: {
                    id: crypto.randomUUID(),
                    description: "",
                    url: data.questionType,
                    title: data.questionName,
                    video_length_in_millis: 0,
                    published_url: null,
                    published_video_length_in_millis: 0,
                },
                status: "DRAFT",
                new_slide: true,
                notify: false,
            });

            toast.success("Video added successfully!");
            form.reset();
            openState?.(false);
            setTimeout(() => {
                setActiveItem(getSlideById(response));
            }, 500);
        } catch (error) {
            toast.error("Failed to add video");
        }
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            questionType: "",
            questionName: "",
        },
    });

    const { setValue, register } = form;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex w-full flex-col gap-6 text-neutral-600"
            >
                <Select
                    onValueChange={(value) => {
                        setValue("questionType", value);
                    }}
                    {...register("questionType")}
                    defaultValue=""
                >
                    <div>
                        <div>
                            Question Type <span className="text-red-500">*</span>
                        </div>
                        <SelectTrigger className="h-[40px] w-full">
                            <SelectValue placeholder="Select Your Question Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {questionType.map((questionType) => (
                                <SelectItem key={questionType.type} value={questionType.type}>
                                    {questionType.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </div>
                </Select>
                <FormField
                    control={form.control}
                    name="questionName"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    {...field}
                                    label="Question Title"
                                    required={true}
                                    input={field.value}
                                    inputType="text"
                                    inputPlaceholder="File name"
                                    onChangeFunction={field.onChange}
                                    className="w-full"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <MyButton type="submit" buttonType="primary" scale="large" layoutVariant="default">
                    Add Question
                </MyButton>
            </form>
        </Form>
    );
};
