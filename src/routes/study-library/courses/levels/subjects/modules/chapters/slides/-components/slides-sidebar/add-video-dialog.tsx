import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useSlides } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-hooks/use-slides";
import { toast } from "sonner";
import { Route } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/index";
import { useContentStore } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-stores/chapter-sidebar-store";

const formSchema = z.object({
    videoUrl: z
        .string()
        .min(1, "URL is required")
        .url("Please enter a valid URL")
        .refine(
            (url) =>
                url.includes("youtube.com") ||
                url.includes("youtu.be") ||
                url.includes("drive.google.com"),
            {
                message: "Please enter a valid YouTube URL",
            },
        ),
    videoName: z.string().min(1, "File name is required"),
});

type FormValues = z.infer<typeof formSchema>;

export const AddVideoDialog = ({
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
                title: data.videoName,
                description: null,
                image_file_id: null,
                slide_order: null,
                video_slide: {
                    id: crypto.randomUUID(),
                    description: "",
                    url: data.videoUrl,
                    title: data.videoName,
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
            videoUrl: "",
            videoName: "",
        },
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex w-full flex-col gap-6 text-neutral-600"
            >
                <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label="Video URL"
                                    required={true}
                                    input={field.value}
                                    inputType="text"
                                    inputPlaceholder="Enter YouTube/Google-Drive video URL here"
                                    onChangeFunction={field.onChange}
                                    className="w-full"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="videoName"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    {...field}
                                    label="Video Title"
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
                    Add Video
                </MyButton>
            </form>
        </Form>
    );
};
