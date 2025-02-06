import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { zodResolver } from "@hookform/resolvers/zod";
// import { DialogContent } from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { SidebarContentItem } from "@/types/study-library/chapter-sidebar";

const formSchema = z.object({
    videoUrl: z
        .string()
        .min(1, "URL is required")
        .url("Please enter a valid URL")
        .refine((url) => url.includes("youtube.com") || url.includes("youtu.be"), {
            message: "Please enter a valid YouTube URL",
        }),
    videoName: z.string().min(1, "File name is required"),
});

type FormValues = z.infer<typeof formSchema>;

export const AddVideoDialog = ({
    openState,
}: {
    openState?: ((open: boolean) => void) | undefined;
}) => {
    const addItem = useContentStore((state) => state.addItem);

    const handleSubmit = (data: FormValues) => {
        const newItem: SidebarContentItem = {
            id: crypto.randomUUID(),
            type: "video" as const,
            name: data.videoName,
            url: data.videoUrl,
            content: "", // Add empty string for video content
            createdAt: new Date(),
        };
        addItem(newItem);
        openState && openState(false);
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            videoUrl: "sfgadfsd",
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
                                    inputPlaceholder="Enter YouTube video URL here"
                                    onChangeFunction={(e) => field.onChange(e)} // Pass the event directly
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
                                    {...field} // Spread all field props
                                    label="Video Title"
                                    required={true}
                                    input={field.value}
                                    inputType="text"
                                    inputPlaceholder="File name"
                                    onChangeFunction={(e) => field.onChange(e)} // Pass the event directly
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
        // </DialogContent>
    );
};
