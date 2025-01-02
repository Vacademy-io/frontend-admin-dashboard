import { SubjectDefaultImage } from "@/assets/svgs";
import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { Check } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRef } from "react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Subject } from "./subjects";

const formSchema = z.object({
    subjectName: z.string().min(1, "Subject name is required"),
    imageLink: z.string().optional(),
    imageFile: z.any().optional(), // Add this to handle file upload
});

type FormValues = z.infer<typeof formSchema>;

interface AddSubjectFormProps {
    onSubmitSuccess: (subject: Subject) => void;
    initialValues?: Subject;
}

export const AddSubjectForm = ({ onSubmitSuccess, initialValues }: AddSubjectFormProps) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            subjectName: initialValues?.name || "",
            imageLink: initialValues?.imageUrl || "",
            imageFile: null,
        },
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onSubmit = (data: FormValues) => {
        const newSubject = {
            name: data.subjectName,
            imageUrl: data.imageLink || undefined,
        };
        onSubmitSuccess(newSubject);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                form.setValue("imageFile", file);
            } else {
                alert("Please upload an image file");
            }
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col gap-6 text-neutral-600"
            >
                <FormField
                    control={form.control}
                    name="subjectName"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label="Subject"
                                    required={true}
                                    inputType="text"
                                    inputPlaceholder="Enter subject name"
                                    className="w-[352px]"
                                    input={field.value}
                                    onChangeFunction={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col gap-6">
                    <div className="flex w-full items-center justify-center">
                        <SubjectDefaultImage />
                    </div>
                    <div className="flex items-end justify-between gap-4">
                        <FormField
                            control={form.control}
                            name="imageLink"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <MyInput
                                            label="Image Link"
                                            required={false}
                                            inputType="text"
                                            inputPlaceholder="Paste Link to an image..."
                                            className="w-[296px]"
                                            input={field.value}
                                            onChangeFunction={(e) => field.onChange(e.target.value)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex cursor-pointer items-center justify-center rounded-lg bg-primary-500 p-2 text-white">
                            <Check />
                        </div>
                    </div>
                    <div className="text-center text-subtitle">OR</div>

                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                    />

                    {/* Upload button that triggers file input */}
                    <MyButton
                        type="button"
                        buttonType="secondary"
                        layoutVariant="default"
                        scale="large"
                        onClick={handleUploadClick}
                    >
                        Upload from Device
                    </MyButton>

                    <div className="text-center text-subtitle">
                        Recommended size is 280 x 280 pixels
                    </div>
                    <MyButton
                        type="submit"
                        buttonType="primary"
                        layoutVariant="default"
                        scale="large"
                    >
                        Add
                    </MyButton>
                </div>
            </form>
        </Form>
    );
};
