// add-modules-form.tsx
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { MyInput } from "@/components/design-system/input";
import { MyButton } from "@/components/design-system/button";
import { ModuleType } from "./modules";
import { useRef, useState } from "react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { INSTITUTE_ID } from "@/constants/urls";
import { FileUploadComponent } from "@/components/design-system/file-upload";
import { PencilSimpleLine } from "@phosphor-icons/react";
import { SubjectDefaultImage } from "@/assets/svgs";
import { DashboardLoader } from "@/components/core/dashboard-loader";

const formSchema = z.object({
    moduleName: z.string().min(1, "Module name is required"),
    description: z.string().optional(),
    imageFile: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddModulesFormProps {
    initialValues?: ModuleType;
    onSubmitSuccess: (module: ModuleType) => void;
}

export const AddModulesForm = ({ initialValues, onSubmitSuccess }: AddModulesFormProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const { uploadFile, getPublicUrl, isUploading: isUploadingFile } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageUrl, setImageUrl] = useState<string | undefined>(initialValues?.imageUrl);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            moduleName: initialValues?.name || "",
            description: initialValues?.description || "",
            imageFile: null,
        },
    });

    const handleFileSubmit = async (file: File) => {
        try {
            setIsUploading(true);
            const fileId = await uploadFile({
                file,
                setIsUploading,
                userId: "your-user-id",
                source: INSTITUTE_ID,
                sourceId: "MODULES",
            });

            if (fileId) {
                const publicUrl = await getPublicUrl(fileId);
                setImageUrl(publicUrl);
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = (data: FormValues) => {
        const newModule = {
            name: data.moduleName,
            description: data.description || "",
            imageUrl: imageUrl,
        };
        onSubmitSuccess(newModule);
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col gap-6 text-neutral-600"
            >
                <FormField
                    control={form.control}
                    name="moduleName"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label="Module Name"
                                    required={true}
                                    inputType="text"
                                    inputPlaceholder="Enter Module Name"
                                    className="w-[352px]"
                                    input={field.value}
                                    onChangeFunction={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="relative flex w-full items-center justify-center">
                    {isUploading ? (
                        <div className="inset-0 flex h-[150px] w-[150px] items-center justify-center bg-white">
                            <DashboardLoader />
                        </div>
                    ) : imageUrl ? (
                        <img
                            src={imageUrl}
                            alt="Module"
                            className="h-[150px] w-[150px] rounded-lg object-cover"
                        />
                    ) : (
                        <SubjectDefaultImage />
                    )}
                    <FileUploadComponent
                        fileInputRef={fileInputRef}
                        onFileSubmit={handleFileSubmit}
                        control={form.control}
                        name="imageFile"
                        acceptedFileTypes="image/*"
                    />
                    <div
                        className={`absolute right-[54px] top-0 ${
                            isUploading ? "hidden" : "visible"
                        }`}
                    >
                        <MyButton
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || isUploadingFile}
                            buttonType="secondary"
                            layoutVariant="icon"
                            scale="small"
                            type="button"
                        >
                            <PencilSimpleLine />
                        </MyButton>
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label="Description"
                                    inputType="text"
                                    inputPlaceholder="Briefly describe module"
                                    className="w-[352px]"
                                    input={field.value}
                                    onChangeFunction={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="w-full px-6 py-4">
                    <MyButton
                        type="submit"
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                        className="w-full"
                    >
                        {initialValues ? "Save Changes" : "Add"}
                    </MyButton>
                </div>
            </form>
        </Form>
    );
};
